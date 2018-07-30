import {json} from "express";

let bluebird = require("bluebird");
var redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
import * as _ from 'lodash';

export class RedisService {
    public client: any;

    public constructor(){
        // console.log('initializing redis client', process.env.REDIS_URL);
        this.client = redis.createClient(process.env.REDIS_URL);
        // this.client = redis.createClient();
    }

    async registerChatter(alias: string, socketid?:string ) {

        let chatter = {user: alias, socketid: socketid}

        return this.client.lpushAsync('chatters', JSON.stringify(chatter)).then((res:any) => {
            return 'user registered';
        }).catch((e)=>{
            console.log(e);
        })
    }



    async getListLength(listname) {
        return this.client.llenAsync(listname).then((res)=> {
            return res;
        }).catch((e)=> {
            console.log(e);
        })
    }

    async getAllChatters(length: number) {

        return this.client.lrangeAsync('chatters',0, length)
    }

    async  removeChattersFromRedis() {

      //delete all users from chatters list
        return this.client.delAsync('chatters').then((res)=>{
            return "deleted all chatters from Redis";
        });
    }

    async removeMessagesFromRedis(){
        return this.client.delAsync('messages').then(res=>{
            return "delete all messages";
        })
    }

    async messagesQueue(message) {
        //wheather to stringify it or not?
        return this.client.lpushAsync('messages',JSON.stringify(message)).then((res:any)=>{
            console.log('messages queue response', res);
            return "message pushed into the queue"
        }).catch((error)=> {
            console.log('error');
        })
    }

    async  getAllMessages() {
        let messageLength = await this.getListLength('messages')
        return this.client.lrangeAsync('messages',0, messageLength).then((res: any)=>{
            return res;
        });

    }

    //drop particular user from redis upon disconnection
    async  dropChatterFromRedis(socketid: string) {

        // get all chatters from redis
        //map through chatters, find the one with socketid as recieved in arguments
        //drop that out of chatters list
        let length = await this.getListLength('chatters');

        let chatters = await this.getAllChatters(length);

        let users = chatters.map((chatter,index)=>{ return JSON.parse(chatter);})

        // console.log('user in dropchatterfromredis', users);

        let usertoberemoved =  users.filter((user,index) => {

            if(user.socketid == socketid) {
                return user;
            }

        });
        console.log('usertoberemoved', usertoberemoved);
        if(usertoberemoved.length>0) {
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