"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
(async () => {
    electron_1.contextBridge.exposeInMainWorld('api', {
        onUpdate: (fn) => {
            electron_1.ipcRenderer.on('update', (_, received_data) => {
                fn(received_data);
            });
        },
        send: (data) => {
            return new Promise((resolve, _) => {
                electron_1.ipcRenderer.once('save-response', (_, is_successed) => {
                    resolve(is_successed);
                });
                electron_1.ipcRenderer.send('save', data);
            });
        }
    });
})();
