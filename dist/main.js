"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var mainWindow;
//let trayIconpath = path.join(__dirname, '../assets/icons/bot_icon_no_background_16x16.png');
var trayIconOnline = path.join(__dirname, '../assets/icons/fukkenbot_icon_16x16.png');
var trayIconOffline = path.join(__dirname, '../assets/icons/fukkenbot_icon_16x16_red.png');
var systemTray = null;
var quitApplication = false;
function createWindow() {
    if (process.platform == "darwin") {
        // Create the browser window for mac with mac specific titlebar buttons
        mainWindow = new electron_1.BrowserWindow({
            titleBarStyle: 'hidden',
            frame: true,
            height: 720,
            width: 900,
            icon: path.join(__dirname, '../assets/icons/fukkenbot_icon_128x128_nvO_icon.ico')
        });
    }
    else {
        // Create the browser window.
        mainWindow = new electron_1.BrowserWindow({
            frame: false,
            height: 720,
            width: 900,
            icon: path.join(__dirname, '../assets/icons/fukkenbot_icon_128x128_nvO_icon.ico')
        });
    }
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "../app/main.html"),
        protocol: "file:",
        slashes: true
    }));
    createTray();
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
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
electron_1.app.on("ready", createWindow);
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
electron_1.ipcMain.on('botConnected', function (event, arg) {
    console.log(arg);
    systemTray.setImage(trayIconOnline);
});
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here. 
//# sourceMappingURL=main.js.map