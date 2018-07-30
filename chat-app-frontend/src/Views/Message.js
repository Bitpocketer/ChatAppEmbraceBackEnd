import React, {Component} from 'react';

export default class Renderlist extends Component {

    render() {
        return (
                <li>
                    {this.props.listitem}
                </li>
        )}
}