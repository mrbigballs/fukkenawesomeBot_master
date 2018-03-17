"use strict";
exports.__esModule = true;
var tmi = require("tmi.js");
var fs = require('fs');
var expressApp = require('express')();
var express = require('express');
var _a = require('electron'), ipcRenderer = _a.ipcRenderer, remote = _a.remote;
var YeelightSearch = require('yeelight-wifi');
var credentials_1 = require("./credentials");
var chatformatter_1 = require("./chatformatter");
var settingsmodule_1 = require("./settingsmodule");
var credentials = new credentials_1.Credentials();
var chatMessageFormatter = new chatformatter_1.ChatMessageFormatter();
var settingsmodule = new settingsmodule_1.SettingsModule();
var mainChatMessageWindow = document.getElementById('chatWindow');
document.getElementById("settingsGetOAuthkeyButton").addEventListener("click", function (e) { return credentials.getOAuthkey(); });
var autoconnect = true;
var deleteMessages = true;
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
    channels: ["#fukkenawesome"]
};
var client = new tmi.client(options);
// Connect the client to the server..
if (autoconnect) {
    console.log('connect');
    client.connect();
}
client.on("connected", function (address, port) {
    ipcRenderer.send('botConnected', 'connected yeah');
});
//on chat message do
client.on("chat", function (channel, userstate, message, self) {
    // Don't listen to my own messages..
    //if (self) return;
    console.log(message);
    console.log(settingsmodule.settings);
    // Do your stuff.
    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames));
    chatMessageFormatter.scrollChat();
    simpleCommand(message);
});
client.on("timeout", function (channel, username, reason, duration) {
    console.log(username + ' timeouted for ' + duration + ' because: ' + reason);
    if (deleteMessages) {
    }
});
function sendMessage(message) {
    client.say(options.channels, message);
}
function simpleCommand(message) {
    console.log('lampen?? ' + list.length);
    if (message == '!lassblinkenbaby') {
        list[0].startColorFlow(5, 0, '1000, 2, 2700, 100, 500, 1, 255, 10, 500, 2, 5000, 1');
    }
    if (message == '!stahp') {
        list[0].stopColorFlow();
    }
    if (message == '!toggle') {
        list[0].toggle();
    }
}
document.getElementById('chatMessageInput').onkeypress = function (e) {
    if (e.keyCode == 13) {
        console.log('sdgsdfg');
        var text = document.getElementById('chatMessageInput').value;
        if (text != '') {
            console.log(text);
            client.say(options.channels[0], text);
            document.getElementById('chatMessageInput').value = '';
        }
    }
};
var yeelightSearch = new YeelightSearch();
var list = [];
yeelightSearch.on('found', function (lightBulb) {
    console.log(lightBulb.getValues(""));
    list.push(lightBulb);
    /*
  lightBulb.toggle()
    .then(() => {
      console.log(lightBulb.get_prop + ' toggled');
    })
    .catch((err: Error) => {
      console.log(`received some error: ${err}`);
    });
    //lass es blinken baby ;)
    */
});
//list[0].startColorFlow(50, 0, '1000, 2, 2700, 100, 500, 1, 255, 10, 500, 2, 5000, 1');
//# sourceMappingURL=awesomebot.js.map