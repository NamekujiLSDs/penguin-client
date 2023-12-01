const { app, Menu, BrowserWindow, protocol, ipcMain } = require('electron');
const localShortcut = require('electron-localshortcut');
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

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        title: "いんぱくとの煮込みカレー",
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
}
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('in-process-gpu');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('enable-gpu-rasterization');

app.on('ready', () => {
    createWindow();
});

// App
app.on('ready', () => {
    protocol.registerFileProtocol('slug', (request, callback) => callback(decodeURI(request.url.replace(/^slug:\//, ''))));
})