var worker = require('node-schedule');
import {RedisService} from "./RedisService";
import {knex} from "./DatabaseService";
import * as _ from 'lodash'

export function scheduleJob(messages) {

    var j = worker.scheduleJob('*/1 * * * *  ', async function () {

        console.log('job is executed after ever minute');

        //get all conversations from reds and copy into database
        let messages = await new RedisService().getAllMessages()


        let readytoinsert = messages.filter((message, index) => {
            // console.log('message in map', message);
            let u = JSON.parse(message)
            // u = _.pick(message,validFields);
            if (u.hasOwnProperty('savedinDb') == false) {
                return u;
            }
        })
        console.log('ready to insert', readytoinsert);
        if (readytoinsert.length != 0) {

            let messagesDb = readytoinsert.map((m, index) => {
                let u = JSON.parse(m);
                u = _.pick(u, validFields);
                console.log('returning u', u);
                return u;

            })

            let values = "";
            console.log('messagesDb', messagesDb);
            let v = messagesDb.map(async (m, index) => {
                if (index != messagesDb.length - 1) {
                    m.message = escape(m.message);
                    values += `('` + m.message + `',` + `'` + m.ip + `','` + m.time + `',` + m.status + `,` + m.c_id + `,'` + m.sender + `','` + m.recipient + `'),`;
                } else {
                    m.message = escape(m.message);
                    values += `('` + m.message + `',` + `'` + m.ip + `','` + m.time + `',` + m.status + `,` + m.c_id + `,'` + m.sender + `','` + m.recipient + `');`;
                }

            })

            Promise.all(v).then(() => {
                console.log('generated values', values);
                knex.raw('insert into conversation_reply (message, ip, time, status, c_id, sender, recipient)  values ' + values)
                    .then(async () => {
                        console.log('record inserted')
                        let messagesbackup = await  new RedisService().getAllMessages();


                        let updatedredisrecord = messagesDb.map(async (msg, index) => {
                            //find index of each message by it's rank and update msg.savedInDb
                            await new RedisService().updateMessageStatus(msg);


                        })

                        Promise.all(updatedredisrecord).then(() => {
                            console.log('updated records in redis')
                        })


                    })
                    .catch((e) => {
                        console.log('error occured', e)
                    })
            })
        }
        //


        //
        // console.log('ready to insert without sender and recipient', messagesDb);
        // knex.raw('insert into conversation_reply values (')
    })
}

let validFields = ["message", "ip", "time", "status", "c_id", "status", "sender", "recipient", "rank"]