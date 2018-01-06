import { Settings } from "./settings";

var Datastore = require('nedb');
let settingsDB = new Datastore({
    filename: __dirname + '/../db/settings.db', // provide a path to the database file 
    autoload: true, // automatically load the database
    timestampData: true // automatically add and manage the fields createdAt and updatedAt
  });



let settingsStreamerName = document.getElementById('chatWindow');

const settingsDiv = document.getElementById('settingsDiv');

export class SettingsModule{

    settings: Settings;

    saveSettings(){
        var insertSettings: Settings = new Settings('fukkenawesome', 'oauth:xxxxx',
             'fukkenawesome', true,
            null, null, true, 'theme-dark',
            ['fukkenawesome', 'andre'], true, true, true,
            true, true);

        settingsDB.insert(insertSettings, function (err: Error, newDoc: Settings) {   // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
        if(err){
            console.log(err);
        }else{
            console.log(newDoc);
        }
           
        });
    }
    
    mapEntrytoSettings(settingsEntry: any){
        this.settings =  new Settings(settingsEntry.streamerUserName, settingsEntry.streamerOAuthkey,
            settingsEntry.channel, settingsEntry.autoconnect,
            settingsEntry.customBotName, settingsEntry.customBotOAuthkey, settingsEntry.themeDark, 
            settingsEntry.themePath, settingsEntry.chatHighlightNames, settingsEntry.quoteSystemEnabled, 
            settingsEntry.quote, settingsEntry.quoteAdd, settingsEntry.quoteDel, settingsEntry.quoteEdit);

            settingsDiv.innerHTML = 'Username: ' + settingsEntry.streamerUserName + ' Channel: ' + settingsEntry.channel;
    }

    loadSettings(){
        var self = this;
        settingsDB.find({}, function (err: Error, settingsEntry: any) {
            if(err){
                console.log(err);
            }else{
                console.log(settingsEntry[0]);
                self.mapEntrytoSettings(settingsEntry[0]);
                
            }
        });
    }


    getStreamerOAuthkey(){
        if(this.settings == null){
            return;
        }else{
            return this.settings.streamerOAuthkey;
        }
    }

    

    

}