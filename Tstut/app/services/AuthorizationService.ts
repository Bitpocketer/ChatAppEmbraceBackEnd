import {Request, Response, NextFunction} from 'express';
import {knex} from './DatabaseService';
import {AuthenticationError} from "../helpers/errors";

export function isAliasAvailable() {
    return async function (req: Request, res: Response, next: NextFunction) {
        let count = 0 ;
        await knex('chatusers')
            .where('name', req.body.name)
            .select('id')
            .then((rows)=>{
                console.log('rows', rows);
                count = rows.length;
            });
        console.log('count', count);
        if(count<1){
            next();
        } else {
            next( new AuthenticationError('username is already taken'));

        }
    }
}

export async function doesConversationExist(userone: string, usertwo: string) {
    // console.log('called---------888888', userone);
    return new Promise(async(resolve, reject)=> {
    let conversationExists = false;

    await  knex('chatusers')
        .where('name',userone)
        .orWhere('name',usertwo)
        .select('id')
        .then(async (rows)=> {
            console.log('chatusers', rows);
            rows.length>0?conversationExists=true : conversationExists = false;
            //greater than one because we need to have at least two user ids to check if the conversation between them has taken place
            if(rows.length > 1) {

                //now query conversation table here
                let u1 = rows[0].id;
                let u2 = rows[1].id;

                await knex ('conversation')
                    .where('user_one',u1)
                    .andWhere('user_two',u2)
                    .orWhere('user_one',u2)
                    .andWhere('user_two',u1)
                    .select('id')
                    .then((rows)=> {
                        console.log('conversations',rows);
                        rows.length>0?conversationExists = true : conversationExists = false;
                    })
            }
        })
     conversationExists?resolve(conversationExists):reject(conversationExists);
    })
}
