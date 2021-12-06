import React from 'react'
import { Container,Navbar,Nav,Row,Col,NavDropdown,Form,Table,Button,Modal,Alert } from 'react-bootstrap'
import { withRouter,useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios'

let projId = {'id':[],'curr':''};

function Profile(props){
    const history = useHistory()
    const [setModal, setModalShow] = React.useState(false);
    const [projNo,setProjNo] = React.useState(-1);
    const [zone,setZone] = React.useState(0);
    const [isUser,setUser] = React.useState(props.location.state.admin===1?true:false);
    const [dataReceived,setDataReceived] = React.useState(false);
    const [projShow, setProjShow] = React.useState(false);
    const [vProj,setVP] = React.useState(false);
    const [proj,setProj] = React.useState('');
    const [quotas,setQuotas] = React.useState([{nvm:0, disk:[0,0,0], gpuP:[0,0,0,0,0], gpu:[0,0,0,0,0],mfP:[0,0,0,0,0], mf:[0,0,0,0,0]},
                        {nvm:0, disk:[0,0,0], gpuP:[0,0,0,0,0], gpu:[0,0,0,0,0],mfP:[0,0,0,0,0], mf:[0,0,0,0,0]},
                        {nvm:0, disk:[0,0,0], gpuP:[0,0,0,0,0], gpu:[0,0,0,0,0],mfP:[0,0,0,0,0], mf:[0,0,0,0,0]},
                        {nvm:0, disk:[0,0,0], gpuP:[0,0,0,0,0], gpu:[0,0,0,0,0],mfP:[0,0,0,0,0], mf:[0,0,0,0,0]}]);
    
    // var props = {location:{state:{
    //     username: "vp4@gmail.com",
	// 	password: "a",
	// 	user: "USR000007",
	// }}};

    // const tableData = [{id:12345678,vm:[{name:"sdfsgva",cost:123},{name:"fghd",cost:542}]},
    //                     {id:12345678,vm:[{name:"sdfsgva",cost:123},{name:"fghd",cost:542},{name:"sdfsgdfsfva",cost:13}]},
    //                     {id:12345678,vm:[{name:"sdfsgva",cost:123},{name:"fghd",cost:542}]}]
    const [tableData,setTable] = React.useState([])

    async function get_proj(){
        await axios({
            method: "POST",
            url: "http://localhost:8008/project",
            data: data
        })
        .then((res)=> {projId.id = res.data.id;setProj(res.data.curr);get_table()})
        .catch(err => console.log(err))
    }
    
    async function get_table(){
            const p = []
            for(let i=0;i<projId.id.length;i++)
                p.push(projId.id[i].id.trim())
            data = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, project_id: p}
            await axios({
                method:"POST",
                url:"http://localhost:8008/vm_cost",
                data: data
            })
            .then((res)=>{
                    for(let i=0;i<res.data.list.length;i++){
                        for(let j=0;j<res.data.list[i].vm.length;j++)
                            if(!res.data.list[i].vm[j].cost)
                            res.data.list[i].vm[j].cost = 0;
                    }
                    setTable(res.data.list)
                    setDataReceived(true)
                })
                .catch((err)=>console.log(err));
            }
        
    React.useEffect(()=>{
        get_proj();
    },[])

    const handleDelete = (e)=>{
        console.log(e.target.id)
    }

    // const handleProj = async (e)=>{
    //     let req= {email: props.location.state.username, passwd: props.location.state.password, user_id:props.location.state.user, projectID:proj}
    //        await axios({method:"POST",
    //                url:"http://localhost:8008/vm",
    //                data:req})
    //            .then((res)=>{
    //                let vms = res.data.vms;
    //                console.log(vms)
    //                setVM(vms)
    //            })
    //            .catch((err)=>console.log(err))
    //    }

    const handleQuotas = async(e)=>{

        let req= {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, projectID:e.target.id}
           await axios({method:"POST",
                   url:"http://localhost:8008/vm/quotas",
                   data:req})
               .then((res)=>{
                   setQuotas(res.data.quotas)
               })
               .catch((err)=>console.log(err))
               setModalShow(true);
    }

    const renderTable = (row,index) => {
        let sum = 0;
        for(let i=0; i < row.vm.length; i++) {
            sum += row.vm[i].cost;
        }
        return(
            // <tr>
            <React.Fragment>
                <tr key={index} className="align-items-center align-content-center">
                <th rowSpan={row.vm.length+1}>{row.id}<br/><br/>
                Total Runtime Cost: {sum}<br/><br/>
                <Button variant={isUser?"outline-light":"outline-primary"} id={row.id} onClick={handleQuotas}>{isUser?"View":"Edit"}</Button>
                <Button className="ml-5" variant="outline-danger" id={index} onClick={handleDelete} disabled={row.vm.length === 0? false:true}>Delete Project</Button>
                <br/></th>
                </tr>
                {row.vm.map((vm)=> { return(
                    <tr className="align-items-center">
                        <td>{vm.name}</td>
                        <td>{vm.cost}</td>
                    </tr>
                )})}
            </React.Fragment>
        )
    }
    const zoneMap = {'us-central-a':0,'us-central-b':1,'eu-east-a':2,'eu-west-b':3};

    
    const userCount = [{zone:"us-central-a",users:12},
    {zone:"us-central-b",users:10},
    {zone:"eu-east-a",users:2},
    {zone:"eu-west-b",users:13}]
    
    const userDet = [{name:"Vijay",id:"1201900313",email:"vijayprashant@gmail.com",credits:"50",paytype:"Card"}]
    // const projId = [{id:132435465},{id:132423425},{id:34546765},{id:98765432},{curr:5674839210,username:"sdfgfh",userid:765432342}];
    
    
    let data = [{email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user}]
    let req = [{email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user}]
    
    async function handleAddProj(e){
        
        req[0]['name'] = e.target.name.value
        e.preventDefault();
        console.log(req)
        await axios({method:"POST",
        url:"http://localhost:8008/create_project",
        data:req})
        .then((res)=>{console.log(res);if(res.data.res === 1){setProjShow(false);setVP(true);setTimeout(() => {setVP(false)}, 1000);get_proj();get_table()}})
        .catch((err)=>console.log(err))   
        
    }
    
    // const quotas = [{nvm:5, disk:[2,3,4], gpuP:[1,1,1,1,1], gpu:[1,1,1,1,1],mfP:[2,2,2,2,2], mf:[2,2,2,2,2]},
    //                 {nvm:15, disk:[2,3,5], gpuP:[1,2,3,4,5], gpu:[1,1,2,1,1],mfP:[2,0,2,2,2], mf:[2,2,2,4,2]},
    //                 {nvm:52, disk:[7,3,6], gpuP:[1,1,0,10,0], gpu:[1,2,1,1,1],mfP:[2,2,0,2,2], mf:[8,2,2,2,2]},
    //                 {nvm:2, disk:[4,3,4], gpuP:[1,0,1,0,1], gpu:[1,1,11,3,1],mfP:[2,2,0,20,2], mf:[2,8,2,7,2]}]

    const handleSubmit = (e)=>{
        console.log('sdjhfbjhvbds')
        const form = e.currentTarget;
        const formData = new FormData(form)
        e.preventDefault();
        e.stopPropagation();
        let json = Object.fromEntries(formData.entries())
        console.log(json)
    }


    

    return (
        <div>
        {dataReceived &&
        <Container fluid >
            {console.log(props.location.state)}
            <Navbar bg="dark" variant="dark" sticky="top">
                <Navbar.Brand href="/">GCP</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <NavDropdown  title="My Projects" id="basic-nav-dropdown">
                        {projId.id.map((row,index)=>{return(<NavDropdown.Item variant="dark" onClick={(e)=>{setProj(e.currentTarget.innerText);}}>{row.id}</NavDropdown.Item>)})}
                        <NavDropdown.Divider />
                        <NavDropdown.Item style={{backgroundColor: 'lightblue',color:'red'}}>{proj}</NavDropdown.Item>
                    </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        <Row className="mt-2">
            <Nav variant="pills" className="pt-2">
            <Nav.Item>
                    <Nav.Link onClick={()=> history.push({
    pathname: '/dashboard',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>DashBoard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="profile" active onClick={()=> history.push({
    pathname: '/profile',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="vm" onClick={()=> history.push({
    pathname: '/vm',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>VM Instances</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="metrics" onClick={()=> history.push({
    pathname: '/metrics',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>Metrics</Nav.Link>
                </Nav.Item>
            </Nav>
            <Button className="ml-auto mr-5 " variant="outline-primary" onClick={()=> setProjShow(true)}>Add Project</Button>
        </Row>
        <br/><br/>
        <Row className="d-flex justify-content-center">
            <Alert show={vProj} variant="success" dismissible onClose={() => setVP(false)}>
                <Alert.Heading>Project Created Successfully</Alert.Heading>
            </Alert>
        </Row>

            <Form class="d-flex justify-content-around">
                <Row className="pt-3">
                    <Col>
                        <Form.Group controlId="formId">
                            <Form.Label>
                            {isUser?"User ID":"Admin ID"}
                            </Form.Label><br/>
                            <Form.Control plaintext readOnly defaultValue={props.location.state.user} disabled class="text-muted" size='lg'/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formEmail">
                            <Form.Label class="">
                            {isUser?"User Email":"Admin Email"}
                            </Form.Label><br/>
                            <Form.Control plaintext readOnly defaultValue={props.location.state.username} disabled class="text-muted" size='lg'/>
                        </Form.Group>
                    </Col>
                </Row>
                <br/><br/>
                {isUser && 
                <Row>
                    <Col>
                        <Form.Group controlId="formCredits">
                            <Form.Label>
                            Number of Credits Available
                            </Form.Label>
                            <Form.Control plaintext readOnly defaultValue={userDet[0].credits} disabled class="text-muted" size='lg'/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formPaymentType">
                            <Form.Label>
                            Payment Type
                            </Form.Label>
                            <Form.Control plaintext readOnly defaultValue={userDet[0].paytype} disabled class="text-muted" size='lg'/>
                        </Form.Group>
                    </Col>
                </Row>}
                {!isUser && 
                <Row className="d-flex justify-content-center">
                    <Form.Label className="font-weight-bolder h3">Number of Users Per Zone</Form.Label> 
                    <Table bordered hover className='text-center'>
                        <thead>
                            <tr>
                                <th>Zone</th>
                                <th>Number of User</th>
                                
                            </tr>
                        </thead>
                        <tbody className="justify-content-center">
                            {userCount.map((row,index)=>{return(
                                <tr key={index}>
                                    <th>{row.zone}</th>
                                    <td>{row.users}</td>
                                </tr>
                            )})}
                        </tbody>
                    </Table> 
                </Row>}

            <Row className="d-flex justify-content-center pt-3">
            <Form.Label className="font-weight-bolder h3">Active Projects</Form.Label>
            <Table bordered variant="dark" hover className='text-center'>
                <thead>
                    <tr>
                        <th>Project ID</th>
                        <th>Vm ID</th>
                        <th>Runtime Cost</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {tableData.map(renderTable)}
                </tbody>
            </Table>
            </Row> 
            </Form> 
            <Modal show={projShow} onHide={()=>setProjShow(false)} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                <Modal.Title>New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form onSubmit={handleAddProj}>
                    <Form.Group controlId="formProjectId" className="mb-4">
                        <Form.Label>Project ID</Form.Label>
                        <Form.Control type="text" name="name" value="Enter Project ID"/>
                        <Form.Text className="text-muted">
                        Project Id muct be Unique
                        </Form.Text>
                    </Form.Group>
                        <Button className="mr-2 ml-2" variant="primary" type="submit">Create Project</Button>
                        <Button variant="secondary" onClick={()=>setProjShow(false)}>Close</Button>
                </Form>
                </Modal.Body>
            </Modal>

            <Modal size="xl" aria-labelledby="contained-modal-title-vcenter" show={setModal} onHide={()=> setModalShow(false)} backdrop="static" keyboard={false} centered>
                <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Quotas
                </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Form onSubmit={handleSubmit}>
                        <Row class="border-bottom-0 d-flex">
                        <Form.Group controlId="zone">
                            <Form.Label class="h4 text-muted">Zone</Form.Label>
                            <Form.Control as="select" onChange={(e)=> setZone(zoneMap[e.target.value])}>
                            <option>us-central-a</option>
                            <option>us-central-b</option>
                            <option>eu-east-a</option>
                            <option>eu-west-b</option>
                        </Form.Control>
                        </Form.Group>
                        </Row>
                        <Row>
                        <br/>
                            <Row className='d-flex justify-content-around pt-3 pb-5'>
                                    <Form.Group as={Col} controlId="formVM">
                                        <Form.Label>Number of VM</Form.Label>   
                                        <Form.Control type="text"  name='nvm' disabled={isUser?true:false} defaultValue={quotas[zone].nvm} />
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formHDD">
                                        <Form.Label>Disk HDD</Form.Label>   
                                        <Form.Control type="text"  name='ssd' disabled={isUser?true:false} defaultValue={quotas[zone].disk[0]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formSSD">
                                        <Form.Label>Disk SSD</Form.Label>   
                                        <Form.Control type="text" name='hdd' disabled={isUser?true:false} defaultValue={quotas[zone].disk[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formBalanced">
                                        <Form.Label>Disk Balanced</Form.Label>   
                                        <Form.Control type="text" name='balanced' disabled={isUser?true:false} defaultValue={quotas[zone].disk[2]}/>
                                    </Form.Group>
                                    <Col></Col>
                            </Row>
                            <p class=" text-muted h4">GPU Preemptable</p>
                            <Row className="pb-5">
                                    <Form.Group as={Col} controlId="formA100P">
                                        <Form.Label>NVIDIA_TESLA_A100</Form.Label>   
                                        <Form.Control type="text" name='A100P' disabled={isUser?true:false} defaultValue={quotas[zone].gpuP[0]}/>
                                    </Form.Group>
                                    
                                    <Form.Group as={Col} controlId="formV100P">
                                        <Form.Label>NVIDIA_TESLA_V100</Form.Label>   
                                        <Form.Control type="text" name='V100P' disabled={isUser?true:false} defaultValue={quotas[zone].gpuP[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formK80P">
                                        <Form.Label>NVIDIA_TESLA_K80</Form.Label>   
                                        <Form.Control type="text" name='K80P' disabled={isUser?true:false} defaultValue={quotas[zone].gpuP[2]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formT4P">
                                        <Form.Label>NVIDIA_TESLA_T4</Form.Label>   
                                        <Form.Control type="text" name='T4P' disabled={isUser?true:false} defaultValue={quotas[zone].gpuP[3]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formP4P">
                                        <Form.Label>NVIDIA_TESLA_P4</Form.Label>   
                                        <Form.Control type="text" name='P4P' disabled={isUser?true:false} defaultValue={quotas[zone].gpuP[4]}/>
                                    </Form.Group>
                            </Row>
                            <br/>
                            <p class=" text-muted h4">GPU Non-Preemptable</p>
                            <Row className="pb-5">
                                    <Form.Group as={Col} controlId="formA100">
                                        <Form.Label>NVIDIA_TESLA_A100</Form.Label>   
                                        <Form.Control type="text" name='A100' disabled={isUser?true:false} defaultValue={quotas[zone].gpu[0]}/>
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formV100">
                                        <Form.Label>NVIDIA_TESLA_V100</Form.Label>   
                                        <Form.Control type="text" name='V100' disabled={isUser?true:false} defaultValue={quotas[zone].gpu[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formK80">
                                        <Form.Label>NVIDIA_TESLA_K80</Form.Label>   
                                        <Form.Control type="text" name='K80' disabled={isUser?true:false} defaultValue={quotas[zone].gpu[2]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formT4">
                                        <Form.Label>NVIDIA_TESLA_T4</Form.Label>   
                                        <Form.Control type="text" name='T4' disabled={isUser?true:false} defaultValue={quotas[zone].gpu[3]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formP4">
                                        <Form.Label>NVIDIA_TESLA_P4</Form.Label>   
                                        <Form.Control type="text" name='P4' disabled={isUser?true:false} defaultValue={quotas[zone].gpu[4]}/>
                                    </Form.Group>
                            </Row>
                            <br/>
                            <p class=" text-muted h4">Machine Family Preemptable</p>
                            <Row className="pb-5"> 
                                    <Form.Group as={Col} controlId="formA2P">
                                        <Form.Label>A2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mfP[0]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formEC2P">
                                        <Form.Label>EC2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mfP[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formN1P">
                                        <Form.Label>N1</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mfP[2]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formN2P">
                                        <Form.Label>N2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mfP[3]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formC2P">
                                        <Form.Label>C2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mfP[4]}/>
                                    </Form.Group>
                            </Row>
                            <br/>
                            <p class=" text-muted h4">Machine Family Non-Preemptable</p>
                            <Row className=" pb-5"> 
                                    <Form.Group as={Col} controlId="formA2">
                                        <Form.Label>A2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mf[0]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formEC2">
                                        <Form.Label>EC2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mf[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formN1">
                                        <Form.Label>N1</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mf[2]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formN2">
                                        <Form.Label>N2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mf[3]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formC2">
                                        <Form.Label>C2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} defaultValue={quotas[zone].mf[4]}/>
                                    </Form.Group>
                            </Row>
                        </Row>
                        <Row>
                    <Button variant="danger" className='mr-3' onClick={()=>setModalShow(false)}>Close</Button>
                    <Button variant='primary' className='mr-auto' disabled={isUser?true:false} type="submit">Submit Changes</Button>
                    </Row>
                        </Form>
                    </Container>

                </Modal.Body>
            </Modal>   
        </Container>
        }
        </div>
    )
}

export default withRouter(Profile);
