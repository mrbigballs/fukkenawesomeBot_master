const tmi = require("tmi.js");


import { Credentials } from "./credentials";
import { ChatMessageFormatter } from "./chatformatter";
import { Settings } from './settings';

const credentials = new Credentials();
const chatMessageFormatter = new ChatMessageFormatter();

let mainChatMessageWindow = document.getElementById('chatWindow');



var autoconnect: boolean =  true;
var deleteMessages: boolean = true;




console.log(__dirname);

var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: credentials.default_botname,
        password: credentials.default_bot_oauthkey
    },
    channels: ["#slethzockt"]
};

const client = new tmi.client(options);

// Connect the client to the server..
if(autoconnect){
    console.log('connect');
    client.connect();
}

//on chat message do

client.on("chat", function (channel: string, userstate: any, message: string, self: any) {
    // Don't listen to my own messages..
    //if (self) return;
    console.log(message);
    // Do your stuff.
    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message));
    chatMessageFormatter.scrollChat();
});

client.on("timeout", function (channel: string, username: string, reason: string, duration: number) {
    console.log(username + ' timeouted for ' + duration  + ' because: ' + reason);
    if(deleteMessages){

    }
});

function sendMessage(message: string){
    client.say(options.channels, message);
}



document.getElementById('chatMessageInput').onkeypress = function(e) {
    if(e.keyCode == 13) {
        console.log('sdgsdfg');
        let text =  (<HTMLInputElement>document.getElementById('chatMessageInput')).value;
        if(text != ''){
            console.log(text);
            
            client.say(options.channels[0], text);
            (<HTMLInputElement>document.getElementById('chatMessageInput')).value = '';
        }
    }
}