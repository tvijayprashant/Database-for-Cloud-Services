import React from 'react';
import {Link,withRouter,useHistory} from 'react-router-dom';
import {Container,Row,Col,Button,Alert,Navbar,Nav,NavDropdown,Modal,Form,Table} from 'react-bootstrap';
import axios from 'axios';


function simulateNetworkRequest() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

let index=0;
let projId = {'id':[],'curr':''};
let vm = [];

function VM (props) {

    var props = {location:{state:{
        username: "vp4@gmail.com",
		password: "a",
		user: "USR000007",
	}}};
    const credits = {disk:[0.10,0.30,0.15], gpuP:[1.35,0.77,0.24,0.45,0.32], gpu:[1.35*2,0.77*2,0.24*2,0.45*2,0.32*2],mfP:[0.20,0.40,0.30,0.50,0.70], mf:[0.2*2,0.4*2,0.3*2,0.5*2,0.7*2], ram:0.20, network:0.95}

    const history=useHistory()
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
    const [dCost,setDCost] = React.useState(credits["disk"][0]);
    const [gpuCost,setGpuCost] = React.useState(0);
    const [mfCost,setMfCost] = React.useState(0);
    const [ramCost,setRamCost] = React.useState(0);
    const [netCost,setNetCost] = React.useState(0);
    const [dataReceived,setDataReceived] = React.useState(true);
    const [vmId,setvmId] = React.useState("");
    const [proj,setProj] = React.useState('');
    const [updateVM,setUpdateVM] = React.useState([]);
    // const [vm,setVM] = React.useState([])

    // const tableData=[{ name:"Mark",vmID:"VM_000007", zone:"us-central-a", iIP:"123.234.345.1", eIP:"322.214.12.12", status:false},
    //         { name:"Maurya",vmID:"VM_000008", zone:"us-central-a", iIP:"123.234.345.1", eIP:"322.214.12.12",status:true },
    //         { name:"Mister",vmID:"VM_000009", zone:"us-central-a", iIP:"123.234.345.1", eIP:"322.214.12.12",status:false },
    //         { name:"Master",vmID:"VM_000000", zone:"us-central-a", iIP:"123.234.345.1", eIP:"322.214.12.12",status:true }]

    const [vmdata,setvmdata] = React.useState([])

    let data = [{email: props.location.state.username, passwd: props.location.state.password, user_id:props.location.state.user}]
    

    const quotas = [{nvm:5, disk:[2,3,4], gpuP:[1,1,1,1,1], gpu:[1,1,1,1,1],mfP:[2,2,2,2,2], mf:[0,0,2,2,2]},
                    {nvm:15, disk:[2,3,5], gpuP:[1,2,3,4,5], gpu:[1,1,2,1,1],mfP:[2,0,2,2,2], mf:[2,2,2,4,2]},
                    {nvm:52, disk:[0,0,0], gpuP:[1,1,0,10,0], gpu:[1,2,1,1,1],mfP:[2,2,0,2,2], mf:[8,2,2,2,2]},
                    {nvm:2, disk:[4,3,4], gpuP:[1,0,1,0,1], gpu:[1,1,11,3,1],mfP:[2,2,0,20,2], mf:[2,8,2,7,2]}]
                    
                    // const vm = [{name:"asdlfjns"},
                    //             {name:"knvbafkhv"},
                    //             {name:"kjhbasjhfb"},
                    //             {name:"kmoufns"}]
                    
                    const diskImage = [{name:"Ubuntu 18.04"},
                    {name:"Ubuntu 20.04"},
                    {name:"Fedora"},
                    {name:"Cent OS"},
                    {name:"Arch Linux"},
                    {name:"Kali"}]
                    
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
        json["machine"] = json["machine"].split(' ')[0]
        json["disk"] = json["disk"].split(' ')[0]
        if(json['disk']=='SSD'){json['disk']=`(${json['disksize']},0,0)`}
        else if(json['disk']=='HDD'){json['disk']=`(0,${json['disksize']},0)`}
        else if(json['disk']=='Balanced'){json['disk']=`(0,0,${json['disksize']})`};
        if(json["gpu"] !== 'None')
        json["gpu"] = json["gpu"].split(' ')[0]
        if(json['gpu']=='None'){json['gpu']=`(0,0,0,0,0)`}
        if(json['gpu'] == 'NVIDIA_TESLA_A100'){json['gpu'] = `(1,0,0,0,0)`}
        else if(json['gpu'] == 'NVIDIA_TESLA_V100'){json['gpu'] = `(0,1,0,0,0)`}
        else if(json['gpu'] == 'NVIDIA_TESLA_K80'){json['gpu'] = `(0,0,1,0,0)`}
        else if(json['gpu'] == 'NVIDIA_TESLA_T4'){json['gpu'] = `(0,0,0,1,0)`}
        else if(json['gpu'] == 'NVIDIA_TESLA_P4'){json['gpu'] = `(0,0,0,0,1)`}       
        
        if(json['preemptibility']=='on'){
            json['preemptibility']=true;
        }
        else if(json['preemptibility']=='off'){
            json['preemptibility'] = false;
        }
        tableEntry["name"] = json['name']
        tableEntry["zone"] = json['zone']
        tableEntry["eIP"] = json['external_ip']
        // tableEntry["iIP"] = json['internal_ip']
        tableEntry["status"] = false
        json['status'] = 'Stopped'
        tableEntry["iIP"] = Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))
        json['internal_ip'] = tableEntry['iIP']
        json['ram']= parseInt(json['ram'])
        // console.log(new Date());
        let date = new Date();
        date = date.toISOString();
        json['date'] = `${date.slice(0,10)} ${date.slice(11,19)}`
        json['userID'] = props.location.state.user
        json['password'] = props.location.state.password
        json['email'] = props.location.state.username
        json['projectID'] = proj;
        console.log(json)
        // req = {
            //     userID: "USR000007",
        //     email: "jawahar@pes.edu",
        //     password: "jawahar@123",
        //     name: "chaii",
        //     boot_disk: "Ubuntu-20.04",
        //     preemptibility: false,
        //     internal_ip: "10.1.10.21",
        //     external_ip: null,
        //     host_name: "microsoft",
        //     network_tag: null,
        //     subnet: null,
        //     projectID:'pluck-rarity',
        //     zone_name: "us-central-a",
        //     ram: 32,
        //     gpu: "(0,0,0,0,0)",
        //     disk: "(1,0,0)", `(${},${}) `
        //     machine: "EC2",
        //     date: "2021-11-10 10:00:00",
        // };

        axios({method:"POST",
        url:"http://localhost:8008/create_vm",
        data: json        
    })
    .then((res)=>{
        if(res.data.vm == 1){
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
        handleVM();  
    })
    .catch((err)=>console.log(err))
        
    console.log(json)
        
}

};

const zoneMap = {'us-central-a':0,'us-central-b':1,'eu-east-a':2,'eu-west-b':3};

const zoneChange = (e) =>{
    setZone(zoneMap[e.target.value]);
};

const machineChange = (e)=>{
    if(e.target.value.split(' ')[0] === 'A2'){setA100(true);setV100(false);setK80(false);setT4(false);setP4(false);setMfCost(preempt?credits["mfP"][0]:credits["mf"][0])}
    if(e.target.value.split(' ')[0] === 'N1'){setA100(false);setV100(true);setK80(true);setT4(true);setP4(true);setRamValue(30);setRamMin(4);setMfCost(preempt?credits["mfP"][1]:credits["mf"][1])}
    if(e.target.value.split(' ')[0] === 'N2'){setA100(false);setV100(false);setK80(false);setT4(false);setP4(false);setRamValue(30);setRamMin(4);setMfCost(preempt?credits["mfP"][2]:credits["mf"][2])}
    if(e.target.value.split(' ')[0] === 'EC2'){setA100(false);setV100(false);setK80(false);setT4(false);setP4(false);setRamValue(30);setRamMin(4);setMfCost(preempt?credits["mfP"][3]:credits["mf"][3])}
    if(e.target.value.split(' ')[0] === 'C2'){setA100(false);setV100(false);setK80(false);setT4(false);setP4(false);setRamValue(30);setRamMin(4);setMfCost(preempt?credits["mfP"][4]:credits["mf"][4])}
}

const gpuChange = e => {
    // console.log(e.target.value.split(' ')[0])
    if(e.target.value.split(' ')[0] === 'NVIDIA_TESLA_A100'){setRamMin(85);setRamValue(85);setGpuCost(preempt?credits["gpuP"][0]:credits["gpu"][0])}
    if(e.target.value.split(' ')[0] === 'NVIDIA_TESLA_V100'){setGpuCost(preempt?credits["gpuP"][1]:credits["gpu"][1])}
    if(e.target.value.split(' ')[0] === 'NVIDIA_TESLA_K80'){setGpuCost(preempt?credits["gpuP"][2]:credits["gpu"][2])}
    if(e.target.value.split(' ')[0] === 'NVIDIA_TESLA_T4'){setGpuCost(preempt?credits["gpuP"][3]:credits["gpu"][3])}
    if(e.target.value.split(' ')[0] === 'NVIDIA_TESLA_P4'){setGpuCost(preempt?credits["gpuP"][4]:credits["gpu"][4])}  
}

const diskChange = e => {
    if(e.target.value.split(' ')[0] === 'SSD'){setDCost(credits["disk"][0])}
    if(e.target.value.split(' ')[0] === 'HDD'){setDCost(credits["disk"][1])}
    if(e.target.value.split(' ')[0] === 'Balanced'){setDCost(credits["disk"][2])}
}

const projQuota = async (e)=>{
    let req = {email:props.location.state.username, password:props.location.state.password, user_id:props.location.state.user, projectID:proj}
    console.log(req)
    await axios({
        method: "POST",
        url: "http://localhost:8008/vm/quotas",
        data: req
    })
    .then((res)=> {console.log(res.data)})
    .catch(err => console.log(err))
}

async function get_proj(){
    let data = [{email: props.location.state.username, passwd: props.location.state.password, user_id:props.location.state.user}]

    await axios({
        method: "POST",
        url: "http://localhost:8008/project",
        data: data
    })
    .then((res)=> {console.log(res.data);projId.id = res.data.id;setProj(res.data.curr);})
    .catch(err => console.log(err))
}

const handleVM = async (e)=>{
    let req= {email: props.location.state.username, passwd: props.location.state.password, user_id:props.location.state.user, projectID:proj}
       await axios({method:"POST",
               url:"http://localhost:8008/vm",
               data:req})
           .then((res)=>{
               let vms = res.data.vms;
               console.log(vms)
               setvmdata(vms)
           })
           .catch((err)=>console.log(err))
}

React.useEffect(()=>{
    get_proj();
},[])

React.useEffect((e) => {
    if (isLoading[index]) {
      simulateNetworkRequest().then(() => {
        setLoading([...isLoading.slice(0,index),false,...isLoading.slice(index+1)]);
        setStopped([...isStopped.slice(0,index),!isStopped[index],...isStopped.slice(index+1)]);
      });
      vmdata[index].status = isStopped[index];
    }
  }, [isLoading,isStopped,vmdata]);

    const handleClick = (e) => {
        index = parseInt(e.target.id.slice(0));
        let req = [{email: props.location.state.username, passwd: props.location.state.password, user_id:props.location.state.user}]
        req[0]["vmId"] = e.target.id.slice(1,)
        req[0]["status"] = isStopped[index]?'Running':'Stopped'
        axios({method:"POST",
                url:"http://localhost:8008/status",
                data: req
            })
            .then((res)=>{console.log(res.data)})
            .catch((err)=>console.log(err))
        setLoading([...isLoading.slice(0,index),true,...isLoading.slice(index+1)]);
    }

    const handleDelete = async (e) => {
        console.log(vmId)
        let req = {email:props.location.state.username, password:props.location.state.password, userID:props.location.state.user, vm:vmId}
        await axios({method:"POST",
                url:"http://localhost:8008/delete_vm",
                data: req
            })
            .then((res)=>{if(res.data.result ===1){
                const newData = [...vmdata]
                newData.splice(vmdata.findIndex((c)=>c.name===vmId),1)
                setvmdata(newData);
                setdeleteShow(false);
                setShow("Deleted");
                setTimeout(() => {setShow("None")}, 3000);
            }})
            .catch((err)=>console.log(err))
        
    };

    const handleUpdateVM=async (e)=>{
        let req = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, vm:e.target.selectedOptions[0].id}
        await axios({method:"POST",
                url:"http://localhost:8008/vm/details",
                data: req
            })
            .then((res)=>setUpdateVM(res.data))
            .catch((err)=>console.log(err))
    }

      const renderTable = (row,index) => {
        isLoading.push(false)
        isStopped.push(row.status==='Stopped'?true:false)
          return(
              <tr key={index} className="text-center">
                <td>{index+1}</td>
                <td>{row.name}</td>
                <td>{row.vm_id}</td>
                <td>{row.zone_name}</td>
                <td><Link to="/abcd">{row.external_ip}</Link></td>
                <td><Link to="/abcd">{row.internal_ip}</Link></td>
                <td className="d-flex justify-content-center align-items-center" colSpan="2">
                    <Button className="ml-2 mr-2 pl-3 pr-3" variant={isStopped[index]?"danger":"success"}  id={index+''+row.vm_id} disabled={isLoading[index]} onClick={handleClick}>
                        {isLoading[index] ? !isStopped[index] ?'Stopping':'Starting' : isStopped[index] ?'Offline':'Online'}
                    </Button>
                </td>
                <td className=" justify-content-center align-items-center">
                    <Button className="ml-2 mr-2 pl-3 pr-3" variant="danger" id={row.vm_id} onClick={(e)=>{setdeleteShow(true);setvmId(e.target.id)}}>
                        Delete
                    </Button>
                </td>
              </tr>
          )
      }


    return(
        <React.Fragment>
        {dataReceived &&
            <Container fluid>
                {/* {console.log(props.location.state)} */}
             <Navbar bg="dark" variant="dark" sticky="top">
                <Navbar.Brand href="/">GCP</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <NavDropdown  title="My Projects" id="basic-nav-dropdown">
                        {projId.id.map((row,index)=>{return(<NavDropdown.Item variant="dark" onClick={(e)=>{setProj(e.currentTarget.innerText);handleVM()}}>{row.id}</NavDropdown.Item>)})}
                        <NavDropdown.Divider />
                        <NavDropdown.Item style={{backgroundColor: 'lightblue',color:'red'}}>{proj}</NavDropdown.Item>
                    </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        <Row className="mt-3">
            <Nav variant="pills">
            <Nav.Item>
                    <Nav.Link onClick={()=> history.push({
    pathname: '/dashboard',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user} 
    })}>DashBoard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="profile" onClick={()=> history.push({
    pathname: '/profile',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user} 
    })}>Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link active eventKey="vm" onClick={()=> history.push({
    pathname: '/vm',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user} 
    })}>VM Instances</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="metrics" onClick={()=> history.push({
    pathname: '/metrics',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user} 
    })}>Metrics</Nav.Link>
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
                        <Button variant="primary" size='md' onClick={() => {setcreateShow(true);projQuota()}}>Create VM</Button>
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
                                            <Form.Control type="text" name="projectID" value={proj} disabled />
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
                                            <Form.Control as="select" name="zone_name" required onChange={zoneChange}>
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
                                            <Form.Check type="checkbox" id="preempt" name="preemptibility" label="Pre-emptibility" onClick={()=>setPreempt(!preempt)}/>
                                        </Form.Group>
                                        
                                    </Col>
                                    </Row>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formType">
                                            <Form.Label>Machine Type</Form.Label>
                                            <Form.Control as="select" name="machine" required onChange={machineChange}>
                                            {/* <option>None</option> */}
                                            {/* {console.log(preempt?credits["mfP"][0]:credits["mf"][0])} */}
                                            <option disabled={(preempt?quotas[zone].mfP[0]:quotas[zone].mf[0])>0?false:true} >EC2 (Available {preempt?quotas[zone].mfP[0]:quotas[zone].mf[0]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[1]:quotas[zone].mf[1])>0?false:true} >N1 (Available {preempt?quotas[zone].mfP[1]:quotas[zone].mf[1]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[2]:quotas[zone].mf[2])>0?false:true} >N2 (Available {preempt?quotas[zone].mfP[2]:quotas[zone].mf[2]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[3]:quotas[zone].mf[3])>0?false:true} >C2 (Available {preempt?quotas[zone].mfP[3]:quotas[zone].mf[3]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[4]:quotas[zone].mf[4])>0?false:true} >A2 (Available {preempt?quotas[zone].mfP[4]:quotas[zone].mf[4]} Machines)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formGPU">
                                            <Form.Label>GPU</Form.Label>
                                            <Form.Control as="select" name="gpu" required onChange={gpuChange}>
                                            {/* {console.log(mfCost)} */}
                                            <option>None</option>
                                            <option disabled={((!isA100 ? false : true) && (preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0])>0 ? false:true)} >NVIDIA_TESLA_A100 (Available {preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0]} GPU)</option>
                                            <option disabled={((!isV100 ? false : true) && (preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1])>0 ? false:true)} >NVIDIA_TESLA_V100 (Available {preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1]} GPU)</option>
                                            <option disabled={((!isK80 ? false : true)  && (preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2])>0 ? false:true)} >NVIDIA_TESLA_K80 (Available {preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2]} GPU)</option>
                                            <option disabled={((!isT4 ? false : true)   && (preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3])>0 ? false:true)} >NVIDIA_TESLA_T4 (Available {preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3]} GPU)</option>
                                            <option disabled={((!isP4 ? false : true)   && (preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4])>0 ? false:true)} >NVIDIA_TESLA_P4 (Available {preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4]} GPU)</option>
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
                                        <Form.Control type="range" min={ramMin} max='500' value={ramValue} name="ram" onChange={e => {setRamValue(e.target.value);setRamCost(credits["ram"])}} />
                                        </Col>
                                        <Col xs="3">
                                        <Form.Control value={ramValue} onChange={e => setRamValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Disk</Form.Label>
                                            <Form.Control as="select" name="disk" onChange={diskChange} required>
                                            {/* <option>Select Disk Type</option> */}
                                            <option disabled={quotas[zone].disk[0]>0?false : true} >SSD (Available {quotas[zone].disk[0]} PB)</option>
                                            <option disabled={quotas[zone].disk[1]>0?false : true} >HDD (Available {quotas[zone].disk[1]} PB)</option>
                                            <option disabled={quotas[zone].disk[2]>0?false : true} >Balanced (Available {quotas[zone].disk[2]} PB)</option>
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
                                        <Form.Control type="range" min='0' max='10' step="1" name="disksize" value={diskValue} onChange={e => {setDiskValue(e.target.value);}} />
                                        </Col>
                                        <Col xs="4">
                                        <Form.Control value={diskValue} onChange={e => setDiskValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Boot_Disk Image</Form.Label>
                                            <Form.Control as="select" name="boot_disk" required>
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
                                        {ipShow && <Form.Control type='text' defaultValue={Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))} name="external_ip"/>}
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="formNetworkTag">
                                                <Form.Label>Network Tag</Form.Label>
                                                <Form.Control type='text' name="network_tag" onClick={()=>setNetCost(credits["network"])}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="formHostName">
                                                <Form.Label>Host Name</Form.Label>
                                                <Form.Control type='text' name="host_name"/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-around ">
                                    <Col>
                                        <Form.Group controlId="formCreditsRequired" className="d-flex justify-content-center text-center">
                                            <Form.Label>
                                            Number of Credits Charged
                                            </Form.Label>
                                            <Form.Control plaintext readOnly value={Math.round(ramCost*ramValue+netCost+dCost*diskValue,4)} disabled className="w-50 text-success h4"/>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formCreditsRequired" className="d-flex justify-content-center text-center">
                                            <Form.Label>
                                            Number of Credits Charged Hourly
                                            </Form.Label>
                                            <Form.Control plaintext readOnly value={Math.round(mfCost+gpuCost,4)} disabled className="w-50 text-success h4"/>
                                        </Form.Group>
                                    </Col>
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
                                                <Form.Control as="select" onChange={handleUpdateVM}>
                                                <option>Select VM</option>
                                                {vmdata.map((row,index)=> {return(<option id={row.vm_id}>{row.name}</option>)})}
                                                </Form.Control>
                                            </Form.Group>
                                        </Row>
                                        <br/>
                                        <Row>
                                    <Col>
                                        <Form.Group controlId="formProject">
                                            <Form.Label>Project ID</Form.Label>
                                            <Form.Control type="text" defaultValue={proj} disabled />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Name of the Instance</Form.Label>
                                            <Form.Control type="text" value={updateVM.name} disabled/>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    
                                    {/* <Row>
                                    <Col>
                                        <Form.Group controlId="formZone">
                                            <Form.Label>Zone</Form.Label>
                                            <Form.Control as="select" name="zone" required onChange={zoneChange}>
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
                                            <Form.Control as="select" name="disk" required>
                                            <option disabled={quotas[zone].disk[0]>0?false : true}>SDD (Available {quotas[zone].disk[0]} Disk)</option>
                                            <option disabled={quotas[zone].disk[1]>0?false : true}>HDD (Available {quotas[zone].disk[1]} Disk)</option>
                                            <option disabled={quotas[zone].disk[2]>0?false : true}>Balanced (Available {quotas[zone].disk[2]} Disk)</option>
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
                                            <Form.Control as="select" name="image" required>
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
                                        {ipShow && <Form.Control type='text' defaultValue={Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))} name="eip"/>}
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="formNetworkTag">
                                                <Form.Label>Network Tag</Form.Label>
                                                <Form.Control type='text' name="networktag"/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="formHostName">
                                                <Form.Label>Host Name</Form.Label>
                                                <Form.Control type='text' name="hostname"/>
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
                                    </Row> */}
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formZone">
                                            <Form.Label>Zone</Form.Label>
                                            <Form.Control as="select" name="zone" value={updateVM.zone_name} required onChange={zoneChange}>
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
                                            <Form.Check type="checkbox" id="preempt" value={updateVM.preemptibility?'on':'off'} name="preempt" label="Pre-emptibility" onClick={()=>setPreempt(!preempt)}/>
                                        </Form.Group>
                                        
                                    </Col>
                                    </Row>
                                    <Row>
                                    <Col>
                                        <Form.Group controlId="formType">
                                            <Form.Label>Machine Type</Form.Label>
                                            <Form.Control as="select" name="machinetype" value={updateVM.machine} required onChange={machineChange}>
                                            {/* <option>None</option> */}
                                            {/* {console.log(preempt?credits["mfP"][0]:credits["mf"][0])} */}
                                            <option disabled={(preempt?quotas[zone].mfP[0]:quotas[zone].mf[0])>0?false:true} >EC2 (Available {preempt?quotas[zone].mfP[0]:quotas[zone].mf[0]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[1]:quotas[zone].mf[1])>0?false:true} >N1 (Available {preempt?quotas[zone].mfP[1]:quotas[zone].mf[1]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[2]:quotas[zone].mf[2])>0?false:true} >N2 (Available {preempt?quotas[zone].mfP[2]:quotas[zone].mf[2]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[3]:quotas[zone].mf[3])>0?false:true} >C2 (Available {preempt?quotas[zone].mfP[3]:quotas[zone].mf[3]} Machines)</option>
                                            <option disabled={(preempt?quotas[zone].mfP[4]:quotas[zone].mf[4])>0?false:true} >A2 (Available {preempt?quotas[zone].mfP[4]:quotas[zone].mf[4]} Machines)</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formGPU">
                                            <Form.Label>GPU</Form.Label>
                                            <Form.Control as="select" name="gpu" required onChange={gpuChange}>
                                            {/* {console.log(mfCost)} */}
                                            <option>None</option>
                                            <option disabled={((!isA100 ? false : true) && (preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0])>0 ? false:true)} >NVIDIA_TESLA_A100 (Available {preempt?quotas[zone].gpuP[0]:quotas[zone].gpu[0]} GPU)</option>
                                            <option disabled={((!isV100 ? false : true) && (preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1])>0 ? false:true)} >NVIDIA_TESLA_V100 (Available {preempt?quotas[zone].gpuP[1]:quotas[zone].gpu[1]} GPU)</option>
                                            <option disabled={((!isK80 ? false : true)  && (preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2])>0 ? false:true)} >NVIDIA_TESLA_K80 (Available {preempt?quotas[zone].gpuP[2]:quotas[zone].gpu[2]} GPU)</option>
                                            <option disabled={((!isT4 ? false : true)   && (preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3])>0 ? false:true)} >NVIDIA_TESLA_T4 (Available {preempt?quotas[zone].gpuP[3]:quotas[zone].gpu[3]} GPU)</option>
                                            <option disabled={((!isP4 ? false : true)   && (preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4])>0 ? false:true)} >NVIDIA_TESLA_P4 (Available {preempt?quotas[zone].gpuP[4]:quotas[zone].gpu[4]} GPU)</option>
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
                                        <Form.Control type="range" min={ramMin} max='500' value={ramValue} name="ram" onChange={e => {setRamValue(e.target.value);setRamCost(credits["ram"])}} />
                                        </Col>
                                        <Col xs="3">
                                        <Form.Control value={ramValue} onChange={e => setRamValue(e.target.value)}/>
                                        </Col>
                                    </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formDisk">
                                            <Form.Label>Disk</Form.Label>
                                            <Form.Control as="select" name="disk" onChange={diskChange} required>
                                            {/* <option>Select Disk Type</option> */}
                                            <option disabled={quotas[zone].disk[0]>0?false : true} >SDD (Available {quotas[zone].disk[0]} PB)</option>
                                            <option disabled={quotas[zone].disk[1]>0?false : true} >HDD (Available {quotas[zone].disk[1]} PB)</option>
                                            <option disabled={quotas[zone].disk[2]>0?false : true} >Balanced (Available {quotas[zone].disk[2]} PB)</option>
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
                                            <Form.Control as="select" name="image" required>
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
                                        {ipShow && <Form.Control type='text' defaultValue={Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))+"."+Math.round(Math.random() * (256))} name="eip"/>}
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="formNetworkTag">
                                                <Form.Label>Network Tag</Form.Label>
                                                <Form.Control type='text' name="networktag" onClick={()=>setNetCost(credits["network"])}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group controlId="formHostName">
                                                <Form.Label>Host Name</Form.Label>
                                                <Form.Control type='text' name="hostname"/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-around ">
                                    <Col>
                                        <Form.Group controlId="formCreditsRequired" className="d-flex justify-content-center text-center">
                                            <Form.Label>
                                            Number of Credits Charged
                                            </Form.Label>
                                            <Form.Control plaintext readOnly value={Math.round(ramCost*ramValue+netCost+dCost*diskValue,4)} disabled className="w-50 text-success h4"/>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formCreditsRequired" className="d-flex justify-content-center text-center">
                                            <Form.Label>
                                            Number of Credits Charged Hourly
                                            </Form.Label>
                                            <Form.Control plaintext readOnly value={Math.round(mfCost+gpuCost,4)} disabled className="w-50 text-success h4"/>
                                        </Form.Group>
                                    </Col>
                                    </Row>
                                    <br/>
                                    <Row className="d-flex justify-content-between">
                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                        <Button variant="danger" onClick={()=> {setTransferShow(false);setValidated(false);setIpShow(false)}}>
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
                        <th>VM ID</th>
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
                }
        </React.Fragment>
        );
    }

    export default withRouter(VM);
