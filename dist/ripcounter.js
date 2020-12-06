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
            setrip_command_alias: [""],
            setgrip_command_alias: [""],
            rip_role_mod: false,
            rip_role_sub: false,
            rip_role_super: false,
            addrip_role_mod: false,
            addrip_role_sub: false,
            addrip_role_super: false,
            addgrip_role_mod: false,
            addgrip_role_sub: false,
            addgrip_role_super: false,
            setrip_role_mod: false,
            setrip_role_sub: false,
            setrip_role_super: false,
            setgrip_role_mod: false,
            setgrip_role_sub: false,
            setgrip_role_super: false,
            rip_message: "",
            addrip_message: "",
            addgrip_message: "",
            setrip_message: "",
            setgrip_message: "",
            rip_cooldown: 30
        };
        this.cooldown = false;
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
            //roles
            //rip
            this.ripcounterSettings.rip_role_mod = JSON.parse(this.store.get('ripcounter_settings')).rip_role_mod;
            this.ripcounterSettings.rip_role_sub = JSON.parse(this.store.get('ripcounter_settings')).rip_role_sub;
            this.ripcounterSettings.rip_role_super = JSON.parse(this.store.get('ripcounter_settings')).rip_role_super;
            //addrip
            this.ripcounterSettings.addrip_role_mod = JSON.parse(this.store.get('ripcounter_settings')).addrip_role_mod;
            this.ripcounterSettings.addrip_role_sub = JSON.parse(this.store.get('ripcounter_settings')).addrip_role_sub;
            this.ripcounterSettings.addrip_role_super = JSON.parse(this.store.get('ripcounter_settings')).addrip_role_super;
            //addgrip
            this.ripcounterSettings.addgrip_role_mod = JSON.parse(this.store.get('ripcounter_settings')).addgrip_role_mod;
            this.ripcounterSettings.addgrip_role_sub = JSON.parse(this.store.get('ripcounter_settings')).addgrip_role_sub;
            this.ripcounterSettings.addgrip_role_super = JSON.parse(this.store.get('ripcounter_settings')).addgrip_role_super;
            //setgrip
            this.ripcounterSettings.setrip_role_mod = JSON.parse(this.store.get('ripcounter_settings')).setrip_role_mod;
            this.ripcounterSettings.setrip_role_sub = JSON.parse(this.store.get('ripcounter_settings')).setrip_role_sub;
            this.ripcounterSettings.setrip_role_super = JSON.parse(this.store.get('ripcounter_settings')).setrip_role_super;
            //setgrip
            this.ripcounterSettings.setgrip_role_mod = JSON.parse(this.store.get('ripcounter_settings')).setgrip_role_mod;
            this.ripcounterSettings.setgrip_role_sub = JSON.parse(this.store.get('ripcounter_settings')).setgrip_role_sub;
            this.ripcounterSettings.setgrip_role_super = JSON.parse(this.store.get('ripcounter_settings')).setgrip_role_super;
            //aliases
            this.ripcounterSettings.rip_command_alias = JSON.parse(this.store.get('ripcounter_settings')).rip_command_alias;
            this.ripcounterSettings.addrip_command_alias = JSON.parse(this.store.get('ripcounter_settings')).addrip_command_alias;
            this.ripcounterSettings.addgrip_command_alias = JSON.parse(this.store.get('ripcounter_settings')).addgrip_command_alias;
            this.ripcounterSettings.setrip_command_alias = JSON.parse(this.store.get('ripcounter_settings')).setrip_command_alias;
            this.ripcounterSettings.setgrip_command_alias = JSON.parse(this.store.get('ripcounter_settings')).setgrip_command_alias;
            //messages
            this.ripcounterSettings.rip_message = JSON.parse(this.store.get('ripcounter_settings')).rip_message;
            this.ripcounterSettings.addrip_message = JSON.parse(this.store.get('ripcounter_settings')).addrip_message;
            this.ripcounterSettings.addgrip_message = JSON.parse(this.store.get('ripcounter_settings')).addgrip_message;
            this.ripcounterSettings.setrip_message = JSON.parse(this.store.get('ripcounter_settings')).setrip_message;
            this.ripcounterSettings.setgrip_message = JSON.parse(this.store.get('ripcounter_settings')).setgrip_message;
            //cooldown
            this.ripcounterSettings.rip_cooldown = JSON.parse(this.store.get('ripcounter_settings')).rip_cooldown;
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
    RipCounter.prototype.getAllRips = function (type) {
        var all_rips = 0;
        this.RipCounterMap.forEach(function (value, key) {
            if (type == 'grip') {
                all_rips += value[1];
            }
            else {
                all_rips += value[0];
            }
        });
        return all_rips;
    };
    RipCounter.prototype.updateRipcounterMapByGame = function (game, rip, grip) {
        //console.log('game: ' + game + ' rip: ' + rip + ' grip: ' + grip);
        if (this.RipCounterMap.has(game)) {
            this.RipCounterMap.set(game, [rip, grip]);
            this.saveRipMap();
        }
    };
    RipCounter.prototype.deleteEntryFromRipcounterMapByGame = function (game) {
        if (this.RipCounterMap.has(game)) {
            this.RipCounterMap["delete"](game);
            this.saveRipMap();
        }
    };
    RipCounter.prototype.activateCooldown = function () {
        var _this = this;
        if (this.ripcounterSettings.rip_cooldown > 0) {
            this.cooldown = true;
            setTimeout(function () {
                _this.cooldown = false;
            }, this.ripcounterSettings.rip_cooldown * 1000);
        }
    };
    RipCounter.prototype.canUse = function (userstate, mod_only, sub_only, isrip, isWhisper) {
        console.log(userstate);
        var badges = userstate.badges;
        console.log('can _USE: mod:' + mod_only + ' sub:' + sub_only + ' isrip:' + isrip + ' sooldown:' + this.cooldown);
        if (badges != null) { //check if broadaster
            if (badges.hasOwnProperty('broadcaster')) {
                return true;
            }
        }
        else if (userstate['mod']) { //check if mod
            return true;
        }
        else if (sub_only && userstate['subscriber'] && !this.cooldown && isrip) { //subonly = true, cooldown = false
            return true;
        }
        else if (sub_only && userstate['subscriber'] && !isrip) { //subonly = true
            return true;
        }
        else if (!mod_only && !sub_only && !this.cooldown) {
            return true;
        }
        else if (!mod_only && !sub_only && this.cooldown && isWhisper) {
            return true;
        }
        else if (!mod_only && !sub_only && !isrip) {
            return true;
        }
        else {
            return false;
        }
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
        //for testing
        this.RipCounterMap.forEach(function (value, key) {
            console.log('key: ' + key);
        });
        if (this.RipCounterMap.has(currentGame)) {
            console.log('game known');
            return this.RipCounterMap.get(currentGame);
        }
        else {
            console.log('new game');
            var newgame = [0, 0];
            return newgame;
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
    RipCounter.prototype.checkRipCommand = function (message, userstate, currentGame, isWhisper) {
        var rip_info_map = new Map();
        rip_info_map.set('game', currentGame);
        rip_info_map.set('sender', userstate['display-name']);
        if (this.ripcounterSettings.active) {
            console.log('checkcommandSTart');
            this.ripcounterSettings.rip_command_alias.push('!rip');
            this.ripcounterSettings.addrip_command_alias.push('!addrip');
            this.ripcounterSettings.addgrip_command_alias.push('!addgrip');
            this.ripcounterSettings.setrip_command_alias.push('!setrip');
            this.ripcounterSettings.setgrip_command_alias.push('!setgrip');
            if (this.ripcounterSettings.rip_command_alias.includes(message.toLowerCase())) { //RIP
                console.log('checkcommand rip IF');
                if (this.canUse(userstate, this.ripcounterSettings.rip_role_mod, this.ripcounterSettings.rip_role_sub, true, isWhisper)) { //check if roles match & cooldown is false
                    var rips = this.getRip(currentGame);
                    console.log('lets test that ' + rips[0]);
                    rip_info_map.set('rip_count', '' + rips[0]);
                    rip_info_map.set('grip_count', '' + rips[1]);
                    if (!userstate['mod'] && !isWhisper) {
                        this.activateCooldown();
                    }
                    var command_reply = {
                        message: this.generateMessage(this.ripcounterSettings.rip_message, rip_info_map),
                        updateui: false
                    };
                    return command_reply;
                }
            }
            else if (this.ripcounterSettings.addrip_command_alias.includes(message.toLowerCase())) { //ADD RIP
                console.log('checkcommand addrip IF');
                if (this.canUse(userstate, this.ripcounterSettings.addrip_role_mod, this.ripcounterSettings.addrip_role_sub, false, isWhisper)) { //check if roles match
                    this.addRip(currentGame, 'rip');
                    var rips = this.getRip(currentGame);
                    rip_info_map.set('rip_count', '' + rips[0]);
                    rip_info_map.set('grip_count', '' + rips[1]);
                    var command_reply = {
                        message: this.generateMessage(this.ripcounterSettings.addrip_message, rip_info_map),
                        updateui: true
                    };
                    return command_reply;
                }
            }
            else if (this.ripcounterSettings.addgrip_command_alias.includes(message.toLowerCase())) { //ADD GRAVITY RIP
                console.log('checkcommand addgrip IF');
                if (this.canUse(userstate, this.ripcounterSettings.addgrip_role_mod, this.ripcounterSettings.addgrip_role_sub, false, isWhisper)) { //check if roles match
                    this.addRip(currentGame, 'grip');
                    var rips = this.getRip(currentGame);
                    rip_info_map.set('rip_count', '' + rips[0]);
                    rip_info_map.set('grip_count', '' + rips[1]);
                    var command_reply = {
                        message: this.generateMessage(this.ripcounterSettings.addgrip_message, rip_info_map),
                        updateui: true
                    };
                    return command_reply;
                }
            }
            else if (this.ripcounterSettings.setrip_command_alias.includes(message.toLowerCase().split(' ')[0])) { //ADD RIP
                if (message.toLowerCase().split(' ')[1] != 'undefined' && !isNaN(parseInt(message.toLowerCase().split(' ')[1]))) { //check if !setrip has parameter & parameter is number
                    if (this.canUse(userstate, this.ripcounterSettings.setrip_role_mod, this.ripcounterSettings.setrip_role_sub, false, isWhisper)) { //check if roles match
                        var new_rip_count = parseInt(message.toLowerCase().split(' ')[1]);
                        this.setRip(currentGame, 'rip', new_rip_count);
                        var rips = this.getRip(currentGame);
                        rip_info_map.set('rip_count', '' + rips[0]);
                        rip_info_map.set('grip_count', '' + rips[1]);
                        var command_reply = {
                            message: this.generateMessage(this.ripcounterSettings.setrip_message, rip_info_map),
                            updateui: true
                        };
                        return command_reply;
                    }
                }
            }
            else if (this.ripcounterSettings.setgrip_command_alias.includes(message.toLowerCase().split(' ')[0])) { //ADD RIP
                if (message.toLowerCase().split(' ')[1] != 'undefined' && !isNaN(parseInt(message.toLowerCase().split(' ')[1]))) { //check if !setrip has parameter & parameter is number
                    if (this.canUse(userstate, this.ripcounterSettings.setgrip_role_mod, this.ripcounterSettings.setgrip_role_sub, false, isWhisper)) { //check if roles match
                        var new_rip_count = parseInt(message.toLowerCase().split(' ')[1]);
                        this.setRip(currentGame, 'grip', new_rip_count);
                        var rips = this.getRip(currentGame);
                        rip_info_map.set('rip_count', '' + rips[0]);
                        rip_info_map.set('grip_count', '' + rips[1]);
                        var command_reply = {
                            message: this.generateMessage(this.ripcounterSettings.setgrip_message, rip_info_map),
                            updateui: true
                        };
                        return command_reply;
                    }
                }
            }
            else {
                console.log('checkcommand ELSE');
                var command_reply = {
                    message: "Error",
                    updateui: false
                };
                return command_reply;
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