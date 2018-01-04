import { Settings } from "./settings";

var Datastore = require('nedb');
let settingsDB = new Datastore({
    filename: __dirname + '/../db/settings.db', // provide a path to the database file 
    autoload: true, // automatically load the database
    timestampData: true // automatically add and manage the fields createdAt and updatedAt
  });


let settingsStreamerName = document.getElementById('chatWindow');

export class SettingsModule{

    saveSettings(){
        var document = { hello: 'world'
               , n: 5
               , today: new Date()
               , nedbIsAwesome: true
              // , notthere: null
             //  , notToBeSaved: undefined  // Will not be saved
               , fruits: [ 'apple', 'orange', 'pear' ]
               , infos: { name: 'nedb' }
               };

        settingsDB.insert(document, function (err: Error, newDoc: Settings) {   // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
        });
    }

    loadSettings(){
        settingsDB.find({}, function (err: Error, docs: any) {
            console.log(docs);
        });
    }


}