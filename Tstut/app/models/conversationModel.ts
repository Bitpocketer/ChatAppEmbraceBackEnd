import * as _ from 'lodash';
import {knex} from "../services/DatabaseService";
import {ConversationOrmModel} from "../orms/ConversationOrmModel";
import {Message} from "./messagesModel";
import {RedisService} from "../services/RedisService";

export class Conversation {
    user_one: number;
    user_two: number;
    time: Date;
    status: number;
    ip: string

    static createConversation(user_one: number, user_two: number, status: number): Conversation {
        //first query if conversation already doesn't exit
        //create conversation and return result

        let conversation = new Conversation();

        conversation.user_one = user_one;
        conversation.user_two = user_two;
        conversation.time = new Date();
        conversation.status = status;
        conversation.ip = '192.168.0.1';


        return conversation;

    }

    static fromDB(conversation: any) {

        if (!_.isNull(conversation)) {
            let c = _.pick(conversation, validFields)
            return c;
        } else {
            return {errormessage: " error from DB conversationModel"}
        }
    }

    static async saveConversation(sender, recipient, packet): Promise<any>{

        // let ids = await this.getIdsOfChatters(sender, recipient).then(res=>{return res}).catch(e=>console.log('get ids error', e));
        // let user1 = ids[0].id; let user2 = ids[1].id;
        let convertsation = this.createConversation(1, 22,1,);

        let conversationidarray = await new ConversationOrmModel(convertsation).save().then((converse)=>{
            let cid = Conversation.fromDB(converse.toJSON())
            return cid;
        });
        let conversationid = conversationidarray.id;
        let message = Message.createMessage(packet.message, "192.168.1.1", new Date(), 1, conversationid,sender,recipient);
        //save message in redis
        let redissatatus= await RedisService.instance.messagesQueue(message);
        console.log('redis status', redissatatus);
    }

    public static async getIdsOfChatters(userone?: string, usertwo?: string) {
        // console.log('called---------getidsofchatters', userone||usertwo);
        console.log('getIds of chatters called"');

        let ids = await knex('chatusers')
            .where('name', userone)
            .orWhere('name', usertwo || userone)
            .select('id')
            .then((rows) => {
                // console.log('rows in the getIds of chatters', rows);
                // ids = rows;
                return rows;


            });
        // console.log('ids in socketservice', ids);
        return ids;
    }
}

let validFields = ["id"]
