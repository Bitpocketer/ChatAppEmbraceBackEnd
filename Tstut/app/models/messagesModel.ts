import * as _ from 'lodash';
export class Message {

    message: string;
    ip: string;
    time: Date;
    status: number;
    c_id: number;

    static createMessage(message:string , ip:string,  time: Date, status: number, cid: number ): Message {

        let msg = new Message();

        msg.message = message;
        msg.ip = ip;
        msg.time = time;
        msg.status = status;
        msg.c_id = cid;

        return  msg;
    }

    static FromDb(msg) {

        if(!_.isNull(msg)) {
            _.pick(msg, validFields);
        }
    }
}
export interface Messages {
    message: string;
    ip: string;
    status: number;
    sender: string,
    recipient: string;
}

let validFields = ['message']