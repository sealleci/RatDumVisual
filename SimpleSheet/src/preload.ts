import { contextBridge, ipcRenderer } from 'electron'

(async () => {
    contextBridge.exposeInMainWorld('api', {
        onUpdate: (fn: (raw_data: string) => void) => {
            ipcRenderer.on('update', (_, received_data: string) => {
                fn(received_data)
            })
        },
        send: (data: string) => {
            return new Promise<boolean>((resolve, _) => {
                ipcRenderer.once('save-response', (_, is_successed: boolean) => {
                    resolve(is_successed)
                })
                ipcRenderer.send('save', data)
            })
        }
    })
})()
