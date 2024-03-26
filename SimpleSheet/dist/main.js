"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const dumper_1 = require("./dumper");
const receiver_1 = require("./receiver");
let main_window;
function createWindow() {
    const new_window = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: (0, path_1.join)(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
    });
    new_window.loadFile((0, path_1.join)(__dirname, '../html/index.html'));
    new_window.on('closed', () => {
        main_window = null;
    });
    return new_window;
}
;
(async () => {
    try {
        electron_1.app.on('ready', () => {
            main_window = createWindow();
            const receiver = new receiver_1.Receiver(main_window);
            const dumper = new dumper_1.Dumper();
            receiver.start();
            electron_1.ipcMain.on('save', (event, data) => {
                dumper.receive(data).then((is_successed) => {
                    event.reply('save-response', is_successed);
                });
            });
        });
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                electron_1.app.quit();
            }
        });
        electron_1.app.on('activate', async () => {
            if (main_window === null) {
                main_window = createWindow();
            }
        });
    }
    catch (_a) { }
})();
