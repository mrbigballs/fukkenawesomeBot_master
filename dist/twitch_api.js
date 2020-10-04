"use strict";
exports.__esModule = true;
exports.TwitchAPI = void 0;
var tmi = require("tmi.js");
var credentials_1 = require("./credentials");
var settingsmodule_1 = require("./settingsmodule");
var storelocal_1 = require("./storelocal");
var https = require('https');
var credentials = new credentials_1.Credentials();
var settingsmodule = new settingsmodule_1.SettingsModule();
var store = new storelocal_1.StoreLocal().getLocalStore();
var api_startpoint_url = 'https://api.twitch.tv/kraken/';
var accept = 'application/vnd.twitchtv.v3+json';
var streamer_oauthkey = settingsmodule.getStreamerOAuthkey();
var twitch_hostname = 'https://api.twitch.tv/helix/';
var twitch_port = 443;
var global_badges_url = 'https://badges.twitch.tv/v1/badges/global/display';
var channel_badges_base_url = 'https://badges.twitch.tv/v1/badges/channels/';
var TwitchAPI = /** @class */ (function () {
    function TwitchAPI() {
        this.bot_clientId = credentials.clientId;
        //bot_client_secret: string = credentials.client_secret;
        this.bot_bearer_token = credentials.generated_bearer_oauthkey;
    }
    TwitchAPI.prototype.getUserIdfromUsername = function (client, username) {
        client.api({
            url: api_startpoint_url + 'users?login=' + username,
            method: "GET",
            headers: {
                "Accept": accept,
                "Authorization": "OAuth " + streamer_oauthkey,
                "Client-ID": credentials.clientId
            }
        }, function (err, res, body) {
            console.log(body);
        });
    };
    TwitchAPI.prototype.twitchAPICall = function (pathUrl, method_call) {
        console.log('apicall: ' + pathUrl);
        var options = {
            hostname: twitch_hostname,
            path: pathUrl,
            method: 'GET',
            headers: {
                accept: 'application/json',
                "Client-ID": this.bot_clientId
            }
        };
        fetch(twitch_hostname + pathUrl, {
            method: method_call,
            //body:    JSON.stringify(body),
            headers: {
                accept: 'application/json',
                "Client-ID": this.bot_clientId
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (response) {
            console.log(response.json());
        })["catch"](function (error) { console.log(error); });
    };
    TwitchAPI.prototype.getOAutch2BearerToken = function () {
        var data = {
            client_id: this.bot_clientId,
            // client_secret: this.bot_client_secret,
            grant_type: 'client_credentials'
        };
        // console.log( 'Oatuhfunc| ' + this.bot_clientId + ' | ' + this.bot_client_secret);
        fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            //body:    'client_id=' + this.bot_clientId + '&client_secret=' + this.bot_client_secret + '&grant_type=client_credentials',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json'
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log(data);
            //settingsmodule.settings.setToken(data.access_token);
            //settingsmodule.saveSettings();
        })["catch"](function (error) { console.log(error); });
    };
    TwitchAPI.prototype.getOAuthorizedByUser = function () {
        var data = {
            client_id: this.bot_clientId,
            //client_secret: this.bot_client_secret,
            grant_type: 'client_credentials'
        };
        // console.log( 'Oatuhfunc| ' + this.bot_clientId + ' | ' + this.bot_client_secret);
        fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            // body:    'client_id=' + this.bot_clientId + '&client_secret=' + this.bot_client_secret + '&grant_type=client_credentials',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json'
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log(data);
            //settingsmodule.settings.setToken(data.access_token);
            //settingsmodule.saveSettings();
        })["catch"](function (error) { console.log(error); });
    };
    TwitchAPI.prototype.searchStreams = function (channel) {
        var twitch_url = twitch_hostname + 'search/channels?query=' + channel;
        fetch(twitch_url, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json'
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log(data);
            //settingsmodule.settings.setToken(data.access_token);
            //settingsmodule.saveSettings();
        })["catch"](function (error) { console.log(error); });
    };
    TwitchAPI.prototype.getStreamInfo = function (channel, oauth) {
        var twitch_url = twitch_hostname + 'streams?user_login=' + channel;
        fetch(twitch_url, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                "Client-ID": this.bot_clientId,
                "Authorization": "Bearer " + oauth
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log(data);
            //settingsmodule.settings.setToken(data.access_token);
            //settingsmodule.saveSettings();
        })["catch"](function (error) { console.log(error); });
    };
    TwitchAPI.prototype.getGlobalBadges = function () {
        console.log('globalBadges');
        fetch(global_badges_url, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                "Client-ID": this.bot_clientId
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log(data);
            store.set('global_badges', JSON.stringify(data));
        })["catch"](function (error) { console.log(error); });
    };
    TwitchAPI.prototype.getChannelBadges = function (token) {
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
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log('channel badges: ' + data);
            store.set('channel_badges', JSON.stringify(data));
        })["catch"](function (error) { console.log(error); });
    };
    TwitchAPI.prototype.getChannelInfo = function (channel_name, token) {
        console.log('stuff should happen ' + channel_name);
        fetch(twitch_hostname + 'search/channels?query=' + channel_name, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                'Client-ID': this.bot_clientId,
                'Authorization': 'Bearer ' + token
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log('inner');
            console.log(data);
            store.set('channel_info', JSON.stringify(data.data[0]));
        })["catch"](function (error) { console.log(error); });
    };
    TwitchAPI.prototype.callTwtichApi = function (oauth, url, savekey) {
        var twitch_url = twitch_hostname + url;
        console.log('api call for: ' + twitch_url);
        fetch(twitch_url, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                "Client-ID": this.bot_clientId,
                "Authorization": "Bearer " + oauth
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log(data);
            if (savekey != '') {
                store.set(savekey, JSON.stringify(data.data[0]));
            }
            return JSON.stringify(data.data);
        })["catch"](function (error) {
            console.log(error);
        });
    };
    TwitchAPI.prototype.callTwitchApiFetch = function (oauth, url) {
        return fetch(twitch_hostname + url, {
            method: 'GET',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                "Client-ID": this.bot_clientId,
                "Authorization": "Bearer " + oauth
            }
        });
    };
    TwitchAPI.prototype.updateChannelDataHelix = function (oauth, broadcasterId, gameId, title, lang) {
        console.log('{"game_id":"' + gameId + '", "title":"' + title + '", "broadcaster_language":"' + lang + '"}');
        // body: JSON.stringify({"game_id": gameId, "title":title , "broadcaster_language":lang})
        //+ '&game_id=' + gameId +'&title=' + title + '&broadcaster_language=' + lang
        return fetch(twitch_hostname + 'channels?broadcaster_id=' + broadcasterId, {
            method: 'PATCH',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                //'Content-Type': 'application/json',
                "Client-ID": this.bot_clientId,
                "Authorization": "Bearer " + oauth
            },
            body: JSON.stringify({ "game_id": gameId, "title": title, "broadcaster_language": lang })
        });
    };
    TwitchAPI.prototype.updateChannelData = function (oauth, broadcasterId, gameName, title) {
        return fetch(api_startpoint_url + 'channels/' + broadcasterId, {
            method: 'PUT',
            headers: {
                accept: 'application/vnd.twitchtv.v5+json',
                "Client-ID": this.bot_clientId,
                "Authorization": "OAuth " + oauth
            },
            body: JSON.stringify({ "channel": { "status": title, "game": gameName, "channel_feed_enabled": true } })
        });
    };
    return TwitchAPI;
}());
exports.TwitchAPI = TwitchAPI;
//# sourceMappingURL=twitch_api.js.map