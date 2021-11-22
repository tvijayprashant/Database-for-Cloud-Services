import React from 'react';
import {Link} from 'react-router-dom';
import {Container,Row,Col,Button,Alert,Navbar,Nav,NavDropdown,Modal,Form,Table} from 'react-bootstrap';
import axios from 'axios';


function simulateNetworkRequest() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

let index=0;

function VM () {
    const [createShow, setcreateShow] = React.useState(false);
    const [deleteShow, setdeleteShow] = React.useState(false);
    const [transferShow, setTransferShow] = React.useState(false);
    const [ipShow,setIpShow] = React.useState(false);
    const [ramValue, setRamValue ] = React.useState(30);
    const [diskValue, setDiskValue ] = React.useState(2);
    const [show, setShow] = React.useState("None");
    const [isA100,setA100] = React.useState(false);
    const [isV100,setV100] = React.useState(false);
    const [isK80,setK80] = React.useState(false);
    const [isT4,setT4] = React.useState(false);
    const [isP4,setP4] = React.useState(false);
    const [ramMin, setRamMin] = React.useState(4)
    const [isLoading, setLoading] = React.useState([]);
    const [isStopped,setStopped] = React.useState([]);
    const [zone,setZone] = React.useState(0);
    const [preempt,setPreempt] = React.useState(false);
    const createRef = React.useRef(null);
    const updateRef = React.useRef(null);
    const [validated, setValidated] = React.useState(false);
    const [cost,setCost] = React.useState(0);
    const [dataReceived,setDataReceived] = React.useState(false);
    const [vmId,setvmId] = React.useState("");

    const tableData=[{ name:"Mark", zone:"us-central-a", iIP:"123.234.345.1", eIP:"322.214.12.12", status:false},
            { name:"Maurya", zone:"us-central-a", iIP:"123.234.345.1", eIP:"322.214.12.12",status:true },
            { name:"Mister", zone:"us-central-a", iIP:"123.234.345.1", eIP:"322.214.12.12",status:false },
            { name:"Master", zone:"us-central-a", iIP:"123.234.345.1", eIP:"322.214.12.12",status:true }]

    const [vmdata,setvmdata] = React.useState(tableData)

    

    const quotas = [{nvm:5, disk:[2,3,4], gpuP:[1,1,1,1,1], gpu:[1,1,1,1,1],mfP:[2,2,2,2,2], mf:[0,0,2,2,2]},
                    {nvm:15, disk:[2,3,5], gpuP:[1,2,3,4,5], gpu:[1,1,2,1,1],mfP:[2,0,2,2,2], mf:[2,2,2,4,2]},
                    {nvm:52, disk:[0,0,0], gpuP:[1,1,0,10,0], gpu:[1,2,1,1,1],mfP:[2,2,0,2,2], mf:[8,2,2,2,2]},
                    {nvm:2, disk:[4,3,4], gpuP:[1,0,1,0,1], gpu:[1,1,11,3,1],mfP:[2,2,0,20,2], mf:[2,8,2,7,2]}]

    const createData = Object.freeze({
        projectid: "97263495872",
        name: "",
        zone: "",
        preempt: false,
        machinetype: "",
        gpu: null,
        ram:ramValue,
        disk: "",
        disksize: diskValue,
        image:"",
        eipenable: false,
        eip: "",
        networktag: "",
        hostname: "",
        credits:0
      });
      const UpdateVMData = Object.freeze({
        projectid: "",
        name: "",
        zone: "",
        preempt: false,
        machinetype: "",
        gpu: "",
        ram:ramValue,
        disk: "",
        disksize: diskValue,
        image:"",
        eipenable: false,
        eip: "",
        networktag: "",
        hostname: "",
        credits:0
    });
    const [createVMData, updateFormData] = React.useState(createData);
    

    const projId = [{id:132435465},{id:132423425},{id:34546765},{id:98765432},{curr:5674839210,username:"sdfgfh",userid:765432342}];
    const vm = [{name:"asdlfjns"},
                {name:"knvbafkhv"},
                {name:"kjhbasjhfb"},
                {name:"kmoufns"}]
    const diskImage = [{name:"Ubuntu 18.04"},
                        {name:"Ubuntu 20.04"},
                        {name:"Fedora"},
                        {name:"Cent OS"},
                        {name:"Arch Linux"},
                        {name:"Kali"},
]


const handleChange = (e) => {
    updateFormData({createVMData,[e.target.name]: e.target.value.trim()});
    if(e.target.name === 'preempt'){
        setPreempt(!preempt);
    }
};

const handleSubmit = (e) => {
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
    }
    else{
        const formData = new FormData(form);
        e.preventDefault();
        let json = Object.fromEntries(formData.entries())
        let tableEntry = {}
        console.log(json)
        json["machinetype"] = json["machinetype"].split(' ')[0]
        json["disk"] = json["disk"].split(' ')[0]
        if(json["gpu"] !== 'None')
            json["gpu"] = json["gpu"].split(' ')[0]
        tableEntry["name"] = json['name']
        tableEntry["zone"] = json['zone']
        tableEntry["eIP"] = json['eip']
        // tableEntry["iIP"] = json['iip']
        tableEntry["status"] = json['status']

        let out = JSON.stringify(json)
        if (form.id === "create") {
            setvmdata([...vmdata,tableEntry]);
            console.log("12321")
            setShow("Created");
            setcreateShow(false);
        }
        else if (form.name === "update") {
            setShow("Updated");
            setTransferShow(false);
        }
        setTimeout(() => {
            setShow("None")
        }, 3000);
        form.reset()
        setValidated(false);
        setIpShow(false);
    }

};

const zoneMap = {'us-central-a':0,'us-central-b':1,'eu-east-a':2,'eu-west-b':3};

const zoneChange = (e) =>{
    updateFormData({createVMData,[e.target.name]: e.target.value.trim()});
    setZone(zoneMap[e.target.value]);
};

const machineChange = (e)=>{
    updateFormData({createVMData,[e.target.name]: e.target.value.trim()});
    if(e.target.value.slice(0,2) === 'A2'){setA100(true);setV100(false);setK80(false);setT4(false);setP4(false);}
    if(e.target.value.slice(0,2) === 'N1'){setA100(false);setV100(true);setK80(true);setT4(true);setP4(true);setRamValue(30);setRamMin(4);}
    if(e.target.value.slice(0,2) === 'N2'){setA100(false);setV100(false);setK80(false);setT4(false);setP4(false);setRamValue(30);setRamMin(4);}
    if(e.target.value.slice(0,2) === 'EC2'){setA100(false);setV100(false);setK80(false);setT4(false);setP4(false);setRamValue(30);setRamMin(4);}
    if(e.target.value.slice(0,2) === 'C2'){setA100(false);setV100(false);setK80(false);setT4(false);setP4(false);setRamValue(30);setRamMin(4);}
}
React.useEffect((e) => {
    if (isLoading[index]) {
      simulateNetworkRequest().then(() => {
        setLoading([...isLoading.slice(0,index),false,...isLoading.slice(index+1)]);
        setStopped([...isStopped.slice(0,index),!isStopped[index],...isStopped.slice(index+1)]);
      });
      vmdata[index].status = isStopped[index];
    }
  }, [isLoading,isStopped,vmdata]);

    const handleClick = (e) => {index = parseInt(e.target.id);setLoading([...isLoading.slice(0,index),true,...isLoading.slice(index+1)]);}

    const handleDelete = (e) => {
        const newData = [...vmdata]
        newData.splice(vmdata.findIndex((c)=>c.name===vmId),1)
        setvmdata(newData);
        setdeleteShow(false);
        setShow("Deleted");
        setTimeout(() => {setShow("None")}, 3000);
    };

      const renderTable = (row,index) => {
        isLoading.push(false)
        isStopped.push(row.status)
          return(
              <tr key={index} className="text-center">
                <td>{index+1}</td>
                <td>{row.name}</td>
                <td>{row.zone}</td>
                <td><Link to="/abcd">{row.eIP}</Link></td>
                <td><Link to="/abcd">{row.iIP}</Link></td>
                <td className="d-flex justify-content-center align-items-center" colSpan="2">
                    <Button className="ml-2 mr-2 pl-3 pr-3" variant={isStopped[index]?"danger":"success"} id={index} disabled={isLoading[index]} onClick={handleClick}>
                        {isLoading[index] ? !isStopped[index] ?'Stopping':'Starting' : isStopped[index] ?'Offline':'Online'}
                    </Button>
                </td>
                <td className=" justify-content-center align-items-center">
                    <Button className="ml-2 mr-2 pl-3 pr-3" variant="danger" id={row.name} onClick={(e)=>{setdeleteShow(true);setvmId(e.target.id)}}>
                        Delete
                    </Button>
                </td>
              </tr>
          )
      }

    React.useEffect(()=>{
        axios
        .get("http://localhost:8008/vm")
        .then((res)=> {console.log(res.data);setDataReceived(true);})
        .catch(err => console.log(err))
    },[dataReceived]);

    return(
            <Container fluid>
             <Navbar bg="light" expand="lg" sticky="top">
                <Navbar.Brand href="/">GCP</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <NavDropdown title="My Projects" id="basic-nav-dropdown">
                        {projId.slice(0,projId.length-1).map((row,index)=>{return(<NavDropdown.Item href={"/"+row.id}>{row.id}</NavDropdown.Item>)})}
                        <NavDropdown.Divider />
                        <NavDropdown.Item href={"/"+projId[projId.length-1].curr}>{projId[projId.length-1].curr}</NavDropdown.Item>
                    </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        <Row>
            <Nav variant="pills">
                <Nav.Item>
                    <Nav.Link href="/">DashBoard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-1" href="/profile">Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link active eventKey="link-2" href="/vm">VM Instances</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-3" href="/metrics">Metrics</Nav.Link>
                </Nav.Item>
            </Nav>
        </Row>
            <Container class="rounded border border-dark text-center w-50">
                <Row className="d-flex justify-content-center">
                    <Alert show={["Created","Deleted","Updated"].includes(show)?true:false} variant="success" dismissible onClose={() => setShow("None")}>
                        <Alert.Heading>VM Instance {show} Successfully</Alert.Heading>
                    </Alert>
                </Row>
                <Row>
                    <Container className="rounded border border-light text-center d-flex justify-content-around w-75 p-3">
                        <Button variant="primary" size='md' onClick={() => setcreateShow(true)}>Create VM</Button>
                        {/* <Button variant="primary" size='md' onClick={() => setdeleteShow(true)}>Delete VM</Button> */}
                        <Button variant="primary" size='md' onClick={() => setTransferShow(true)}>Update VM</Button>
                        <Modal size="lg" show={createShow} onHide={() => {setcreateShow(false);createRef.current.reset();setIpShow(false)}} aria-labelledby="contained-modal-title-vcenter" centered backdrop="static" keyboard={false}>
                            <Modal.Header closeButton>
                            <Modal.Title id="createVM">
                                Create VM Instance
                            </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Container>
                                    <Form ref={createRef} id="create" noValidate validated={validated} onSubmit={handleSubmit}>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formProject">
                                            <Form.Label>Project ID</Form.Label>
                                            <Form.Control type="text" name="projectid" defaultValue={createVMData["projectid"]} disabled />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Name of the Instance<span class="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Name" name="name" required/>
                                            <Form.Text className="text-muted">The Name of the VM must be unique</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formZone">
                                            <Form.Label>Zone</Form.Label>
                                            <Form.Control as="select" name="zone" required onChange={zoneChange}>
                                                {/* <option>Select Zone</option> */}
                                                <option>us-central-a</option>
                                                <option>us-central-b</option>
                                                <option>eu-east-a</option>
                                                <option>eu-west-b</option>
                                            </Form.Control>
                                        </Form.Group>
                                        <br/>
                                    </Col>
                                    <Col>
                                    <br/><br/>
                                        <Form.Group controlId="formPreempt">
                                            <Form.Check type="checkbox" id="preempt" name="preempt" label="Pre-emptibility" />
                                        </Form.Group>
                                        
                                    </Col>
                                    </Row>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formType">
                                            <Form.Label>Machine Type</Form.Label>
                                            <Form.Control as="select" name="machinetype" required onChange={machineChange}>
                                            {/* <option>None</option> */}
                                            <option disabled={(preempt?quotas[zone].mfP[0]:quotas[zone].mf[0])>0?false:true}>EC2 (Available {preempt?quotas[zone].mfP[0]:quotas[zone].mf[0]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[1]:quotas[zone].mf[1])>0?false:true}>N1 (Available {preempt?quotas[zone].mfP[1]:quotas[zone].mf[1]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[2]:quotas[zone].mf[2])>0?false:true}>N2 (Available {preempt?quotas[zone].mfP[2]:quotas[zone].mf[2]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[3]:quotas[zone].mf[3])>0?false:true}>C2 (Available {preempt?quotas[zone].mfP[3]:quotas[zone].mf[3]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[4]:quotas[zone].mf[4])>0?false:true}>A2 (Available {preempt?quotas[zone].mfP[4]:quotas[zone].mf[4]} Machines)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formGPU">
                                            <Form.Label>GPU</Form.Label>
                                            <Form.Control as="select" name="gpu" required onChange={e => {if(e.target.value === 'NVIDIA_TESLA_A100'){setRamMin(85);setRamValue(85)};}}>
                                            <option>None</option>
                                            <option disabled={((!isA100 ? false : true) && (preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0])>0 ? false:true)}>NVIDIA_TESLA_A100 (Available {preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0]} GPU)</option>
                                            <option disabled={((!isV100 ? false : true) && (preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1])>0 ? false:true)}>NVIDIA_TESLA_V100 (Available {preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1]} GPU)</option>
                                            <option disabled={((!isK80 ? false : true)  && (preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2])>0 ? false:true)}>NVIDIA_TESLA_K80 (Available {preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2]} GPU)</option>
                                            <option disabled={((!isT4 ? false : true)   && (preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3])>0 ? false:true)}>NVIDIA_TESLA_T4 (Available {preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3]} GPU)</option>
                                            <option disabled={((!isP4 ? false : true)   && (preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4])>0 ? false:true)}>NVIDIA_TESLA_P4 (Available {preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4]} GPU)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Label>RAM(in GB)</Form.Label>
                                        <Form.Group as={Row} controlId='formRam'>
                                        <Col xs="9">
                                        <Form.Control type="range" min={ramMin} max='500' value={ramValue} name="ram" onChange={e => {setRamValue(e.target.value);}} />
                                        </Col>
                                        <Col xs="3">
                                        <Form.Control value={ramValue} onChange={e => setRamValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Disk</Form.Label>
                                            <Form.Control as="select" name="disk" required onChange={handleChange}>
                                            {/* <option>Select Disk Type</option> */}
                                            <option disabled={quotas[zone].disk[0]>0?false : true}>SDD (Available {quotas[zone].disk[0]} GPU)</option>
                                            <option disabled={quotas[zone].disk[1]>0?false : true}>HDD (Available {quotas[zone].disk[1]} GPU)</option>
                                            <option disabled={quotas[zone].disk[2]>0?false : true}>Balanced (Available {quotas[zone].disk[2]} GPU)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Label>Disk Size(in TB)</Form.Label>
                                        <Form.Group as={Row} controlId='formDiskSize'>
                                        <Col xs>
                                        <Form.Control type="range" min='0' max='10' name="disksize" value={diskValue} onChange={e => {setDiskValue(e.target.value);}} />
                                        </Col>
                                        <Col xs="4">
                                        <Form.Control value={diskValue} onChange={e => setDiskValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Boot_Disk Image</Form.Label>
                                            <Form.Control as="select" name="image" required onChange={handleChange}>
                                            {/* <option>Select Image</option> */}
                                            {diskImage.map((row,index)=> {return(<option>{row.name}</option>)})}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formExternalIP">
                                        <Form.Check inline type="checkbox" label="Enable External IP" name="eipenable" onChange={(e)=> {setIpShow(!ipShow)}} />
                                        {ipShow && <Form.Control type='text' defaultValue={Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))} name="eip" onChange={handleChange}/>}
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="formNetworkTag">
                                                <Form.Label>Network Tag</Form.Label>
                                                <Form.Control type='text' name="networktag"  onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="formHostName">
                                                <Form.Label>Host Name</Form.Label>
                                                <Form.Control type='text' name="hostname" onChange={handleChange}/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-around ">
                                        <Form.Group controlId="formCreditsRequired" className="d-flex justify-content-center text-center">
                                            <Form.Label>
                                            Number of Credits Required
                                            </Form.Label>
                                            <Form.Control plaintext readOnly defaultValue="13" disabled className="w-50 text-success h4"/>
                                        </Form.Group>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-between">
                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                        <Button variant="danger" onClick={()=> {setcreateShow(false);createRef.current.reset();setValidated(false);setIpShow(false)}}>
                                            Close
                                        </Button>
                                    </Row>
                                    </Form>
                                </Container>
                            </Modal.Body>
                        </Modal>
                        <Modal size="lg" show={deleteShow} onHide={() => setdeleteShow(false)} aria-labelledby="contained-modal-title-vcenter" centered backdrop="static" keyboard={false}>
                            <Modal.Header closeButton>
                            <Modal.Title id="deleteVM">
                                Delete VM Instance
                            </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form name="delete">
                                    <Container centered>
                                        <Row className="justify-content-center">
                                            <Form.Group controlId="deleteVm" className="d-flex">
                                                <Form.Label className="mr-3 text-center" size="md">Confirm to Delete VM Instance</Form.Label>
                                                <Form.Control type="text" name="vmId" defaultValue={vmId} disabled />
                                            </Form.Group>
                                        </Row>
                                        <br/>
                                        <Row className="justify-content-around">
                                            <Button variant="primary" size="lg" onClick={handleDelete}>
                                                    Delete
                                            </Button>
                                            <Button variant="danger" size="lg" onClick={() => {setdeleteShow(false);}}>
                                                    Cancel
                                            </Button>
                                        </Row>
                                    </Container>
                                </Form>
                            </Modal.Body>
                        </Modal>
                        <Modal size="lg" show={transferShow} ref={updateRef} onHide={() => {setTransferShow(false);updateRef.current.reset();setIpShow(false)}} aria-labelledby="contained-modal-title-vcenter" centered backdrop="static" keyboard={false}>
                            <Modal.Header closeButton>
                            <Modal.Title id="transferVM">
                                Update VM Instance
                            </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                            <Form ref={updateRef} id="update" noValidate validated={validated} onSubmit={handleSubmit}>
                                    <Container centered>
                                        <Row>
                                            <Form.Group controlId="updateVm">
                                                <Form.Label size="lg">Select the VM instance to Update</Form.Label>
                                                <Form.Control as="select">
                                                {/* <option>Select VM</option> */}
                                                {vm.map((row,index)=> {return(<option>{row.name}</option>)})}
                                                </Form.Control>
                                            </Form.Group>
                                        </Row>
                                        <br/>
                                        <Row>
                                    <Col>
                                        <Form.Group controlId="formProject">
                                            <Form.Label>Project ID</Form.Label>
                                            <Form.Control type="text" defaultValue={createVMData["projectid"]} disabled />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Name of the Instance</Form.Label>
                                            <Form.Control type="text" defaultValue={createVMData["name"]} disabled/>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    {/* <Row>
                                    <Col>
                                        <Form.Group controlId="formZone">
                                            <Form.Label>Zone</Form.Label>
                                            <Form.Control as="select">
                                                <option>us-central-a</option>
                                                <option>us-central-b</option>
                                                <option>eu-east-a</option>
                                                <option>eu-west-b</option>
                                            </Form.Control>
                                        </Form.Group>
                                        <br/>
                                    </Col>
                                    <Col>
                                    <br/><br/>
                                        <Form.Group controlId="formDisk">
                                            <Form.Check type="checkbox" id="preempt" label="Pre-emptibility"/>
                                        </Form.Group>
                                        
                                    </Col>
                                    </Row>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formType">
                                            <Form.Label>Machine Type</Form.Label>
                                            <Form.Control as="select" name="machinetype" onChange={machineChange}>
                                            <option disabled={(preempt?quotas[zone].mfP[0]:quotas[zone].mf[0])>0?false:true}>EC2 (Available {preempt?quotas[zone].mfP[0]:quotas[zone].mf[0]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[1]:quotas[zone].mf[1])>0?false:true}>N1 (Available {preempt?quotas[zone].mfP[1]:quotas[zone].mf[1]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[2]:quotas[zone].mf[2])>0?false:true}>N2 (Available {preempt?quotas[zone].mfP[2]:quotas[zone].mf[2]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[3]:quotas[zone].mf[3])>0?false:true}>C2 (Available {preempt?quotas[zone].mfP[3]:quotas[zone].mf[3]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[4]:quotas[zone].mf[4])>0?false:true}>A2 (Available {preempt?quotas[zone].mfP[4]:quotas[zone].mf[4]} Machines)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formGPU">
                                            <Form.Label>GPU</Form.Label>
                                            <Form.Control as="select">
                                            <option disabled={(!isA100 ? true : false) && (preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0])>0?false:true} >NVIDIA_TESLA_A100 (Available {preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0]} GPU)</option>
                                            <option disabled={(!isV100 ? true : false) && (preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1])>0?false:true}>NVIDIA_TESLA_V100 (Available {preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1]} GPU)</option>
                                            <option disabled={(!isK80 ? true : false) && (preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2])>0?false:true}>NVIDIA_TESLA_K80 (Available {preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2]} GPU)</option>
                                            <option disabled={(!isT4 ? true : false) && (preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3])>0?false:true}>NVIDIA_TESLA_T4 (Available {preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3]} GPU)</option>
                                            <option disabled={(!isP4 ? true : false) && (preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4])>0?false:true}>NVIDIA_TESLA_P4 (Available {preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4]} GPU)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Label>RAM</Form.Label>
                                        <Form.Group as={Row} controlId='formRam'>
                                        <Col xs="9">
                                        <Form.Control type="range" min='0' max='1000' value={ramValue} onChange={e => setRamValue(e.target.value)} />
                                        </Col>
                                        <Col xs="3">
                                        <Form.Control value={ramValue} onChange={e => setRamValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Disk</Form.Label>
                                            <Form.Control as="select">
                                            <option disabled={quotas[zone].disk[0]>0?false : true}>SDD (Available {quotas[zone].disk[0]} GPU)</option>
                                            <option disabled={quotas[zone].disk[1]>0?false : true}>HDD (Available {quotas[zone].disk[1]} GPU)</option>
                                            <option disabled={quotas[zone].disk[2]>0?false : true}>Balanced (Available {quotas[zone].disk[2]} GPU)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Label>Disk Size(in MB)</Form.Label>
                                        <Form.Group as={Row} controlId='formDiskSize'>
                                        <Col xs>
                                        <Form.Control type="range" min='0' max='100000' value={diskValue} onChange={e => setDiskValue(e.target.value)} />
                                        </Col>
                                        <Col xs="4">
                                        <Form.Control value={diskValue} onChange={e => setDiskValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Boot_Disk Image</Form.Label>
                                            <Form.Control as="select" defaultValue='Ubuntu 18.04'>
                                            {diskImage.map((row,index)=> {return(<option>{row.name}</option>)})}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formExternalIP">
                                        <Form.Control type='text' placeholder="123.312.445.1" disabled />
                                        <Form.Check type='checkbox' id='e-ip' label="Enable External IP" onChange={()=> setIpShow(!ipShow)} />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formInernalIP">
                                        <Form.Label>Internal IP</Form.Label>
                                            <Form.Control type='text' placeholder="123.312.445.1" defaultValue="121.123.345.1"/>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="formNetworkTag">
                                                <Form.Label>Network Tag</Form.Label>
                                                <Form.Control type='text' placeholder="east-coast" />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="formHostName">
                                                <Form.Label>Host Name</Form.Label>
                                                <Form.Control type='text' placeholder="asda" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-center">
                                        <Form.Group controlId="formCredits" className="d-flex justify-content-center">
                                            <Form.Label>
                                            Number of Credits Required
                                            </Form.Label>
                                            <Form.Control plaintext readOnly defaultValue="13" disabled className="w-50 text-success h4"/>
                                        </Form.Group>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-between">
                                        <Button variant="primary" onClick={() => {setTransferShow(false);setShow("Updated");setTimeout(() => {setShow("None")}, 3000);}}>
                                            Submit
                                        </Button>
                                        <Button variant="danger" onClick={() => {setTransferShow(false);setShow("Updated");setTimeout(() => {setShow("None")}, 3000);}}>
                                            Close
                                        </Button>
                                    </Row> */}
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formZone">
                                            <Form.Label>Zone</Form.Label>
                                            <Form.Control as="select" name="zone" required onChange={zoneChange}>
                                                {/* <option>Select Zone</option> */}
                                                <option>us-central-a</option>
                                                <option>us-central-b</option>
                                                <option>eu-east-a</option>
                                                <option>eu-west-b</option>
                                            </Form.Control>
                                        </Form.Group>
                                        <br/>
                                    </Col>
                                    <Col>
                                    <br/><br/>
                                        <Form.Group controlId="formPreempt">
                                            <Form.Check type="checkbox" id="preempt" name="preempt" label="Pre-emptibility" />
                                        </Form.Group>
                                        
                                    </Col>
                                    </Row>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formType">
                                            <Form.Label>Machine Type</Form.Label>
                                            <Form.Control as="select" name="machinetype" required onChange={machineChange}>
                                            {/* <option>None</option> */}
                                            <option disabled={(preempt?quotas[zone].mfP[0]:quotas[zone].mf[0])>0?false:true}>EC2 (Available {preempt?quotas[zone].mfP[0]:quotas[zone].mf[0]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[1]:quotas[zone].mf[1])>0?false:true}>N1 (Available {preempt?quotas[zone].mfP[1]:quotas[zone].mf[1]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[2]:quotas[zone].mf[2])>0?false:true}>N2 (Available {preempt?quotas[zone].mfP[2]:quotas[zone].mf[2]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[3]:quotas[zone].mf[3])>0?false:true}>C2 (Available {preempt?quotas[zone].mfP[3]:quotas[zone].mf[3]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[4]:quotas[zone].mf[4])>0?false:true}>A2 (Available {preempt?quotas[zone].mfP[4]:quotas[zone].mf[4]} Machines)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formGPU">
                                            <Form.Label>GPU</Form.Label>
                                            <Form.Control as="select" name="gpu" required onChange={e => {if(e.target.value === 'NVIDIA_TESLA_A100'){setRamMin(85);setRamValue(85)};}}>
                                            <option>None</option>
                                            <option disabled={((!isA100 ? false : true) && (preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0])>0 ? false:true)}>NVIDIA_TESLA_A100 (Available {preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0]} GPU)</option>
                                            <option disabled={((!isV100 ? false : true) && (preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1])>0 ? false:true)}>NVIDIA_TESLA_V100 (Available {preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1]} GPU)</option>
                                            <option disabled={((!isK80 ? false : true)  && (preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2])>0 ? false:true)}>NVIDIA_TESLA_K80 (Available {preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2]} GPU)</option>
                                            <option disabled={((!isT4 ? false : true)   && (preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3])>0 ? false:true)}>NVIDIA_TESLA_T4 (Available {preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3]} GPU)</option>
                                            <option disabled={((!isP4 ? false : true)   && (preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4])>0 ? false:true)}>NVIDIA_TESLA_P4 (Available {preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4]} GPU)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Label>RAM(in GB)</Form.Label>
                                        <Form.Group as={Row} controlId='formRam'>
                                        <Col xs="9">
                                        <Form.Control type="range" min={ramMin} max='500' value={ramValue} name="ram" onChange={e => {setRamValue(e.target.value);}} />
                                        </Col>
                                        <Col xs="3">
                                        <Form.Control value={ramValue} onChange={e => setRamValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Disk</Form.Label>
                                            <Form.Control as="select" name="disk" required onChange={handleChange}>
                                            {/* <option>Select Disk Type</option> */}
                                            <option disabled={quotas[zone].disk[0]>0?false : true}>SDD (Available {quotas[zone].disk[0]} GPU)</option>
                                            <option disabled={quotas[zone].disk[1]>0?false : true}>HDD (Available {quotas[zone].disk[1]} GPU)</option>
                                            <option disabled={quotas[zone].disk[2]>0?false : true}>Balanced (Available {quotas[zone].disk[2]} GPU)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Label>Disk Size(in TB)</Form.Label>
                                        <Form.Group as={Row} controlId='formDiskSize'>
                                        <Col xs>
                                        <Form.Control type="range" min='0' max='10' name="disksize" value={diskValue} onChange={e => {setDiskValue(e.target.value);}} />
                                        </Col>
                                        <Col xs="4">
                                        <Form.Control value={diskValue} onChange={e => setDiskValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Boot_Disk Image</Form.Label>
                                            <Form.Control as="select" name="image" required onChange={handleChange}>
                                            {/* <option>Select Image</option> */}
                                            {diskImage.map((row,index)=> {return(<option>{row.name}</option>)})}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formExternalIP">
                                        <Form.Check inline type="checkbox" label="Enable External IP" name="eipenable" onChange={(e)=> {setIpShow(!ipShow)}} />
                                        {ipShow && <Form.Control type='text' defaultValue={Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))} name="eip" onChange={handleChange}/>}
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="formNetworkTag">
                                                <Form.Label>Network Tag</Form.Label>
                                                <Form.Control type='text' name="networktag"  onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="formHostName">
                                                <Form.Label>Host Name</Form.Label>
                                                <Form.Control type='text' name="hostname" onChange={handleChange}/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-around ">
                                        <Form.Group controlId="formCreditsRequired" className="d-flex justify-content-center text-center">
                                            <Form.Label>
                                            Number of Credits Required
                                            </Form.Label>
                                            <Form.Control plaintext readOnly defaultValue="13" disabled className="w-50 text-success h4"/>
                                        </Form.Group>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-between">
                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                        <Button variant="danger" onClick={()=> {setTransferShow(false);setShow("Updated");setTimeout(() => {setShow("None")}, 3000);createRef.current.reset();setIpShow(false)}}>
                                            Close
                                        </Button>
                                    </Row>
                                    </Container>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    </Container>
                </Row>
            </Container>
            <br/>
            <Container>
                <Table striped bordered hover>
                    <thead>
                        <tr className="text-center">
                        <th>#</th>
                        <th>VM Name</th>
                        <th>Zone</th>
                        <th>External IP</th>
                        <th>Internal IP</th>
                        <th>Status</th>
                        <th>Delete VM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vmdata.map(renderTable)}
                    </tbody>
                </Table>
            </Container>
            </Container>
        );
    }

    export default VM;
