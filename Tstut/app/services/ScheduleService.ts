var worker = require('node-schedule');
import {RedisService} from "./RedisService";
import {knex} from "./DatabaseService";
import * as _ from 'lodash'

export function scheduleJob(messages) {

    var j = worker.scheduleJob('*/1 * * * * ', async function(){

        console.log('job is executed after ever minute');

        //get all conversations from reds and copy into database
        let messages = await new RedisService().getAllMessages()
        console.log('messages in scheduler', messages);

        let readytoinsert = messages.map((message, index)=> {
            // console.log('message in map', message);
            let u = JSON.parse(message)
             // u = _.pick(message,validFields);
            return u;
        })

        let messagesDb = readytoinsert.map((m, index)=> {
            let u = _.pick(m, validFields);
            return u;
        })
        let values="";

        let v= messagesDb.map(async(m, index)=> {
            if(index!=messagesDb.length-1) {
                m.message = escape(m.message);
                values+=`('`+m.message+`',`+`'`+m.ip+`','`+m.time+`',`+m.status+`,`+m.c_id+`),`;
            } else {
                m.message = escape(m.message);
                values+=`('`+m.message+`',`+`'`+m.ip+`','`+m.time+`',`+m.status+`,`+m.c_id+`);`;
            }

        })

        Promise.all(v).then(()=>{
            console.log('generated values', values);
            knex.raw('insert into conversation_reply (message, ip, time, status, c_id)  values '+values )
                .then(()=>{ console.log('record inserted')})
                .catch((e)=>{ console.log('error occured',e)})
        })

        //
        // console.log('ready to insert without sender and recipient', messagesDb);
        // knex.raw('insert into conversation_reply values (')
    })
}

let validFields = ["message", "ip", "time", "status", "c_id", "status"]