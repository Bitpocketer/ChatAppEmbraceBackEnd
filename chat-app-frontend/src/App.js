import React, {Component} from 'react';
import logo from './static/logo.svg';
import io from 'socket.io-client';
import './style/App.css';
import {
    showchatrooms, hidchatrooms,
    showloginform,
    hideloginform,
    showregisterationform,
    hideregisterationform,
    openmodal,
    closemodal,
    showerror,
    hideerror, showpasswordfield, hidepasswordfield,
    showconversationview,
    hideconversationview
} from "./custom/customjs";
import LoginForm from "./Views/LoginForm";
import Renderlist from "./Views/Message";
import UserList from "./Views/UserList";
import ConversationItem from "./Views/ConversationItem";
import $ from 'jquery';
import {api} from './apiconfig';

let socket = io("http://localhost:4000/public", {reconnect: true});

// let socket = io('http://316c3271.ngrok.io');

class App extends Component {

    constructor() {
        super();
        this.state = {
            message: '',
            messagestodisplay: [],
            alias: '',
            users: [],
            guest: false,
            recipient: '',
            conversations: [],
            privatemessages: [],
            authenticated: false,
            activeconversation:'',
            firstmessageadded: false
        }
    }

    componentDidMount() {
        hideregisterationform();
        console.log('component mounted');
        socket.on('connection', function (socket) {
            console.log('connected to server', socket.id);

        });
        socket.on('messsage', function (msg) {
            console.log('msg recieved', msg);
        });

        socket.on('privatemessage', function (packet) {
            console.log('private message recieved ', packet)
            //check if conversation of a sender  is already added to the state
            this.setState({recipient: packet.sender})
            let pm = {recipient: packet.recipient, sender: packet.sender, message: [packet.message],c_id:packet.c_id}
            console.log('generatedpm on privatemessage', pm);
            if(pm.recipient===this.state.alias){
                this.setState({firstmessageadded:true})
            }
            if(this.state.firstmessageadded === true) {
                this.setState({privatemessages: this.state.privatemessages.concat(pm)}, () => {
                    console.log('pms', this.state.privatemessages)
                });
            }

            let senderadded = false;

            this.state.conversations.map((convo, index) => {

                var indexofcolumn = packet.message.indexOf(":")

                var user = packet.message.substring(0, indexofcolumn);
                console.log('deducted user from message', user);
                if (convo.c_id === packet.c_id) {

                    senderadded = true;

                }
            })
            //push to state only if the sender is not added to the list

            if (!senderadded) {
                // deduct sender from packet and update the user property of packet
                var indexofcolumn = packet.message.indexOf(":")

                var user = packet.message.substring(0, indexofcolumn);
                packet.sender = user;
                console.log('packet sender', packet.sender);
                console.log('packet recipient', packet.recipient);
                this.setState({conversations: this.state.conversations.concat(packet)});
                console.log('sender not added')
            }
            else {
                // find the conversation of the sender and only update the message recieved (sounds hectic though fkit)
                console.log('sender added');
                let updatedarray = this.state.conversations;
                this.state.conversations.map((convo, index) => {

                    var indexofcolumn = packet.message.indexOf(":")

                    var c_id = packet.c_id;

                    if (convo.c_id === c_id ) {
                        //find the convesation of this sender in the state and update only message,
                        var requiredconversation = this.state.conversations.find(con => con.c_id === convo.c_id);
                        console.log('required conversation', requiredconversation);
                        requiredconversation.message = packet.message;
                        updatedarray[index] = requiredconversation;
                    }
                });
                console.log('update array', updatedarray);
                this.setState({conversations: updatedarray});
            }
        }.bind(this))
        // socket.emit('message', this.state.message);
        this.listenForMessages();

        socket.on('aliascreated', function (alias) {
            console.log('alias created on server', alias);
            this.setState({alias: alias}, () => {
                this.displayChatrooms(alias);
                this.hidelogin();
                this.fetchConversations(alias);

            },)
        }.bind(this))

        socket.on('chatterslist', (chatters) => {
            console.log('all chatters on frontend', chatters);

            chatters.map((chatter, index) => {
                // console.log(this.doesChatterAlreayExist(chatter));
                if (!this.doesChatterAlreayExist(chatter)) {
                    this.setState({users: this.state.users.concat(chatter)});
                }
            })
        })

        socket.on('newuseradded', (chatter) => {
            // console.log('newuseradded', chatter);
            if (this.state.alias !== chatter && !this.doesChatterAlreayExist(chatter)) {
                this.setState({users: this.state.users.concat(chatter)});
            }
        });

        socket.on('deleteduser', (chatter) => {
            // console.log('deleted user', chatter);
            let filteredusers = this.state.users.filter((user, index) => {
                if (user !== chatter) {
                    return user;
                }
            });

            // console.log('filtered users', filteredusers);
            this.setState({users: filteredusers}, () => {
                console.log('state update after filteration', this.state.users);
            });
        })

        socket.on('conversationcreated', (packet)=>{
            console.log('packet on conversation created', packet);
            let pm = {sender: this.state.alias, recipient: packet.recipient, message: [packet.message],c_id:packet.c_id}
            this.setState({privatemessages:this.state.privatemessages.concat(pm)});
            this.setState({conversations: this.state.conversations.concat(packet),activeconversation:packet.c_id});
            this.setState({firstmessageadded:true})
        })

        socket.on('disconnect', () => {
            // socket.connect();
            // console.log('socket disconnected', socket);
        })

    };

    render() {
        var Messages = this.state.messagestodisplay.map((msg, index) => {
            return <Renderlist listitem={msg} key={index}/>
        });

        var PrivateMessages = this.state.privatemessages.map((conversation, index) => {

            // if ((conversation.sender === this.state.alias || conversation.recipient === this.state.alias) && (conversation.sender === this.state.alias || conversation.sender === this.state.recipient)) {
                if(conversation.c_id===this.state.activeconversation){
                let list = conversation.message.map((msg, index) => {
                    // console.log('message of pm',msg);
                    return <Renderlist listitem={msg} key={index}/>
                })
                return list;
            }
        })

        var user = this.state.users.map((user, index) => {
            return <UserList listitem={user} key={index} openmodal={this.openchatmodal.bind(this)}
                             setrecepient={this.setRecepient.bind(this)}/>
        })

        var Conversations = this.state.conversations.map((conversation, index) => {
            // console.log('conversation', conversation);
            // console.log('conversation',conversation);
            let conmessage;
            let username
            let msg;
            if (typeof conversation.message !== 'undefined') {
                // console.log('untrimmed message', conversation.message);
                conmessage = decodeURIComponent(conversation.message);
                var indexofcolumn = conmessage.indexOf(":")

                msg = conmessage.substring(indexofcolumn + 1, conmessage.length);
                username = conmessage.substring(0, indexofcolumn);
                // console.log('trimmed message', username);
                msg = username + ": " + msg;
            } else {
                msg = " ";
            }
            // return <ConversationItem
            //     sender={conversation.sender !== this.state.alias ? conversation.user : 'some other user'}
            //     conversationId={conversation.c_id} message={msg} openmodal={this.openchatmodal.bind(this)}/>

            if(conversation.sender === this.state.alias || conversation.recipient === this.state.alias) {
                return <ConversationItem sender = {conversation.sender===this.state.alias?conversation.recipient:conversation.sender} conversationId = {conversation.c_id}
                                         message = {msg} openmodal = {this.openchatmodal.bind(this)} key={conversation.c_id}
                                          conversationId ={conversation.c_id}  />
            }


        })

        return (
            <div className="container">

                <LoginForm setnick={this.setNickName.bind(this)} signin={this.signin.bind(this)}
                           signup={this.signup.bind(this)} guestornot={this.setAsGuest.bind(this)}/>
                <button onClick={this.signout.bind(this)}>signout</button>
                <p>{this.state.alias}</p>
                <div className="chatrooms">
                    <ul>
                        <li>Public</li>
                        <li>Pakistan</li>
                        <li>World</li>
                    </ul>
                </div>

                <div id="chatroomcontainer">

                    <div id="userscontainer">
                        <h4>Users</h4>
                        <div id="userslist">
                            <ul>
                                {user}
                            </ul>
                        </div>
                    </div>

                    <div id="conversationcontainer">
                        <h4>conversations</h4>
                        <div id="userslist">
                            <ul>
                                {Conversations}
                            </ul>
                        </div>
                    </div>

                    <ul id="messages">
                        {Messages}
                    </ul>

                    <div id="myModal" className="modal">

                        <div className="modal-content">
                            <span className="close" onClick={this.closechatmodal}>&times;</span>
                            <ul id="messages">
                                {PrivateMessages}
                            </ul>
                            <form className="modalchatform">
                                <input id="m" autoComplete="off" onChange={this.composeMessage.bind(this)}
                                       ref="msgbox"/>
                                <button onClick={this.sendPrivateMessage.bind(this)}>Send</button>
                            </form>
                        </div>

                    </div>

                    <form className="chatform">
                        <input id="m" autoComplete="off" onChange={this.composeMessage.bind(this)} ref="msgbox"/>
                        <button onClick={this.sendMessage.bind(this)}>Send</button>
                    </form>
                </div>
            </div>

        );
    }

    sendMessage(e) {
        e.preventDefault();
        // console.log('sending');
        var alias = this.state.alias;
        // console.log('the alias is ', this.state.alias);
        var msg = this.state.message;
        var message = alias + ': ' + msg;
        if (this.state.alias !== '')
            socket.emit('message', message);
        else
            console.log('first logintochat');
        this.refs.msgbox.value = "";
    }

    sendPrivateMessage(e) {
        e.preventDefault();
        var alias = this.state.alias;
        var msg = this.state.message;
        var recipient = this.state.recipient;

        var message = alias + ': ' + msg;

        let packet = {
            message: message,
            recipient: recipient,
            sender: alias
        }

        socket.emit('privatemessage', packet);
        //update state for private messages
        if(this.state.activeconversation!=="") {
            let pm = {
                sender: this.state.alias,
                recipient: packet.recipient,
                message: [packet.message],
                c_id: this.state.activeconversation
            }
            this.setState({privatemessages: this.state.privatemessages.concat(pm)}, () => {
                console.log('pms', this.state.privatemessages)
            });
            this.updateConversationMessage(pm);
        }
    }

    composeMessage(e) {

        let target = e.target;
        let msg = target.value;

        this.setState({message: msg});

    }

    listenForMessages() {
        // console.log('listening for messages');
        socket.on('message', (msg) => {
            // console.log('message received on frontend', msg);
            this.setState({messagestodisplay: this.state.messagestodisplay.concat(msg)}, () => {
                // console.log('dalm', this.state.messagestodisplay)
            })
        })
    }

    setNickName(nick) {
        // console.log('setting nick', nick);
        hideconversationview();
        let user = {
            nick: nick,
            id: socket.id
        }
        if (!socket.connected) {
            // console.log('socket not connected');
            // socket = io("http://localhost:3000/public");
            // console.log(socket)
            socket.open((result) => {
                // console.log('result from reconnection', result)
            });

        }
        console.log('emitting nick', user);
        socket.emit('setnick', user);
    }

    displayChatrooms(alias) {
        // console.log('displaychatroom called');
        showchatrooms();
        // this.setState({users:this.state.users.concat(alias)})
    }

    setRecepient(recepient) {
        this.setState({recipient: recepient})
    }

    showlogin() {
        showloginform();
    }

    hidelogin() {
        hideloginform();
    }

    doesChatterAlreayExist(chatter) {

        let exist = false;
        this.state.users.map((user, index) => {
            if (user == chatter) {
                exist = true;
            }
        })
        return exist;
    }

    signout() {
        socket.emit('forceDisconnect', socket.id);
        this.setState({users: []});
        this.showlogin();
        hideerror();
        hideconversationview();

        this.setState({
            messagestodisplay: [], alias: '', users: [], guest: false, recipient: '',
            conversations: [], privatemessages: [], authenticated: false
        });
    }

    signin(user) {

        // console.log('sign in here', user);
        $.ajax({
            url:'http://localhost:3000/api/authenticate',
            dataType: 'JSON',
            data: user,
            type: 'POST',
            success: (response) => {
                console.log('response from authentication', response);
                if (response.token != null && typeof  response.token !== 'undefined' && response.token !== "invalid username or password") {
                    let u = {
                        nick: user.name
                    }
                    if (!socket.connected) {
                        console.log('socket not connected');
                        // socket = io("http://localhost:3000/public");
                        console.log(socket)
                        socket.open((result) => {
                            // console.log('result from reconnection', result)
                        });
                        this.setState({authenticated: true})
                    }
                    console.log('emitting setnick', u);
                    socket.emit('setnick', u);
                    showconversationview();
                    this.setState({authenticated: true})
                }
                else {
                    console.log('invalid user name or password');
                    showerror();
                }
            },
            err: (error) => {
                console.log('error in authentication', error);
            }
        })
    }

    signup(user) {

        $.ajax({
            url: api.url+'api/create',
            dataType: 'JSON',
            data: user,
            type: 'POST',
            success: (response) => {
                // console.log('response from user registeration', response);
                if (response.name === user.name) {

                }
            },
            err: (error) => {
                // console.log('error in registeration', error);
            }
        })
    }

    openchatmodal(e, conversationId) {
        console.log('conversationId in openchatmodel',conversationId);
        let target = e.target;
        let recipient = target.innerHTML;
        this.setState({activeconversation:conversationId});
        this.setState({recipient: recipient}, () => {

            if (this.state.authenticated && this.state.fetchpm===true) {

                this.fetchMessage(this.state.alias,this.state.recipient);
            }
        });
        openmodal();
        // if(this.state.authenticated) {
        //     this.fetchMessage(this.state.alias,this.state.recipient);
        // }
    }


    closechatmodal() {

        closemodal()
    }

    setAsGuest(guest) {

        if (guest === false) {
            this.setState({guest: false});
        } else {
            this.setState({guest: true})
            hideerror();
        }
    }

    fetchMessage(alias, recipient) {
        let chatters = {
            alias: alias,
            recipient: recipient
        }
        $.ajax({
            url: api.url+'api/getmessages',
            type: 'POST',
            data: chatters,

            success: function (messages) {
                // console.log('these are messages between '+this.state.alias + 'and '+this.state.recipient, messages);
                console.log(this.state.alias, messages);
                let unescappedmessages = messages.map((msg)=>{
                    msg.message= decodeURIComponent(msg.message);

                    let pm = {recipient: this.state.alias, sender: this.state.recipient, message: [msg.message],c_id:msg.c_id}
                    // console.log('generated pm', pm);
                    this.setState({privatemessages: this.state.privatemessages.concat(pm)});
                })

            }.bind(this),
            err: function (error) {
                console.log('error occured while fetching messages', error);
            }
        })
    }

    fetchConversations(alias) {

        console.log('alias in fetchConversations', alias);
        let conversationids = this.state.conversations.map((conversation, index) => {
            return conversation.c_id;
        })
        let cids = {cids: conversationids, alias: this.state.alias}

        $.ajax({
            url: api.url+'api/userconversationsfromredis',
            type: 'post',
            dataType: 'json',
            data: cids,
            success:  (messages,status,XMLHttpRequest )=> {
                console.log('conversations fetched from redis', messages);

                if(XMLHttpRequest.getResponseHeader('fetchpm')==1) {
                    this.setState({fetchpm:true})
                }

                return messages;
            },
            err: function (error) {
                console.log('error in fetching messages from redis', error);
            }
        }).then((messages) => {

            this.updateConversations(messages);
            this.updatePrivateMessages(messages);
        })
    }


updateConversations(conversations) {
        console.log('conversations in updateConversations',conversations)
// update conversations based on c_id
    //check if the conversation with particular c_id is already there don't push just update, put only when conversation doesn't exist
    //initialy conversations are empty

    //for loop for checking each conversation existance in state
    for(let i =0; i<conversations.length; i++) {
        //if conversation doesn't exist in state push into state
        conversations[i].message = decodeURIComponent(conversations[i].message)
        if(this.conversationExist(conversations[i].c_id) === false) {
            //conversation does not exist, push into state

            this.setState({conversations: this.state.conversations.concat(conversations[i])})
            //if this is the last message of conversations then its message also has to be updated
            //find latest message of conversation id i and update it
        }
        else {

        //     //conversation exists in state, only find the conversation and update the latest message
        //     //first find the latest message of the current conversation c_id from the conversations recieved in this function
            let latestmessage;
            //for loop for finding first message of current c_id from conversations
            loop1:
            for(let lm=0; lm<conversations.length; lm++) {
                if(conversations[i].c_id=== conversations[lm].c_id) {
                    latestmessage = conversations[lm];
                    break loop1;
                }
            }
            // console.log('latest message of ',conversations[i].c_id,' ', latestmessage);
             this.state.conversations.map((conv,index)=>{
                if(conv.c_id === conversations[i].c_id) {
                    conv = latestmessage;
                    this.state.conversations[index] = conv;
                    this.forceUpdate();
                }
            })

        }
    }

}

    conversationExist(c_id, messages) {
        console.log('messages in conversationExist', c_id);
        let exists = false;
        let indexofExistingConversationInState ;
        this.state.conversations.map((con, index) => {
            if (con.c_id === c_id) {
                exists = true;
                indexofExistingConversationInState = index;
            }
        })
        //if conversation is already added to the state, then find the latest message from messages of this c_id
        if(c_id === 38 ) {
            console.log('returning ',exists);
        }
        return exists;

    }


    updatePrivateMessages(messages) {
        // console.log('push these message into private messages', messages);

            for (let i = messages.length - 1; i >= 0; i--) {
                let pm = {
                    recipient: messages[i].recipient,
                    sender: messages[i].sender,
                    message: [messages[i].message],
                    c_id: messages[i].c_id
                }
                this.setState({privatemessages: this.state.privatemessages.concat(pm)});
            }

    }

    updateConversationMessage(message) {
        console.log('updateConversationMessage called', message);
        this.state.conversations.map((convo,index)=>{
            if(convo.c_id===message.c_id) {
                convo.message = message.message;
                this.forceUpdate();
            }
        })
    }

}

export default App;
