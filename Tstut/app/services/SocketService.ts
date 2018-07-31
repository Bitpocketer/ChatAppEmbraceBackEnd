import {RedisService} from './RedisService';
import {doesConversationExist} from "./AuthorizationService";
import {Conversation} from "../models/conversationModel";
import {Message} from '../models/messagesModel';
import {MessageOrmModel} from '../orms/MessageOrmModel';
import {ConversationOrmModel} from "../orms/ConversationOrmModel";
import {knex} from "./DatabaseService";

export function socketserver(server) {
    var io = require('socket.io').listen(server);
    var publicroom = io.of('/public');

    publicroom.on('connection', async function (socket) {

        //uncomment this line to delete all users from redis;
        // new RedisService().removeChattersFromRedis();

        //setup user ,register nick in redis along with socket id
        socket.on('setnick', (nick) => {

            // console.log('resetting nick', nick);

            new RedisService().registerChatter(nick.nick, socket.id).then(async (result) => {
                console.log('result from redis', result);

                if (result == 'user registered') {

                    let Rs = new RedisService();
                    let length = await Rs.getListLength('chatters');
                    let chatters = await Rs.getAllChatters(length);
                    // console.log('length of chatters', length);
                    console.log('all chatters', chatters);
                    // console.log('all chatters', chatters);
                    socket.emit('aliascreated', nick.nick);

                    let chatterslist = chatters.map((user, index) => {

                        let juser = JSON.parse(user);
                        return juser.user;
                    });
                    // console.log('againchatterlist', chatterslist);
                    socket.emit('chatterslist', chatterslist);

                    publicroom.emit('newuseradded', nick.nick);
                    publicroom.emit('message', nick.nick + ' joined the room');

                }
            })
            // socket.emit('aliascreated',nick.nick);
        })

        //listen for public messages on main room
        socket.on('message', (message) => {
            console.log('message recieved', message);
            publicroom.emit('message', message);
        });

        // listen for private messages
        socket.on('privatemessage', async (packet) => {

            let address = socket.handshake.address;
            console.log('socket address', address)

            let conversationExist = await doesConversationExist(packet.recipient, packet.sender);
            console.log('--------->> packet recieved', packet);
            console.log('conversation exists', conversationExist);
            // console.log('send this message to', packet);
            // socket.emit('privatemessage',packet.recipient);
            //query the redis for the recipient socket id, if id is found (user is online) emit msg on that id
            //if recipient is offline push the message into redis and conversation db if recipient is also registered user
            //otherwise send message that recipient is offline :)

            //query the redis for the socket id of recipient here
            let Rs = new RedisService();
            let length = await Rs.getListLength('chatters');
            let chatters = await Rs.getAllChatters(length);

            let reciver = chatters.filter((user, index) => {

                if (packet.recipient == JSON.parse(user).user) {
                    return JSON.parse(user);
                }
            });

            //if reciever.length!=0 is true that would means user exists in redis and online send message to the user
            if (reciver.length != 0) {
                console.log('reciever found');
                let reciverj = JSON.parse(reciver[0]);
                console.log("------------->required socket.id", reciverj.socketid);

                let message = packet.message;
                let index = message.indexOf(":");
                let sender = message.substring(0, index + 1);
                message = message.substring(index + 1, message.length);

                let fullmessage = sender + message;
                packet.message = fullmessage;
                // socket.broadcast.to(reciverj.socketid).emit('privatemessage', packet);

                // push conversation if the conversation does not exist
                if (conversationExist == false) {
                    conversationExist;
                    console.log('sending parameters to getidsofchatters', packet.sender);
                    //first get ids of sender and recipient from database

                    let ids = await getIdsOfChatters(packet.sender, packet.recipient);

                    let user1 = ids[0].id;
                    let user2 = ids[1].id;

                    let conversation = Conversation.createConversation(user1, user2, 1);

                    let conversationidarray = await new ConversationOrmModel(conversation).save().then((converse) => {
                        let cid = Conversation.fromDB(converse.toJSON())
                        console.log('cid', cid);
                        return cid;
                    })

                    console.log('conversation created', conversationidarray);
                    let conversationid = conversationidarray.id;

                    let message = Message.createMessage(packet.message, address, new Date(), 1, conversationid, packet.sender, packet.recipient);
                    console.log('created message', message);

                    // let msgindb = await pushMessageIntoDB(message);
                    // console.log(msgindb);

                    let messageinredis = Object.create(message);
                    messageinredis.sender = packet.sender;
                    messageinredis.recipient = packet.recipient;
                    messageinredis.time = message.time;
                    messageinredis.status = message.status;
                    messageinredis.c_id = message.c_id;
                    messageinredis.ip = message.ip;
                    messageinredis.message = message.message;


                    new RedisService().messagesQueue(messageinredis).then(async (resp)=>{
                        await new RedisService().getAllMessages().then(res=>{
                            console.log('messages from redis for online user',res);
                        })
                    });

                    //now push messasges agains this created conversationid into conversation_reply
                    packet.c_id = conversationid;
                    socket.broadcast.to(reciverj.socketid).emit('privatemessage', packet);
                    setTimeout(()=>{socket.emit('conversationcreated',packet);},2000)

                } else {

                    //just find the id of conversation and push message into db against that conversation
                    let ids = await getIdsOfChatters(packet.sender, packet.recipient);

                    let user1 = ids[0].id;
                    let user2 = ids[1].id;

                    let conversation = await getConversationOfChatters(user1, user2)
                    console.log('required conversationid', conversation[0].id);

                    let conversationId = conversation[0].id;
                    console.log('conversationId', conversationId);

                    let message = Message.createMessage(packet.message, address, new Date(), 1, conversationId,packet.sender, packet.recipient);

                    // let msgindb = await pushMessageIntoDB(message);

                    let messageinredis = Object.create(message);
                    messageinredis.sender = packet.sender;
                    messageinredis.recipient = packet.recipient;
                    messageinredis.time = message.time;
                    messageinredis.status = message.status;
                    messageinredis.c_id = message.c_id;
                    messageinredis.ip = message.ip;
                    messageinredis.message = message.message;


                    new RedisService().messagesQueue(messageinredis).then(async (resp)=>{
                        await new RedisService().getAllMessages().then(res=>{
                            console.log('messages from redis for online user',res);
                        })
                    });

                    // console.log('message stored successfully for existing conversation');
                    // console.log(msgindb);

                    packet.c_id = conversationId;
                    socket.broadcast.to(reciverj.socketid).emit('privatemessage', packet)
                }
            } else {
                //if the user is not found from redis that means he's offline  push the message into queue

                console.log('reciever is not found, store into redis here');
                let message = packet.message;
                let index = message.indexOf(":");

                let sender = message.substring(0, index + 1);
                message = message.substring(index + 1, message.length);

                let fullmessage = sender + message;
                packet.message = fullmessage;

                //get conversation id of these users

                let ids = await getIdsOfChatters(packet.sender, packet.recipient);

                let user1 = ids[0].id;
                let user2 = ids[1].id;

                let conversation = await getConversationOfChatters(user1, user2)
                console.log('required conversationid', conversation[0].id);

                let conversationId = conversation[0].id;

                let msg =  Message.createMessage(packet.message, address, new Date(), 1, conversationId, packet.sender, packet.recipient);

                // let msgindb = await pushMessageIntoDB(msg);
                let messageinredis = Object.create(msg);
                messageinredis.sender = packet.sender;
                messageinredis.recipient = packet.recipient;
                messageinredis.time = msg.time;
                messageinredis.status = msg.status;
                messageinredis.c_id = msg.c_id;
                messageinredis.ip = msg.ip;
                messageinredis.message = msg.message;
                new RedisService().messagesQueue(messageinredis).then(async (resp)=>{
                   let msgs = await new RedisService().getAllMessages().then(res=>{
                       console.log('msgs from redis', res);
                   });

                });



            }

        })

        //handle disconnection
        socket.on('disconnect', async () => {
            console.log('disconnected from public room', socket.id);
            await  new RedisService().dropChatterFromRedis(socket.id).then(async (result) => {
                // console.log('result from dropchatterfromredids=======>', result);

                publicroom.emit('deleteduser', result);
                publicroom.emit('message', result + 'left the room');

                let length = await new RedisService().getListLength('chatters');
                let chatters = await new RedisService().getAllChatters(length);

                // console.log('chattersinredisoriginal', chatters);

                let chatterslist = chatters.map((user, index) => {

                    let juser = JSON.parse(user);
                    return juser.user;
                });


            });
        })

        //handle forced disconnection
        socket.on('forceDisconnect', (id) => {
            socket.disconnect();
        })
    })

}

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

function test(... params) {

}

