import React, {Component} from 'react';
import {showpasswordfield, hidepasswordfield, showregisterationform, hideregisterationform} from "../custom/customjs";
import axios from 'axios';

export default class LoginForm extends Component {
    constructor() {
        super();
        this.state = {
            nickname: '',
            asguest:''
        }
    }

    render() {
        return (
            <div>
                <div className="log-form">
                    <h4>Login to chat</h4>
                    <input type ="checkbox" name ="guest" value="checked"  onClick={this.asGuest.bind(this)}/>guest
                    <form className="loginform">
                        <input type="text" title="username" placeholder="username" onChange={this.setname.bind(this)}/>
                        <input type="password" title="username" placeholder="password" id="pwdfield" onChange={this.setPassword.bind(this)}/>

                        <button type="submit" className="btn" onClick={this.logIntoChat.bind(this)}>Join</button>

                        <button id = "registerbutton" onClick={this.showSignupForm}>Register</button>
                        {/*<a className="forgot" href="#">Forgot Username?</a>*/}
                    </form>
                    <p id="error">Invalid username or password</p>
                </div>

                <div className="signupform">
                    <h4>Register</h4>
                    <form className="loginform">
                        <input type="text" title="username" placeholder="username" onChange={this.setname.bind(this)}/>
                        <input type="email" title="email" placeholder="email" onChange={this.setEmail.bind(this)}/>
                        <input type="password" title="username" placeholder="password" onChange={this.setPassword.bind(this)}/>
                        <button onClick={this.signup.bind(this)}>Register</button>
                        <button onClick={this.hideregform.bind(this)}>close</button>
                        {/*<a className="forgot" href="#">Forgot Username?</a>*/}
                    </form>
                </div>


            </div>
        )
    }

    setname(e) {
        e.preventDefault();
        let target = e.target;
        let nick = target.value;
        this.setState({nickname: nick});
    }

    setPassword(e) {
        let target = e.target;
        let password = target.value;
        this.setState({password:password});
    }

    setEmail(e) {
        let target= e.target;
        let email = target.value;
        this.setState({email:email})
    }

    logIntoChat(e) {
        e.preventDefault();
        // console.log('sending', this.state.nickname);
        let mydata = {
            nickname: this.state.nickname
        }
        // console.log('mydata', mydata);
        if(this.state.asguest===true) {
            // console.log('entering as guest');
            this.props.setnick(mydata.nickname);
        } else {
            let user={
                name:this.state.nickname,
                password:this.state.password
            }
            this.props.signin(user);
        }
    }

    showSignupForm(e) {
        e.preventDefault();
        showregisterationform();
    }

    hideregform(e) {
        e.preventDefault();
        hideregisterationform();
    }

    asGuest(e) {
        let target = e.target;
        let boxvalue = target.checked;

        console.log('box value', boxvalue);
        if(boxvalue===false) {
            this.setState({asguest:false});
            showpasswordfield();
            this.props.guestornot(boxvalue);
        } else {
            this.setState({asguest:true})
            hidepasswordfield();
            this.props.guestornot(boxvalue);
        }
    }

    signup(e) {
        e.preventDefault();
        let user = {
            name: this.state.nickname,
            password: this.state.password,
            email: this.state.email
        }

        this.props.signup(user);
    }

}