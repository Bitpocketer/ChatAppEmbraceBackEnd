export class AuthenticationError{
    Message:string ;

    constructor(message?:string) {
        this.Message = message;
    }
    get status(){
        return 403
    }

    get message() {
        return this.Message;
    }
}