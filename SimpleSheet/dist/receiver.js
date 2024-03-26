"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receiver = void 0;
const net_1 = require("net");
class Receiver {
    constructor(window, host = 'localhost', port = 11451) {
        this.window = window;
        this.host = host;
        this.port = port;
        this.server = null;
    }
    start() {
        try {
            if (this.server === null) {
                this.server = (0, net_1.createServer)((socket) => {
                    socket.on('data', (data) => {
                        console.log(`Main@Receiver> Received data.`);
                        this.window.webContents.send('update', data.toString('utf-8'));
                    });
                });
            }
            this.server.listen(this.port, this.host);
            console.log(`Main@Receiver> Started.`);
        }
        catch (_a) { }
    }
    stop() {
        if (this.server === null) {
            return;
        }
        this.server.close();
    }
}
exports.Receiver = Receiver;
