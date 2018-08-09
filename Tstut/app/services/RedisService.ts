import {json} from "express";

let bluebird = require("bluebird");
var redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
import * as _ from 'lodash';

export class RedisService {
    public client: any;
    private static Instance: RedisService;

    public constructor() {
        // console.log('initializing redis client', process.env.REDIS_URL);
        this.client = redis.createClient(process.env.REDIS_URL);
        // this.client = redis.createClient();
    }

    public static get instance(): any {
        return this.Instance || (this.Instance = new RedisService())
    }

    public async registerChatter(alias: string, socketid?: string) {
        let chatters = await this.getAllChatters();
        let users = chatters.find((chatter, index) => {
            if(JSON.parse(chatter).user == alias){
                return  JSON.parse(chatter);
            }
        })
        console.log('users', users);
        if (typeof users!= "undefined" && users!=undefined) {
            //if user is trying to register for the second time, delete first record of user from redis and reinsert again
            //after deletion, push the new chatter
            await  this.client.lremAsync("chatters", -1, users);
        }
        return this.client.lpushAsync('chatters', JSON.stringify({user: alias, socketid: socketid})).then(() => {
            return 'user registered';
        }).catch((e) => {
            console.log('error in registering user',e);
        })
    }


    async getListLength(listname) {

        return this.client.llenAsync(listname).then((res) => {
            return res;
        }).catch((e) => {
            console.log(e);
        })
    }

    async getAllChatters() {
        let length = await this.client.llenAsync('chatters').then((res) => {
            return res
        });
        return this.client.lrangeAsync('chatters', 0, length)
    }

    async getRecipient(recipient) {
        console.log('user to find', recipient);
        return new Promise(async (resolve, reject)=>{

           let chatters = await this.getAllChatters();
           let reciver = chatters.find((user, index)=>{
               if (recipient == JSON.parse(user).user) {
                   return JSON.parse(user);
               }
           })
            console.log('reciever from array', reciver);
            if(typeof reciver !='undefined' && JSON.parse(reciver).user===recipient) {
               resolve(JSON.parse(reciver));
            } else {
                console.log('rejecting get REcipient');
               reject("not found");
            }
        })
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

    async dropChatterFromRedis(socketid: string) {

        // get all chatters from redis
        //map through chatters, find the one with socketid as recieved in arguments
        //drop that out of chatters list
        let chatters = await this.getAllChatters();
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