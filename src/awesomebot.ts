const tmi = require("tmi.js");
const fs = require('fs');
const expressApp = require('express')();
var express = require('express');

var {ipcRenderer, remote, } = require('electron');


const YeelightSearch = require('yeelight-wifi');

import { Credentials } from "./credentials";
import { ChatMessageFormatter } from "./chatformatter";
import { Settings } from './settings';
import { SettingsModule } from './settingsmodule';
import { Wikipedia } from './wikipedia';
import { TwitchAPI } from './twitch_api';
import { StoreLocal } from './storelocal';

const store = new StoreLocal().getLocalStore();


const credentials = new Credentials();
const chatMessageFormatter = new ChatMessageFormatter();
const settingsmodule = new SettingsModule();
const wikipedia = new Wikipedia();
const twitchapi = new TwitchAPI();
const win = remote.getCurrentWindow();

let mainChatMessageWindow = document.getElementById('chatWindow');

document.getElementById("settingsGetOAuthkeyButton").addEventListener ("click", (e:Event) => credentials.getOAuthkeyFor('streamer'));
document.getElementById("settingsGetOAuthkeyButtonBot").addEventListener ("click", (e:Event) => credentials.getOAuthkeyFor('bot'));
document.getElementById("settingsSaveAccountDataConnect").addEventListener ("click", (e:Event) => reconnectTmi());

var autoconnect: boolean =  true;
var deleteMessages: boolean = true;

settingsmodule.loadSettings();

var server = require('http').createServer(expressApp);
var io = require('socket.io')(server);

//twitchapi.getStreamsInfo('lunalya');

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
    /*channels: ["#fukkenawesome"]
    channels: ["#kyri_valkyrie"]*/
    channels: ["#fukkenawesome"]
};

var client: any;

// Connect the client to the server..
if(autoconnect){
    
//if(settingsmodule.settings.customBotName === 'undefined'){console.log('YEAS');}
/*
    if(settingsmodule.settings.customBotName === null && settingsmodule.settings.streamerUserName != null){
        var options = {
            options: {
                debug: true
            },
            connection: {
                reconnect: true
            },
            identity: {
                username: settingsmodule.settings.streamerUserName,
                password: settingsmodule.settings.streamerOAuthkey
            },
            channels: ["#fukkenawesome"]
        };
    }*/
    console.log('connect');
    //client.connect();
}


function sendMessage(message: string){
    client.say(options.channels, message);
}

function simpleCommand(message: string){
    //console.log('lampen?? ' + list.length);
    /*
    if(message == '!lassblinkenbaby'){
        list[0].startColorFlow(5, 0, '1000, 2, 2700, 100, 500, 1, 255, 10, 500, 2, 5000, 1');
    }
    if(message == '!stahp'){
        list[0].stopColorFlow();
    }
    if(message == '!toggle'){
        list[0].toggle();
    }
    */
    if(message.startsWith("!wiki")){
        wikipedia.serachWiki(message.replace("!wiki", "").trim());
    }
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
 /*
const yeelightSearch = new YeelightSearch();
let list: Array<any> = [];
yeelightSearch.on('found', (lightBulb: any) => {
    console.log(lightBulb.getValues(""));
    
    list.push(lightBulb);
   
  lightBulb.toggle()
    .then(() => {
      console.log(lightBulb.get_prop + ' toggled');
    })
    .catch((err: Error) => {
      console.log(`received some error: ${err}`);
    });
    //lass es blinken baby ;)
    
});
*/

var settingsloaded = setInterval(function() {
    try{
        if (typeof settingsmodule.settings.streamerUserName != "undefined") {
        console.log("Settings loadded");
        
        clearInterval(settingsloaded);
        initApplication();
        }
    }catch(e){return;}
 }, 100);

function initApplication(){
    //clear session staorage for username colors in chat
    //store.clear();
    console.log('oookey');
    if(store.has('channel_info')){
        store.delete('channel_info');
        console.log('has key');
    }
    //store.del('channel_info');
    twitchapi.getGlobalBadges();
    twitchapi.getChannelInfo(settingsmodule.settings.channel, settingsmodule.settings.streamerOAuthkey);

    //ini ui comps
    initChatSettingsUIComponents();

    initTmi();
   
    
    
}

function initTmi(){
    if(client != null){
        client.disconnect();
        //client.setValue(null);
        client = null;
    }
    var chan = '#' + settingsmodule.settings.channel;
    console.log(chan);
    var usr = (settingsmodule.settings.customBotName === '') ? settingsmodule.settings.streamerUserName : settingsmodule.settings.customBotName;
    var oauth = 'oauth:' + ((settingsmodule.settings.customBotOAuthkey === '') ? settingsmodule.settings.streamerOAuthkey : settingsmodule.settings.customBotOAuthkey);
    console.log(chan + ' ' + usr + ' ' + oauth);
    options = {
        options: {
            debug: true
        },
        connection: {
            reconnect: true
        },
        identity: {
            username: usr,
            password: oauth
        },
        channels: [chan]
    };

   

    var challeBadgesloaded = setInterval(function() {
        try{
            if (typeof store.get('channel_info') != "undefined") {
            console.log("channel bades loadded");
            clearInterval(challeBadgesloaded);
            twitchapi.getChannelBadges(settingsmodule.settings.streamerOAuthkey);
            }
        }catch(e){return;}
     }, 300);

    try{
        client = new tmi.client(options);
        client.connect();

        client.on("connected", function (address: string, port: number) {
            ipcRenderer.send('botConnected', 'connected yeah');
        });
        
        //on chat message do
        /*
        client.on("chat", function (channel: string, userstate: any, message: string, self: any) {
            // Don't listen to my own messages..
            //if (self) return;
            console.log(message);
            //console.log(settingsmodule.settings);
            // Do your stuff.
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames));
            chatMessageFormatter.scrollChat();
            simpleCommand(message);
        
        });
        */
        client.on("message", (channel: string, userstate: any, message: string, self: any) => {
            // Don't listen to my own messages..
            //if (self) return;
        
            // Handle different message types..
            switch(userstate["message-type"]) {
                case "action":
                    console.log(message);
                    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames, 'action'));
                    chatMessageFormatter.scrollChat();
                    break;
                case "chat":
                    console.log(message);
                    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames, 'chat'));
                    chatMessageFormatter.scrollChat();
                    simpleCommand(message);

                    break;
                case "whisper":
                    console.log(message);
                    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames, 'whisper'));
                    chatMessageFormatter.scrollChat();
                    break;
                default:
                    // Something else ?
                    break;
            }
        });
        
        var doNotSpamJoined = false;

        client.on("timeout", function (channel: string, username: string, reason: string, duration: number) {
            console.log(username + ' timeouted for ' + duration  + ' because: ' + reason);
            if(deleteMessages){
        
            }
        });

        client.on("connecting", (address: string, port: number) => {
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage('Connected to: ' + address + ':' + port, 'info', null, null));
        });

        client.on("disconnected", (reason: string) => {
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage('Disconnted: ' + reason, 'serve', null, null));
            doNotSpamJoined = false;
        });

        
        client.on("join", (channel: string, username: string, self: any) => {
            //on self joining room inform
            if (username == settingsmodule.settings.streamerUserName || username == settingsmodule.settings.customBotName ) {
                doNotSpamJoined = true;
                mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage('Joined: ' + channel, 'info', null, null));
            }
        });

        client.on("raided", (channel: string, username: string, viewers: string) => {
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage('RAIDED by : ' + username + ' with: ' + viewers + ' viewers', 'important', null, null));
        });

        client.on("subscription", (channel: string, username: string, method: any, message: string, userstate: any) => {
            var optionalmessage = message != null ? ' - ' + message : '';
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' subscribed!', 'sub-chat-info', userstate, message));
        });

        client.on("resub", (channel: string, username: string, months: number, message: string, userstate: any, methods: any) => {
            var optionalmessage = message != null ? ' - ' + message : '';
            let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' resubbed for ' + cumulativeMonths + ' in a row!', 'sub-chat-info', userstate, message));
        });

        client.on("giftpaidupgrade", (channel: string, username: string, sender: string, userstate: any) => {
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' extends the gifsub from ' + sender, 'sub-chat-info', userstate, null));
        });

        client.on("anongiftpaidupgrade", (channel: string, username: string, userstate: any) => {
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' extends the gifsub from someone', 'sub-chat-info', userstate, null));
        });

        client.on("subgift", (channel: string, username: string, streakMonths: number, recipient: string, methods: any, userstate: any) => {
            // Do your stuff.
            let senderCount = ~~userstate["msg-param-sender-count"];
            if(senderCount > 1){
                mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' gifts ' + senderCount + ' subscriptions!', 'sub-chat-info', userstate, null));
            }else{
                mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' gifts ' + recipient + ' a subscription!', 'sub-chat-info', userstate, null));
            }
            
        });

        client.on("submysterygift", (channel: string, username: string, numbOfSubs: number, methods: any, userstate: any) => {
            // Do your stuff.
            let senderCount = ~~userstate["msg-param-sender-count"];
            if(senderCount > 1){
                mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' gifts ' + senderCount + ' subscriptions!', 'sub-chat-info', userstate, null));
            }else{
                mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' gifts a subscription!', 'sub-chat-info', userstate, null));
            }
        });

        client.on("cheer", (channel: string, userstate: any, message: string) => {
            mainChatMessageWindow.appendChild(chatMessageFormatter.generateInfoMessage(' cheered with ' + userstate.bits, 'cheer-chat-info', userstate, null));
        });

    }catch(e){
        console.log(e.message);
    }
}

function reconnectTmi(){
    let channel_tmp = (<HTMLInputElement>document.getElementById('settingsChannelName')).value;
    let saved_channel = settingsmodule.settings.channel;
    if(channel_tmp != saved_channel){
        settingsmodule.settings.setChannel(channel_tmp);
        settingsmodule.saveSettings();
    }
    twitchapi.getChannelInfo(channel_tmp.toLocaleLowerCase(), settingsmodule.settings.streamerOAuthkey);
    initTmi();
    
}


ipcRenderer.on('save-token', function(event, data) {
    // this function never gets called
    console.log('save-token ' + data.user_token + ' ' + data.user_type);
    if(data.user_type == 'streamer'){
       let username = (<HTMLInputElement>document.getElementById('settingsStreamerName')).value;
       console.log(username);
       settingsmodule.settings.setUserNameStreamer(username);
       settingsmodule.settings.setStreamerToken(data.user_token);
    }else{
        let username = (<HTMLInputElement>document.getElementById('settingsBotName')).value;
        console.log(username);
        settingsmodule.settings.setUserNameBot(username);
        settingsmodule.settings.setBotToken(data.user_token);
    }
    
    settingsmodule.saveSettings();
    reconnectTmi();
});

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

window.onbeforeunload = (event: any) => {
    /* If window is reloaded, remove win event listeners
    (DOM element listeners get auto garbage collected but not
    Electron win listeners as the win is not dereferenced unless closed) */
    win.removeAllListeners();
}

function handleWindowControls() {
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    document.getElementById('max-button').addEventListener("click", event => {
        win.maximize();
    });

    document.getElementById('restore-button').addEventListener("click", event => {
        win.unmaximize();
    });

    document.getElementById('close-button').addEventListener("click", event => {
        win.close();
    });

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}

//Chat settings
document.getElementById("chat-set-radio-none").addEventListener ("click", (e:Event) => {
    store.set('chat_settings_outlines', 'none');
});

document.getElementById("chat-set-radio-white").addEventListener ("click", (e:Event) => {
    store.set('chat_settings_outlines', 'white');
});

document.getElementById("chat-set-radio-dynamic").addEventListener ("click", (e:Event) => {
    store.set('chat_settings_outlines', 'dynamic');
});

(<HTMLInputElement>document.getElementById("chat-set-check-whisper")).addEventListener( 'change', function() {
    if(this.checked) {
        store.set('chat_settings_show_whisper', 'true');
        let whispers = document.getElementsByClassName("whisper");
          for(var i = 0; i < whispers.length; i++) {
            var classes = (<HTMLElement>whispers[i]).getAttribute('class').replace('none-show','');
            (<HTMLElement>whispers[i]).setAttribute('class', classes);
          }
       
    } else {
        store.set('chat_settings_show_whisper', 'false');
        let whispers = document.getElementsByClassName("whisper");
        for(var i = 0; i < whispers.length; i++) {
            var classes = (<HTMLElement>whispers[i]).getAttribute('class');
            (<HTMLElement>whispers[i]).setAttribute('class', classes + ' none-show');
          }
    }
});

function initChatSettingsUIComponents(){
    if(store.get('chat_settings_outlines') != 'undefined'){
        if(store.get('chat_settings_outlines') == 'white'){
            (<HTMLInputElement>document.getElementById("chat-set-radio-white")).checked = true;
        }else if(store.get('chat_settings_outlines') == 'dynamic'){
            (<HTMLInputElement>document.getElementById("chat-set-radio-dynamic")).checked = true;
        }else{
            (<HTMLInputElement>document.getElementById("chat-set-radio-none")).checked = true;
        }
    }

    if(store.get('chat_settings_show_whisper') != 'undefined'){
        if(store.get('chat_settings_show_whisper') == 'true'){
            console.log('indeed its true');
            (<HTMLInputElement>document.getElementById("chat-set-check-whisper")).checked = true;
        }else{
            (<HTMLInputElement>document.getElementById("chat-set-check-whisper")).checked = false;
        }
    }

    var highlightKeywordsAsString = settingsmodule.settings.chatHighlightNames.toString();
    console.log('keswords: ' + highlightKeywordsAsString);
    (<HTMLInputElement>document.getElementById("chat-set-highlight-textarea")).value = highlightKeywordsAsString; 
    //chat-set-highlight-textarea
}

function closedSettingsTest(){
    console.log('Call test');
}

jQuery('#chatSettingsModal').on('hidden.bs.modal', function () {
    closedSettingsTest();
    let kewywords = (<HTMLInputElement>document.getElementById("chat-set-highlight-textarea")).value.replace(/ /g,'');
    var highlightKeywordsAsString = settingsmodule.settings.chatHighlightNames.toString();
    if(kewywords != highlightKeywordsAsString){
        let keyList = kewywords.split(",");
        settingsmodule.settings.chatHighlightNames = keyList;
        settingsmodule.saveSettings();
    }
});

//list[0].startColorFlow(50, 0, '1000, 2, 2700, 100, 500, 1, 255, 10, 500, 2, 5000, 1');

