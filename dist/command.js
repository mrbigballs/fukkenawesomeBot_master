"use strict";
exports.__esModule = true;
var Command = /** @class */ (function () {
    function Command(triggers) {
        this.triggers = [];
        this.message = '';
        this.cooldown = false;
        this.cooldowntime = 0;
        this.parameters = []; //eg. <wurst> etc.
        this.triggers = triggers;
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
        setTimeout(this.setCooldownState(false), this.cooldowntime);
    };
    return Command;
}());
exports.Command = Command;
//# sourceMappingURL=command.js.map