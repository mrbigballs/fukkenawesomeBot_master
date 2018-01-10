import { app, BrowserWindow, Tray, Menu } from "electron";
import * as path from "path";
import * as url from "url";

let mainWindow: Electron.BrowserWindow;
let trayIconpath = path.join(__dirname, '../assets/icons/bot_icon_no_background_16x16.png');
let systemTray: Tray = null;
let quitApplication: boolean = false;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: false,
    height: 720,
    width: 900,
    icon: path.join(__dirname, '../assets/icons/bot_icon_no_background_128x128.ico')

  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, "../app/main.html"),
      protocol: "file:",
      slashes: true,
  }));

  createTray();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

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
  systemTray = new Tray(trayIconpath);
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.