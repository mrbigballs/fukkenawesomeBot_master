const tmi = require("tmi.js");
const fs = require('fs');
const expressApp = require('express')();
var express = require('express');
var {ipcRenderer, remote} = require('electron');

import { Credentials } from "./credentials";
import { ChatMessageFormatter } from "./chatformatter";
import { Settings } from './settings';
import { SettingsModule } from './settingsmodule';

const credentials = new Credentials();
const chatMessageFormatter = new ChatMessageFormatter();
const settingsmodule = new SettingsModule();

let mainChatMessageWindow = document.getElementById('chatWindow');

document.getElementById("settingsGetOAuthkeyButton").addEventListener ("click", (e:Event) => credentials.getOAuthkey());

var autoconnect: boolean =  true;
var deleteMessages: boolean = true;

settingsmodule.loadSettings();

var server = require('http').createServer(expressApp);
var io = require('socket.io')(server);


console.log(__dirname);
expressApp.use(express.static(__dirname + '/../app/public'));

server.listen(1337);

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

client.on("connected", function (address: string, port: number) {
    ipcRenderer.send('botConnected', 'connected yeah');
});

//on chat message do
client.on("chat", function (channel: string, userstate: any, message: string, self: any) {
    // Don't listen to my own messages..
    //if (self) return;
    console.log(message);
    console.log(settingsmodule.settings);
    // Do your stuff.
    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames));
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