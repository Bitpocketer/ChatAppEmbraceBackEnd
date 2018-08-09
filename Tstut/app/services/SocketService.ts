import {RedisService} from './RedisService';
import {doesConversationExist} from "./AuthorizationService";
import {Conversation} from "../models/conversationModel";
import {Message} from '../models/messagesModel';
import {MessageOrmModel} from '../orms/MessageOrmModel';
import {ConversationOrmModel} from "../orms/ConversationOrmModel";
import * as ChatEventsHandler from '../helpers/ChatEventsHandler';
import {knex} from "./DatabaseService";
export let publicroom;
module.exports = function (io) {
    publicroom = io.of('/public');
    let worldroom = io.of('/world');
    console.log('io called');
    //public room events
    publicroom.on('connection',function(socket){

        socket.on('setnick',async (user)=>{
           await ChatEventsHandler.setNick(user.nick, socket.id, socket);
           await ChatEventsHandler.sendChattersList(socket);

        });

        socket.on('message', (message)=>{
            ChatEventsHandler.broadcastPublicMessage(message,publicroom);
        })

        socket.on('privatemessage', async(packet)=> {
            try {
                await ChatEventsHandler.sendPrivateMessage(packet, socket);

            } catch(err){
                console.log('error in socket service on privateMessage', err);
            }
        })

        socket.on('disconnect', async()=>{
            ChatEventsHandler.handleDisconnection(socket.id)
        })
    })
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




