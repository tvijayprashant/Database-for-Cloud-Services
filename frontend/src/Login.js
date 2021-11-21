import React from 'react';
import './loginstyle.css';
import axios from 'axios';
import {Link} from 'react-router-dom';
function Login(){
    const [msg,setMsg] = React.useState({})
    const [auth,setAuth] = React.useState(false)

    const handleSubmit= (response)=>{
        response.preventDefault();
        let data = [{email: response.currentTarget[0].value, password: response.currentTarget[1].value}]
        setAuth(true)
            // axios({
            //   method: "POST",
            //   url: "http://localhost:8008/login",
            //   data: data
            // })
            //   .then((response) => {
            //     setMsg(response.data);
            //   })
            //   .catch((error) => {
            //       console.log(error);
            //     });
            //     console.log(msg);
          };
    
        
    return(
        
 <div className="container-fluid">
    <div className="row no-gutter">       
        <div className="col-md-6 d-none d-md-flex bg-image" ></div>
        <div className="col-md-6 bg-light">
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
                                <button type="submit" className="btn btn-primary btn-block text-uppercase mb-2 rounded-pill shadow-sm">{auth && <Link to={{ pathname:"/dashboard",
                    state:{name:"eafafdfga",password: "afdafgda"}
                  }} />}Sign in</button>
                               
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    )
}

export default Login;