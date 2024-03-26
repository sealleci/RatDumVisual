import { BrowserWindow } from 'electron'
import { Server, createServer } from 'net'


class Receiver {
    private window: BrowserWindow
    private host: string
    private port: number
    private server: Server | null

    constructor(window: BrowserWindow, host: string = 'localhost', port: number = 11451) {
        this.window = window
        this.host = host
        this.port = port
        this.server = null
    }

    start() {
        try {
            if (this.server === null) {
                this.server = createServer((socket) => {
                    socket.on('data', (data) => {
                        console.log(`Main@Receiver> Received data.`)
                        this.window.webContents.send('update', data.toString('utf-8'))
                    })
                })
            }

            this.server.listen(this.port, this.host)
            console.log(`Main@Receiver> Started.`)
        } catch { }
    }

    stop() {
        if (this.server === null) {
            return
        }

        this.server.close()
    }
}

export { Receiver }
