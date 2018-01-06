"use strict";
exports.__esModule = true;
var tmi = require("tmi.js");
var credentials_1 = require("./credentials");
var chatformatter_1 = require("./chatformatter");
var settingsmodule_1 = require("./settingsmodule");
var credentials = new credentials_1.Credentials();
var chatMessageFormatter = new chatformatter_1.ChatMessageFormatter();
var settingsmodule = new settingsmodule_1.SettingsModule();
var mainChatMessageWindow = document.getElementById('chatWindow');
var autoconnect = true;
var deleteMessages = true;
settingsmodule.loadSettings();
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
var client = new tmi.client(options);
// Connect the client to the server..
if (autoconnect) {
    console.log('connect');
    client.connect();
}
//on chat message do
client.on("chat", function (channel, userstate, message, self) {
    // Don't listen to my own messages..
    //if (self) return;
    console.log(message);
    console.log(settingsmodule.settings);
    // Do your stuff.
    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames));
    chatMessageFormatter.scrollChat();
});
client.on("timeout", function (channel, username, reason, duration) {
    console.log(username + ' timeouted for ' + duration + ' because: ' + reason);
    if (deleteMessages) {
    }
});
function sendMessage(message) {
    client.say(options.channels, message);
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
//# sourceMappingURL=awesomebot.js.map