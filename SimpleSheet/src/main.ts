import { app, BrowserWindow, ipcMain } from 'electron'
import { join as joinPaths } from 'path'

import { Dumper } from './dumper'
import { Receiver } from './receiver'

let main_window: Electron.BrowserWindow | null

function createWindow(): BrowserWindow {
    const new_window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: joinPaths(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
    })
    new_window.loadFile(joinPaths(__dirname, '../html/index.html'))
    new_window.on('closed', () => {
        main_window = null
    })

    return new_window
};

(async () => {
    try {
        app.on('ready', () => {
            main_window = createWindow()
            const receiver = new Receiver(main_window)
            const dumper = new Dumper()
            receiver.start()
            ipcMain.on('save', (event, data: string) => {
                dumper.receive(data).then((is_successed) => {
                    event.reply('save-response', is_successed)
                })
            })
        })
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })
        app.on('activate', async () => {
            if (main_window === null) {
                main_window = createWindow()
            }
        })
    } catch { }
})()
