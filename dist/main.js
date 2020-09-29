"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
//import { Titlebar, Color } from 'custom-electron-titlebar'
var credentials_1 = require("./credentials");
var mainWindow;
var splashWindow;
//let trayIconpath = path.join(__dirname, '../assets/icons/bot_icon_no_background_16x16.png');
var trayIconOnline = path.join(__dirname, '../assets/icons/fukkenbot_icon_16x16.png');
var trayIconOffline = path.join(__dirname, '../assets/icons/fukkenbot_icon_16x16_red.png');
var systemTray = null;
var quitApplication = false;
var credentials = new credentials_1.Credentials();
function createWindow() {
    if (process.platform == "darwin") {
        // Create the browser window for mac with mac specific titlebar buttons
        mainWindow = new electron_1.BrowserWindow({
            backgroundColor: '#242424',
            titleBarStyle: 'hidden',
            frame: true,
            show: false,
            height: 720,
            width: 900,
            minHeight: 500,
            minWidth: 400,
            icon: path.join(__dirname, '../assets/icons/fukkenbot_icon_128x128_nvO_icon.ico'),
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });
    }
    else {
        // Create the browser window.
        mainWindow = new electron_1.BrowserWindow({
            backgroundColor: '#242424',
            frame: false,
            show: false,
            height: 720,
            width: 900,
            minHeight: 500,
            minWidth: 400,
            icon: path.join(__dirname, '../assets/icons/fukkenbot_icon_128x128_nvO_icon.ico'),
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });
    }
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        //pathname: path.join(__dirname, "../app/main.html"),
        pathname: path.join(__dirname, "../app/main_grid.html"),
        protocol: "file:",
        slashes: true
    }));
    createTray();
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    //show window when content has been loaded
    mainWindow.once('ready-to-show', function () {
        //mainWindow.show()
    });
    mainWindow.on("close", function (e) {
        //when closing process is started
        console.log('close!!! called on mainwindow');
        if (!quitApplication) {
            e.preventDefault();
            mainWindow.hide();
            return false;
        }
    });
    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        //mainWindow = null;
        console.log('closeedddd!!1 called on mainwindow');
        //if(!app.quit){
        //event.preventDefault();
        //createTray();
        //mainWindow.hide();
        //}
        //return false;
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on("ready", createWindow);
electron_1.app.on("ready", function () {
    createWindow();
    createSplashScreen();
    splashToBormalWidow();
});
// Quit when all windows are closed.
electron_1.app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin" && quitApplication) {
        console.log('app quit!!');
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
function createTray() {
    systemTray = new electron_1.Tray(trayIconOffline);
    var trayMenuTemplate = [
        {
            label: 'Settings',
            click: function () {
                console.log("Clicked on settings");
            }
        },
        {
            label: 'Open',
            click: function () {
                mainWindow.show();
                //createWindow();
            }
        },
        {
            label: 'Quit', click: function () {
                quitApplication = true;
                electron_1.app.quit();
            }
        }
    ];
    var trayMenu = electron_1.Menu.buildFromTemplate(trayMenuTemplate);
    systemTray.setContextMenu(trayMenu);
}
function createSplashScreen() {
    splashWindow = new electron_1.BrowserWindow({
        backgroundColor: '#242424',
        frame: false,
        show: false,
        height: 360,
        width: 640,
        icon: path.join(__dirname, '../assets/icons/fukkenbot_icon_128x128_nvO_icon.ico'),
        webPreferences: {
            nodeIntegration: true
        }
    });
    splashWindow.loadURL(path.join(__dirname, "../app/splash_screen_01.html"));
    splashWindow.show();
    splashWindow.on('closed', function () {
        splashWindow = null;
    });
    splashWindow.on('close', function () {
        splashWindow = null;
    });
}
function splashToBormalWidow() {
    setTimeout(function () {
        splashWindow.close();
        mainWindow.show();
    }, 5000);
}
electron_1.ipcMain.on('botConnected', function (event, arg) {
    console.log(arg);
    systemTray.setImage(trayIconOnline);
});
electron_1.ipcMain.on('botDisconnected', function (event, arg) {
    console.log(arg);
    systemTray.setImage(trayIconOffline);
});
electron_1.ipcMain.on('open-new-window-for-oauthentication', function (event, fileName) {
    var authWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false
        },
        frame: false
    });
    console.log('filename: ' + fileName.uri);
    authWindow.loadURL(fileName.uri);
    authWindow.show();
    var webRequest = authWindow.webContents.session.webRequest;
    var filter = {
        urls: ['http://mrbigballs.net/*']
    };
    webRequest.onHeadersReceived(filter, function (_a) {
        var url = _a.url;
        return __awaiter(void 0, void 0, void 0, function () {
            var params, token, start, end, token2, returnCred;
            return __generator(this, function (_b) {
                console.log('onHeadersReceived: ' + url);
                params = new URLSearchParams(url);
                token = params.get('access_token');
                console.log('oauth token: ' + token);
                start = url.lastIndexOf('#access_token=');
                end = url.indexOf('&scope=');
                token2 = url.substring(start, end).replace('#access_token=', '');
                console.log('oauth token: ' + token2);
                returnCred = { user_token: token2, user_type: fileName.user_type };
                event.sender.send('save-token', returnCred);
                authWindow.loadURL(path.join(__dirname, "../app/account_connected.html"));
                setTimeout(function () { authWindow.close(); }, 3500);
                return [2 /*return*/];
            });
        });
    });
    webRequest.onCompleted(filter, function (_a) {
        var url = _a.url;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                console.log('onCompleted: ' + url);
                return [2 /*return*/];
            });
        });
    });
    webRequest.onBeforeRedirect(filter, function (_a) {
        var url = _a.url;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                console.log('onBeforeRedirect: ' + url);
                return [2 /*return*/];
            });
        });
    });
    authWindow.webContents.on('will-navigate', function (event, newUrl) {
        console.log('will-navigate');
        console.log(newUrl);
        console.log(authWindow.webContents.getURL());
        // More complex code to handle tokens goes here
    });
    authWindow.on('closed', function () {
        authWindow = null;
    });
    authWindow.on('close', function () {
        authWindow = null;
    });
});
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
//# sourceMappingURL=main.js.map