"use strict";
exports.__esModule = true;
var Raffle = /** @class */ (function () {
    function Raffle(client) {
        this.timer = 300000; //5 min
        this.tmiClient = client;
    }
    Raffle.prototype.addParticipant = function (displayName) {
        this.participants.indexOf(displayName) === -1 ? this.participants.push(displayName) : console.log("This user " + displayName + " is already on the list.");
    };
    Raffle.prototype.drawWinner = function () {
        return this.participants[Math.floor(Math.random() * this.participants.length)];
    };
    Raffle.prototype.setKeyword = function (keyword) {
        this.keyword = keyword;
    };
    Raffle.prototype.startTimedRaffle = function () {
    };
    return Raffle;
}());
exports.Raffle = Raffle;
//# sourceMappingURL=raffle.js.map