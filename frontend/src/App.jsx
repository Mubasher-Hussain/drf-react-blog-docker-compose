import React from "react";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";

import axios from "./auth/axiosConfig";

import "./App.scss";
import { Login, Register } from "./login/index";
import { logout, useAuth } from "./auth";
import { BlogDetails, BlogsList, NewBlog, EditBlog } from "./blogs";

import NotificationSystem from 'react-notification-system';
 

const notificationSystem = React.createRef()


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogginActive: true,
    };
  }


  // For animating register and login container via onclick
  changeState() {
    const { isLogginActive } = this.state;
    if (isLogginActive) {
      this.rightSide.classList.remove("right");
      this.rightSide.classList.add("left");
    } else {
      this.rightSide.classList.remove("left");
      this.rightSide.classList.add("right");
    }
    this.setState(prevState => ({ isLogginActive: !prevState.isLogginActive }));
  }

  createNotification(message, level, children=null){
    notificationSystem.current.addNotification({
      message: message,
      level: level,
      children: children
    });
  }

  render() {
    const { isLogginActive } = this.state;
    const current = isLogginActive ? "Register" : "Login";
    const currentActive = isLogginActive ? "login" : "register";
    
    return (
      <Router>
        <div className="App">
          <NotificationSystem ref={notificationSystem} />
          <NavBar createNotification={this.createNotification}/>
          <Switch>
            <Route exact path='/'><Redirect to='../blogsList'></Redirect></Route>
            <Route exact path="/blogsList/:author?" component={BlogsList}/>
            <Route
              exact path="/blogDetails/:pk"
              children={({match}) => (
                <BlogDetails createNotification={this.createNotification} match={match} />
              )}
            />
            <PrivateRoute
              path="/createPost"
              createNotification={this.createNotification}
              component={NewBlog}
            />
            <PrivateRoute
              path="/editPost/:pk"
              createNotification={this.createNotification}
              component={EditBlog} 
            />
            <Route path="/login">
              <div className="login">
                <div className="container" ref={ref => (this.container = ref)}>
                  {isLogginActive && (
                    <Login containerRef={ref => (this.current = ref)} createNotification={this.createNotification}
                    />
                  )}
                  {!isLogginActive && (
                    <Register containerRef={ref => (this.current = ref)} createNotification={this.createNotification} />
                  )}
                </div>
                <RightSide
                  current={current}
                  currentActive={currentActive}
                  containerRef={ref => (this.rightSide = ref)}
                  onClick={this.changeState.bind(this)}
                  isLogginActive={this.state.isLogginActive}
                />
              </div>
            </Route>

          </Switch>
          
      </div>
      
    </Router>
    );
  }
}


// Container for login and register tab
const RightSide = props => {
  let containerSide;
  if (props.isLogginActive) {
    containerSide = "left";
  } else {
    containerSide = "right";
  }
  return (

    <div
      className= {"right-side " + containerSide}
      ref={props.containerRef}
      onClick={props.onClick}
    >
      <div className="inner-container">
        <div className="text">{props.current}</div>
      </div>
    </div>
  );
};


// Navbar for login/logout and display blogs List option
function NavBar (props) {

  const [logged] = useAuth();
  const history = useHistory();
  function serverLogout() {
    axios
    .get('blogs/api/logout')
    .then(() =>{
      logout();
      props.createNotification('Logged Out', 'success');
      history.push('../');
      history.goBack();}); 
  }
  return (
    <nav class='navbar navbar-expand navbar-dark bg-dark fixed-top' >
      <div class='container'>
        <ul class="navbar-nav mr-auto">

          { logged &&      
            <li class="nav-item">
              <button class="btn" onClick={() => serverLogout()}>Logout</button>
            </li>
            }
          {!logged && 
            <li class="nav-item">
              <button class="btn" onClick={() => history.push('../login')}>Login</button>
            </li>
            }
          <li class="nav-item">
          <button class="btn" onClick={() => history.push('../blogsList')}>Blogs List</button>
          </li>
          <button class="btn"
            onClick={() =>{
              if (!logged){
                props.createNotification(
                  'You need to login first. Redirecting in 5s....',
                  'warning', 
                  <Link to='../login'>Login</Link>)
                setTimeout(() => history.push('../login'), 5000)
              }
              else
                history.push('../createPost')
            }}
          >
          New Blog
          </button>
        </ul>
      </div>
    </nav>
    
  );
};


// Reroutes to login page if non authorized user accesses certain elements
const PrivateRoute = ({ component: Component, createNotification=createNotification ,...rest }) => {
  const [logged] = useAuth();
   
    return <Route {...rest} render={({match}) => (
      logged
        ? <Component createNotification={createNotification} match={match} />
        : <Redirect to='../login' />
    )} />
}


export default App;
