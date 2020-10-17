"use strict";
exports.__esModule = true;
exports.Raffle = void 0;
var Raffle = /** @class */ (function () {
    //load or init settings
    function Raffle(localStore, tmiClient) {
        this.raffle_active = false;
        this.subscriberLuck = 0;
        this.timer = 300000; //5 min
        this.participants = [];
        this.drawlist = [];
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
        if (this.store.has('raffle_items')) {
            this.raffleItems = JSON.parse(this.store.get('raffle_items'));
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
        var winner;
        this.drawlist = [];
        console.log('lock' + this.subscriberLuck);
        if (typeof this.subscriberLuck == 'undefined' || this.subscriberLuck == 0) {
            winner = this.participants[Math.floor(Math.random() * this.participants.length)];
        }
        else {
            for (var i = 0; i < this.participants.length; i++) {
                if (this.participants[i]['subscriber']) {
                    for (var j = 0; j < this.subscriberLuck; j++) {
                        this.drawlist.push(this.participants[i]);
                    }
                }
                else {
                    this.drawlist.push(this.participants[i]);
                }
            }
            console.log(JSON.stringify(this.drawlist));
            winner = this.drawlist[Math.floor(Math.random() * this.drawlist.length)];
        }
        console.log('WINNER::: ' + winner['display-name']);
        if (this.announceWinnerInChat) {
        }
        if (this.automaticWhisperWinner) {
        }
        return winner;
    };
    Raffle.prototype.setKeyword = function (keyword) {
        this.keyword = keyword;
    };
    Raffle.prototype.startTimedRaffle = function () {
        this.timed_raffle_timeout = setTimeout(this.drawWinner, this.timer);
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
    Raffle.prototype.addRaffleItem = function (game, raffleKeyword, gameKey, winner, active, game_store) {
        if (typeof this.raffleItems == 'undefined') {
            this.raffleItems = [];
        }
        var raffleItem = {
            raffle_item: game,
            raffle_keyword: raffleKeyword,
            game_key: gameKey,
            raffle_winnder: winner,
            item_active: active,
            store_type: game_store
        };
        this.raffleItems.push(raffleItem);
        this.store.set('raffle_items', JSON.stringify(this.raffleItems));
    };
    Raffle.prototype.updateRaffleItem = function (index, game, raffleKeyword, gameKey, winner, active, game_store) {
        if (typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems[index].raffle_item = game;
            this.raffleItems[index].raffle_keyword = raffleKeyword;
            this.raffleItems[index].game_key = gameKey;
            this.raffleItems[index].raffle_winnder = winner;
            this.raffleItems[index].item_active = active;
            this.raffleItems[index].store_type = game_store;
            this.store.set('raffle_items', JSON.stringify(this.raffleItems));
        }
        else {
            console.log('element ' + index + ' does not exist');
        }
    };
    Raffle.prototype.deleteRaffleItemByIndex = function (index) {
        console.log('index: ' + index);
        if (typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems.splice(index, 1);
            this.store.set('raffle_items', JSON.stringify(this.raffleItems));
        }
    };
    Raffle.prototype.updateActiveStateByIndex = function (index, active) {
        if (typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems[index].item_active = active;
            this.store.set('raffle_items', JSON.stringify(this.raffleItems));
        }
    };
    return Raffle;
}());
exports.Raffle = Raffle;
//# sourceMappingURL=raffle.js.map