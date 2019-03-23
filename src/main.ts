import { app, BrowserWindow, Tray, Menu, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";

let mainWindow: Electron.BrowserWindow;
//let trayIconpath = path.join(__dirname, '../assets/icons/bot_icon_no_background_16x16.png');
let trayIconOnline = path.join(__dirname, '../assets/icons/fukkenbot_icon_16x16.png');
let trayIconOffline = path.join(__dirname, '../assets/icons/fukkenbot_icon_16x16_red.png');
let systemTray: Tray = null;
let quitApplication: boolean = false;

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
    icon: path.join(__dirname, '../assets/icons/fukkenbot_icon_128x128_nvO_icon.ico')

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
    icon: path.join(__dirname, '../assets/icons/fukkenbot_icon_128x128_nvO_icon.ico')

    });
  }
  

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, "../app/main.html"),
      protocol: "file:",
      slashes: true,
  }));

  createTray();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();


  //show window when content has been loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
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
app.on("ready", createWindow);

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

ipcMain.on('botConnected', (event:any, arg:any) => {  
  console.log(arg);
  systemTray.setImage(trayIconOnline);
});

ipcMain.on('botDisconnected', (event:any, arg:any) => {  
  console.log(arg);
  systemTray.setImage(trayIconOffline);
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.