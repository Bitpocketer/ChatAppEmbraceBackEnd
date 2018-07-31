import {knex} from '../services/DatabaseService';
import {getUserAlias} from '../services/UserService';
import {RedisService} from "./RedisService";
import {type} from "os";

export async  function getConversationOfUser(userid: number) : Promise<any> {

    let userconversation = await knex('chatusers')
        .join('conversation', 'conversation.user_two', '=', 'chatusers.id')
        .select('chatusers.name as user')
        .where('conversation.user_one', userid)
        .orWhere('conversation.user_two', userid)
        .then((rows)=>{
            // console.log('rows in getvconversationofUser', rows);
            return rows;
        })
        return userconversation;

}



export async  function testgetConversationOfUser(userid: number) : Promise<any> {
    // console.log('uid in tconversationofuser', userid);

    let userconversation = await knex.raw('select conversation.*, messages.*, chatusers.name as user' +
        ' from conversation' +
        ' inner join ' +
        ' (select distinct on (c_id) c_id, conversation_reply.time, conversation_reply.message' +
        ' ,conversation_reply.sender, conversation_reply.recipient from conversation_reply' +
        ' order by c_id, conversation_reply.time desc' +
        ') messages on messages.c_id = conversation.id' +
        ' inner join chatusers on conversation.user_two = chatusers.id' +
        ' where user_one = '+ userid.toString() +' or user_two = '+ userid.toString()

    ).then( async (result)=>{
        console.log('result of raw query', result.rows);
        // return result.rows;

       let conversationz = await result.rows.map (async (converse,index) => {

            if( converse.user == await getUserAlias(userid) && (converse.user_one == userid || converse.user_two== userid)) {

                // console.log('condition passed');
                converse.user = await getUserAlias(converse.user_two);

                if(converse.user_two == userid && converse.user == await getUserAlias(converse.user_two)) {
                    // console.log('con repassed');
                    // console.log('conuser1', await(getUserAlias(converse.user_one)));
                    converse.user = await(getUserAlias(converse.user_one));

                    // console.log('settup ', converse.user);
                }

            }
            return converse;

        })

        ;
        // return conversationz;
        let conversations = Promise.all(conversationz).then((completed) => {
            // console.log('promise.all', completed);
            return completed;
        })
        return conversations;
    })
    // console.log('uservorsationsz', userconversation);
    return userconversation;

}

export async function messagesBetweenUserAndRecipient(alias: string, recipient: number) {

    // console.log('alias in messagesbetweenuserRecipient ',  alias);

    let messages = await knex.raw('select conversation_reply.message from conversation_reply' +
        ' inner join conversation c2 on c2.id = conversation_reply.c_id ' +
        ' inner join chatusers on chatusers.id = c2.user_one or chatusers.id = c2.user_two' +
        ` where chatusers.name = '`+alias+ `'`+ `and ( c2.user_two = `+recipient+ `or c2.user_one =`+recipient+`)`)
        .then((result)=> {
            // return result.rows;
            let messages = result.rows.map((row,index)=>{
                return row.message;
            })
            return messages;

        })
    return messages;
}

export async function getMessagesFromRedis(alias?: string) {

    try {
      let allmessages= await new RedisService().getAllMessages().then(res=>{return res});
      let parsedmessages = allmessages.map((message,index)=>{
          return JSON.parse(message);
      })
        //now map througgh cid and for each id check if it exist as c_id in parsedmessages array if it does, copy message into new array
;

      let filteredmessages = parsedmessages.filter((mss,index) => {

          if(mss.sender === alias || mss.recipient === alias) {
              return mss;
          }
      })
        // console.log('parsed messagesfrom redis', parsedmessages);
        // console.log('filtered messages from redis', filteredmessages)
        filteredmessages.reverse();
        // console.log('reverse filtered messages from redis', filteredmessages)
      return filteredmessages;
    } catch (error) {
        return error;
    }
}

