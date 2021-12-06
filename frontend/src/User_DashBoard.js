import React from "react";
import { Container, Row, Col, Navbar, Nav, NavDropdown, Card, Button,Carousel} from 'react-bootstrap';
import {withRouter,useHistory } from "react-router-dom";
import { Line } from 'react-chartjs-2';
import axios from 'axios';

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

function User_DashBoard(props){
    let values = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const history = useHistory();
    const [dataReceived,setDataReceived] = React.useState(false);
    const [vm,setVM] = React.useState([]);
    const [proj,setProj] = React.useState(projId.curr);
    const [cr, setCR] = React.useState(genData(values));
    const [gr, setGR] = React.useState(genData(values));
    const [du, setDU] = React.useState(genData(values));
    const [ru, setRU] = React.useState(genData(values));
    const [cu, setCU] = React.useState(genData(values));
    const [gu, setGU] = React.useState(genData(values));
    const handleProj = async (e)=>{
     let req= {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, projectID:proj}
        await axios({method:"POST",
                url:"http://localhost:8008/vm",
                data:req})
            .then((res)=>{
                let vms = res.data.vms;
                console.log(vms)
                setVM(vms)
            })
            .catch((err)=>console.log(err))
    }
    async function get_proj(){
        let data = [{email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user}]

        await axios({
            method: "POST",
            url: "http://localhost:8008/project",
            data: data
        })
        .then((res)=> {console.log(res.data);projId.id = res.data.id;setProj(res.data.curr);})
        .catch(err => console.log(err))
        handleProj()
    }

    const getMetrics = async(e)=>{
        let res = {email: props.location.state.username, password: props.location.state.password, user_id:props.location.state.user, project_id:proj}
        await axios({
            method: "POST",
            url: "http://localhost:8008/project_metric",
            data: res
        })
        .then((res)=> {
            // console.log(res.data.metric.cr)
            res = res.data;
            // console.log(res.metric.du.map(x=>x*100))
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
        setDataReceived(true)
    }

    React.useEffect(()=>{
        get_proj();
        getMetrics();

    },[])


    // React.useEffect(()=>{
    //     let data = [{email: props.location.state.username, passwd: props.location.state.password, user_id:props.location.state.user}]
    //     axios({
    //         method: "POST",
    //         url: "http://localhost:8008/:"+proj+"/vm",
    //         data: data
    //       })
    //     .then((res)=> {setQuotas(res.data);setDataReceived(true);})
    //     .catch(err => console.log(err))
    // },[dataReceived,proj]);

    return(
    <React.Fragment>
    { dataReceived &&
    <Container fluid>
            <Navbar bg="dark" variant="dark" sticky="top">
                <Navbar.Brand href="/">GCP</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <NavDropdown  title="My Projects" id="basic-nav-dropdown">
                        {projId.id.map((row,index)=>{return(<NavDropdown.Item variant="dark" onClick={(e)=>{setProj(e.currentTarget.innerText);handleProj()}}>{row.id}</NavDropdown.Item>)})}
                        <NavDropdown.Divider />
                        <NavDropdown.Item style={{backgroundColor: 'lightblue',color:'red'}}>{proj}</NavDropdown.Item>
                    </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        <Row className="mt-3">
            <Nav variant="pills">
                <Nav.Item>
                    <Nav.Link active onClick={()=> history.push({
    pathname: '/dashboard',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user, admin:props.location.state.admin} 
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
                    <Nav.Link eventKey="metrics" onClick={()=> history.push({
    pathname: '/metrics',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>Metrics</Nav.Link>
                </Nav.Item>
            </Nav>
        </Row>
        <Row>
        <Container className="justify-content-around">
        <Row>
            <Col>
            <Row className="pb-5">
                <Card bg="light" text="dark" border="light" className="text-center" style={{ width: '25rem' }}>
                    <Card.Header>Profile</Card.Header>
                    <Card.Body>
                    <Card.Title>Project ID</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{proj}</Card.Subtitle>
                    <Card.Title>User Name</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{props.location.state.username}</Card.Subtitle>
                    <Card.Title>User ID</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{props.location.state.user}</Card.Subtitle>
                    <Button className="text-center mt-3" variant="outline-dark" bg="light" onClick={()=> history.push({
    pathname: '/profile',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>Go to Profile</Button>
                    </Card.Body>
                </Card>
                </Row>
                <Row>
                <Card bg="light" text="dark" border="light" className="text-center" style={{ width: '25rem' }}>
                    <Card.Header>VM Instances</Card.Header>
                    <Card.Body>
                    {vm.map((row)=>{return(<Card.Subtitle className="mb-2 text-muted">{row.name}</Card.Subtitle>)})}
                    <Button className="text-center mt-3" variant="outline-dark" bg="light" onClick={()=> history.push({
    pathname: '/vm',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>Go to VM Instances</Button>
                    </Card.Body>
                </Card> 
                </Row>
            </Col>
            <Col className="justify-content-center align-content-center">
                <Card bg="light" text="dark" border="light" className="text-center flex-fill mt-5"  >
                    <Card.Header>Metrics</Card.Header>
                    <Card.Body>
                        <Carousel interval={5000} pause='hover' indicators={false}>
                            <Carousel.Item >
                                <Card.Title>CPU_Runtime</Card.Title>
                                <Line data={cr} options={options} />
                                <br/>
                            </Carousel.Item>
                            <Carousel.Item>
                            <Card.Title>GPU_Runtime</Card.Title>
                                <Line data={gr} options={options} />
                                <br/>
                            </Carousel.Item>
                            <Carousel.Item >
                            <Card.Title>CPU_Usage</Card.Title>
                                <Line data={cu} options={options} />
                                <br/>
                            </Carousel.Item>
                            <Carousel.Item >
                            <Card.Title>GPU_Usage</Card.Title>
                                <Line data={gu} options={options} />
                                <br/>
                            </Carousel.Item>
                            <Carousel.Item >
                            <Card.Title>Disk_Usage</Card.Title>
                                <Line data={du} options={options} />
                                <br/>
                            </Carousel.Item>
                            <Carousel.Item >
                            <Card.Title>Ram_Usage</Card.Title>
                                <Line data={ru} options={options} />
                                <br/>
                            </Carousel.Item>
                        </Carousel>
                    <br/>
                    <Button className="text-center mt-3" variant="outline-dark" bg="light" onClick={()=> history.push({
    pathname: '/metrics',
    state: {username:props.location.state.username, password:props.location.state.password, user:props.location.state.user,admin:props.location.state.admin} 
    })}>Go to Metrics</Button>
                    </Card.Body>
                </Card>
            </Col>
            </Row>
            <br/>
        <Row>
        <br/>
        </Row>
        </Container>
    </Row>
    </Container>}
    </React.Fragment>)
}

export default withRouter(User_DashBoard);