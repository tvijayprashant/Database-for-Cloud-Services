import React from 'react'
import { Container,Navbar,Nav,Row,Col,NavDropdown,Card,Form } from 'react-bootstrap'
import { Line } from 'react-chartjs-2'

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

function Metrics(){
    let values = cpuRuntime.datasets[0].data;
    const [data, setData] = React.useState(genData(values));
    const [graph,setGraph] = React.useState("");

    const projId = [{id:132435465},{id:132423425},{id:34546765},{id:98765432},{curr:5674839210,username:"sdfgfh",userid:765432342}];
    const details = [{pId:89573461, vmId:861829, zone:"us-central-a"},
                {pId:27342342, vmId:13425, zone:"us-central-b"},
                {pId:34785692, vmId:83454, zone:"us-central-a"},
                {pId:123423524, vmId:64545, zone:"eu-east-a"},
                {pId:82374234, vmId:2345465, zone:"eu-west-b"},
            ]
    // const dataset = {diskUsage:[12, 19, 3, 5, 2, 3],cpuRuntime:[12, 19, 3, 2, 6, 4]}
    
    React.useEffect(() => {
    }, []);

    
    const handleCost = (e)=> {
        values = [12, 19, 3, 5, 2, 3];
        if(e.target.checked){
            values = values.map(x=>x*10)
        }
        setData(genData(values))
    }
    const handleProj = (e)=> {
            
    }
    const handleVm = (e)=> {

    }
    const handleZone = (e)=> {        
        if(e.target.value === 'us-central-a'){
            let data = graph.datasets[0].data;
            data = data * 10;
            cpuRuntime.datasets[0].data = data;
            console.log({graph}.datasets[0].data)
        }
        else if(e.target.value === 'us-central-b'){
            let data = cpuRuntime.datasets[0].data;
            data = data * 10;
            cpuRuntime.datasets[0].data = data;
        }
        else if(e.target.value === 'eu-east-a'){
            let data = cpuRuntime.datasets[0].data;
            data = data * 10;
            cpuRuntime.datasets[0].data = data;
        }
        else if(e.target.value === 'eu-west-b'){
            let data = cpuRuntime.datasets[0].data;
            data = data * 10;
            cpuRuntime.datasets[0].data = data;
        }
    }
    
    const handleGraph = (e) => {
        setGraph(e.currentTarget.id);
    }
    return (
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
                    <Nav.Link eventKey="link-2" href="/vm">VM Instances</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link active eventKey="link-3" href="/metrics">Metrics</Nav.Link>
                </Nav.Item>
            </Nav>
        </Row>
        <br/>
        <Row>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>Disk Usage</Card.Header>
                    <Card.Body>
                        <Line data={data} options={options} />
                        <Form id='diskUsage' className="d-flex justify-content-around" onChange={handleGraph}>
                            <Form.Check type="checkbox" id="costCheck" label="With Cost" className="mr-2 mt-2" onChange={handleCost}/>
                            <Form.Control as="select" id="projectId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleProj}>
                                {details.map((row,index)=> {return(<option>{row.pId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="vmId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleVm}>
                                {details.map((row,index)=> {return(<option>{row.vmId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="zoneName" size="sm" className="ml-3 mr-3 mt-2" onChange={handleZone}>
                                <option>us-central-a</option>
                                <option>us-central-b</option>
                                <option>eu-east-a</option>
                                <option>eu-west-b</option>
                            </Form.Control>
                            </Form>
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>RAM Usage</Card.Header>
                    <Card.Body>
                        <Line data={data} options={options} />
                        <Form id='ramUsage' className="d-flex justify-content-around" onChange={handleGraph}>
                            <Form.Check type="checkbox" id="costCheck" label="With Cost" className="mr-2 mt-2" onChange={handleCost}/>
                            <Form.Control as="select" id="projectId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleProj}>
                                {details.map((row,index)=> {return(<option>{row.pId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="vmId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleVm}>
                                {details.map((row,index)=> {return(<option>{row.vmId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="zoneName" size="sm" className="ml-3 mr-3 mt-2" onChange={handleZone}>
                                <option>us-central-a</option>
                                <option>us-central-b</option>
                                <option>eu-east-a</option>
                                <option>eu-west-b</option>
                            </Form.Control>
                            </Form>
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
                        <Line data={data} options={options} />
                        <Form id='cpuRuntime' className="d-flex justify-content-around" onChange={handleGraph}>
                            <Form.Check type="checkbox" id="costCheck" label="With Cost" className="mr-2 mt-2" onChange={handleCost}/>
                            <Form.Control as="select" id="projectId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleProj}>
                                {details.map((row,index)=> {return(<option>{row.pId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="vmId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleVm}>
                                {details.map((row,index)=> {return(<option>{row.vmId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="zoneName" size="sm" className="ml-3 mr-3 mt-2" onChange={handleZone}>
                                <option>us-central-a</option>
                                <option>us-central-b</option>
                                <option>eu-east-a</option>
                                <option>eu-west-b</option>
                            </Form.Control>
                            </Form>
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>GPU Runtime</Card.Header>
                    <Card.Body>
                        <Line data={data} options={options} />
                        <Form id='gpuRuntime' className="d-flex justify-content-around" onChange={handleGraph}>
                            <Form.Check type="checkbox" id="costCheck" label="With Cost" className="mr-2 mt-2" onChange={handleCost}/>
                            <Form.Control as="select" id="projectId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleProj}>
                                {details.map((row,index)=> {return(<option>{row.pId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="vmId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleVm}>
                                {details.map((row,index)=> {return(<option>{row.vmId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="zoneName" size="sm" className="ml-3 mr-3 mt-2" onChange={handleZone}>
                                <option>us-central-a</option>
                                <option>us-central-b</option>
                                <option>eu-east-a</option>
                                <option>eu-west-b</option>
                            </Form.Control>
                            </Form>
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
                        <Line data={data} options={options} />
                        <Form id='cpuUsage' className="d-flex justify-content-around" onChange={handleGraph}>
                            <Form.Check type="checkbox" id="costCheck" label="With Cost" className="mr-2 mt-2" onChange={handleCost}/>
                            <Form.Control as="select" id="projectId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleProj}>
                                {details.map((row,index)=> {return(<option>{row.pId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="vmId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleVm}>
                                {details.map((row,index)=> {return(<option>{row.vmId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="zoneName" size="sm" className="ml-3 mr-3 mt-2" onChange={handleZone}>
                                <option>us-central-a</option>
                                <option>us-central-b</option>
                                <option>eu-east-a</option>
                                <option>eu-west-b</option>
                            </Form.Control>
                            </Form>
                    </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card bg="light" text="dark" border="light" className="d-flex justify-content-center text-center" >
                    <Card.Header>GPU Usage</Card.Header>
                    <Card.Body>
                        <Line data={data} options={options} />
                        <Form id='gpuUsage' className="d-flex justify-content-around" onChange={handleGraph}>
                            <Form.Check type="checkbox" id="costCheck" label="With Cost" className="mr-2 mt-2" onChange={handleCost}/>
                            <Form.Control as="select" id="projectId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleProj}>
                                {details.map((row,index)=> {return(<option>{row.pId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="vmId" size="sm" className="ml-3 mr-3 mt-2" onChange={handleVm}>
                                {details.map((row,index)=> {return(<option>{row.vmId}</option>)})}
                            </Form.Control>
                            <Form.Control as="select" id="zoneName" size="sm" className="ml-3 mr-3 mt-2" onChange={handleZone}>
                                <option>us-central-a</option>
                                <option>us-central-b</option>
                                <option>eu-east-a</option>
                                <option>eu-west-b</option>
                            </Form.Control>
                            </Form>
                    </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
    )
}

export default Metrics;