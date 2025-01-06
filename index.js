const { app, Menu, BrowserWindow, session, protocol, ipcMain } = require('electron');
const localShortcut = require('electron-localshortcut');
const { autoUpdater } = require("electron-updater")
const path = require('path');

//脆弱性の対策らしい？知らんけど
delete require('electron').nativeImage.createThumbnailFromPath;
if (!app.requestSingleInstanceLock()) {
    log.error('Other process(es) are already existing. Quit. If you can\'t see the window, please kill all task(s).');
    app.exit();
}
protocol.registerSchemesAsPrivileged([{
    scheme: 'slug',
    privileges: {
        secure: true,
        corsEnabled: true
    }
}])
let mainWindow = null;
let splashWindow = null;


function splash() {
    splashWindow = new BrowserWindow({
        height: 200,
        width: 400,
        title: "Penguin Cient",
        alwaysOnTop: true,
        transparent: true,
        frame: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "splash/preload.js")
        },
    });


    const update = async () => {
        let updateCheck = null
        autoUpdater.on('checking-for-update', () => {
            splashWindow.webContents.send("status", "Checking for updates...");
            updateCheck = setTimeout(() => {
                splashWindow.webContents.send("status", "Update check error!")
                setTimeout(() => {
                    createWindow()
                }, 1000);
            }, 15000);
        });
        autoUpdater.on("update-available", (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", `Found new verison v${i.version}`)
        });
        autoUpdater.on("update-not-available", () => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send('status', "You using latest version.");
            setTimeout(() => {
                createWindow();
            }, 1000);
        });

        autoUpdater.on('error', (e) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send('status', "Error!" + e.name);
            setTimeout(() => {
                createWindow();
            }, 1000);
        });
        autoUpdater.on('download-progress', (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send('status', "Downloading new version...");
        });
        autoUpdater.on('update-downloaded', (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", "Update downloaded");
            setTimeout(() => {
                autoUpdater.quitAndInstall();
            }, 1000);
        });
        autoUpdater.autoDownload = "download";
        autoUpdater.allowPrerelease = false;
        autoUpdater.checkForUpdates();
    };
    splashWindow.loadURL(path.join(__dirname, "splash/index.html"))
    splashWindow.webContents.on("did-finish-load", () => {
        splashWindow.show();
        update()
    })
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: false,
        title: "Penguin Cient",
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            contextIsolation: false,
            preload: path.join(__dirname, './preload.js'),
            enableRemoteModule: true, // オプションによっては必要な場合があります
            experimentalFeatures: true,
            enableHardwareAcceleration: true
        },
    });
    //ESCの実装。Preloadで受け取り
    localShortcut.register(mainWindow, 'Esc', () => {
        mainWindow.webContents.send('ESC');
    });
    localShortcut.register(mainWindow, 'F5', () => {
        mainWindow.reload();
    });
    localShortcut.register(mainWindow, 'F12', () => {
        mainWindow.webContents.openDevTools();
    });
    localShortcut.register(mainWindow, 'F6', () => {
        mainWindow.loadURL("https://krunker.io");
    });
    mainWindow.fullScreen = true;
    mainWindow.setTitle('いんぱくとの煮込みカレー')
    mainWindow.loadURL('https://krunker.io');

    Menu.setApplicationMenu(null);

    ipcMain.on('exitClient', () => {
        app.exit();
    });
    app.on('window-all-closed', () => {
        app.quit()
    })
    app.on('will-quit', () => {
        localShortcut.unregisterAll();
    });
    mainWindow.once("ready-to-show", () => {
        splashWindow.destroy();
        mainWindow.show();
    });
}


app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('in-process-gpu');
// app.commandLine.appendSwitch('ignore-gpu-blocklist');
// app.commandLine.appendSwitch('enable-quic');
// app.commandLine.appendSwitch('enable-gpu-rasterization');

const rejectList = require('./reject.json').urls;

app.on('ready', () => {
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        const url = details.url
        if (rejectList.some(domain => url.includes(domain))) {
            callback({ cancel: true })
            console.log(`Blocked ${url}`)
        } else {
            callback({ cancel: false })
            console.log(`Allowed ${url}`)
        }
    });
});

app.whenReady().then(() => {
    splash();
});

// App
app.on('ready', () => {
    protocol.registerFileProtocol('slug', (request, callback) => callback(decodeURI(request.url.replace(/^slug:\//, ''))));
})

ipcMain.handle("appVer", () => {
    const version = app.getVersion();
    return version;
});