"use strict";
exports.__esModule = true;
exports.Raffle = void 0;
var Raffle = /** @class */ (function () {
    //load or init settings
    function Raffle(localStore, tmiClient) {
        this.raffle_active = false;
        this.timer = 300000; //5 min
        this.participants = [];
        this.automaticWhisperWinner = false;
        this.announceWinnerInChat = false;
        this.raffleSettings = {
            automaticWhisperWinner: "false",
            announceWinnerInChat: "false",
            timer: 300000,
            raffle_notification_chat: "Congrats ##winner## you won!",
            raffle_notification_whsiper: "Hey, ##winner## congratulations you won the raffle!!",
            raffle_notification_game_key: "Here is your key for ##item## ##game_platform##-Key: ##game_key"
        };
        this.tmiClient = tmiClient;
        this.store = localStore;
        if (this.store.has('raffle_settings')) {
            this.raffleSettings.automaticWhisperWinner = JSON.parse(this.store.get('raffle_settings')).automaticWhisperWinner;
            this.raffleSettings.announceWinnerInChat = JSON.parse(this.store.get('raffle_settings')).announceWinnerInChat;
            this.raffleSettings.timer = JSON.parse(this.store.get('raffle_settings')).timer;
        }
        else {
            //init raffle settings
            this.store.set('raffle_settings', JSON.stringify(this.raffleSettings));
        }
    }
    Raffle.prototype.addParticipant = function (userstate) {
        if (this.subscriberOnly) {
            if (userstate['subscriber']) {
                for (var i = 0; i < this.participants.length; i++) {
                    if (this.participants[i]['user-id'] == userstate['user-id']) {
                        return;
                    }
                }
                this.participants.push(userstate);
                return userstate;
            }
        }
        else {
            for (var i = 0; i < this.participants.length; i++) {
                if (this.participants[i]['user-id'] == userstate['user-id']) {
                    return;
                }
            }
            this.participants.push(userstate);
            return userstate;
        }
        //this.participants.indexOf(displayName) === -1 ? this.participants.push(displayName) : console.log("This user " + displayName + " is already on the list.");
    };
    Raffle.prototype.addUserToList = function (userstate) {
    };
    Raffle.prototype.updateUIList = function () {
    };
    Raffle.prototype.drawWinner = function () {
        var winner = this.participants[Math.floor(Math.random() * this.participants.length)];
        if (this.announceWinnerInChat) {
        }
        if (this.automaticWhisperWinner) {
        }
    };
    Raffle.prototype.setKeyword = function (keyword) {
        this.keyword = keyword;
    };
    Raffle.prototype.startTimedRaffle = function () {
        this.timed_raffle_timeout = setTimeout(function () {
            console.log('timed raffle');
            this.drawWinner();
        }, this.timer);
    };
    Raffle.prototype.stopTimedRaffle = function () {
        clearTimeout(this.timed_raffle_timeout);
    };
    Raffle.prototype.startUITimer = function () {
        this.ui_timer_interval = setInterval(function () {
        }, 500);
    };
    Raffle.prototype.clearparticipants = function () {
        this.participants = [];
    };
    Raffle.prototype.addRaffleItem = function (game, raffleKeyword, gameKey, winner) {
        var raffleItem = {
            raffle_item: game,
            raffle_keyword: raffleKeyword,
            game_key: gameKey,
            raffle_winnder: winner
        };
        this.raffleItems.push(raffleItem);
    };
    Raffle.prototype.updateRaffleItem = function (index, game, raffleKeyword, gameKey, winner) {
        if (typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems[index].raffleItem.raffle_item = game;
            this.raffleItems[index].raffleItem.raffle_keyword = raffleKeyword;
            this.raffleItems[index].raffleItem.game_key = gameKey;
            this.raffleItems[index].raffleItem.raffle_winnder = winner;
        }
        else {
            console.log('element ' + index + ' does not exist');
        }
    };
    return Raffle;
}());
exports.Raffle = Raffle;
//# sourceMappingURL=raffle.js.map