import React from 'react';
import {BrowserRouter as Router,Switch,Route,Link} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import User_DashBoard from './User_DashBoard';
import Profile from './Profile';
import Metrics from './Metrics';
import VM  from './VM';
import Login from './Login';

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/dashboard" component={User_DashBoard} />
          <Route path="/metrics" component={Metrics} />
          <Route path="/vm" component={VM} />
          <Route path="/profile" component={Profile} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
