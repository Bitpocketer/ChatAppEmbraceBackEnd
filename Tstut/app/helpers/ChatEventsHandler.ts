import {RedisService} from '../services/RedisService';
import {doesConversationExist} from "../services/AuthorizationService";
import {Conversation} from '../models/conversationModel';
import {messagesBetweenUserAndRecipient} from "../services/ConversationService";

export async function setNick(user: any, socketid: string, socket: any) {

    await RedisService.instance.registerChatter(user, socketid);
    socket.emit('aliascreated', user);
}

export async function sendChattersList(socket: any) {
    let chatterlist = await RedisService.instance.getAllChatters();
    chatterlist = chatterlist.map((user, index) => {
        user = JSON.parse(user);
        return user.user;
    });
    socket.emit('chatterslist', chatterlist);
}


export async function sendPrivateMessage(packet, socket) {
    try {
        console.log('send private mesage called');
        let receiver = await getReceiverFromRedis(packet);
        console.log('reciever offline', receiver);
        if (receiver != false && receiver != null) {
            console.log('executing for online user');
            if (await getConversationFromDatabase(packet)) {
                packet.c_id = await Conversation.saveConversation(packet.sender, packet.recipient, packet, false);
            } else {
                packet.c_id = await Conversation.saveConversation(packet.sender, packet.recipient, packet, true);
                sendConversationCreatedNotificationToClient(socket, packet);
            }
            socket.broadcast.to(receiver.socketid).emit('privatemessage', packet);
        } else {
            //USER IS OFFLINE  THAT MEANS HE ALREADY HAS CONVERSATION WITH RECIPIENT HANDLE IT HERE UPDATE EXISTING CONVERSATION
            packet.c_id = await Conversation.saveConversation(packet.sender, packet.recipient, packet, false);
        }
    } catch (err) {
        console.log('error in send message', err);

    }
}

function sendConversationCreatedNotificationToClient(socket, packet) {
    setTimeout(() => {
        socket.emit('conversationcreated', packet)
    }, 2000);
}

async function getReceiverFromRedis(packet) {
    try {
        return await RedisService.instance.getRecipient(packet.recipient);
    } catch (err) {
        console.log('not found in getRecieverfromRedis', err);
        return false;
    }
}

async function getConversationFromDatabase(packet) {
    try {
        return await doesConversationExist(packet.recipient, packet.sender);

    } catch (err) {
        return false;
    }
}

export async function broadcastPublicMessage(message, socket: any) {
    console.log('broadcast this message to public room', message);
    socket.emit('message', message);
}

export function notifyUserAddition(socket: any) {
    socket.emit('lal')

}

export async function handleDisconnection(socketid: string) {
    await RedisService.instance.dropChatterFromRedis(socketid);
}



