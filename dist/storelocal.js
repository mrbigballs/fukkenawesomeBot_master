"use strict";
exports.__esModule = true;
exports.StoreLocal = void 0;
var Store = require('electron-store');
var store = new Store();
var StoreLocal = /** @class */ (function () {
    function StoreLocal() {
    }
    StoreLocal.prototype.getLocalStore = function () {
        return store;
    };
    StoreLocal.prototype.setKey = function (key, saveObject) {
        console.log('fgdfhdf');
        store.set(key, saveObject);
    };
    StoreLocal.prototype.getKey = function (key) {
        return store.get(key);
    };
    StoreLocal.prototype.clearStore = function () {
        store.clear();
    };
    return StoreLocal;
}());
exports.StoreLocal = StoreLocal;
//# sourceMappingURL=storelocal.js.map