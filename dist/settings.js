"use strict";
exports.__esModule = true;
exports.Settings = void 0;
var Settings = /** @class */ (function () {
    function Settings(sName, sOauthkey, channel, autconn, cBotName, cBotOauthkey, themeDark, themePath, chatHighlights, quoteEnabled, quote, quoteAdd, quoteDel, quoteEdit, uiNotifications) {
        //autoconnect
        this.autoconnect = false;
        //Theme
        this.themeDark = true;
        this.themePath = '';
        //chat highlight  
        this.chatHighlightNames = [];
        this.streamerUserName = sName;
        this.streamerOAuthkey = sOauthkey;
        this.channel = channel;
        this.autoconnect = autconn;
        this.customBotName = cBotName;
        this.customBotOAuthkey = cBotOauthkey;
        this.themeDark = themeDark;
        this.themePath = themePath;
        this.quoteSystemEnabled = quoteEnabled;
        this.quote = quote;
        this.quoteAdd = quoteAdd;
        this.quoteDel = quoteDel;
        this.quoteEdit = quoteEdit;
        this.chatHighlightNames = chatHighlights;
        this.uiNotifications = uiNotifications;
    }
    Settings.prototype.setBotToken = function (token) {
        this.customBotOAuthkey = token;
    };
    Settings.prototype.setUserNameBot = function (username) {
        this.customBotName = username;
    };
    Settings.prototype.setUserNameStreamer = function (username) {
        this.streamerUserName = username;
    };
    Settings.prototype.setStreamerToken = function (token) {
        this.streamerOAuthkey = token;
    };
    Settings.prototype.setChannel = function (channel_name) {
        this.channel = channel_name;
    };
    Settings.prototype.setAutoconnect = function (autoCon) {
        this.autoconnect = autoCon;
    };
    return Settings;
}());
exports.Settings = Settings;
//# sourceMappingURL=settings.js.map