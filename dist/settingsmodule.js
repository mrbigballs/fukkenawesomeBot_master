"use strict";
exports.__esModule = true;
var Datastore = require('nedb');
var settingsDB = new Datastore({
    filename: __dirname + '/../db/settings.db',
    autoload: true,
    timestampData: true // automatically add and manage the fields createdAt and updatedAt
});
var settingsStreamerName = document.getElementById('chatWindow');
var SettingsModule = /** @class */ (function () {
    function SettingsModule() {
    }
    SettingsModule.prototype.saveSettings = function () {
        var document = { hello: 'world',
            n: 5,
            today: new Date(),
            nedbIsAwesome: true
            // , notthere: null
            //  , notToBeSaved: undefined  // Will not be saved
            ,
            fruits: ['apple', 'orange', 'pear'],
            infos: { name: 'nedb' }
        };
        settingsDB.insert(document, function (err, newDoc) {
            // newDoc is the newly inserted document, including its _id
            // newDoc has no key called notToBeSaved since its value was undefined
        });
    };
    SettingsModule.prototype.loadSettings = function () {
        settingsDB.find({}, function (err, docs) {
            console.log(docs);
        });
    };
    return SettingsModule;
}());
exports.SettingsModule = SettingsModule;
//# sourceMappingURL=settingsmodule.js.map