const tmi = require("tmi.js");
import { Credentials } from "./credentials";
import { Settings } from './settings';
import { SettingsModule } from './settingsmodule';

const credentials = new Credentials();
const settingsmodule = new SettingsModule();

let api_startpoint_url: string = 'https://api.twitch.tv/kraken/';
let accept: string = 'application/vnd.twitchtv.v3+json';
let streamer_oauthkey = settingsmodule.getStreamerOAuthkey();


function getUserIdfromUsername(client: any, username: string){
    
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