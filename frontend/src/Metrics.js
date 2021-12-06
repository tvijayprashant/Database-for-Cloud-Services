import React from 'react'
import { Container,Navbar,Nav,Row,Col,NavDropdown,Card,Form } from 'react-bootstrap'
import { Line } from 'react-chartjs-2'
import {useHistory,withRouter} from 'react-router-dom'
import axios from 'axios'


  let genData= (values) => ({
    labels: ['1', '2', '3', '4', '5', '6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24'],
    datasets: [
      {
        label: 'Time',
        data: values,
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
})
  
  const options = {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

let projId = {'id':[],'curr':''};



function Metrics(props){
    const history = useHistory()
    let values = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const [proj,setProj] = React.useState(projId.curr);
    const [isUser,setUser] = React.useState(props.location.state.admin===1?false:true)
    const [zone,setZone] = React.useState('us-central-a');
    const [curP,setCurP] = React.useState('cdsaml-32445');
    const [vm,setVM] = React.useState([])
    const [dataReceived,setDataReceived] = React.useState(false);
    var props = {location:{state:{
        username: "vp4@gmail.com",
		password: "a",
		user: "USR000007",
	}}};
    let data = [{email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user}]
    
    const [cr, setCR] = React.useState(genData(values));
    const [gr, setGR] = React.useState(genData(values));
    const [du, setDU] = React.useState(genData(values));
    const [ru, setRU] = React.useState(genData(values));
    const [cu, setCU] = React.useState(genData(values));
    const [gu, setGU] = React.useState(genData(values));



// const getMetrics = async(e)=>{
//     let res = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, project_id:e}
//     result = await axios({
//         method: "POST",
//         url: "http://localhost:8008/project_metric",
//         data: res
//     })
//     .then((res)=> {
//         setDU(genData(res.metric.du.map(x=>x*100)))
//         setRU(genData(res.metric.ru.map(x=>x*100)))
//         setCU(genData(res.metric.cu.map(x=>x*100)))
//         setGU(genData(res.metric.gu.map(x=>x*100)))
//             for(let i=0;i<24;i++){
//                 if(!result.metric.cr[i])
//                     result.metric.cr[i] = 0
//                 if(!result.metric.gr[i])
//                     result.metric.gr[i] = 0
//             }
//         setCR(genData(res.metric.cr))
//         setGR(genData(res.metric.gr)) 
//     })
//     .catch(err => console.log(err))
// }

const getVm = async (e)=>{
    let req= {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, projectID:curP}
       await axios({method:"POST",
               url:"http://localhost:8008/vm",
               data:req})
           .then((res)=>{
               setVM(res.data.vms)
           })
           .catch((err)=>console.log(err))
   }

const handleZone = async (e)=> {  
    setZone(e.target.value)

    let res = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, zone:e.target.value}
    await axios({
        method: "POST",
        url: "http://localhost:8008/zone_metric",
        data: res
    })
    .then((res)=> {
        console.log(res.data)
        res=res.data
        setDU(genData(res.metric.du.map(x=>x*100)))
        setRU(genData(res.metric.ru.map(x=>x*100)))
        setCU(genData(res.metric.cu.map(x=>x*100)))
        setGU(genData(res.metric.gu.map(x=>x*100)))
            for(let i=0;i<24;i++){
                if(!res.metric.cr[i])
                    res.metric.cr[i] = 0
                if(!res.metric.gr[i])
                    res.metric.gr[i] = 0
            }
        setCR(genData(res.metric.cr))
        setGR(genData(res.metric.gr)) 
    })
    .catch(err => console.log(err)) 
}

const handleProj = async (e)=> {
    if(e.currentTarget.value === 'None'){
        setDU(genData(values))
        setRU(genData(values))
        setCU(genData(values))
        setGU(genData(values))
        setCR(genData(values))
        setGR(genData(values)) 
    }

    else if(e.currentTarget.value === 'All Projects'){
        let res = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, zone:zone}
        await axios({
            method: "POST",
            url: "http://localhost:8008/zone_metric",
            data: res
        })
        .then((res)=> {
            console.log(res.data)
            res=res.data
            setDU(genData(res.metric.du.map(x=>x*100)))
            setRU(genData(res.metric.ru.map(x=>x*100)))
            setCU(genData(res.metric.cu.map(x=>x*100)))
            setGU(genData(res.metric.gu.map(x=>x*100)))
                for(let i=0;i<24;i++){
                    if(!res.metric.cr[i])
                        res.metric.cr[i] = 0
                    if(!res.metric.gr[i])
                        res.metric.gr[i] = 0
                }
            setCR(genData(res.metric.cr))
            setGR(genData(res.metric.gr)) 
        })
        .catch(err => console.log(err))
    }
    else{
        setCurP(e.currentTarget.value);
        let res = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, project_id:e.currentTarget.value}
        await axios({
            method: "POST",
            url: "http://localhost:8008/project_metric",
            data: res
        })
        .then((res)=> {
            res = res.data
            setDU(genData(res.metric.du.map(x=>x*100)))
            setRU(genData(res.metric.ru.map(x=>x*100)))
            setCU(genData(res.metric.cu.map(x=>x*100)))
            setGU(genData(res.metric.gu.map(x=>x*100)))
                for(let i=0;i<24;i++){
                    if(!res.metric.cr[i])
                        res.metric.cr[i] = 0
                    if(!res.metric.gr[i])
                        res.metric.gr[i] = 0
                }
            setCR(genData(res.metric.cr))
            setGR(genData(res.metric.gr)) 
        })
        .catch(err => console.log(err))
    }
    getVm()  
}

const handleVm = async (e)=> {
    if(e.currentTarget.value === 'All VM Instances'){
        let res = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, project_id:curP}
        await axios({
            method: "POST",
            url: "http://localhost:8008/project_metric",
            data: res
        })
        .then((res)=> {
            console.log(res.data)
            res=res.data
            setDU(genData(res.metric.du.map(x=>x*100)))
            setRU(genData(res.metric.ru.map(x=>x*100)))
            setCU(genData(res.metric.cu.map(x=>x*100)))
            setGU(genData(res.metric.gu.map(x=>x*100)))
                for(let i=0;i<24;i++){
                    if(!res.metric.cr[i])
                        res.metric.cr[i] = 0
                    if(!res.metric.gr[i])
                        res.metric.gr[i] = 0
                }
            setCR(genData(res.metric.cr))
            setGR(genData(res.metric.gr)) 
        })
        .catch(err => console.log(err))
    }
    else{
        let res = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, vm:e.currentTarget.value}
        await axios({
            method: "POST",
            url: "http://localhost:8008/vm_metric",
            data: res
        })
        .then((res)=> {
            res = res.data
            console.log(res)
            setDU(genData(res.metric.du.map(x=>x*100)))
            setRU(genData(res.metric.ru.map(x=>x*100)))
            setCU(genData(res.metric.cu.map(x=>x*100)))
            setGU(genData(res.metric.gu.map(x=>x*100)))
                for(let i=0;i<24;i++){
                    if(!res.metric.cr[i])
                        res.metric.cr[i] = 0
                    if(!res.metric.gr[i])
                        res.metric.gr[i] = 0
                }
            setCR(genData(res.metric.cr))
            setGR(genData(res.metric.gr)) 
        })
        .catch(err => console.log(err))
    }
    }
    
    async function get_proj(){
        await axios({
            method: "POST",
            url: "http://localhost:8008/project",
            data: data
        })
        .then((res)=> {projId.id = res.data.id;setProj(res.data.curr);setDataReceived(true)})
        .catch(err => console.log(err))
    }
    React.useEffect(()=>{
        get_proj();
    },[])

    return (
        <React.Fragment>
            { dataReceived &&
        <Container fluid>
            
            <Navbar bg="dark" variant="dark" sticky="top">
                <Navbar.Brand href="/">GCP</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <NavDropdown  title="My Projects" id="basic-nav-dropdown">
                        {projId.id.map((row,index)=>{return(<NavDropdown.Item variant="dark" onClick={(e)=>{setProj(e.currentTarget.innerText)}}>{row.id}</NavDropdown.Item>)})}
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
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>DashBoard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="profile" onClick={()=> history.push({
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
                    <Nav.Link active eventKey="metrics" onClick={()=> history.push({
    pathname: '/metrics',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>Metrics</Nav.Link>
                </Nav.Item>
            </Nav>
        </Row>
        <br/>
        <Row>
            <Form id='diskUsage' className="d-flex justify-content-around">

                    <Form.Control as="select" id="zoneName" size="sm" className="ml-3 mr-3 mt-2" disabled={isUser?false:true} onChange={handleZone}>
                        <option>us-central-a</option>
                        <option>us-central-b</option>
                        <option>eu-east-a</option>
                        <option>eu-west-b</option>
                    </Form.Control>

                    <Form.Control as="select" id="projectId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleProj}>
                        <option>All Projects</option>
                        {projId.id.map((row,index)=> {return(<option id={index}>{row.id}</option>)})}
                    </Form.Control>

                    <Form.Control as="select" id="vmId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleVm}>
                        {vm.length > 0 && <option>All VM Instances</option>}
                        {vm.length === 0 && <option>None</option>}
                        {vm.map((row)=> {return(<option>{row.vm_id}</option>)})}
                    </Form.Control>

            </Form>
        </Row>
        <br/>
        <Row>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>Disk Usage</Card.Header>
                    <Card.Body>
                        <Line data={du} options={options} />
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>RAM Usage</Card.Header>
                    <Card.Body>
                        <Line data={ru} options={options} />
                    </Card.Body>
            </Card>
            </Col>
        </Row>
        <br/>
        <Row>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>CPU Runtime</Card.Header>
                    <Card.Body>
                        <Line data={cr} options={options} />
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>GPU Runtime</Card.Header>
                    <Card.Body>
                        <Line data={gr} options={options} />
                    </Card.Body>
            </Card>
            </Col>
        </Row>
        <br/>
        <Row>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>CPU Usage</Card.Header>
                    <Card.Body>
                        <Line data={cu} options={options} />
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>GPU Usage</Card.Header>
                    <Card.Body>
                        <Line data={gu} options={options} />
                    </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
        }</React.Fragment>
    )
}

export default withRouter(Metrics);