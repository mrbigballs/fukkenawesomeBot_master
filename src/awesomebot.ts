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
import { Raffle } from './raffle';


const store = new StoreLocal().getLocalStore();


const credentials = new Credentials();
const chatMessageFormatter = new ChatMessageFormatter();
const settingsmodule = new SettingsModule();
const wikipedia = new Wikipedia();
const twitchapi = new TwitchAPI();
const win = remote.getCurrentWindow();
let raffle: Raffle;


let mainChatMessageWindow = document.getElementById('chatWindow');

document.getElementById("settingsGetOAuthkeyButton").addEventListener ("click", (e:Event) => credentials.getOAuthkeyFor('streamer'));
document.getElementById("settingsGetOAuthkeyButtonBot").addEventListener ("click", (e:Event) => credentials.getOAuthkeyFor('bot'));
document.getElementById("settingsSaveAccountDataConnect").addEventListener ("click", (e:Event) => reconnectTmi());

var autoconnect: boolean =  true;
var deleteMessages: boolean = true;
var currentGame: string = '';
let game_info: any;
let channel_info: any;
let stream_info: any;
let searchedGames: any;
let min: string;
let sec: string;

let intervalRequests: NodeJS.Timer[] = [];
let raffleInterval: any;

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
            channel_info = JSON.parse(store.get('channel_info'));
            console.log("channel bades loadded");
            clearInterval(challeBadgesloaded);
            twitchapi.getChannelBadges(settingsmodule.settings.streamerOAuthkey);
            setStreamingTitleUI(channel_info.title);
            getGameInfo();
            initIntervals();
            }
        }catch(e){return;}
     }, 300);

    try{
        client = new tmi.client(options);
        client.connect();

        client.on("connected", function (address: string, port: number) {
            ipcRenderer.send('botConnected', 'connected yeah');
            raffle = new Raffle(store, client);
            
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
                    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames, 'chat-normal'));
                    chatMessageFormatter.scrollChat();
                    simpleCommand(message);
                    if(raffle.raffle_active){
                        if(message.toLocaleLowerCase() == raffle.keyword.toLocaleLowerCase()){
                            updateRaffleList(raffle.addParticipant(userstate));
                        }
                    }
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

function initIntervals(){
    // update channel_info
    var channelInfoInterval = setInterval(function() {
        try{
            const updateChannelPromise = twitchapi.callTwitchApiFetch(settingsmodule.settings.streamerOAuthkey, 'search/channels?query=' + settingsmodule.settings.channel);
            updateChannelPromise.then(response => {
                return response.json();
              }).then(channels => {
                 // var jgame = JSON.parse(games);
                console.log(channels.data[0]);
                channel_info = channels.data[0];
                //console.log(games.data[0].name);
                store.set('channel_info', JSON.stringify(channel_info));
               
                setStreamingTitleUI(channel_info.title);
                getGameInfo();
                console.log("channel_info_updated");
              });  
        }catch(e){return;}
     }, 60000);

     intervalRequests.push(channelInfoInterval);

     var streamInfoInterval = setInterval(function() {
        try{
            const updateChannelPromise = twitchapi.callTwitchApiFetch(settingsmodule.settings.streamerOAuthkey, 'streams?user_id=' + channel_info.id);
            updateChannelPromise.then(response => {
                return response.json();
              }).then(streams => {
                 // var jgame = JSON.parse(games);
                 if(typeof streams.data[0] != 'undefined'){
                    console.log(streams);
                    stream_info = streams.data[0];
                    //console.log(games.data[0].name);
                    store.set('stream_info', JSON.stringify(stream_info));
                   console.log(new Date(stream_info.started_at))
                   updateLiveUI();
                    //setStreamingTitleUI(channel_info.title);
                    //getGameInfo();
                    console.log("cstream_info_updated");
                 }else{
                    store.set('stream_info', '');
                    stream_info = null;
                    jQuery('.stream-info').removeClass('online');
                    //jQuery('.stream-info').addClass('offline');
                 }
               
              });  
        }catch(e){//stream offline
            
        }
     }, 60000);

     intervalRequests.push(streamInfoInterval);
}

function clearAllIntervals(){
    for(var i = 0; intervalRequests.length > i; i++){
        clearInterval( intervalRequests[i]);
    }
}

function updateLiveUI(){
    jQuery('.stream-info').addClass('online');
    document.getElementById("stream-time").innerHTML = timeDiffCalc(new Date(stream_info.started_at), new Date());
    document.getElementById("viewer-count-update").innerHTML = stream_info.viewer_count;
}

function timeDiffCalc(dateFuture: any, dateNow: any) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;
    console.log('calculated days', days);

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    console.log('calculated hours', hours);

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    console.log('minutes', minutes);

    let difference = '';
    if (days > 0) {
      difference += (days === 1) ? `${days}:` : `${days}:`;
    }

    difference += (hours < 10 && days > 0 ) ? `0${hours}:` : `${hours}:`;

    difference += (minutes < 10 ) ? `0${minutes}` : `${minutes}`; 

    return difference;
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

function getGameInfo(){
    let gameId =  JSON.parse(store.get('channel_info')).game_id;
    if(store.get('channel_info')  != "undefined" ){
        twitchapi.callTwtichApi(settingsmodule.settings.streamerOAuthkey, 'games?id=' + gameId, 'game_info');
        var gameInfoSet = setInterval(function() {
        try{
            if (typeof store.get('game_info') != "undefined") {
                console.log("game_info_set");
                clearInterval(gameInfoSet);
                game_info = JSON.parse(store.get('game_info'));
                (<HTMLInputElement>document.getElementById("mediamanager-game-title")).value = game_info.name;
                changeBoxArt(game_info.box_art_url);
            }
        }catch(e){return;}
     }, 300);
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

/*
*Chat settings menu Eventlistenr for chat whisper checkbox
*
*/
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

/*
*Chat settings menu Eventlistenr for zebra chat checkbox
*
*/
(<HTMLInputElement>document.getElementById("chat-set-check-zebra")).addEventListener( 'change', function() {
    if(this.checked) {
        store.set('chat_settings_zebra_chat', 'true');
        jQuery('.chat').addClass('zebra');
       
    } else {
        store.set('chat_settings_zebra_chat', 'false');
        jQuery('.chat').removeClass('zebra');
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

    //chat settings whisper checkbox
    if(store.get('chat_settings_show_whisper') != 'undefined'){
        if(store.get('chat_settings_show_whisper') == 'true'){
            console.log('indeed its true');
            (<HTMLInputElement>document.getElementById("chat-set-check-whisper")).checked = true;
        }else{
            (<HTMLInputElement>document.getElementById("chat-set-check-whisper")).checked = false;
        }
    }else{//initialize value
        store.set('chat_settings_show_whisper', 'false');
        (<HTMLInputElement>document.getElementById("chat-set-check-whisper")).checked = false;
    }

    //chat settings zebra checkbox
    if(store.get('chat_settings_zebra_chat') != 'undefined'){
        if(store.get('chat_settings_zebra_chat') == 'true'){
            console.log('indeed its true');
            (<HTMLInputElement>document.getElementById("chat-set-check-zebra")).checked = true;
            jQuery('.chat').addClass('zebra');
        }else{
            (<HTMLInputElement>document.getElementById("chat-set-check-zebra")).checked = false;
        }
    }else{//initialize value
        store.set('chat_settings_zebra_chat', 'false');
        (<HTMLInputElement>document.getElementById("chat-set-check-zebra")).checked = false;
    }

    var highlightKeywordsAsString = settingsmodule.settings.chatHighlightNames.toString();
    console.log('keswords: ' + highlightKeywordsAsString);
    (<HTMLInputElement>document.getElementById("chat-set-highlight-textarea")).value = highlightKeywordsAsString; 
    //chat-set-highlight-textarea
}

function changeBoxArt(url: string){
    let img_correct_dimensions = url.replace('{height}', '100').replace('{width}', '77');
    //console.log('imgurl___ ' +img_correct_dimensions);
    document.getElementById("box_art").setAttribute('src', img_correct_dimensions );
}

function setStreamingTitleUI(title: string){
    (<HTMLInputElement>document.getElementById("mediamanager-stream-title")).value = title; 
}

jQuery('#chatSettingsModal').on('hidden.bs.modal', function () {
    
    let kewywords = (<HTMLInputElement>document.getElementById("chat-set-highlight-textarea")).value.replace(/ /g,'');
    var highlightKeywordsAsString = settingsmodule.settings.chatHighlightNames.toString();
    if(kewywords != highlightKeywordsAsString){
        let keyList = kewywords.split(",");
        settingsmodule.settings.chatHighlightNames = keyList;
        settingsmodule.saveSettings();
    }
});

//stream title & game update
(<HTMLInputElement>document.getElementById("mediamanager-game-title")).addEventListener('input', function(e){
    let suggestions: string[] = [];
    if((<HTMLInputElement>e.target).value.length > 4) {
        console.log('yallah');
        const searchgamespromise = twitchapi.callTwitchApiFetch(  settingsmodule.settings.streamerOAuthkey, 'search/categories?query=' + (<HTMLInputElement>e.target).value);
        searchgamespromise.then(response => {
            return response.json();
          }).then(games => {
             // var jgame = JSON.parse(games);
            console.log(games);
            searchedGames = games;
            //console.log(games.data[0].name);
            for(var i = 0; games.data.length > i; i++){
                //console.log(games.data[i]);
                suggestions.push(games.data[i].name);
            }
            console.log('suggestionslength ' + suggestions.length);
            jQuery( "#mediamanager-game-title" ).autocomplete({
                source: suggestions,
                "position": { my: "left bottom", at: "left top"}
              });
          });
    }
});

//update stream & title button
document.getElementById("stream-update-button-button").addEventListener('click', function(e){
    document.getElementById("update-title-icon").setAttribute('class', 'fa fa-refresh fa-spin fa-lg');
    let game_title = (<HTMLInputElement>document.getElementById("mediamanager-game-title")).value;
    let stream_title = (<HTMLInputElement>document.getElementById("mediamanager-stream-title")).value;
    let game_id: string = '';
    for(var i = 0; searchedGames.data.length > i; i++){
        //console.log(games.data[i]);
        if(searchedGames.data[i].name == game_title){
            game_id = searchedGames.data[i].id;
            break;
        }
    }
    console.log(game_title + ' id: '+ game_id + ' - ' + stream_title + ' - ' + channel_info.id);
    //twitchapi.updateChannelDataHelix(settingsmodule.settings.streamerOAuthkey, channel_info.id, game_id, stream_title, channel_info.broadcaster_language);
    const updateGameAndTitlePromise = twitchapi.updateChannelData(settingsmodule.settings.streamerOAuthkey, channel_info.id, game_title, stream_title);
    //const updateGameAndTitlePromise = twitchapi.updateChannelDataHelix(settingsmodule.settings.streamerOAuthkey, channel_info.id.trim(), game_id, stream_title, channel_info.broadcaster_language);
    updateGameAndTitlePromise.then(response => {
        if(response.ok){
            document.getElementById("update-title-icon").setAttribute('class', 'fa fa-refresh fa-lg');
        }
    });
    
});
//list[0].startColorFlow(50, 0, '1000, 2, 2700, 100, 500, 1, 255, 10, 500, 2, 5000, 1');

//RAFFLE UI

document.getElementById("raffle-set-button").addEventListener('click', function(e){
    raffle.setKeyword((<HTMLInputElement>document.getElementById("raffle-keyword-input")).value);
    document.getElementById("raffle-lock-icon").setAttribute('class', 'fa fa-lock fa-lg');
    document.getElementById("raffle-set-button").setAttribute('class', 'btn btn-outline-secondary glow');
    jQuery('#raffle-set-button').prop('disabled', true);
    jQuery('#raffle-clear-button').prop('disabled', false);
    jQuery('#raffle-keyword-input').addClass('locked');
    jQuery('#raffle-keyword-input').prop('disabled', true);
    jQuery('#raffle-subonly-checkbox').prop('disabled', true);
    jQuery('#raffle-autoroll-button').prop('disabled', true);
    jQuery('#raffle-roll-button').prop('disabled', false);
    raffle.raffle_active = true;

});

document.getElementById("raffle-autoroll-button").addEventListener('click', function(e){
    raffle.setKeyword((<HTMLInputElement>document.getElementById("raffle-keyword-input")).value);
    document.getElementById("raffle-auto-icon").setAttribute('class', 'fa fa-refresh fa-spin fa-lg');
    document.getElementById("raffle-autoroll-button").setAttribute('class', 'btn btn-outline-secondary glow');

    //manual roll button
    jQuery('#raffle-set-button').prop('disabled', true);
    jQuery('#raffle-keyword-input').addClass('locked');
    jQuery('#raffle-keyword-input').prop('disabled', true);
    jQuery('#raffle-subonly-checkbox').prop('disabled', true);
    jQuery('#raffle-roll-button').prop('disabled', true);
    jQuery('#raffle-clear-button').prop('disabled', false);
    raffle.raffle_active = true;

    min = document.getElementById("raffle-count-min").innerHTML;
    var set_min = min == '' ? 0 : parseInt(min);
    sec = document.getElementById("raffle-count-sec").innerHTML;
    var set_sec = sec == '' ? 0 : parseInt(sec);

    var min_in_milli = set_min*60000;
    var sec_in_milli = set_sec*1000;
    var combined = min_in_milli + sec_in_milli
    //set timer in raffle class
    raffle.timer = combined;
    //raffle.startTimedRaffle();
    var countDownDate = new Date(new Date().getTime() + combined).getTime();

    raffleInterval = setInterval(function(){
        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        
       
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        //document.getElementById("demo").innerHTML = days + "d " + hours + "h "
        //+ minutes + "m " + seconds + "s ";

        if(minutes <= 0){
            document.getElementById("raffle-count-min").innerHTML = '00';
        }else{
            document.getElementById("raffle-count-min").innerHTML = minutes < 10 ? '0' + minutes : '' + minutes;
        }
        if(seconds <= 0){
            document.getElementById("raffle-count-sec").innerHTML = '00';
        }else{
            document.getElementById("raffle-count-sec").innerHTML = seconds < 10 ? '0' + seconds : '' + seconds;
        }

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(raffleInterval);
            raffle.raffle_active = false;
            raffle.drawWinner();
            document.getElementById("raffle-part-list-ul").innerHTML = '';
            document.getElementById("raffle-lock-icon").setAttribute('class', 'fa fa-unlock fa-lg');
            document.getElementById("raffle-set-button").setAttribute('class', 'btn btn-outline-secondary');

            document.getElementById("raffle-auto-icon").setAttribute('class', 'fa fa-refresh fa-lg');
            document.getElementById("raffle-autoroll-button").setAttribute('class', 'btn btn-outline-secondary');

            jQuery('#raffle-set-button').prop('disabled', false);
            jQuery('#raffle-clear-button').prop('disabled', true);
            jQuery('#raffle-keyword-input').removeClass('locked');
            jQuery('#raffle-keyword-input').prop('disabled', false);
            jQuery('#raffle-subonly-checkbox').prop('disabled', false);
            jQuery('#raffle-autoroll-button').prop('disabled', false);
            jQuery('#raffle-roll-button').prop('disabled', true);
            raffle.clearparticipants();
            document.getElementById("raffle-count-min").innerHTML = min;
            document.getElementById("raffle-count-sec").innerHTML = sec;
        }

    }, 500);

});



document.getElementById("raffle-clear-button").addEventListener('click', function(e){
    raffle.raffle_active = false;
    document.getElementById("raffle-part-list-ul").innerHTML = '';
    document.getElementById("raffle-lock-icon").setAttribute('class', 'fa fa-unlock fa-lg');
    document.getElementById("raffle-set-button").setAttribute('class', 'btn btn-outline-secondary');

    document.getElementById("raffle-auto-icon").setAttribute('class', 'fa fa-refresh fa-lg');
    document.getElementById("raffle-autoroll-button").setAttribute('class', 'btn btn-outline-secondary');

    jQuery('#raffle-set-button').prop('disabled', false);
    jQuery('#raffle-clear-button').prop('disabled', true);
    jQuery('#raffle-keyword-input').removeClass('locked');
    jQuery('#raffle-keyword-input').prop('disabled', false);
    jQuery('#raffle-subonly-checkbox').prop('disabled', false);
    jQuery('#raffle-autoroll-button').prop('disabled', false);
    jQuery('#raffle-roll-button').prop('disabled', true);
    raffle.clearparticipants();
    if(document.getElementById("raffle-count-min").innerHTML == '00' && document.getElementById("raffle-count-sec").innerHTML == '00'){
        document.getElementById("raffle-count-min").innerHTML = min;
        document.getElementById("raffle-count-sec").innerHTML = sec;
    }
    

    jQuery('#winner-user-thumbnail').attr("src", "");
    jQuery('.rwinner-name').html('');
    jQuery('#winner-envelope').css('visibility', 'hidden');

    try{
        clearInterval(raffleInterval);
        //raffle.stopTimedRaffle();
    }catch(e){}
});

//sub only checkbox
(<HTMLInputElement>document.getElementById("raffle-subonly-checkbox")).addEventListener( 'change', function() {
    if(this.checked) {
        raffle.subscriberOnly = true;
        jQuery('#raffe-subluck-slider').prop('disabled', true);
        jQuery('#sub-luck-muliplayer-dispaly').css('visibility', 'hidden');

    }else{
        raffle.subscriberOnly = false;
        jQuery('#raffe-subluck-slider').prop('disabled', false);
        jQuery('#sub-luck-muliplayer-dispaly').css('visibility', 'visible');
    }
});


//slider

jQuery("#raffe-subluck-slider").on('change',function(){
    var test = (<HTMLInputElement>document.getElementById("raffe-subluck-slider")).value;
    console.log('slider' + test + ' ' +test);
    var test = (<HTMLInputElement>document.getElementById("raffe-subluck-slider")).value;
    document.getElementById("sub-luck-muliplayer-dispaly").innerHTML = 'x' + test;
    raffle.subscriberLuck = parseInt(test);
});

document.getElementById("raffle-roll-button").addEventListener('click', function(e){
    raffle.raffle_active = false;
    let winner = raffle.drawWinner();
    if(typeof winner != 'undefined'){
        try{
            const getUserInfo = twitchapi.callTwitchApiFetch(settingsmodule.settings.streamerOAuthkey, 'users?id=' + winner['user-id']);
            getUserInfo.then(response => {
                return response.json();
              }).then(user => {
                 // var jgame = JSON.parse(games);
                console.log(user.data[0]);
                
                jQuery('#winner-user-thumbnail').attr("src", user.data[0].profile_image_url);
                jQuery('.rwinner-name').html(winner['display-name']);
                jQuery('#winner-envelope').css('visibility', 'visible');
               
              });  
        }catch(e){return;}
    }
    
});

// prevent entering more then 2 digits in timers
jQuery('.rminutes').on('keydown', function(e){
    var regex = /[0-9]|\./;
    //console.log(checkNumeric(e));
    if(!regex.test(String.fromCharCode(e.keyCode)) && e.keyCode != 8 && e.keyCode != 37 && e.keyCode != 39){
        e.preventDefault();
    };
     if(jQuery('.rminutes').html().length >= 2){
        var regex = /[0-9]|\./;
         if(e.keyCode != 8 && e.keyCode != 37 && e.keyCode != 39){
            e.preventDefault();
            
         }else{
            
         }
     }
});

jQuery('.rseconds').on('keydown', function(e){
    var regex = /[0-9]|\./;
    //console.log(checkNumeric(e));
    if(!regex.test(String.fromCharCode(e.keyCode)) && e.keyCode != 8 && e.keyCode != 37 && e.keyCode != 39){
        e.preventDefault();
    };
     if(jQuery('.rminutes').html().length >= 2){
        var regex = /[0-9]|\./;
         if(e.keyCode != 8 && e.keyCode != 37 && e.keyCode != 39){
            e.preventDefault();
            
         }else{
            
         }
     }
});

function updateRaffleList(userstate: any){
    if(typeof userstate != 'undefined'){
        let list_elem = document.createElement('li');
        let displayname_span = document.createElement('span');
        let user_type_icon_span = document.createElement('span');
        if(userstate['subscriber']){
            user_type_icon_span.setAttribute('class', 'fa fa-usd fa-fw');
        }else{
            user_type_icon_span.setAttribute('class', 'fa fa-user-o fa-fw');
        }
        displayname_span.innerHTML = userstate['display-name'];
    
        list_elem.appendChild(user_type_icon_span);
        list_elem.appendChild(displayname_span);
        document.getElementById("raffle-part-list-ul").appendChild(list_elem);
    } 
}