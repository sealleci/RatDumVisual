declare interface Window {
    api: {
        onUpdate: (fn: (data: string) => void) => void,
        send: (data: string) => Promise<boolean>
    }
}