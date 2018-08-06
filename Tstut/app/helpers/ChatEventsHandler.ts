import {RedisService} from '../services/RedisService';
export function  privateMessage(message) {
    console.log('private message recieved', message);
}

export async function setNick(user: any, socketid: string, socket: any){

      await RedisService.instance.registerChatter(user, socketid);
      socket.emit('aliascreated', user);
}

export async function sendChattersList(socket: any) {
    let chatterlist = await RedisService.instance.getAllChatters();
    chatterlist = chatterlist.map((user, index)=>{
         user = JSON.parse(user);
        return user.user;
    });
    socket.emit('chatterslist', chatterlist);
}

export function NotifyUserAddition(socket) {
    socket.emit('lal')

}



