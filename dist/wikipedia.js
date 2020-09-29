"use strict";
exports.__esModule = true;
exports.Wikipedia = void 0;
var url = "https://en.wikipedia.org/w/api.php";
var Wikipedia = /** @class */ (function () {
    function Wikipedia() {
    }
    Wikipedia.prototype.serachWiki = function (searchKeyword) {
        var params = {
            action: "query",
            list: "search",
            srsearch: searchKeyword,
            format: "json"
        };
        url = url + "?origin=*";
        Object.keys(params).forEach(function (key) { url += "&" + key + "=" + this.params[key]; });
        console.log(url);
        fetch(url)
            .then(function (response) { return response.json(); })
            .then(function (response) {
            console.log(response.query.search[0].title);
        })["catch"](function (error) { console.log(error); });
    };
    return Wikipedia;
}());
exports.Wikipedia = Wikipedia;
//# sourceMappingURL=wikipedia.js.map