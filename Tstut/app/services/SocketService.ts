import {RedisService} from './RedisService';
import {doesConversationExist} from "./AuthorizationService";
import {Conversation} from "../models/conversationModel";
import {Message} from '../models/messagesModel';
import {MessageOrmModel} from '../orms/MessageOrmModel';
import {ConversationOrmModel} from "../orms/ConversationOrmModel";
import * as ChatEvents from '../helpers/ChatEvents';
import {knex} from "./DatabaseService";
export let publicroom;
module.exports = function (io) {
    publicroom = io.of('/public');
    let worldroom = io.of('/world');
    console.log('io called');
    //public room events
    publicroom.on('connection',function(socket){
        console.log('public room connection established',socket.id);
        publicroom.on('setnick',(user)=>{
            ChatEvents.setNick(user);
        });
    })



}








//
export async function getIdsOfChatters(userone?: string, usertwo?: string) {
    // console.log('called---------getidsofchatters', userone||usertwo);

    let ids = await knex('chatusers')
        .where('name', userone)
        .orWhere('name', usertwo||userone)
        .select('id')
        .then((rows) => {
            // console.log('rows in the getIds of chatters', rows);
            // ids = rows;
            return rows;

        });
    // console.log('ids in socketservice', ids);
    return ids;
}

async function pushMessageIntoDB(message: Message) {
    console.log('message to push into db', message);
    try {
        return await new MessageOrmModel().save(message).then((message) => {
            let msg = Message.FromDb(message.toJSON())
            return "succesfully stored message";
        })

    }
    catch (error) {
        return error;
        console.log('error in pushing message to db', error);
    }
}

async function getConversationOfChatters(userone: number, usertwo: number) {

    return await knex('conversation')
        .where('user_one', userone)
        .andWhere('user_two', usertwo)
        .orWhere('user_one', usertwo)
        .andWhere('user_two', userone)
        .select('id')
        .then((rows) => {
            console.log('conversations', rows);
            return rows;
        })
}


