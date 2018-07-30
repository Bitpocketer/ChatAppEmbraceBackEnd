import * as bcrypt from 'bcrypt-nodejs';
import * as _ from 'lodash';
export class User {
    name: string;
    email: string;
    password: string;


    static create(name: string, email: string, password: string): User{
        let user = new User();

        //do some validation here and then create user but for now that's okay
        user.name = name;
        user.email = email;
        user.password = hash(password);

        return user;
    }
static  fromDb(user:any):any {

        if(!_.isNull(user) ) {

         let u=   _.pick(user,validfields)
            return u;
        }
}


}
function hash(password: string) : string {
    let salt = bcrypt.genSaltSync(10);
console.log('returning hash password', bcrypt.hashSync(password,salt));
    return bcrypt.hashSync(password, salt);
}

let validfields= ["name", "email"];
