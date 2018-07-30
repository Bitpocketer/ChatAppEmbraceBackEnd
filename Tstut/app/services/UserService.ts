import {UserOrmModel} from "../orms/UserOrmModel";
import * as ConversationService from './ConversationService';
import {User} from "../models/userModel";
import {getIdsOfChatters} from "../services/SocketService";
import {stringify} from "querystring";

export async function getUserConversations(alias: string) {

    // console.log('getUserConversations called in UserServices', alias);
    let userId = await getIdsOfChatters(alias);
     userId = userId[0].id;
     // console.log('userId  in UserService', userId);
     //now get all the conversations of this great user he has been involved in
    let username = await getUserAlias(userId);


    let conversationsOfUser = await ConversationService.testgetConversationOfUser(userId);
    // console.log('conversationOfuser', conversationsOfUser);
    return conversationsOfUser;
}

export async function getUserAlias(userId) {


    let alias= await new UserOrmModel().where('id', userId).fetch().then((result)=>{

        return User.fromDb(result.toJSON());
    })
    // console.log('returning alias for '+userId, alias.name);
    return alias= alias.name;


}

export async function getUserOfflineMessages(alias:string) {

    let allmessages = await ConversationService.getMessagesFromRedis( alias);
    return allmessages;

}

export async function getMessages(alias: string, recipient: string) {

    let userTwoId = await getIdsOfChatters(null, recipient);
     // console.log('userTwoids', userTwoId);
    return await ConversationService.messagesBetweenUserAndRecipient(alias, userTwoId[0].id);
}


