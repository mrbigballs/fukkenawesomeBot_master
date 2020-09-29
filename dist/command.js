"use strict";
exports.__esModule = true;
exports.Command = void 0;
var Command = /** @class */ (function () {
    function Command(triggers, message, cooldowntime, parameters) {
        if (message === void 0) { message = ''; }
        if (cooldowntime === void 0) { cooldowntime = 60; }
        if (parameters === void 0) { parameters = []; }
        this.triggers = [];
        this.message = '';
        this.cooldown = false;
        this.cooldowntime = 0;
        this.parameters = []; //eg. <wurst> etc.
        this.triggers = triggers;
        this.message = message;
        this.cooldowntime = cooldowntime;
        this.parameters = parameters;
    }
    Command.prototype.hasTriggerAlias = function (triggers) {
        if (triggers.length = 1) {
            return false;
        }
        else {
            return true;
        }
    };
    Command.prototype.containsTrigger = function (triggerKeyword) {
        for (var _i = 0, _a = this.triggers; _i < _a.length; _i++) {
            var trigger = _a[_i];
            if (trigger.toLowerCase() == triggerKeyword.toLocaleLowerCase()) {
                return true;
            }
        }
        return false;
    };
    Command.prototype.setCooldownState = function (coolDown) {
        this.cooldown = coolDown;
    };
    Command.prototype.runCooldownTimer = function () {
        //setTimeout(this.setCooldownState(false), this.cooldowntime);
    };
    return Command;
}());
exports.Command = Command;
//# sourceMappingURL=command.js.map