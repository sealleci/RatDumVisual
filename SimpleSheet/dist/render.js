"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _SaveButton_is_handling_accessor_storage;
function clearChildren(elm) {
    for (const child of Array.from(elm.childNodes)) {
        elm.removeChild(child);
    }
}
function isPrimitiveType(value) {
    return typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'undefined' ||
        value === null;
}
function formatNumber(value) {
    if (Math.floor(value) === value) {
        return value.toString();
    }
    return value.toFixed(2).toString();
}
class Sheet {
    constructor() {
        this.sheet_elm = document.querySelector('#sheet');
        this.records = [];
        this.keys_to_iter = [];
        this.header_field_names = [];
        this.is_first_time = true;
        this.clearTableHeader();
        this.clearTableBody();
    }
    clearTableHeader() {
        clearChildren(this.sheet_elm.querySelector('.sheet__header'));
    }
    clearTableBody() {
        clearChildren(this.sheet_elm.querySelector('.sheet__body'));
    }
    static createColumn(tag_name, class_list = [], inner_text = '') {
        const new_elm = document.createElement(tag_name);
        new_elm.classList.add(...class_list);
        new_elm.innerText = inner_text;
        return new_elm;
    }
    static createRow(items_of_one_row) {
        const tr_elm = document.createElement('tr');
        tr_elm.classList.add('sheet__row');
        for (const item_value of items_of_one_row.map(x => typeof x === 'undefined' || x === null ? '' :
            typeof x === 'number' ? formatNumber(x) : x.toString())) {
            tr_elm.appendChild(Sheet.createColumn('td', ['sheet__col'], item_value));
        }
        return tr_elm;
    }
    updateHeader() {
        const sheet_header_elm = this.sheet_elm.querySelector('.sheet__header');
        this.clearTableHeader();
        sheet_header_elm.appendChild(Sheet.createRow(this.header_field_names));
    }
    inesrtRecord(record_items) {
        const sheet_body_elm = this.sheet_elm.querySelector('.sheet__body');
        const new_row = Sheet.createRow(record_items);
        if (sheet_body_elm.firstChild !== null) {
            sheet_body_elm.insertBefore(new_row, sheet_body_elm.firstChild);
        }
        else {
            sheet_body_elm.appendChild(new_row);
        }
    }
    insertBatch(data_of_rows) {
        for (const record_items of data_of_rows) {
            this.inesrtRecord(record_items);
        }
    }
    augmentRecordColumns() {
        const sheet_body_elm = this.sheet_elm.querySelector('.sheet__body');
        const row_elm_list = Array.from(sheet_body_elm.querySelectorAll('.sheet__row'));
        for (const row_elm of row_elm_list) {
            const diff = this.header_field_names.length - row_elm.childNodes.length;
            if (diff <= 0) {
                continue;
            }
            for (let i = 0; i < diff; i += 1) {
                row_elm.appendChild(Sheet.createColumn('td', ['sheet__col']));
            }
        }
    }
    parseKeysToIter(json_data) {
        const keys_field_name = 'keys_to_iter';
        if (!(keys_field_name in json_data)) {
            return;
        }
        if (!(Array.isArray(json_data[keys_field_name]))) {
            return;
        }
        this.keys_to_iter = json_data[keys_field_name].map(x => Array.isArray(x) ?
            x.map(y => typeof y === 'string' ? y : '') :
            [typeof x === 'string' ? x : '']);
        this.is_first_time = false;
    }
    static rectifyRecord(raw_record) {
        function handleSpecificalValue(value) {
            return typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean' ?
                value.toString() :
                Array.isArray(value) ?
                    handleArray(value) :
                    typeof value === 'object' ?
                        handleObject(value) :
                        '';
        }
        function handleObject(object_field) {
            const kv_list = [];
            for (const key of Object.keys(object_field)) {
                const value = object_field[key];
                kv_list.push(`${key}:${handleSpecificalValue(value)}`);
            }
            return '{' + kv_list.join('') + '}';
        }
        function handleArray(array_field) {
            return '[' + array_field.map(x => handleSpecificalValue(x)).join(',') + ']';
        }
        const rectified_record = {};
        for (const key of Object.keys(raw_record)) {
            const value = raw_record[key];
            rectified_record[key] =
                isPrimitiveType(value) ?
                    value :
                    typeof value === 'object' ?
                        handleObject(value) :
                        Array.isArray(value) ?
                            handleArray(value) :
                            undefined;
        }
        return rectified_record;
    }
    extractRecords(data) {
        const records = [];
        for (const key_group of this.keys_to_iter) {
            let raw_record = data;
            let is_valid = true;
            for (const key of key_group) {
                if (!(key in raw_record)) {
                    is_valid = false;
                    break;
                }
                raw_record = raw_record[key];
            }
            if (is_valid && Array.isArray(raw_record)) {
                records.push(...raw_record.map(x => typeof x === 'object' ?
                    Sheet.rectifyRecord(x) :
                    {}));
            }
        }
        return records;
    }
    static assembleHeader(records) {
        const result = [];
        for (const record of records) {
            for (const key of Object.keys(record)) {
                if (result.indexOf(key) === -1) {
                    result.push(key);
                }
            }
        }
        return result;
    }
    compareHeader(another_header_field_names) {
        if (another_header_field_names.length !== this.header_field_names.length) {
            return false;
        }
        for (let i = 0; i < another_header_field_names.length; i += 1) {
            if (this.header_field_names.indexOf(another_header_field_names[i]) === -1) {
                return false;
            }
        }
        return true;
    }
    augmentHeader(another_header_field_names) {
        for (const field_names of another_header_field_names) {
            if (this.header_field_names.indexOf(field_names) === -1) {
                this.header_field_names.push(field_names);
            }
        }
    }
    getOrderedValues(record) {
        const result = [];
        for (const field_name of this.header_field_names) {
            if (field_name in record) {
                result.push(record[field_name]);
            }
            else {
                result.push(undefined);
            }
        }
        return result;
    }
    onUpdate(data) {
        try {
            const json_data = JSON.parse(data);
            if (this.is_first_time) {
                this.parseKeysToIter(json_data);
            }
            if (!('data' in json_data)) {
                return;
            }
            const records = this.extractRecords(json_data['data']);
            const cur_header_field_names = Sheet.assembleHeader(records);
            if (!this.compareHeader(cur_header_field_names) &&
                cur_header_field_names.length >= this.header_field_names.length) {
                this.augmentHeader(cur_header_field_names);
                this.updateHeader();
                this.augmentRecordColumns();
            }
            this.records.push(...records);
            this.insertBatch(records.map(x => this.getOrderedValues(x)));
        }
        catch (e) {
            console.log(`Render@Sheet> Failed to parse data: ${e}`);
        }
    }
    orderMapForRecord(record) {
        const result = [];
        for (const field_name of this.header_field_names) {
            if (field_name in record) {
                const value = record[field_name];
                result.push(typeof value === 'undefined' || value === null ? '' : value.toString());
            }
            else {
                result.push('');
            }
        }
        return result;
    }
    getSave() {
        return [
            this.header_field_names.join(','),
            ...this.records.map(x => this.orderMapForRecord(x).join(','))
        ].join('\n');
    }
}
class SaveButton {
    get is_handling() { return __classPrivateFieldGet(this, _SaveButton_is_handling_accessor_storage, "f"); }
    set is_handling(value) { __classPrivateFieldSet(this, _SaveButton_is_handling_accessor_storage, value, "f"); }
    constructor() {
        _SaveButton_is_handling_accessor_storage.set(this, void 0);
        this.button_elm = document.querySelector('#save_button');
        this.is_handling = false;
    }
    bind(fn) {
        this.button_elm.addEventListener('click', fn);
    }
}
_SaveButton_is_handling_accessor_storage = new WeakMap();
;
(async () => {
    const sheet = new Sheet();
    const save_button = new SaveButton();
    window.api.onUpdate((data) => {
        sheet.onUpdate(data);
    });
    save_button.bind(() => {
        if (save_button.is_handling) {
            return;
        }
        save_button.is_handling = true;
        window.api.send(sheet.getSave()).then((is_successed) => {
            console.log(`Render@SaveButton> Save status: ${is_successed}`);
            save_button.is_handling = false;
        });
    });
})();
