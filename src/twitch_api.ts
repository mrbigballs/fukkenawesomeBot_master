const tmi = require("tmi.js");
import { Credentials } from "./credentials";
import { Settings } from './settings';
import { SettingsModule } from './settingsmodule';
import { StoreLocal } from './storelocal';
const https = require('https');

const credentials = new Credentials();
const settingsmodule = new SettingsModule();
const store = new StoreLocal().getLocalStore();

let api_startpoint_url: string = 'https://api.twitch.tv/kraken/';
let accept: string = 'application/vnd.twitchtv.v3+json';
let streamer_oauthkey = settingsmodule.getStreamerOAuthkey();

let twitch_hostname: string = 'https://api.twitch.tv/helix/';
let twitch_port: number = 443;
let global_badges_url = 'https://badges.twitch.tv/v1/badges/global/display'
let channel_badges_base_url = 'https://badges.twitch.tv/v1/badges/channels/'

export class TwitchAPI{


    bot_clientId: string = credentials.clientId;
    //bot_client_secret: string = credentials.client_secret;
    bot_bearer_token: string = credentials.generated_bearer_oauthkey;

    

    getUserIdfromUsername(client: any, username: string){
        
        client.api({
            url: api_startpoint_url + 'users?login=' + username,
            method: "GET",
            headers: {
                "Accept": accept,
                "Authorization": "OAuth " + streamer_oauthkey,
                "Client-ID": credentials.clientId
            }
        }, function(err: ErrorEvent, res: Response, body: any) {
            console.log(body);
        });
        
    }

    twitchAPICall(pathUrl: string, method_call: string){
        console.log('apicall: ' + pathUrl);
        const options = {
            hostname: twitch_hostname,
            path: pathUrl,
            method: 'GET',
            headers: {
            accept: 'application/json',
            "Client-ID": this.bot_clientId,
           // "Authorization": "Bearer " + auth
            }
        }
        
        fetch(twitch_hostname+pathUrl, {
            method: method_call,
            //body:    JSON.stringify(body),
            headers: {
                accept: 'application/json',
                "Client-ID": this.bot_clientId,
               // "Authorization": "Bearer " + auth
                }
        })
            .then(function(response){return response.json();})
            .then(function(response) {
                 
                    console.log(response.json() );
                }
            )
            .catch(function(error){console.log(error);});
    }

    getOAutch2BearerToken(){
        const data = {
            client_id: this.bot_clientId,
           // client_secret: this.bot_client_secret,
            grant_type: 'client_credentials'
        }

       // console.log( 'Oatuhfunc| ' + this.bot_clientId + ' | ' + this.bot_client_secret);

        fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            //body:    'client_id=' + this.bot_clientId + '&client_secret=' + this.bot_client_secret + '&grant_type=client_credentials',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json'
                }
        })
            .then(function(response){return response.json();})
            .then(function(data) {

                    console.log(data);
                    //settingsmodule.settings.setToken(data.access_token);
                    //settingsmodule.saveSettings();
                }
            )
            .catch(function(error){console.log(error);});
    }

    getOAuthorizedByUser(){
        const data = {
            client_id: this.bot_clientId,
            //client_secret: this.bot_client_secret,
            grant_type: 'client_credentials'
        }

       // console.log( 'Oatuhfunc| ' + this.bot_clientId + ' | ' + this.bot_client_secret);

        fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
           // body:    'client_id=' + this.bot_clientId + '&client_secret=' + this.bot_client_secret + '&grant_type=client_credentials',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json'
                }
        })
            .then(function(response){return response.json();})
            .then(function(data) {

                    console.log(data);
                    //settingsmodule.settings.setToken(data.access_token);
                    //settingsmodule.saveSettings();
                }
            )
            .catch(function(error){console.log(error);});
    }

    searchStreams(channel: string): void{
        let twitch_url = twitch_hostname + 'search/channels?query=' + channel;
        fetch(twitch_url, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json'
                }
        })
            .then(function(response){return response.json();})
            .then(function(data) {

                    console.log(data);
                    //settingsmodule.settings.setToken(data.access_token);
                    //settingsmodule.saveSettings();
                }
            )
            .catch(function(error){console.log(error);});
    }

    getStreamInfo(channel: string, oauth: string): void{
        let twitch_url = twitch_hostname + 'streams?user_login=' + channel;
        fetch(twitch_url, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                "Client-ID": this.bot_clientId,
                "Authorization": "Bearer " + oauth
                }
        })
            .then(function(response){return response.json();})
            .then(function(data) {

                    console.log(data);
                    //settingsmodule.settings.setToken(data.access_token);
                    //settingsmodule.saveSettings();
                }
            )
            .catch(function(error){console.log(error);});
    }

    getGlobalBadges(){
        fetch(global_badges_url, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                "Client-ID": this.bot_clientId,
                }
        })
            .then(function(response){return response.json();})
            .then(function(data) {
                    console.log(data);
                    store.set('global_badges', JSON.stringify(data));
                }
            )
            .catch(function(error){console.log(error);});
    }
    
    getChannelBadges( token: string){
        console.log('hiiii');
        console.log(store.get('channel_info'));
        fetch(channel_badges_base_url + JSON.parse(store.get('channel_info')).id + '/display', {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                'Client-ID': this.bot_clientId,
                'Authorization': 'Bearer ' + token
                }
        })
            .then(function(response){return response.json();})
            .then(function(data) {
                    console.log('channel badges: ' + data);
                    store.set('channel_badges', JSON.stringify(data));
                }
            )
            .catch(function(error){console.log(error);});
    }

    getChannelInfo(channel_name: string, token: string){
        console.log('stuff should happen ' + channel_name);
        fetch(twitch_hostname + 'search/channels?query=' + channel_name, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                'Client-ID': this.bot_clientId,
                'Authorization': 'Bearer ' + token
                }
        })
            .then(function(response){return response.json();})
            .then(function(data) {
                console.log('inner');
                    

                    console.log(data);
                    store.set('channel_info', JSON.stringify(data.data[0]));
                    
                }
            )
            .catch(function(error){console.log(error);});
    }



}