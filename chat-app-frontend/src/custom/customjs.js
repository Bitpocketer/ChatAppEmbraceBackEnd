import $ from 'jquery';

export function showchatrooms() {
    $(".chatrooms").show();
}

export function hidchatrooms() {
    $(".chatrooms").hide();
}

export function hideloginform() {

    $(".log-form").hide();
}

export function showloginform() {
    $(".log-form").show();
}


export function hidepasswordfield() {
    $("#pwdfield").hide();
}

export function showpasswordfield() {
    $("#pwdfield").show();
}

export function showregisterationform(){
    $(".signupform").show();
}

export function hideregisterationform() {
    $(".signupform").hide()
}

export function showconversationview(){
    $("#conversationcontainer").show();
}

export function hideconversationview() {
$("#conversationcontainer").hide();
}

export function openmodal(){
$("#myModal").css("display","block");
}
export function closemodal(){
 $("#myModal").css("display","none");
}

export function showerror() {
    $("#error").show();
}

export function hideerror() {
    $("#error").hide();
}
