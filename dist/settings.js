"use strict";
exports.__esModule = true;
var Settings = /** @class */ (function () {
    function Settings(sName, sOauthkey, channel, autconn, cBotName, cBotOauthkey, themeDark, themePath, chatHighlights, quoteEnabled, quote, quoteAdd, quoteDel, quoteEdit) {
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
    }
    return Settings;
}());
exports.Settings = Settings;
//# sourceMappingURL=settings.js.map