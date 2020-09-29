import { app, BrowserWindow, Tray, Menu, ipcMain, session, ipcRenderer, remote } from "electron";
import * as path from "path";
import * as url from "url";
//import { Titlebar, Color } from 'custom-electron-titlebar'
import { Credentials } from "./credentials";



let mainWindow: Electron.BrowserWindow;
let splashWindow: Electron.BrowserWindow;
//let trayIconpath = path.join(__dirname, '../assets/icons/bot_icon_no_background_16x16.png');
let trayIconOnline = path.join(__dirname, '../assets/icons/fukkenbot_icon_16x16.png');
let trayIconOffline = path.join(__dirname, '../assets/icons/fukkenbot_icon_16x16_red.png');
let systemTray: Tray = null;
let quitApplication: boolean = false;
const credentials = new Credentials();




function createWindow() {

  

  if(process.platform == "darwin"){
    // Create the browser window for mac with mac specific titlebar buttons
    mainWindow = new BrowserWindow({
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

  }else{
    // Create the browser window.
    mainWindow = new BrowserWindow({
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
      slashes: true,
  }));

  createTray();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();


  //show window when content has been loaded
  mainWindow.once('ready-to-show', () => {
    //mainWindow.show()
  })



  mainWindow.on("close", (e) => {
    //when closing process is started
    console.log('close!!! called on mainwindow');
    if(!quitApplication){
      e.preventDefault();
      mainWindow.hide();
      return false;
      }
    
    });
  


  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
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
app.on("ready", function(){
  createWindow();
  createSplashScreen();
  splashToBormalWidow();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin" && quitApplication) {
    console.log('app quit!!');
    app.quit();
  }
  
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
    
  }
});

function createTray(){
  systemTray = new Tray(trayIconOffline);
  const trayMenuTemplate = [
    {
      label: 'Settings',
      click: function () {
      console.log("Clicked on settings")
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
          app.quit()
      }
    }
  ]
       
  let trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
  systemTray.setContextMenu(trayMenu)
}

function createSplashScreen(){
  
  splashWindow = new BrowserWindow({
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

      splashWindow.on('closed', function() {
        splashWindow = null;
    });
      splashWindow.on('close', function() {
        splashWindow = null;
    });
}

function splashToBormalWidow(){
  setTimeout(() => { 
    splashWindow.close(); 
    mainWindow.show();
  }, 5000);
}

ipcMain.on('botConnected', (event:any, arg:any) => {  
  console.log(arg);
  systemTray.setImage(trayIconOnline);
});

ipcMain.on('botDisconnected', (event:any, arg:any) => {  
  console.log(arg);
  systemTray.setImage(trayIconOffline);
});

ipcMain.on('open-new-window-for-oauthentication', (event, fileName) => {
  

  let authWindow = new BrowserWindow({
        width: 800, 
        height: 600, 
        show: false, 
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false
          },
        frame: false
    });
    console.log('filename: ' + fileName.uri)

    authWindow.loadURL(fileName.uri);
    authWindow.show();

    const {session: {webRequest}} = authWindow.webContents;

    const filter = {
      urls: ['http://mrbigballs.net/*']
    };

    

    webRequest.onHeadersReceived(filter, async ({url}) => {
      console.log('onHeadersReceived: ' + url);
      let params = new URLSearchParams(url);
      let token = params.get('access_token');
      console.log('oauth token: ' + token)
      var start = url.lastIndexOf('#access_token=');
      var end = url.indexOf('&scope=');
      var token2 = url.substring(start, end).replace('#access_token=','');
      console.log('oauth token: ' + token2)
      let returnCred = {user_token: token2, user_type: fileName.user_type};
      event.sender.send('save-token', returnCred);
      authWindow.loadURL(path.join(__dirname, "../app/account_connected.html"));
      setTimeout(() => { authWindow.close(); }, 3500);
      
      
    });

    webRequest.onCompleted(filter, async ({url}) => {
      console.log('onCompleted: ' + url);
      //createAppWindow();
      //return destroyAuthWin();
    });

    webRequest.onBeforeRedirect(filter, async ({url}) => {
      console.log('onBeforeRedirect: ' + url);
      //createAppWindow();
      //return destroyAuthWin();
    });
    
    authWindow.webContents.on('will-navigate', function (event, newUrl) {
      console.log('will-navigate');
        console.log(newUrl);
        console.log(authWindow.webContents.getURL());
        // More complex code to handle tokens goes here
    });
    

    authWindow.on('closed', function() {
        authWindow = null;
    });
    authWindow.on('close', function() {
      authWindow = null;
  });
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.