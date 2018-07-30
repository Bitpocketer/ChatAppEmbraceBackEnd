import {knex} from './DatabaseService';
import * as bcrypt from 'bcrypt-nodejs';
import * as jwt from 'jsonwebtoken';

let JWTsecret = process.env.JWT_SECRET || 'mysecretkey';

export async function authenticate(username: string, password: string): Promise<IauthToken | string> {
    // console.log('req recieved in authenticate', username);
    let token;
    let recordexists: boolean = false;
    let record: any;
    await knex.select('name', 'password', 'id')
        .from('chatusers')
        .where({name: username})
        .then((row) => {
            record = row;
        });
   let pass= record.length!=0&&record!='undefined'?record[0].password:null;
   console.log('pass', pass);
   console.log('password', password);
    if(pass!=null&&bcrypt.compareSync(password,pass)) {
        let token = jwt.sign({
            id: record[0].id,
            name: record[0].name
        } as Ijwt, JWTsecret, {
            algorithm:'HS256',
            expiresIn: '1 day'
        });
        return token;
    } else {
        return "invalid username or password";
    }

}

export interface IauthToken {
    token: string;
}

export interface Ijwt {
    id: number;
    name: string;
}