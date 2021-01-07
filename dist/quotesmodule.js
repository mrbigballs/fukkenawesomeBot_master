"use strict";
exports.__esModule = true;
exports.QuotesModule = void 0;
var core_1 = require("@nano-sql/core");
/*
var Datastore = require('nedb');
let quoteDB = new Datastore({
    filename: __dirname + '/../db/quotes.db', // provide a path to the database file
    autoload: true, // automatically load the database
    timestampData: true, // automatically add and manage the fields createdAt and updatedAt,
    corruptAlertThreshold: 1
  });
*/
core_1.nSQL().createDatabase({
    id: "quote_db",
    mode: "PERM",
    tables: [
        {
            name: "quotes",
            model: {
                "id:int": { pk: true, ai: true },
                "quote:string": { notNull: true },
                "created:date": { notNull: true },
                "creator:string": { notNull: true },
                "game:string": {}
            }
        }
    ],
    version: 3,
    onVersionUpdate: function (prevVersion) {
        return new Promise(function (res, rej) {
            switch (prevVersion) {
                case 1:
                    // migrate v1 to v2
                    res(2);
                    break;
                case 2:
                    // migrate v2 to v3
                    res(3);
                    break;
            }
        });
    }
}).then(function () {
    // ready to query!
})["catch"](function () {
    // ran into a problem
});
var QuotesModule = /** @class */ (function () {
    function QuotesModule() {
    }
    QuotesModule.prototype.addQuoteToDB = function (quoteStr, username, gameStr) {
        core_1.nSQL("quotes").query("upsert", { quote: quoteStr, created: new Date(), creator: username, game: gameStr }).exec();
    };
    QuotesModule.prototype.getQuoteById = function (quote_id) {
        core_1.nSQL("quotes").query("select").where(["id", "=", quote_id]).exec().then(function (rows) {
            console.log(rows); // <= array of row objects
        });
    };
    QuotesModule.prototype.printTable = function () {
        // Get all rows from the users table.
        core_1.nSQL("quotes").query("select").exec().then(function (rows) {
            console.log(rows); // <= array of row objects
        });
    };
    return QuotesModule;
}());
exports.QuotesModule = QuotesModule;
//# sourceMappingURL=quotesmodule.js.map