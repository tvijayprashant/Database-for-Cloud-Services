import React from 'react'
import { Container,Navbar,Nav,Row,Col,NavDropdown,Form,Table,Button,Modal,Alert } from 'react-bootstrap'
import axios from 'axios'

function Profile(){

    const [setModal, setModalShow] = React.useState(false);
    const [projNo,setProjNo] = React.useState(-1);
    const [zone,setZone] = React.useState(0);
    const [isUser,setUser] = React.useState(true);
    const [quota,setQuotas] = React.useState([]);
    const [dataReceived,setDataReceived] = React.useState(false);
    const [projShow, setProjShow] = React.useState(false);
    const [vProj,setVP] = React.useState(false);
    
    const tableData = [{id:12345678,vm:[[{name:"sdfsgva",cost:123},{name:"fghd",cost:542}]],total:444},
                        {id:12345678,vm:[{name:"sdfsgva",cost:123},{name:"fghd",cost:542},{name:"sdfsgdfsfva",cost:13}],total:444},
                        {id:12345678,vm:[{name:"sdfsgva",cost:123},{name:"fghd",cost:542}],total:444}]

    const handleDelete = (e)=>{
        console.log(e.target.id)
    }

    const renderTable = (row,index) => {
        return(
            // <tr>
            <React.Fragment>
                <tr key={index} className="align-items-center align-content-center">
                <th rowSpan={row.vm.length+1}>{row.id}<br/><br/>
                Total Cost: {row.total}<br/><br/>
                <Button variant={isUser?"outline-light":"outline-primary"} id={index} onClick={(e)=> {setModalShow(true);setProjNo(e.target.id);}}>{isUser?"View":"Edit"}</Button>
                <Button className="ml-5" variant="outline-danger" id={index} onClick={handleDelete} disabled={row.vm.length === 0? false:true}>Delete Project</Button>
                <br/></th>
                </tr>
                {row.vm.map((vm,idx)=> { return(
                    <tr className="align-items-center">
                        <td>{vm.name}</td>
                        <td>{vm.cost}</td>
                    </tr>
                )})}
            </React.Fragment>
        )
    }
    const zoneMap = {'us-central-a':0,'us-central-b':1,'eu-east-a':2,'eu-west-b':3};

    const quotas = [{nvm:5, disk:[2,3,4], gpuP:[1,1,1,1,1], gpu:[1,1,1,1,1],mfP:[2,2,2,2,2], mf:[2,2,2,2,2]},
                    {nvm:15, disk:[2,3,5], gpuP:[1,2,3,4,5], gpu:[1,1,2,1,1],mfP:[2,0,2,2,2], mf:[2,2,2,4,2]},
                    {nvm:52, disk:[7,3,6], gpuP:[1,1,0,10,0], gpu:[1,2,1,1,1],mfP:[2,2,0,2,2], mf:[8,2,2,2,2]},
                    {nvm:2, disk:[4,3,4], gpuP:[1,0,1,0,1], gpu:[1,1,11,3,1],mfP:[2,2,0,20,2], mf:[2,8,2,7,2]}]

    const userCount = [{zone:"us-central-a",users:12},
                        {zone:"us-central-b",users:10},
                        {zone:"eu-east-a",users:2},
                        {zone:"eu-west-b",users:13}]

    const userDet = [{name:"Vijay",id:"1201900313",email:"vijayprashant@gmail.com",credits:"50",paytype:"Card"}]
    const projId = [{id:132435465},{id:132423425},{id:34546765},{id:98765432},{curr:5674839210,username:"sdfgfh",userid:765432342}];

    React.useEffect(()=>{
        axios
        .get("./quotas.json")
        .then((res)=> {setQuotas(res.data);setDataReceived(true);})
        .catch(err => console.log(err))
    },[dataReceived]);

    return (
        <div>
        {dataReceived &&
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
            <Nav variant="pills" className="pt-2">
                <Nav.Item>
                    <Nav.Link href="/">DashBoard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link active eventKey="link-1" href="/profile">Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-2" href="/vm">VM Instances</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-3" href="/metrics">Metrics</Nav.Link>
                </Nav.Item>
            </Nav>
            <Button className="ml-auto mr-5" variant="outline-primary" onClick={()=> setProjShow(true)}>Add Project</Button>
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
                        <Form.Group controlId="formName">
                            <Form.Label>
                            {isUser?"User Name":"Admin Name"}
                            </Form.Label><br/>
                            <Form.Control  plaintext readOnly defaultValue={userDet[0].name} disabled class="text-muted" size="lg" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formId">
                            <Form.Label>
                            {isUser?"User ID":"Admin ID"}
                            </Form.Label><br/>
                            <Form.Control plaintext readOnly defaultValue={userDet[0].id} disabled class="text-muted" size='lg'/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formEmail">
                            <Form.Label class="">
                            {isUser?"User Email":"Admin Email"}
                            </Form.Label><br/>
                            <Form.Control plaintext readOnly defaultValue={userDet[0].email} disabled class="text-muted" size='lg'/>
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
                        <th>Cost</th>
                        
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
                <Form >
                    <Form.Group controlId="formProjectId" className="mb-4">
                        <Form.Label>Project ID</Form.Label>
                        <Form.Control type="text" placeholder="Enter Project ID"/>
                        <Form.Text className="text-muted">
                        Project Id muct be Unique
                        </Form.Text>
                    </Form.Group>
                        <Button className="mr-2 ml-2" variant="primary" onClick={()=>{setProjShow(false);setVP(true);setTimeout(() => {setVP(false)}, 1000);}}>Create Project</Button>
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
                        <Form>
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
                                        <Form.Control type="text"  disabled={isUser?true:false} placeholder={quotas[zone].nvm} />
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formHDD">
                                        <Form.Label>Disk HDD</Form.Label>   
                                        <Form.Control type="text"  disabled={isUser?true:false} placeholder={quotas[zone].disk[0]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formSSD">
                                        <Form.Label>Disk SSD</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].disk[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formBalanced">
                                        <Form.Label>Disk Balanced</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].disk[2]}/>
                                    </Form.Group>
                                    <Col></Col>
                            </Row>
                            <p class=" text-muted h4">GPU Preemptable</p>
                            <Row className="pb-5">
                                    <Form.Group as={Col} controlId="formA100P">
                                        <Form.Label>NVIDIA_TESLA_A100</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpuP[0]}/>
                                    </Form.Group>
                                    
                                    <Form.Group as={Col} controlId="formV100P">
                                        <Form.Label>NVIDIA_TESLA_V100</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpuP[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formK80P">
                                        <Form.Label>NVIDIA_TESLA_K80</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpuP[2]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formT4P">
                                        <Form.Label>NVIDIA_TESLA_T4</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpuP[3]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formP4P">
                                        <Form.Label>NVIDIA_TESLA_P4</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpuP[4]}/>
                                    </Form.Group>
                            </Row>
                            <br/>
                            <p class=" text-muted h4">GPU Non-Preemptable</p>
                            <Row className="pb-5">
                                    <Form.Group as={Col} controlId="formA100">
                                        <Form.Label>NVIDIA_TESLA_A100</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpu[0]}/>
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formV100">
                                        <Form.Label>NVIDIA_TESLA_V100</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpu[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formK80">
                                        <Form.Label>NVIDIA_TESLA_K80</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpu[2]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formT4">
                                        <Form.Label>NVIDIA_TESLA_T4</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpu[3]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formP4">
                                        <Form.Label>NVIDIA_TESLA_P4</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].gpu[4]}/>
                                    </Form.Group>
                            </Row>
                            <br/>
                            <p class=" text-muted h4">Machine Family Preemptable</p>
                            <Row className="pb-5"> 
                                    <Form.Group as={Col} controlId="formA2P">
                                        <Form.Label>A2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mfP[0]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formEC2P">
                                        <Form.Label>EC2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mfP[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formN1P">
                                        <Form.Label>N1</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mfP[2]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formN2P">
                                        <Form.Label>N2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mfP[3]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formC2P">
                                        <Form.Label>C2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mfP[4]}/>
                                    </Form.Group>
                            </Row>
                            <br/>
                            <p class=" text-muted h4">Machine Family Non-Preemptable</p>
                            <Row className=" pb-5"> 
                                    <Form.Group as={Col} controlId="formA2">
                                        <Form.Label>A2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mf[0]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formEC2">
                                        <Form.Label>EC2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mf[1]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formN1">
                                        <Form.Label>N1</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mf[2]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formN2">
                                        <Form.Label>N2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mf[3]}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formC2">
                                        <Form.Label>C2</Form.Label>   
                                        <Form.Control type="text" disabled={isUser?true:false} placeholder={quotas[zone].mf[4]}/>
                                    </Form.Group>
                            </Row>
                        </Row>
                        </Form>
                    </Container>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={()=>setModalShow(false)}>Close</Button>
                    {!isUser && <Button onClick={()=>setModalShow(false)}>Submit Changes</Button>}
                </Modal.Footer>
            </Modal>   
        </Container>
        }
        </div>
    )
}

export default Profile;
