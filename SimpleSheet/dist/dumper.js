"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dumper = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class Dumper {
    constructor(file_name = 'data.csv') {
        this.file_name = file_name;
    }
    receive(data) {
        console.log(`Main@Dumper> Received data to save: ${data.length}`);
        return new Promise((resolve, _) => {
            const file_path = (0, path_1.join)(__dirname, `${Dumper.folder_path}/${this.file_name}`);
            (0, fs_1.writeFile)(file_path, data, 'utf-8', (err) => {
                if (err === null) {
                    resolve(true);
                }
                else {
                    console.log(`Main@Dumper> ${err}`);
                    resolve(false);
                }
            });
        });
    }
}
exports.Dumper = Dumper;
Dumper.folder_path = '../save';
