import {json} from "express";

let bluebird = require("bluebird");
var redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
import * as _ from 'lodash';

export class RedisService {
    public client: any;

    public constructor() {
        // console.log('initializing redis client', process.env.REDIS_URL);
        this.client = redis.createClient(process.env.REDIS_URL);
        // this.client = redis.createClient();
    }

    async registerChatter(alias: string, socketid?: string) {

        let length = await  this.getListLength('chatters');
        let chatters = await this.getAllChatters(length);
        console.log('all chatters in registerchatter', chatters);


        let users = chatters.map((chatter, index) => {
            return JSON.parse(chatter);
        })

        // console.log('user in dropchatterfromredis', users);

        let usertoberemoved = users.filter((user, index) => {

            if (user.user == alias) {
                return user;
            }

        });


        if (usertoberemoved.length > 0) {
            console.log('first remove the user ',alias,' already exists');
        return  await  this.client.lremAsync("chatters", -1, JSON.stringify(usertoberemoved[0])).then(async (result) => {

            //if user is trying to register for the second time, delete first record of user from redis and reinsert again
                //after deletion, push the new chatter
                let chatter = {user: alias, socketid: socketid}
                 return await this.client.lpushAsync('chatters', JSON.stringify(chatter)).then((res: any) => {
                    return 'user registered';
                })

            }).catch((e) => {
                console.log(e);
            })
        } else {

            console.log('insert directly');
            let chatter = {user: alias, socketid: socketid}
            return this.client.lpushAsync('chatters', JSON.stringify(chatter)).then((res: any) => {
                return 'user registered';
            }).catch((e) => {
                console.log(e);
            })
        }
    }


    async getListLength(listname) {

        return this.client.llenAsync(listname).then((res) => {
            return res;
        }).catch((e) => {
            console.log(e);
        })
    }

    async getAllChatters(length: number) {

        return this.client.lrangeAsync('chatters', 0, length)
    }

    async removeChattersFromRedis() {

        //delete all users from chatters list
        return this.client.delAsync('chatters').then((res) => {
            return "deleted all chatters from Redis";
        });
    }

    async removeMessagesFromRedis() {
        return this.client.delAsync('messages').then(res => {
            return "delete all messages";
        })
    }

    async messagesQueue(message) {
        let messagescount = await this.client.zcountAsync('messagesset', Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY).then(res => {
            return res
        });
        console.log('messagescount', messagescount);
        message.rank = messagescount;
        return this.client.zaddAsync('messagesset', messagescount, JSON.stringify(message)).then(res => {
            return "message pushed into sortedset"
        }).catch((error) => {
            console.log('error');
        })

        //wheather to stringify it or not?
        // return this.client.lpushAsync('messages',JSON.stringify(message)).then((res:any)=>{
        //     console.log('messages queue response', res);
        //     return "message pushed into the queue"
        // }).catch((error)=> {
        //     console.log('error');
        // })
    }

    async getAllMessages() {
        // let messageLength = await this.getListLength('messages')
        // return this.client.lrangeAsync('messages',0, messageLength).then((res: any)=>{
        //     return res;
        // });
        //remove it later,

        return this.client.zrangeAsync('messagesset', 0, -1).then(res => {
            return res;
        })


    }

    async updateMessageStatus(message) {
        console.log('message in updateMessagesStatus', message);
        let jm = message;
        // jm.savedinDb=true
        message.message = decodeURIComponent(message.message);
        message = JSON.stringify(message)
        console.log('remove this message', message);
        await this.client.zremAsync('messagesset', message).then(async (res) => {
            console.log("message deleted", res)
            if (res === 1) {
                message = JSON.parse(message);
                jm.savedinDb = true;
                await this.client.zaddAsync('messagesset', jm.rank, JSON.stringify(jm)).then(res => {
                    console.log('message updated', res)
                });
            }
        });


    }

    //drop particular user from redis upon disconnection
    async dropChatterFromRedis(socketid: string) {

        // get all chatters from redis
        //map through chatters, find the one with socketid as recieved in arguments
        //drop that out of chatters list
        let length = await this.getListLength('chatters');

        let chatters = await this.getAllChatters(length);

        let users = chatters.map((chatter, index) => {
            return JSON.parse(chatter);
        })

        // console.log('user in dropchatterfromredis', users);

        let usertoberemoved = users.filter((user, index) => {

            if (user.socketid == socketid) {
                return user;
            }

        });
        console.log('usertoberemoved', usertoberemoved);
        if (usertoberemoved.length > 0) {
            return this.client.lremAsync("chatters", -1, JSON.stringify(usertoberemoved[0])).then((result) => {
                console.log('delete alias', usertoberemoved[0].user);
                console.log('result', result);

                return usertoberemoved[0].user;
            }).catch((e) => {
                console.log(e);
            })
        }
    }
}