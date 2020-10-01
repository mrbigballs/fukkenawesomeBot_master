"use strict";
exports.__esModule = true;
exports.RipCounter = void 0;
var RipCounter = /** @class */ (function () {
    function RipCounter(localStore) {
        this.store = localStore;
        if (this.store.has('ripmap')) {
            this.RipCounterMap = new Map(JSON.parse(this.store.get('ripmap')));
        }
        else {
            this.RipCounterMap = new Map();
        }
    }
    RipCounter.prototype.addRip = function (currentGame, type) {
        //game already on list
        if (this.RipCounterMap.has(currentGame)) {
            var rip = this.RipCounterMap.get(currentGame)[0];
            var grip = this.RipCounterMap.get(currentGame)[1];
            rip++;
            if (type == 'grip') {
                grip++;
            }
            this.RipCounterMap.get(currentGame)[0] = rip;
            this.RipCounterMap.get(currentGame)[1] = grip;
            this.saveRipMap();
        }
        else { //game not on list
            if (type == 'grip') {
                this.RipCounterMap.set(currentGame, [1, 1]);
            }
            else {
                this.RipCounterMap.set(currentGame, [1, 0]);
            }
            this.saveRipMap();
        }
    };
    RipCounter.prototype.setRip = function (currentGame, type, ripcount) {
        if (this.RipCounterMap.has(currentGame)) {
            if (type == 'grip') {
                this.RipCounterMap.get(currentGame)[1] = ripcount;
            }
            else {
                this.RipCounterMap.get(currentGame)[0] = ripcount;
            }
            this.saveRipMap();
        }
        else { //game not on list
            if (type == 'grip') {
                this.RipCounterMap.set(currentGame, [0, ripcount]);
            }
            else {
                this.RipCounterMap.set(currentGame, [ripcount, 0]);
            }
            this.saveRipMap();
        }
    };
    RipCounter.prototype.getRip = function (currentGame) {
        if (this.RipCounterMap.has(currentGame)) {
            return this.RipCounterMap.get(currentGame);
        }
        else {
            return [0, 0];
        }
    };
    RipCounter.prototype.saveRipMap = function () {
        this.store.set('ripmap', JSON.stringify(this.RipCounterMap));
    };
    return RipCounter;
}());
exports.RipCounter = RipCounter;
//# sourceMappingURL=ripcounter.js.map