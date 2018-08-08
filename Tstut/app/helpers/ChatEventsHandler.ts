import {RedisService} from '../services/RedisService';
import {doesConversationExist} from "../services/AuthorizationService";
import {Conversation}from '../models/conversationModel';
export function  privateMessage(message) {
    console.log('private message recieved', message);
}

export async function setNick(user: any, socketid: string, socket: any){

      await RedisService.instance.registerChatter(user, socketid);
      socket.emit('aliascreated', user);
}

export async function sendChattersList(socket: any) {
    let chatterlist = await RedisService.instance.getAllChatters();
    chatterlist = chatterlist.map((user, index)=>{
         user = JSON.parse(user);
        return user.user;
    });
    socket.emit('chatterslist', chatterlist);
}
export async function sendPrivateMessage(packet: any, socket: any) {
    try {
        //query redis if the redis has user that means user is online, send message to the online user
        let recipient = await RedisService.instance.getRecipient(packet.recipient);
        console.log('found recipient in resolved promise', recipient);
        socket.broadcast.to(recipient.socketid).emit('privatemessage', packet);
        try{
            await doesConversationExist(packet.recipient, packet.sender);

        } catch(e) {
            //IF CONVERSATION DOES NOT EXIST, CREATE ONE AND PUSH IT ONTO DB
          await  Conversation.saveConversation(packet.sender, packet.recipient, packet);

        }
        //all that is left now is
        //creating conversation if one doesn't exist
        //storing messages in redis
        //storing messages in database
        //scheduler for copying messages from redis to database


    } catch(e) {
        //if user is not online
        console.log('rejected promise result', e);
    }
}
export async function broadcastPublicMessage(message,socket: any) {
    console.log('broadcast this message to public room', message);
    socket.emit('message', message);
}

export function notifyUserAddition(socket: any) {
    socket.emit('lal')

}

export async function handleDisconnection(socketid: string) {
    await RedisService.instance.dropChatterFromRedis(socketid);
}



