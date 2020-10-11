"use strict";
exports.__esModule = true;
exports.OBSConnection = void 0;
var OBSWebSocket = require('obs-websocket-js');
var OBSConnection = /** @class */ (function () {
    function OBSConnection() {
        this.obs = new OBSWebSocket();
        this.obs.connect({ address: 'localhost:4444', password: '' });
        this.obs.on('SwitchScenes', function (data) {
            console.log('No IDEA Waht im doing');
            console.log('SwitchScenes', data);
        });
        this.obs.on('error', function (err) {
            console.error('socket error:', err);
        });
    }
    return OBSConnection;
}());
exports.OBSConnection = OBSConnection;
//# sourceMappingURL=obs_connection.js.map