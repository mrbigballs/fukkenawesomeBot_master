"use strict";
exports.__esModule = true;
exports.RipCounter = void 0;
var RipCounter = /** @class */ (function () {
    function RipCounter(localStore) {
        var _this = this;
        this.ripcounterSettings = {
            active: false,
            rip_command_alias: [""],
            addrip_command_alias: [""],
            addgrip_command_alias: [""],
            rip_message: "",
            addrip_message: "",
            addgrip_message: ""
        };
        console.log('TEST 1');
        this.store = localStore;
        if (this.store.has('ripcounter_map')) {
            this.ripcounter_map = JSON.parse(this.store.get('ripcounter_map'));
            this.RipCounterMap = new Map();
            this.ripcounter_map.forEach(function (item, index) {
                _this.RipCounterMap.set(item.game, [item.rip, item.grip]);
            });
            //this.RipCounterMap = new Map(JSON.parse(this.store.get('ripcounter_map')));
        }
        else {
            this.RipCounterMap = new Map();
            //this.RipCounterMap.set('Chicken Police', [5,3]);
            this.ripcounter_map = [];
            var ripEntry = {
                game: "Chicken Police",
                rip: 10,
                grip: 4
            };
            this.ripcounter_map.push(ripEntry);
            this.store.set('ripcounter_map', JSON.stringify(this.ripcounter_map));
        }
        console.log('TEST 2');
        if (this.store.has('ripcounter_settings')) {
            console.log('ripcounter_SETTINGS found');
            this.ripcounterSettings.active = JSON.parse(this.store.get('ripcounter_settings')).active;
            console.log('ripcounter active?: ' + this.ripcounterSettings.active);
            this.ripcounterSettings.rip_command_alias = JSON.parse(this.store.get('ripcounter_settings')).rip_command_alias;
            this.ripcounterSettings.addrip_command_alias = JSON.parse(this.store.get('ripcounter_settings')).addrip_command_alias;
            this.ripcounterSettings.addgrip_command_alias = JSON.parse(this.store.get('ripcounter_settings')).addgrip_command_alias;
            this.ripcounterSettings.rip_message = JSON.parse(this.store.get('ripcounter_settings')).rip_message;
            this.ripcounterSettings.addrip_message = JSON.parse(this.store.get('ripcounter_settings')).addrip_message;
            this.ripcounterSettings.addgrip_message = JSON.parse(this.store.get('ripcounter_settings')).addgrip_message;
        }
        else {
            //init ripcounter settings
            this.store.set('ripcounter_settings', JSON.stringify(this.ripcounterSettings));
        }
        console.log('TEST 3');
    }
    RipCounter.prototype.updateRipcounterSettingsSimple = function () {
        this.store.set('ripcounter_settings', JSON.stringify(this.ripcounterSettings));
    };
    RipCounter.prototype.getRipcounterMap = function () {
        return this.RipCounterMap;
    };
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
        var rip_map_save = [];
        this.RipCounterMap.forEach(function (value, key) {
            var ripEntry = {
                game: key,
                rip: value[0],
                grip: value[1]
            };
            rip_map_save.push(ripEntry);
        });
        this.store.set('ripcounter_map', JSON.stringify(rip_map_save));
    };
    RipCounter.prototype.checkRipCommand = function (message, userstate, currentGame) {
        var rip_info_map = new Map();
        rip_info_map.set('game', currentGame);
        rip_info_map.set('sender', userstate['display-name']);
        if (this.ripcounterSettings.active) {
            console.log('checkcommandSTart');
            this.ripcounterSettings.rip_command_alias.push('!rip');
            this.ripcounterSettings.addrip_command_alias.push('!addrip');
            this.ripcounterSettings.addgrip_command_alias.push('!addgrip');
            if (this.ripcounterSettings.rip_command_alias.includes(message.toLowerCase())) { //RIP
                console.log('checkcommand rip IF');
                var rips = this.getRip(currentGame);
                rip_info_map.set('rip_count', '' + rips[0]);
                rip_info_map.set('grip_count', '' + rips[1]);
                return this.generateMessage(this.ripcounterSettings.rip_message, rip_info_map);
            }
            else if (this.ripcounterSettings.addrip_command_alias.includes(message.toLowerCase())) { //ADD RIP
                console.log('checkcommand addrip IF');
                this.addRip(currentGame, 'rip');
                var rips = this.getRip(currentGame);
                rip_info_map.set('rip_count', '' + rips[0]);
                rip_info_map.set('grip_count', '' + rips[1]);
                return this.generateMessage(this.ripcounterSettings.addrip_message, rip_info_map);
            }
            else if (this.ripcounterSettings.addgrip_command_alias.includes(message.toLowerCase())) { //ADD GRAVITY RIP
                console.log('checkcommand addgrip IF');
                this.addRip(currentGame, 'grip');
                var rips = this.getRip(currentGame);
                rip_info_map.set('rip_count', '' + rips[0]);
                rip_info_map.set('grip_count', '' + rips[1]);
                return this.generateMessage(this.ripcounterSettings.addgrip_message, rip_info_map);
            }
            else {
                console.log('checkcommand ELSE');
                return "";
            }
        }
    };
    RipCounter.prototype.generateMessage = function (message, replaceList) {
        //var message = "bla bla ${test zwo} kawwabunga ${boi} whatever ${_hola}";
        //var replaceList = new Map<string, string>();
        //replaceList.set("test zwo", "hola");
        //var repMessage = "";
        var regex = /\${([^}]+)}/g; //regex for ${}
        var matchList = message.match(regex);
        console.log(matchList);
        for (var i = 0; i < matchList.length; i++) {
            var replacementWord = replaceList.get(matchList[i].replace('${', '').replace('}', ''));
            console.log(replacementWord);
            if (replacementWord != 'undefined') {
                message = message.replace(matchList[i], replacementWord);
            }
        }
        console.log(message);
        return message;
    };
    return RipCounter;
}());
exports.RipCounter = RipCounter;
//# sourceMappingURL=ripcounter.js.map