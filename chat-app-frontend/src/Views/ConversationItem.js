import React, {Component} from 'react';

export default class ConversationItem extends Component {

    render() {
        return <li>
            <div className="conversationitem" >
                <h3 onClick={this.props.openmodal}>{this.props.sender}</h3>
                <p>{this.props.message}</p>
            </div>
        </li>
    }
}