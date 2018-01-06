"use strict";
exports.__esModule = true;
var tmi = require("tmi.js");
var credentials_1 = require("./credentials");
var settingsmodule_1 = require("./settingsmodule");
var credentials = new credentials_1.Credentials();
var settingsmodule = new settingsmodule_1.SettingsModule();
var api_startpoint_url = 'https://api.twitch.tv/kraken/';
var accept = 'application/vnd.twitchtv.v3+json';
var streamer_oauthkey = settingsmodule.getStreamerOAuthkey();
function getUserIdfromUsername(client, username) {
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
}
//# sourceMappingURL=twitch_api.js.map