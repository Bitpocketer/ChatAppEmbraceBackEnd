import React, {Component} from 'react';

export default class Renderlist extends Component {

    render(){
        return <li onClick={this.props.openmodal}>{this.props.listitem}</li>
    }
}