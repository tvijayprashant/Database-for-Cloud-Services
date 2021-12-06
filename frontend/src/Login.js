import React from 'react';
import './loginstyle.css';
import axios from 'axios'; 
import {withRouter,useHistory} from 'react-router-dom';
import {Modal,Alert,Button,Form} from 'react-bootstrap';

let msg = [];
function Login(){

    const [signup,setSignUp] = React.useState(false)
    const [show,setShow] = React.useState([false,false])
    const [dataReceived,setDataReceived] = React.useState(false)
    const history = useHistory()

    const handleSubmit= async (response)=>{
        response.preventDefault();
        let data = [{email: response.currentTarget[0].value, password: response.currentTarget[1].value}]
        await axios({
              method: "POST",
              url: "http://localhost:8008/login",
              data: data
            })
            .then((response) => {
                    msg = response.data;
                    console.log(response.data)
                    let props = { username:data[0].email, password: data[0].password, user:response.data['user'].user_id, admin:response.data['admin']}
                    if(response.data['authenticated']){
                        history.push({
                            pathname: '/dashboard',
                            state: props 
                            })
                    }
                    else{ console.log("entered");setShow([true,false]);setTimeout(() => {setShow([false,false])}, 3000);}
                })
                .catch((error) => {
                    console.log(error);
                });         
          };
          
    const handleSignUp = (response) =>{
        response.preventDefault()
        let data = [{name:response.currentTarget[0].value ,email: response.currentTarget[1].value, password: response.currentTarget[2].value, payment: response.currentTarget[3].value}]
        console.log(data)
        axios({
              method: "POST",
              url: "http://localhost:8008/signup",
              data: data
            })
              .then((response) => {
                    msg = response.data;
                  })
                  .catch((error) => {
                          console.log(error);
                        });
        console.log(msg);
        setSignUp(false)
        setShow([true,true]);setTimeout(() => {setShow([false,false])}, 2000);
    }
        
    return(
<React.Fragment>
    
    <div className="container-fluid">
        <div className="row no-gutter">       
            <div className="col-md-6 d-none d-md-flex bg-image" ></div>
            <div className="col-md-6 bg-light">
            <Alert show={show[0]} variant={!show[1]?"success":"danger"} dismissible onClose={() => setShow([false,false])}>
                        <Alert.Heading>{msg.message}</Alert.Heading>
            </Alert>
                <div className="login d-flex align-items-center py-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-10 col-xl-7 mx-auto">
                                <h3 className="display-4 displog">Log In</h3>
                                <p className="text-muted mb-4 displog">to continue to Cloud Service Dashboard</p>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
                                        <input id="email" type="email" placeholder="Username" required autofocus="" className="form-control rounded-pill border-0 shadow-sm px-4"/>
                                    </div>
                                    <div className="form-group mb-3">
                                        <input id="password" type="password" placeholder="Password" required className="form-control rounded-pill border-0 shadow-sm px-4 text-primary"/>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-3">
                                        <input id="customCheck1" type="checkbox" className="custom-control-input"/>
                                        <label for="customCheck1" className="custom-control-label">Remember password</label>
                                    </div>
                                    <div class="d-flex">
                                    <button type="submit" className="btn btn-primary btn-block text-uppercase mb-2 mr-2 rounded-pill shadow-sm">Log in</button>
                                    <button className="btn btn-outline-primary btn-block text-uppercase mb-2 ml-2 rounded-pill shadow-sm" onClick={()=> setSignUp(true)}>Sign up</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal show={signup} centered onHide={()=>setSignUp(false)} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                    <Modal.Title>Sign Up</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form onSubmit={handleSignUp}>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" placeholder="Name" />
                        </Form.Group>
                        <br/>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" name="email" placeholder="Enter email" />
                            <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                            </Form.Text>
                        </Form.Group>
                        <br/>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" name="password" placeholder="Password" />
                        </Form.Group>
                        <br/>
                        <Form.Group controlId="formPayment">
                            <Form.Label>Payment Type</Form.Label>
                            <Form.Control type="text" name="payment" placeholder="Enter Payment Type" />
                        </Form.Group>
                        <br/>
                        
                        <Button variant="primary" type="submit">
                            Sign Up
                        </Button>
                    </Form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    </div>
</React.Fragment>
    )
}

export default withRouter(Login);