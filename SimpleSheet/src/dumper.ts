import { writeFile } from 'fs'
import { join as joinPaths } from 'path'

class Dumper {
    private static folder_path: string = '../save'
    private file_name: string
    constructor(file_name: string = 'data.csv') {
        this.file_name = file_name
    }

    receive(data: string): Promise<boolean> {
        console.log(`Main@Dumper> Received data to save: ${data.length}`)
        return new Promise((resolve, _) => {
            const file_path = joinPaths(__dirname, `${Dumper.folder_path}/${this.file_name}`)
            writeFile(file_path, data, 'utf-8', (err) => {
                if (err === null) {
                    resolve(true)
                } else {
                    console.log(`Main@Dumper> ${err}`)
                    resolve(false)
                }
            })
        })
    }
}

export { Dumper }
