import React from "react";
import { Container, Row, Col, Navbar, Nav, NavDropdown, Card, Button,Carousel} from 'react-bootstrap';
import { Line } from 'react-chartjs-2';

const data = {
  labels: ['1', '2', '3', '4', '5', '6'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      fill: false,
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgba(255, 99, 132, 0.2)',
    },
  ],
};

const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

const projId = [{id:132435465},{id:132423425},{id:34546765},{id:98765432},{curr:5674839210,username:"sdfgfh",userid:765432342}];
const vm = [{name:"asfdgsfg"},{name:"sadfasfg"},{name:"Agnihotri"},{name:"Netradham"},{name:"SunnyDay"}]

export const Admin_DashBoard = () =>(
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
                    <Nav.Link active href="/">DashBoard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-1" href="/profile">Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-2" href="/vm">VM Instances</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-3" href="/metrics">Metrics</Nav.Link>
                </Nav.Item>
            </Nav>
        </Row>
        <Row>
        <Container className="justify-content-around">
        <Row>
            <Col>
                <Card bg="light" text="dark" border="light" className="text-center" style={{ width: '25rem' }}>
                    <Card.Header>Profile</Card.Header>
                    <Card.Body>
                    <Card.Title>Project ID</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{projId[projId.length-1].curr}</Card.Subtitle>
                    <Card.Title>User Name</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{projId[projId.length-1].username}</Card.Subtitle>
                    <Card.Title>User ID</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{projId[projId.length-1].userid}</Card.Subtitle>
                    <Button className="text-center" variant="dark" bg="light" href="/profile">Go to Profile</Button>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card bg="light" text="dark" border="light" className="text-center" style={{ width: '25rem' }}>
                    <Card.Header>Metrics</Card.Header>
                    <Card.Body>
                        <Carousel interval={5000} pause='hover'>
                            <Carousel.Item >
                                <Card.Title>Runtime</Card.Title>
                                <Line data={data} options={options} />
                                <br/>
                            </Carousel.Item>
                            <Carousel.Item >
                            <Card.Title>CPU_Runtime</Card.Title>
                                <Line data={data} options={options} />
                                <br/>
                            </Carousel.Item>
                            <Carousel.Item>
                            <Card.Title>GPU_Runtime</Card.Title>
                                <Line data={data} options={options} />
                                <br/>
                            </Carousel.Item>
                        </Carousel>
                    <br/>
                    <Button className="text-center" variant="dark" bg="light" href="/metrics">Go to Metrics</Button>
                    </Card.Body>
                </Card>
            </Col>
            </Row>
            <br/>
            <Row className="justify-content-center">
                <Card bg="light" text="dark" border="light" className="text-center" style={{ width: '25rem' }}>
                    <Card.Header>VM Instances</Card.Header>
                    <Card.Body>
                    {vm.map((row)=>{return(<Card.Subtitle className="mb-2 text-muted">{row.name}</Card.Subtitle>)})}
                    <Button className="text-center" variant="dark" bg="light" href="/vm">Go to VM Instances</Button>
                    </Card.Body>
                </Card>
        </Row>
        <Row>
        <br/>
        </Row>
        {/* <Row>
        <Col>
                <Card bg="light" text="dark" border="light" className="text-center" style={{ width: '18rem' }}>
                    <Card.Header>Header</Card.Header>
                    <Card.Body>
                    <Card.Title>Light Card Title</Card.Title>
                    <Card.Text>
                        Some quick example text to build on the card title and make up the bulk
                        of the card's content.
                    </Card.Text>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card bg="light" text="dark" border="light" className="text-center" style={{ width: '18rem' }}>
                    <Card.Header>Header</Card.Header>
                    <Card.Body>
                    <Card.Title>Light Card Title</Card.Title>
                    <Card.Text>
                        Some quick example text to build on the card title and make up the bulk
                        of the card's content.
                    </Card.Text>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card bg="light" text="dark" border="light" className="text-center" style={{ width: '18rem' }}>
                    <Card.Header>Header</Card.Header>
                    <Card.Body>
                    <Card.Title>Light Card Title</Card.Title>
                    <Card.Text>
                        Some quick example text to build on the card title and make up the bulk
                        of the card's content.
                    </Card.Text>
                    </Card.Body>
                </Card>
            </Col>
        </Row> */}
        </Container>
    </Row>
    </Container>
)