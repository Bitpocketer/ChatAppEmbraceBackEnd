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
            if(index!=messagesDb.length-1)
            {
                let msg = m.message;
                let status = m.status;
                let ip = m.ip;
                let c_id = m.c_id;

                if(msg.includes(`'`)){
                    console.log(`msg includes '`, msg);
                    // get all occurences of ' in msg
                    let indexes = [], i = -1;

                    while((i=msg.indexOf(`'`,i+1))!= -1) {
                        indexes.push(i);
                    }

                    if(indexes.length>1) {
                        //
                        for(let i =0; i<indexes.length; i++) {

                        }
                    } else if(indexes.length===1) {
                        msg.splice(indexes[0],0,`'`)
                    }
                 console.log(msg, 'changed after processing');
                }

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