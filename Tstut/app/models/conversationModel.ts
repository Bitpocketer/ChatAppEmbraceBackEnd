import * as _ from 'lodash';

export class Conversation {
    user_one: number;
    user_two: number;
    time : Date;
    status: number;
    ip: string

    static createConversation(user_one: number, user_two: number, status: number): Conversation{
        //first query if conversation already doesn't exit
        //create conversation and return result

        let conversation = new Conversation ();

        conversation.user_one = user_one;
        conversation.user_two = user_two;
        conversation.time = new Date();
        conversation.status = status;
        conversation.ip = '192.168.0.1';


        return conversation;

    }

    static fromDB(conversation: any) {

        if(!_.isNull(conversation)) {
            let c = _.pick(conversation, validFields)
            return c;
        } else {
            return {errormessage:" error from DB conversationModel"}
        }
    }
}
let validFields=["id"]
