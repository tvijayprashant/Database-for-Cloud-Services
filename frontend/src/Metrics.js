import React from 'react'
import { Container,Navbar,Nav,Row,Col,NavDropdown,Card,Form } from 'react-bootstrap'
import { Line } from 'react-chartjs-2'
import {useHistory,withRouter} from 'react-router-dom'
import axios from 'axios'

  let cpuRuntime={
    labels: ['1', '2', '3', '4', '5', '6'],
    datasets: [
      {
        label: '# of Votes',
        data:[12, 19, 3, 5, 2, 3],
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
}

  let genData= (values) => ({
    labels: ['1', '2', '3', '4', '5', '6'],
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
    let values = cpuRuntime.datasets[0].data;
    const [points, setData] = React.useState(genData(values));
    const [graph,setGraph] = React.useState("");
    const [dataReceived,setDataReceived] = React.useState(true);
    const [quotas,setQuotas] = React.useState([]);
    const [proj,setProj] = React.useState(projId.curr);
    const [isUser,setUser] = React.useState(false)
    var props = {location:{state:{
        username: "vp3@gmail.com",
		password: "a",
		user: "USR000007",
	}}};
    let data = [{email: props.location.state.username, passwd: props.location.state.password, user_id:props.location.state.user}]

    // const projId = [{id:132435465},{id:132423425},{id:34546765},{id:98765432},{curr:5674839210,username:"sdfgfh",userid:765432342}];
    const details = [{pId:89573461, vmId:861829, zone:"us-central-a"},
                {pId:27342342, vmId:13425, zone:"us-central-b"},
                {pId:34785692, vmId:83454, zone:"us-central-a"},
                {pId:123423524, vmId:64545, zone:"eu-east-a"},
                {pId:82374234, vmId:2345465, zone:"eu-west-b"}
            ]
    // const dataset = {diskUsage:[12, 19, 3, 5, 2, 3],cpuRuntime:[12, 19, 3, 2, 6, 4]}
    
    React.useEffect(() => {
    }, []);

    
    const handleProj = (e)=> {
            
    }
    const handleVm = (e)=> {

    }
    const handleZone = (e)=> {        
        // if(e.target.value === 'us-central-a'){
        //     let data = graph.datasets[0].data;
        //     data = data * 10;
        //     cpuRuntime.datasets[0].data = data;
        //     console.log({graph}.datasets[0].data)
        // }
        // else if(e.target.value === 'us-central-b'){
        //     let data = cpuRuntime.datasets[0].data;
        //     data = data * 10;
        //     cpuRuntime.datasets[0].data = data;
        // }
        // else if(e.target.value === 'eu-east-a'){
        //     let data = cpuRuntime.datasets[0].data;
        //     data = data * 10;
        //     cpuRuntime.datasets[0].data = data;
        // }
        // else if(e.target.value === 'eu-west-b'){
        //     let data = cpuRuntime.datasets[0].data;
        //     data = data * 10;
        //     cpuRuntime.datasets[0].data = data;
        // }
        data["zone"]=e.target.value

    }
    

    async function get_proj(){
        await axios({
            method: "POST",
            url: "http://localhost:8008/project",
            data: data
        })
        .then((res)=> {console.log(res.data);projId.id = res.data.id;setProj(res.data.curr);})
        .catch(err => console.log(err))
    }
    React.useEffect(()=>{
        get_proj();
    },[])

    return (
        <React.Fragment>
            { dataReceived &&
        <Container fluid>
            {console.log(props.location.state)}
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
                    <Nav.Link eventKey="vm" onClick={()=> history.push({
    pathname: '/vm',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user} 
    })}>VM Instances</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link active eventKey="metrics" onClick={()=> history.push({
    pathname: '/metrics',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user} 
    })}>Metrics</Nav.Link>
                </Nav.Item>
            </Nav>
        </Row>
        <br/>
        <Row>
            <Form id='diskUsage' className="d-flex justify-content-around">

                    <Form.Control as="select" id="zoneName" size="sm" className="ml-3 mr-3 mt-2" onChange={handleZone}>
                        <option>us-central-a</option>
                        <option>us-central-b</option>
                        <option>eu-east-a</option>
                        <option>eu-west-b</option>
                    </Form.Control>

                    <Form.Control as="select" id="projectId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleProj}>
                        {details.map((row,index)=> {return(<option>{row.pId}</option>)})}
                        <option>All Projects</option>
                    </Form.Control>

                    <Form.Control as="select" id="vmId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleVm}>
                        {details.map((row,index)=> {return(<option>{row.vmId}</option>)})}
                        <option>All VM Instances</option>
                    </Form.Control>

            </Form>
        </Row>
        <br/>
        <Row>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>Disk Usage</Card.Header>
                    <Card.Body>
                        <Line data={points} options={options} />
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>RAM Usage</Card.Header>
                    <Card.Body>
                        <Line data={points} options={options} />
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
                        <Line data={points} options={options} />
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>GPU Runtime</Card.Header>
                    <Card.Body>
                        <Line data={points} options={options} />
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
                        <Line data={points} options={options} />
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>GPU Usage</Card.Header>
                    <Card.Body>
                        <Line data={points} options={options} />
                    </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
        }</React.Fragment>
    )
}

export default withRouter(Metrics);