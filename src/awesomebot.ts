const tmi = require("tmi.js");
const fs = require('fs');
const expressApp = require('express')();
var express = require('express');

var {ipcRenderer, remote, } = require('electron');

const { PubSubClient } = require('twitch-pubsub-client');
const YeelightSearch = require('yeelight-wifi');

import { Credentials } from "./credentials";
import { ChatMessageFormatter } from "./chatformatter";
import { Settings } from './settings';
import { SettingsModule } from './settingsmodule';
import { QuotesModule } from './quotesmodule';
import { Wikipedia } from './wikipedia';
import { TwitchAPI } from './twitch_api';
import { StoreLocal } from './storelocal';
import { Raffle } from './raffle';
import { RipCounter } from './ripcounter';
import { MainNavigation } from './ui/navigation';



const store = new StoreLocal().getLocalStore();


const credentials = new Credentials();
const chatMessageFormatter = new ChatMessageFormatter();
const settingsmodule = new SettingsModule();
const qutotesmodule = new QuotesModule();
const wikipedia = new Wikipedia();
const twitchapi = new TwitchAPI();
const mainNavigation = new MainNavigation();
const win = remote.getCurrentWindow();
let raffle: Raffle;
let ripcounter: RipCounter;


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

let bits_topic: string = '';
let channel_points_topic: string = '';

let followersSet: Set<number> = new Set();

settingsmodule.loadSettings();




var server = require('http').createServer(expressApp);
var io = require('socket.io')(server);

let pub_ws = new WebSocket('wss://pubsub-edge.twitch.tv');

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
    updateRafflePrizeListUI();
    //initTMi
    initTmi();
    //Ripcounter
    ripcounter = new RipCounter(store);
    initRipcounterSettingsUIComponents();
    updateRipcounterTable();
    
    //qutotesmodule.checkIfDBisEmpty();
    //qutotesmodule.addQuoteToDB('"balsldaksdk"', 'other', 'Chicken Police');
    //qutotesmodule.printTable();
    qutotesmodule.getQuoteById(2);
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

             //init PubSub
            //pubsubfunctions(settingsmodule.settings.streamerOAuthkey, channel_info.id);
            initPubSubConnection(settingsmodule.settings.streamerOAuthkey, channel_info.id);

            }
        }catch(e){return;}
     }, 300);

    try{
        client = new tmi.client(options);
        client.connect();

        client.on("connected", function (address: string, port: number) {
            ipcRenderer.send('botConnected', 'connected yeah');
            raffle = new Raffle(store, client);
            initRaffleNotificationSettingsUIComponents();

            //add channel to bot title
            $('#bot-title-channel-connected').text('[' + options.channels[0] + ']');
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
                    //ripcounter
                    if (!self){
                        ripcounterCheckRips(message, userstate, false);
                        //commands
                        simpleCommand(message);
                        //raffle
                        if(raffle.raffle_active){
                            if(message.toLocaleLowerCase() == raffle.keyword.toLocaleLowerCase()){
                                updateRaffleList(raffle.addParticipant(userstate));
                            }
                        }
                    }
                    
                    break;
                case "whisper":
                    console.log(message);
                    mainChatMessageWindow.appendChild(chatMessageFormatter.generateChatMessageElement(userstate, message, settingsmodule.settings.chatHighlightNames, 'whisper'));
                    chatMessageFormatter.scrollChat();

                    if (!self){
                        ripcounterCheckRips(message, userstate, true);
                        //commands
                        simpleCommand(message);
                        
                    }
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
                //only update mediamanager title & game when not currently in focus
                if(!jQuery("#mediamanager-game-title").is(":focus") && !jQuery("#mediamanager-stream-title").is(":focus")){
                    setStreamingTitleUI(channel_info.title);
                    getGameInfo();
                }
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

     var followerInfoInterval = setInterval(function() {
        try{
            const updateChannelPromise = twitchapi.callTwitchApiFetch(settingsmodule.settings.streamerOAuthkey, 'users/follows?to_id=' + channel_info.id);
            updateChannelPromise.then(response => {
                return response.json();
              }).then(followers => {
                 // var jgame = JSON.parse(games);
                console.log(followers.data);
                checkForNewFollowers(followers.data);
                
                console.log("followers updated");
              });  
        }catch(e){return;}
     }, 60000);

     intervalRequests.push(followerInfoInterval);
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

function checkForNewFollowers(followersJson: any){
    //initilazation of followers
    if(followersSet.size == 0){
        for(var i = 0; i < followersJson.length; i++){
            followersSet.add(followersJson.from_id);
        }
    }else{//already initialized now checking for new followers
        for(var i = 0; i < followersJson.length; i++){
            if(followersSet.add(followersJson.from_id)){
                console.log('new follower: ' +followersJson.from_name);
            }
        }
    }
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
                //setcurrent game
                currentGame = game_info.name;
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
            //set current game
            currentGame = game_title;
        }
    });
    
});
//list[0].startColorFlow(50, 0, '1000, 2, 2700, 100, 500, 1, 255, 10, 500, 2, 5000, 1');

//RAFFLE UI

document.getElementById("raffle-set-button").addEventListener('click', function(e){
    let current_keyword = generateRaffleKeyWord(null);
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
    raffleNotifyChat(false, null, null, current_keyword);
});

function generateRaffleKeyWord(currentPrize: any){
    if(currentPrize != null){
        if( currentPrize.raffle_keyword != ''){
            console.log('HERER');
            raffle.setKeyword(currentPrize.raffle_keyword);
            (<HTMLInputElement>document.getElementById("raffle-keyword-input")).value = currentPrize.raffle_keyword;
            return currentPrize.raffle_keyword;
        }else{//no keyword set in prize item
            console.log('Over there');
            var ranKey = raffle.getRandomKeyword();
            raffle.setKeyword(ranKey);
            (<HTMLInputElement>document.getElementById("raffle-keyword-input")).value = ranKey;
            return ranKey;
        }
    }else{
        if((<HTMLInputElement>document.getElementById("raffle-keyword-input")).value != ''){//keyword from keyword input
            raffle.setKeyword((<HTMLInputElement>document.getElementById("raffle-keyword-input")).value);
            return (<HTMLInputElement>document.getElementById("raffle-keyword-input")).value;
        }else{//no keyword in keyword input get random from list
            console.log('error??');
            var ranKey = raffle.getRandomKeyword();
            raffle.setKeyword(ranKey);
            (<HTMLInputElement>document.getElementById("raffle-keyword-input")).value = ranKey;
            return ranKey;
        }
    }
}

function raffleDrawWinner(winner: any){
    raffleNotifyChatWinner(winner);
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
}

function sendKeyToWinner(winner: any, currentPrize: any){

    if(raffle.raffleSettings.automaticWhisperWinner){
        let chat_message = "";
        let raffle_info_map: Map<string, string> = new Map();
        raffle_info_map.set('prize', currentPrize.raffle_item);
        raffle_info_map.set('prize_platform', currentPrize.store_type);
        raffle_info_map.set('prize_key', currentPrize.game_key);
        raffle_info_map.set('winner',  winner['display-name']);
        chat_message = raffle.generateMessage(raffle.raffleSettings.raffle_notification_whisper, raffle_info_map);

        if(client != 'undefined'){
            client.say(options.channels[0], '/w ' + winner['display-name'] + ' ' +  chat_message);
        }

    }
}

function raffleNotifyChat(autoraffle: boolean, currentPrize: any, time: string, current_keyword: string){

    if(raffle.raffleSettings.chatNotificationStart){
        let chat_message = "";
        let raffle_info_map: Map<string, string> = new Map();
        
        raffle_info_map.set('prize', currentPrize != null ? currentPrize.raffle_item : '¯\\_(ツ)_/¯');
        raffle_info_map.set('prize_platform', currentPrize != null ? currentPrize.store_type : "");
        raffle_info_map.set('keyword', current_keyword);
        raffle_info_map.set('time', time != null ? time : "");
        chat_message = raffle.generateMessage(raffle.raffleSettings.raffle_notification_chat_start, raffle_info_map);
        if(autoraffle){
            chat_message += ' ' + raffle.generateMessage(raffle.raffleSettings.raffle_notification_chat_start_timed, raffle_info_map);
        }

        if(client != 'undefined'){
            client.say(options.channels[0], chat_message);
        }
    }
    
}

function raffleNotifyChatReminder(currentPrize: any, time: string, current_keyword: string){

    if(raffle.raffleSettings.chatNotificationStart){
        let chat_message = "";
        let raffle_info_map: Map<string, string> = new Map();
        
        raffle_info_map.set('prize', currentPrize != null ? currentPrize.raffle_item : '¯\\_(ツ)_/¯');
        raffle_info_map.set('prize_platform', currentPrize != null ? currentPrize.store_type : "");
        raffle_info_map.set('keyword', current_keyword);
        raffle_info_map.set('time', time != null ? time : "");
        chat_message = raffle.generateMessage(raffle.raffleSettings.raffle_notification_chat_reminder, raffle_info_map);
       
        if(client != 'undefined'){
            client.say(options.channels[0], chat_message);
        }
    }
}

function raffleNotifyChatWinner(winner: any){

    if(raffle.raffleSettings.announceWinnerInChat){
        let chat_message = "";
        let raffle_info_map: Map<string, string> = new Map();
        
        raffle_info_map.set('winner',  winner['display-name']);
        chat_message = raffle.generateMessage(raffle.raffleSettings.raffle_notification_chat_winner, raffle_info_map);

        if(client != 'undefined'){
            client.say(options.channels[0], chat_message);
        }
    }
}

document.getElementById("raffle-autoroll-button").addEventListener('click', function(e){
    let currentPrize: any = null;
    var index = 0;
    if(store.has('raffle_items')){
        let prizes = JSON.parse(store.get('raffle_items'));
        console.log(JSON.stringify(prizes));
        //von hinten aufbauen
        index = 0;
        for(var i = prizes.length - 1 ; i >= 0; i--){
            console.log('rpizes_ : ' + JSON.stringify(prizes[i]));
            if(prizes[i].item_active){
                currentPrize = prizes[i];
                index = i;
                break;
            }
        }
    }

    let current_keyword = generateRaffleKeyWord(currentPrize);
    
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
    var combined = min_in_milli + sec_in_milli;
    //set timer in raffle class
    raffle.timer = combined;
    //raffle.startTimedRaffle();
    var countDownDate = new Date(new Date().getTime() + combined).getTime();
    var reminderTimes = combined / 3;

    //notify chat
    raffleNotifyChat(true, currentPrize, '' + min + ':' + sec + '', current_keyword);

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

        //check for reminder time / 3
        if(raffle.raffleSettings.chatNotificationReminder){
            let reminder_dis = (combined - reminderTimes*2);
            let reminder_min1 =  Math.floor((reminder_dis % (1000 * 60 * 60)) / (1000 * 60));
            let reminder_sec1 =  Math.floor((reminder_dis % (1000 * 60)) / 1000);
            if(minutes == reminder_min1 && seconds == reminder_sec1){
                raffleNotifyChatReminder(currentPrize, '' + minutes + ':' + seconds + '', current_keyword);
            }
            let reminder_dis2 = (combined - reminderTimes);
            let reminder_min2 =  Math.floor((reminder_dis2 % (1000 * 60 * 60)) / (1000 * 60));
            let reminder_sec2 =  Math.floor((reminder_dis2 % (1000 * 60)) / 1000);
            if(minutes == reminder_min2 && seconds == reminder_sec2){
                raffleNotifyChatReminder(currentPrize, '' + minutes + ':' + seconds + '', current_keyword);
            }
        }



        // If the count down is finished, write some text
        if (distance < 0) {
            
            clearInterval(raffleInterval);
            raffle.raffle_active = false;
            //draw winner
            let winner = raffle.drawWinner();
            raffleDrawWinner(winner);
            //send key to winner
            sendKeyToWinner(winner, currentPrize);
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
            //set prize inactive and update list
            raffle.updateActiveStateByRaffleItem(currentPrize, false);
            raffle.updateWinnerByCurrentRaffleItem(currentPrize, winner['display-name']);
            updateRafflePrizeListUI();
        }

    }, 1000);

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
    
    if(typeof min != 'undefined'){
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
    raffleDrawWinner(winner);
    
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

//raffle prize on change
jQuery('.store-type').on('change', function(e){
    //console.log('store tyyyepe ' +jQuery("input[name='store-platform']:checked").val());
    if( jQuery("input[name='store-platform']:checked").val() == 'other'){
        jQuery('#radio-other-input').prop('disabled', false);
    }else{
        jQuery('#radio-other-input').prop('disabled', true);
    }
});

//save raffle prize
document.getElementById("raffle-prize-save-button").addEventListener('click', function(e){
    let raffle_prize_id =  jQuery("#raffle-prize-id-from-list").text();
    if(raffle_prize_id != ''){//edit mode
        let prize_game_name = (<HTMLInputElement>document.getElementById("raffle-prize-game-name")).value;
        let prize_keyword = (<HTMLInputElement>document.getElementById("raffle-prize-keyword")).value;
        let prize_active = false;
        if((<HTMLInputElement>document.getElementById("raffle-prize-active-checkbox")).checked){
            prize_active = true;
        }

        let prize_platform =  $("input[name='store-platform']:checked").val();
        prize_platform = prize_platform == 'other' ? (<HTMLInputElement>document.getElementById("radio-other-input")).value : prize_platform;

        let prize_key =  (<HTMLInputElement>document.getElementById("raffle-prize-key-area")).value;

        raffle.updateRaffleItem(parseInt(raffle_prize_id), prize_game_name, prize_keyword, prize_key, prize_active, ''+prize_platform);
        updateRafflePrizeListUI();
        (<any>$('#rafflePrizeModal')).modal('hide');
    }
    if(jQuery("#raffle-prize-adding-title").is(":visible")){
        saveNewRafflePrize();
    }else{

    }
});

function saveNewRafflePrize(){
    let prize_game_name = (<HTMLInputElement>document.getElementById("raffle-prize-game-name")).value;
    let prize_keyword = (<HTMLInputElement>document.getElementById("raffle-prize-keyword")).value;
    let prize_active = false;
    if((<HTMLInputElement>document.getElementById("raffle-prize-active-checkbox")).checked){
        prize_active = true;
    }

    let prize_platform =  $("input[name='store-platform']:checked").val();
    prize_platform = prize_platform == 'other' ? (<HTMLInputElement>document.getElementById("radio-other-input")).value : prize_platform;

    let prize_keys =  (<HTMLInputElement>document.getElementById("raffle-prize-key-area")).value.trim().split(/\s|,|;/g);

    console.log(prize_game_name + prize_keyword + prize_active + prize_platform + prize_keys);

    if(prize_game_name != ''){
        let uniqueKeys = [];
        const uniqueset = new Set(prize_keys);
        uniqueKeys = Array.from(uniqueset);
        console.log(uniqueKeys);
        for(var i = 0; i < uniqueKeys.length; i++){
            raffle.addRaffleItem(prize_game_name, prize_keyword,uniqueKeys[i], '', prize_active, '' + prize_platform);
            
        }
        updateRafflePrizeListUI();
        (<any>$('#rafflePrizeModal')).modal('hide');
    }
}

function updateRafflePrizeListUI(){
    
    if(store.has('raffle_items')){
        document.getElementById('raffle-prize-list-ul').innerHTML = '';
        let prizes = JSON.parse(store.get('raffle_items'));
        console.log(JSON.stringify(prizes));
        //von hinten aufbauen
        for(var i = prizes.length - 1 ; i >= 0; i--){
            let prizeli = document.createElement('li');
            //prizeli.setAttribute('draggable', 'true');
            prizeli.setAttribute('value', '' + i);
            let wrapper_div = document.createElement('div');
            //prizeli.setAttribute('value', i);
            let active_chekbox = document.createElement('input');
            active_chekbox.setAttribute('type', 'checkbox');
            active_chekbox.setAttribute('value', '' + i);
            active_chekbox.setAttribute('id', 'active-prize');
            active_chekbox.setAttribute('class', 'prize-list-checkbox');
            active_chekbox.addEventListener ('click', function (eve) {
                // Der Index i kann hier nicht benutzt werden
                console.log ("this " +  this);
                console.log ("event " +  eve);
                setPrizeActiveInactive (this);
            });
            let active_label = document.createElement('label');
            if(prizes[i].item_active){
                active_chekbox.checked = true;
            }else{
                active_chekbox.checked = false;
            }
            active_label.setAttribute('class', 'prize-list-check-label');
            active_label.appendChild(active_chekbox);
            let checkbox_span = document.createElement('span');
            checkbox_span.setAttribute('class', 'checkmark');
            active_label.appendChild(checkbox_span);
            let game_name_span = document.createElement('span');
           
            game_name_span.innerHTML = prizes[i].raffle_item;
            let keyword_name_span = document.createElement('span');
            keyword_name_span.innerHTML = prizes[i].raffle_keyword;
            let store_span = document.createElement('span');
            store_span.innerHTML = prizes[i].store_type;
            let key_span = document.createElement('span');
            let obscured_key = prizes[i].game_key;
            let tempkey = prizes[i].game_key.substring(prizes[i].game_key.length - 3, 3);
            obscured_key = prizes[i].game_key.replace(tempkey, 'XXXXXXXX')
            key_span.innerHTML = obscured_key;
            let winner_span = document.createElement('span');
            winner_span.innerHTML = prizes[i].raffle_winner;
            let trash_can_span = document.createElement('span');
            trash_can_span.setAttribute('class', 'fa fa-trash prizelist-icon');
            trash_can_span.setAttribute('value', '' + i);
            trash_can_span.addEventListener ('click', function (eve) {
                // Der Index i kann hier nicht benutzt werden
                console.log ("this " +  this);
                console.log ("event " +  eve);
                deletePrizeFromList (this);
            });
            let edit_span = document.createElement('span');
            edit_span.setAttribute('class', 'fa fa-pencil prizelist-icon');
            edit_span.setAttribute('value', '' + i);
            edit_span.addEventListener ('click', function (eve) {
                // Der Index i kann hier nicht benutzt werden
                console.log ("this " +  this);
                console.log ("event " +  eve);
                editPrizeItem (this);
            });
            //wrapper_div.appendChild(active_chekbox);
            wrapper_div.appendChild( active_label);
            wrapper_div.appendChild(edit_span);
            wrapper_div.appendChild(trash_can_span);
            wrapper_div.appendChild(game_name_span);
            wrapper_div.appendChild(keyword_name_span);
            wrapper_div.appendChild(store_span);
            wrapper_div.appendChild(key_span);
            wrapper_div.appendChild(winner_span);
            prizeli.appendChild(wrapper_div);
            document.getElementById('raffle-prize-list-ul').appendChild(prizeli);
        }
    }
    
}

//delete or reset content from prize add tab on closing

jQuery('#rafflePrizeModal').on('hidden.bs.modal', function () {

    (<HTMLInputElement>document.getElementById("raffle-prize-game-name")).value = '';
    (<HTMLInputElement>document.getElementById("raffle-prize-keyword")).value = '';
    
    (<HTMLInputElement>document.getElementById("raffle-prize-active-checkbox")).checked = false;
    
    (<HTMLInputElement>document.getElementById("radio-steam")).checked = true;

    (<HTMLInputElement>document.getElementById("radio-other-input")).value = '';
    (<HTMLInputElement>document.getElementById("radio-other-input")).disabled = true;

    (<HTMLInputElement>document.getElementById("raffle-prize-key-area")).value = '';

});

$('#raffle-add-price').on('click', function (e) {
    //title
    jQuery("#raffle-prize-edit-title").hide();
    jQuery("#raffle-prize-adding-title").show();
  });



function deletePrizeFromList(elem: HTMLSpanElement){
    console.log('delete ' + elem.getAttribute('value'));
    let id = parseInt(elem.getAttribute('value'));
    console.log('id ' + id);
    raffle.deleteRaffleItemByIndex(id);
    updateRafflePrizeListUI();
}

function editPrizeItem(elem: HTMLSpanElement){
    let id = parseInt(elem.getAttribute('value'));
    console.log('id ' + id);

    let prizes = JSON.parse(store.get('raffle_items'));
    //console.log(JSON.stringify(prizes));

    //title
    jQuery("#raffle-prize-edit-title").show();
    jQuery("#raffle-prize-adding-title").hide();
    //add id to modal
    jQuery("#raffle-prize-id-from-list").text(''+id);

    if(prizes[id].raffle_winner != ''){
        jQuery("#raffle-prize-winner-display").show();
        jQuery("#raffle-prize-winner-display-name").text(prizes[id].raffle_winner);
    }else{
        jQuery("#raffle-prize-winner-display").hide();
    }
    

    (<HTMLInputElement>document.getElementById("raffle-prize-game-name")).value = prizes[id].raffle_item;
    (<HTMLInputElement>document.getElementById("raffle-prize-keyword")).value = prizes[id].raffle_keyword;
    
    (<HTMLInputElement>document.getElementById("raffle-prize-active-checkbox")).checked = prizes[id].item_active;
    let platform = prizes[id].store_type;
    if(platform == 'Steam'){
        (<HTMLInputElement>document.getElementById("radio-steam")).checked = true;
    }else if(platform == 'Battle.net'){
        (<HTMLInputElement>document.getElementById("radio-battlenet")).checked = true;
    }else if(platform == 'Epic Games'){
        (<HTMLInputElement>document.getElementById("radio-epic")).checked = true;
    }else if(platform == 'GoG Galaxy'){
        (<HTMLInputElement>document.getElementById("radio-gog")).checked = true;
    }else if(platform == 'Origin'){
        (<HTMLInputElement>document.getElementById("radio-origin")).checked = true;
    }else if(platform == 'uPlay'){
        (<HTMLInputElement>document.getElementById("radio-uplay")).checked = true;
    }else{
        (<HTMLInputElement>document.getElementById("radio-other")).checked = true;
        (<HTMLInputElement>document.getElementById("radio-other-input")).value = platform;
        (<HTMLInputElement>document.getElementById("radio-other-input")).disabled = false;
    }
    
    (<HTMLInputElement>document.getElementById("raffle-prize-key-area")).value = prizes[id].game_key;

    (<any>$('#rafflePrizeModal')).modal();
}

function setPrizeActiveInactive(elem: HTMLInputElement){
    console.log('delete ' + elem.checked);
    let active = elem.checked;
    let id = parseInt(elem.getAttribute('value'));

    raffle.updateActiveStateByIndex(id, active);
    updateRafflePrizeListUI();
}

//send message to winner
document.getElementById("winner-envelope").addEventListener('click', function(e){
    var winnerName = jQuery(".rwinner-name").html();
    if(winnerName != ''){
        (<HTMLInputElement>document.getElementById("chatMessageInput")).value = '/w ' + winnerName + ' ';
        mainNavigation.navigationSelectWindow('navChat');
    }
});

//save & load raffle notification settings

function initRaffleNotificationSettingsUIComponents(){

    if(raffle.raffleSettings.chatNotificationStart){
        (<HTMLInputElement>document.getElementById("raffle-notification-start-active")).checked = true;
    }else{
        (<HTMLInputElement>document.getElementById("raffle-notification-start-active")).checked = false;
    }

    if(raffle.raffleSettings.chatNotificationReminder){
        (<HTMLInputElement>document.getElementById("raffle-notification-reminder-active")).checked = true;
    }else{
        (<HTMLInputElement>document.getElementById("raffle-notification-reminder-active")).checked = false;
    }

    if(raffle.raffleSettings.announceWinnerInChat){
        (<HTMLInputElement>document.getElementById("raffle-notification-winner-active")).checked = true;
    }else{
        (<HTMLInputElement>document.getElementById("raffle-notification-winner-active")).checked = false;
    }

    if(raffle.raffleSettings.automaticWhisperWinner){
        (<HTMLInputElement>document.getElementById("raffle-whisper-winner-active")).checked = true;
    }else{
        (<HTMLInputElement>document.getElementById("raffle-whisper-winner-active")).checked = false;
    }
      
    (<HTMLInputElement>document.getElementById("raff-notification-start-textarea")).value = raffle.raffleSettings.raffle_notification_chat_start;
    (<HTMLInputElement>document.getElementById("raff-notification-start-timed-textarea")).value = raffle.raffleSettings.raffle_notification_chat_start_timed;
    (<HTMLInputElement>document.getElementById("raff-notification-reminder-textarea")).value = raffle.raffleSettings.raffle_notification_chat_reminder;
    (<HTMLInputElement>document.getElementById("raff-notification-winner-textarea")).value = raffle.raffleSettings.raffle_notification_chat_winner;
    (<HTMLInputElement>document.getElementById("raff-whisper-winner-textarea")).value = raffle.raffleSettings.raffle_notification_whisper;
    


}

jQuery('#raffleNotificationsModal').on('hidden.bs.modal', function () {
    
    raffle.raffleSettings.chatNotificationStart = (<HTMLInputElement>document.getElementById("raffle-notification-start-active")).checked;
    raffle.raffleSettings.chatNotificationReminder = (<HTMLInputElement>document.getElementById("raffle-notification-reminder-active")).checked;
    raffle.raffleSettings.announceWinnerInChat =  (<HTMLInputElement>document.getElementById("raffle-notification-winner-active")).checked;
    raffle.raffleSettings.automaticWhisperWinner =  (<HTMLInputElement>document.getElementById("raffle-whisper-winner-active")).checked;

    raffle.raffleSettings.raffle_notification_chat_start = (<HTMLInputElement>document.getElementById("raff-notification-start-textarea")).value;
    raffle.raffleSettings.raffle_notification_chat_start_timed =  (<HTMLInputElement>document.getElementById("raff-notification-start-timed-textarea")).value;
    raffle.raffleSettings.raffle_notification_chat_reminder = (<HTMLInputElement>document.getElementById("raff-notification-reminder-textarea")).value;
    raffle.raffleSettings.raffle_notification_chat_winner = (<HTMLInputElement>document.getElementById("raff-notification-winner-textarea")).value;
    raffle.raffleSettings.raffle_notification_whisper =  (<HTMLInputElement>document.getElementById("raff-whisper-winner-textarea")).value;

    raffle.updateRaffleSettingsSimple();
    
});

//Sort prizelist items

jQuery('#raffle-prize-list-ul').sortable({
    update: function( ) {
        console.log('dropped something: ' + this);
    },
    stop: function(event, ui) {
        console.log("New position: " + ui.item.index());
        updatePrizePositionInList(ui.item, ui.item.index());
    },
    placeholder: "drag-drop-ui-state-highlight-placeholder",
    opacity: 0.7
});

jQuery( '#raffle-prize-list-ul' ).disableSelection();

function updatePrizePositionInList(elem: JQuery<HTMLElement>, moveToIndex: number){
    console.dir(elem);
    let id = parseInt(elem.attr('value'));
    //console.log(elem.find());
    console.log('id ' + id);
    raffle.updateRaffleItemPositionByIndex(id, moveToIndex);
    updateRafflePrizeListUI();
}

//Ripcounter functions

function ripcounterCheckRips(message: string, userstate: any, isWhisper: boolean){
    if(ripcounter.ripcounterSettings.active){
        let rip_reply = ripcounter.checkRipCommand(message, userstate, currentGame == '' ? 'Chicken Police' : currentGame, isWhisper);
        
        if(typeof rip_reply !== 'undefined'){
            if(rip_reply.updateui){
                updateRipCounterUITable();
            }
            
            if(rip_reply.message != '' && rip_reply.message != 'Error'){
                if(client != 'undefined'){
                    if(!isWhisper){
                        client.say(options.channels[0], rip_reply.message);
                    }else{
                        client.say(options.channels[0], '/w ' + userstate['display-name'] + ' ' + rip_reply.message);
                    }
                    
                }
            }
        }
        
        
    }
}

function initRipcounterSettingsUIComponents(){

    //Active Check
    (<HTMLInputElement>document.getElementById("ripcounter-active")).checked = ripcounter.ripcounterSettings.active;
    //cooldown
    (<HTMLInputElement>document.getElementById("ripcounter-rip-cooldown")).value = ripcounter.ripcounterSettings.rip_cooldown.toString();
    //Roles
    (<HTMLInputElement>document.getElementById("rip-modonly-check")).checked = ripcounter.ripcounterSettings.rip_role_mod;
    (<HTMLInputElement>document.getElementById("rip-subonly-check")).checked = ripcounter.ripcounterSettings.rip_role_sub;
    (<HTMLInputElement>document.getElementById("addrip-modonly-check")).checked = ripcounter.ripcounterSettings.addrip_role_mod;
    (<HTMLInputElement>document.getElementById("addrip-subonly-check")).checked = ripcounter.ripcounterSettings.addrip_role_sub;
    (<HTMLInputElement>document.getElementById("addgrip-modonly-check")).checked = ripcounter.ripcounterSettings.addgrip_role_mod;
    (<HTMLInputElement>document.getElementById("addgrip-subonly-check")).checked = ripcounter.ripcounterSettings.addgrip_role_sub;
    (<HTMLInputElement>document.getElementById("setrip-modonly-check")).checked = ripcounter.ripcounterSettings.setrip_role_mod;
    (<HTMLInputElement>document.getElementById("setrip-subonly-check")).checked = ripcounter.ripcounterSettings.setrip_role_sub;
    (<HTMLInputElement>document.getElementById("setgrip-modonly-check")).checked = ripcounter.ripcounterSettings.setgrip_role_mod;
    (<HTMLInputElement>document.getElementById("setgrip-subonly-check")).checked = ripcounter.ripcounterSettings.setgrip_role_sub;
    //Aliases
    (<HTMLInputElement>document.getElementById("ripcounter-rip-aliases-textarea")).value = ripcounter.ripcounterSettings.rip_command_alias.toString();;
    (<HTMLInputElement>document.getElementById("ripcounter-addrip-aliases-textarea")).value = ripcounter.ripcounterSettings.addrip_command_alias.toString();
    (<HTMLInputElement>document.getElementById("ripcounter-addgrip-aliases-textarea")).value = ripcounter.ripcounterSettings.addgrip_command_alias.toString();
    (<HTMLInputElement>document.getElementById("ripcounter-setrip-aliases-textarea")).value = ripcounter.ripcounterSettings.setrip_command_alias.toString();
    (<HTMLInputElement>document.getElementById("ripcounter-setgrip-aliases-textarea")).value = ripcounter.ripcounterSettings.setgrip_command_alias.toString();
    //Command Messages
    (<HTMLInputElement>document.getElementById("ripcounter-rip-message-textarea")).value = ripcounter.ripcounterSettings.rip_message;
    (<HTMLInputElement>document.getElementById("ripcounter-addrip-message-textarea")).value = ripcounter.ripcounterSettings.addrip_message;
    (<HTMLInputElement>document.getElementById("ripcounter-addgrip-message-textarea")).value = ripcounter.ripcounterSettings.addgrip_message;
    (<HTMLInputElement>document.getElementById("ripcounter-setrip-message-textarea")).value = ripcounter.ripcounterSettings.setrip_message;
    (<HTMLInputElement>document.getElementById("ripcounter-setgrip-message-textarea")).value = ripcounter.ripcounterSettings.setgrip_message;
    
}

jQuery('#ripcounterSettNotiModal').on('hidden.bs.modal', function () {
    //active
    ripcounter.ripcounterSettings.active = (<HTMLInputElement>document.getElementById("ripcounter-active")).checked;
    //cooldown
    let cooldowntime = (isNaN(parseInt((<HTMLInputElement>document.getElementById("ripcounter-rip-cooldown")).value)) ? 0 : parseInt((<HTMLInputElement>document.getElementById("ripcounter-rip-cooldown")).value));
    ripcounter.ripcounterSettings.rip_cooldown = cooldowntime;
    //roles
    ripcounter.ripcounterSettings.rip_role_mod = (<HTMLInputElement>document.getElementById("rip-modonly-check")).checked;
    ripcounter.ripcounterSettings.rip_role_sub = (<HTMLInputElement>document.getElementById("rip-subonly-check")).checked;
    ripcounter.ripcounterSettings.addrip_role_mod = (<HTMLInputElement>document.getElementById("addrip-modonly-check")).checked;
    ripcounter.ripcounterSettings.addrip_role_sub = (<HTMLInputElement>document.getElementById("addrip-subonly-check")).checked;
    ripcounter.ripcounterSettings.addgrip_role_mod = (<HTMLInputElement>document.getElementById("addgrip-modonly-check")).checked;
    ripcounter.ripcounterSettings.addgrip_role_sub = (<HTMLInputElement>document.getElementById("addgrip-subonly-check")).checked;
    ripcounter.ripcounterSettings.setrip_role_mod = (<HTMLInputElement>document.getElementById("setrip-modonly-check")).checked;
    ripcounter.ripcounterSettings.setrip_role_sub = (<HTMLInputElement>document.getElementById("setrip-subonly-check")).checked;
    ripcounter.ripcounterSettings.setgrip_role_mod = (<HTMLInputElement>document.getElementById("setgrip-modonly-check")).checked;
    ripcounter.ripcounterSettings.setgrip_role_sub = (<HTMLInputElement>document.getElementById("setgrip-subonly-check")).checked;
    //Aliases
    ripcounter.ripcounterSettings.rip_command_alias = (<HTMLInputElement>document.getElementById("ripcounter-rip-aliases-textarea")).value.split(',');
    ripcounter.ripcounterSettings.addrip_command_alias = (<HTMLInputElement>document.getElementById("ripcounter-addrip-aliases-textarea")).value.split(',');
    ripcounter.ripcounterSettings.addgrip_command_alias = (<HTMLInputElement>document.getElementById("ripcounter-addgrip-aliases-textarea")).value.split(',');
    ripcounter.ripcounterSettings.setrip_command_alias = (<HTMLInputElement>document.getElementById("ripcounter-setrip-aliases-textarea")).value.split(',');
    ripcounter.ripcounterSettings.setgrip_command_alias = (<HTMLInputElement>document.getElementById("ripcounter-setgrip-aliases-textarea")).value.split(',');
    //Messages
    ripcounter.ripcounterSettings.rip_message = (<HTMLInputElement>document.getElementById("ripcounter-rip-message-textarea")).value;
    ripcounter.ripcounterSettings.addrip_message = (<HTMLInputElement>document.getElementById("ripcounter-addrip-message-textarea")).value;
    ripcounter.ripcounterSettings.addgrip_message = (<HTMLInputElement>document.getElementById("ripcounter-addgrip-message-textarea")).value;
    ripcounter.ripcounterSettings.setrip_message = (<HTMLInputElement>document.getElementById("ripcounter-setrip-message-textarea")).value;
    ripcounter.ripcounterSettings.setgrip_message = (<HTMLInputElement>document.getElementById("ripcounter-setgrip-message-textarea")).value;

    ripcounter.updateRipcounterSettingsSimple();

});

function updateRipcounterTable(){
    let ripcounterMap = ripcounter.RipCounterMap;
    let table_body = (<HTMLTableElement>document.getElementById("ripcounter-table-tbody"));
    ripcounterMap.forEach((value: any, key: any) => {
        console.log('key: ' + key + ' value: ' + value.toString());
        let tr = document.createElement('tr');
        let td_game = document.createElement('th');
        td_game.setAttribute('class', 'ripcounter-head-game');
        td_game.innerHTML = key;
        let td_rip = document.createElement('td');
        td_rip.setAttribute("contenteditable", "true");
        td_rip.setAttribute('class', 'ripcounter-table-rips');
        td_rip.innerHTML = value[0];
        let td_grip = document.createElement('td');
        td_grip.setAttribute("contenteditable", "true");
        td_grip.setAttribute('class', 'ripcounter-table-grips');
        td_grip.innerHTML = value[1];
        let td_buttons = document.createElement('td');

        let edit_button = document.createElement('button');
        edit_button.setAttribute('class', 'btn btn-outline-secondary btn-sm riprow-edit');
        edit_button.setAttribute('type', 'button');
        let span_edit_icon = document.createElement('span');
        span_edit_icon.setAttribute('class', 'fa fa-pencil');
        span_edit_icon.setAttribute('aria-hidden', 'true');

        let del_button = document.createElement('button');
        del_button.setAttribute('class', 'btn btn-outline-secondary btn-sm riprow-del');
        del_button.setAttribute('type', 'button');
        let span_trash_icon = document.createElement('span');
        span_trash_icon.setAttribute('class', 'fa fa-trash-o');
        span_trash_icon.setAttribute('aria-hidden', 'true');

        let save_button = document.createElement('button');
        save_button.setAttribute('class', 'btn btn-outline-secondary btn-sm riprow-save');
        save_button.setAttribute('type', 'button');
        save_button.style.display = "none";
        let span_save_icon = document.createElement('span');
        span_save_icon.setAttribute('class', 'fa fa-floppy-o');
        span_save_icon.setAttribute('aria-hidden', 'true');

        let cancel_button = document.createElement('button');
        cancel_button.setAttribute('class', 'btn btn-outline-secondary btn-sm riprow-cancel');
        cancel_button.setAttribute('type', 'button');
        cancel_button.style.display = "none";
        let span_cancel_icon = document.createElement('span');
        span_cancel_icon.setAttribute('class', 'fa fa-times');
        span_cancel_icon.setAttribute('aria-hidden', 'true');
        
        del_button.appendChild(span_trash_icon);
        edit_button.appendChild(span_edit_icon);
        save_button.appendChild(span_save_icon);
        cancel_button.appendChild(span_cancel_icon);

        tr.appendChild(td_game);
        tr.appendChild(td_rip);
        tr.appendChild(td_grip);
        td_buttons.appendChild(edit_button);
        td_buttons.appendChild(del_button);
        td_buttons.appendChild(save_button);
        td_buttons.appendChild(cancel_button);
        tr.appendChild(td_buttons);
        table_body.appendChild(tr);

        //eventlisteners
        edit_button.addEventListener ('click', function (event) {
            editRipCounterRow(tr);
        });

        save_button.addEventListener ('click', function (event) {
            saveRipCounterRow(tr);
        });

        cancel_button.addEventListener ('click', function (event){
            cancelEditRipCounterRow(tr);
        });

        del_button.addEventListener ('click', function (event){
            deleteRipCounterRow(tr);
        });
    });

    //update global counter
    updateGlobalRipCounter();
}

jQuery('.ripcounter-table-rips').on("DOMSubtreeModified",function(event) {
    console.log('focus out for: ' + event.target);
});

function editRipCounterRow(elem: HTMLTableRowElement){
    //rip cell
    var rip = elem.cells[1].innerText;
    let rip_input = document.createElement('input');
    //rip_input.setAttribute('maxlength', '10');
    //rip_input.setAttribute('size', '10');
    rip_input.setAttribute('type', 'number');
    rip_input.setAttribute('class', 'form-control rip-table-input');
    rip_input.value = rip;
    elem.cells[1].innerHTML = "";
    elem.cells[1].appendChild(rip_input);
    //grip cell
    var grip = elem.cells[2].innerText;
    let grip_input = document.createElement('input');
    //grip_input.setAttribute('maxlength', '10');
    //grip_input.setAttribute('size', '10');
    grip_input.setAttribute('type', 'number');
    grip_input.setAttribute('class', 'form-control rip-table-input');
    grip_input.value = grip;
    elem.cells[2].innerHTML = "";
    elem.cells[2].appendChild(grip_input);

    //buttons
    var buttons = elem.cells[3].getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        if(buttons[i].classList.contains('riprow-edit')){
            buttons[i].style.display = 'none';
        }
        
        if(buttons[i].classList.contains('riprow-del')) {
            buttons[i].style.display = 'none';
        }

        if(buttons[i].classList.contains('riprow-save')) {
            buttons[i].style.display = '';
        }

        if(buttons[i].classList.contains('riprow-cancel')) {
            buttons[i].style.display = '';
        }
    }
}

function cancelEditRipCounterRow(elem: HTMLTableRowElement){
    let rips = ripcounter.RipCounterMap.get(elem.cells[0].innerText);

    elem.cells[1].innerHTML = '';
    elem.cells[1].innerHTML = '' + rips[0];

    elem.cells[2].innerHTML = '';
    elem.cells[2].innerHTML = '' + rips[1];

     //buttons
     var buttons = elem.cells[3].getElementsByTagName("button");
     for (var i = 0; i < buttons.length; i++) {
         if(buttons[i].classList.contains('riprow-edit')){
             buttons[i].style.display = '';
         }
         
         if(buttons[i].classList.contains('riprow-del')) {
             buttons[i].style.display = '';
         }
 
         if(buttons[i].classList.contains('riprow-save')) {
             buttons[i].style.display = 'none';
         }
 
         if(buttons[i].classList.contains('riprow-cancel')) {
             buttons[i].style.display = 'none';
         }
     }

}

function deleteRipCounterRow(elem: HTMLTableRowElement){
    let table =  (<HTMLTableElement>document.getElementById("ripcounter-table"));
    table.deleteRow(elem.rowIndex);

    ripcounter.deleteEntryFromRipcounterMapByGame(elem.cells[0].innerText);  
    
    //update global counter
    updateGlobalRipCounter();
}

function saveRipCounterRow(elem: HTMLTableRowElement){
    var rip = parseInt(elem.cells[1].getElementsByTagName("input")[0].value);
    var grip = parseInt(elem.cells[2].getElementsByTagName("input")[0].value);

    elem.cells[1].innerHTML = '';
    elem.cells[1].innerHTML = '' + rip;

    elem.cells[2].innerHTML = '';
    elem.cells[2].innerHTML = '' + grip;

    ripcounter.updateRipcounterMapByGame(elem.cells[0].innerText, rip, grip);

     //buttons
     var buttons = elem.cells[3].getElementsByTagName("button");
     for (var i = 0; i < buttons.length; i++) {
         if(buttons[i].classList.contains('riprow-edit')){
             buttons[i].style.display = '';
         }
         
         if(buttons[i].classList.contains('riprow-del')) {
             buttons[i].style.display = '';
         }
 
         if(buttons[i].classList.contains('riprow-save')) {
             buttons[i].style.display = 'none';
         }
 
         if(buttons[i].classList.contains('riprow-cancel')) {
             buttons[i].style.display = 'none';
         }
     }

     //update global counter
    updateGlobalRipCounter();
}

function updateRipCounterUITable(){
    let table =  (<HTMLTableElement>document.getElementById("ripcounter-table"));
    let rips_map = ripcounter.RipCounterMap;
    let table_games_helper_array:string[] = [];

    for(var i = 0; i < table.rows.length; i++){
        let row = (<HTMLTableRowElement>table.rows[i]);
        table_games_helper_array.push(row.cells[0].innerText);
    }

    let rip_key_itr = rips_map.keys();

    let result = rip_key_itr.next();
    while (!result.done) {
        console.log(result.value); // 1 3 5 7 9
       if(table_games_helper_array.includes(result.value)){//game already on list update
            for(var i = 0; i < table.rows.length; i++){
                let row = (<HTMLTableRowElement>table.rows[i]);
                if(rips_map.has(row.cells[0].innerText)){
                    //update cells
                    row.cells[1].innerText = '' + rips_map.get(row.cells[0].innerText)[0];
                    row.cells[2].innerText = '' + rips_map.get(row.cells[0].innerText)[1];
                }
            }
            //update global counter
            updateGlobalRipCounter();
       }else{//new game add to table
            let tr = table.insertRow(1);
            //let tr = document.createElement('tr');
            let td_game = document.createElement('th');
            td_game.setAttribute('class', 'ripcounter-head-game');
            td_game.innerHTML = result.value;
            let td_rip = document.createElement('td');
            td_rip.setAttribute("contenteditable", "true");
            td_rip.setAttribute('class', 'ripcounter-table-rips');
            td_rip.innerHTML = '' +rips_map.get(result.value)[0];
            let td_grip = document.createElement('td');
            td_grip.setAttribute("contenteditable", "true");
            td_grip.setAttribute('class', 'ripcounter-table-grips');
            td_grip.innerHTML = '' + rips_map.get(result.value)[1];
            let td_buttons = document.createElement('td');

            let edit_button = document.createElement('button');
            edit_button.setAttribute('class', 'btn btn-outline-secondary btn-sm riprow-edit');
            edit_button.setAttribute('type', 'button');
            let span_edit_icon = document.createElement('span');
            span_edit_icon.setAttribute('class', 'fa fa-pencil');
            span_edit_icon.setAttribute('aria-hidden', 'true');

            let del_button = document.createElement('button');
            del_button.setAttribute('class', 'btn btn-outline-secondary btn-sm riprow-del');
            del_button.setAttribute('type', 'button');
            let span_trash_icon = document.createElement('span');
            span_trash_icon.setAttribute('class', 'fa fa-trash-o');
            span_trash_icon.setAttribute('aria-hidden', 'true');

            let save_button = document.createElement('button');
            save_button.setAttribute('class', 'btn btn-outline-secondary btn-sm riprow-save');
            save_button.setAttribute('type', 'button');
            save_button.style.display = "none";
            let span_save_icon = document.createElement('span');
            span_save_icon.setAttribute('class', 'fa fa-floppy-o');
            span_save_icon.setAttribute('aria-hidden', 'true');

            let cancel_button = document.createElement('button');
            cancel_button.setAttribute('class', 'btn btn-outline-secondary btn-sm riprow-cancel');
            cancel_button.setAttribute('type', 'button');
            cancel_button.style.display = "none";
            let span_cancel_icon = document.createElement('span');
            span_cancel_icon.setAttribute('class', 'fa fa-times');
            span_cancel_icon.setAttribute('aria-hidden', 'true');
            
            del_button.appendChild(span_trash_icon);
            edit_button.appendChild(span_edit_icon);
            save_button.appendChild(span_save_icon);
            cancel_button.appendChild(span_cancel_icon);

            tr.appendChild(td_game);
            tr.appendChild(td_rip);
            tr.appendChild(td_grip);
            td_buttons.appendChild(edit_button);
            td_buttons.appendChild(del_button);
            td_buttons.appendChild(save_button);
            td_buttons.appendChild(cancel_button);
            tr.appendChild(td_buttons);
            

            //eventlisteners
            edit_button.addEventListener ('click', function (event) {
                editRipCounterRow(tr);
            });

            save_button.addEventListener ('click', function (event) {
                saveRipCounterRow(tr);
            });

            cancel_button.addEventListener ('click', function (event){
                cancelEditRipCounterRow(tr);
            });

            del_button.addEventListener ('click', function (event){
                deleteRipCounterRow(tr);
            }); 

            //update global counter
            updateGlobalRipCounter();
       }
       result = rip_key_itr.next();
    }   
}

function updateGlobalRipCounter(){
    jQuery('#ripcounter-global-rips').text(ripcounter.getAllRips('rip'));
    jQuery('#ripcounter-global-grips').text(ripcounter.getAllRips('grip'));
}

   
  



//Twitch PubSub Bit functions

function pubsubfunctions(oauth: string, channel_id: string){

    console.log('pubsub we are here 1');
    let twitch_pubsub = new PubSubClient();
    let bits_topic = 'channel-bits-events-v1.' + channel_id;
    let channel_points_topic = 'channel-points-channel-v1.' + channel_id;
    //listen to bits

    twitch_pubsub.connect();
    console.log('pubsub we are here 2');
    twitch_pubsub.listen([bits_topic,channel_points_topic] , oauth, 'bits:read+channel:read:redemptions');
    console.log('pubsub we are here 3');
    twitch_pubsub.onConnect(() => { 
        /* ... */ 
        console.log('Connected to pubs sub'); 
    });

    twitch_pubsub.onMessage((topic: any, message: any) => { 
        /* ... */ 
        console.log('PUBSUB RECEIVED MESSAGE concerning topic: ' + topic + 'with message: ' + JSON.stringify(message));
    });

}

function connectPubSub() {
    var heartbeatInterval = 1000 * 60; //ms between PING's
    var reconnectInterval = 1000 * 3; //ms to wait before reconnect
    var heartbeatHandle: any;

    pub_ws = new WebSocket('wss://pubsub-edge.twitch.tv');

    pub_ws.onopen = function(event) {
        console.log('INFO: Socket Opened\n');
        heartbeat();
        heartbeatHandle = setInterval(heartbeat, heartbeatInterval);
        // listen to topics
        listenOnTopic([bits_topic, channel_points_topic], settingsmodule.settings.streamerOAuthkey);
    };

    pub_ws.onerror = function(error) {
        console.log('ERR:  ' + JSON.stringify(error) + '\n');
    };

    pub_ws.onmessage = function(event) {
        let message = JSON.parse(event.data);
        console.log('RECV: ' + JSON.stringify(message) + '\n');
        if (message.type == 'RECONNECT') {
            console.log('INFO: Reconnecting...\n');
            setTimeout(connectPubSub, reconnectInterval);
        }
    };

    pub_ws.onclose = function() {
        console.log('INFO: Socket Closed\n');
        clearInterval(heartbeatHandle);
        console.log('INFO: Reconnecting...\n');
        setTimeout(connectPubSub, reconnectInterval);
    };

}

function heartbeat() {
    let message = {
        type: 'PING'
    };
    console.log('SENT: ' + JSON.stringify(message) + '\n');
    pub_ws.send(JSON.stringify(message));
}

function nonce(length: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function listenOnTopic(topic: string[], oauth: string) {
    let message = {
        type: 'LISTEN',
        nonce: nonce(15),
        data: {
            topics: topic,
            auth_token: oauth
        }
    };
    console.log('SENT: ' + JSON.stringify(message) + '\n');
    pub_ws.send(JSON.stringify(message));
}

function initPubSubConnection(oauth: string, channel_id: string){
    console.log('pubsub conn well see');
    
    bits_topic = 'channel-bits-events-v1.' + channel_id;
    channel_points_topic = 'channel-points-channel-v1.' + channel_id;

    connectPubSub();

}