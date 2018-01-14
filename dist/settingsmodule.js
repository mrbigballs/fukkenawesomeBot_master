"use strict";
exports.__esModule = true;
var settings_1 = require("./settings");
var Datastore = require('nedb');
var settingsDB = new Datastore({
    filename: __dirname + '/../db/settings.db',
    autoload: true,
    timestampData: true // automatically add and manage the fields createdAt and updatedAt
});
var settingsStreamerName = document.getElementById('settingsStreamerName');
var settingsStreamerOAuthkey = document.getElementById('settingsStreamerOauthkay');
var settingsDiv = document.getElementById('settingsDiv');
var SettingsModule = /** @class */ (function () {
    function SettingsModule() {
    }
    SettingsModule.prototype.saveSettings = function () {
        settingsDB.update({ _id: 'QQGy79vh0WjCyifK' }, this.settings, {}, function (err, numReplaced) {
            console.log("replaced---->" + numReplaced);
        });
    };
    SettingsModule.prototype.mapEntrytoSettings = function (settingsEntry) {
        this.settings = new settings_1.Settings(settingsEntry.streamerUserName, settingsEntry.streamerOAuthkey, settingsEntry.channel, settingsEntry.autoconnect, settingsEntry.customBotName, settingsEntry.customBotOAuthkey, settingsEntry.themeDark, settingsEntry.themePath, settingsEntry.chatHighlightNames, settingsEntry.quoteSystemEnabled, settingsEntry.quote, settingsEntry.quoteAdd, settingsEntry.quoteDel, settingsEntry.quoteEdit, settingsEntry.uiNotifications);
        settingsStreamerName.value = settingsEntry.streamerUserName;
        settingsStreamerOAuthkey.value = settingsEntry.streamerOAuthkey;
    };
    SettingsModule.prototype.loadSettings = function () {
        var self = this;
        settingsDB.find({}, function (err, settingsEntry) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(settingsEntry[0]);
                self.mapEntrytoSettings(settingsEntry[0]);
            }
        });
    };
    SettingsModule.prototype.initSettingsDB = function () {
        var insertSettings = new settings_1.Settings('fukkenawesome', 'oauth:xxxxx', 'fukkenawesome', true, null, null, true, 'theme-dark', ['fukkenawesome', 'andre'], true, true, true, true, true, true);
        settingsDB.insert(insertSettings, function (err, newDoc) {
            // newDoc is the newly inserted document, including its _id
            // newDoc has no key called notToBeSaved since its value was undefined
            if (err) {
                console.log(err);
            }
            else {
                console.log(newDoc);
            }
        });
    };
    SettingsModule.prototype.getStreamerOAuthkey = function () {
        if (this.settings == null) {
            return;
        }
        else {
            return this.settings.streamerOAuthkey;
        }
    };
    return SettingsModule;
}());
exports.SettingsModule = SettingsModule;
//# sourceMappingURL=settingsmodule.js.map