type PrimitiveType = number | string | boolean | undefined | null
type StoredRecord = Record<string, PrimitiveType>

function clearChildren(elm: HTMLElement) {
    for (const child of Array.from(elm.childNodes)) {
        elm.removeChild(child)
    }
}

function isPrimitiveType(value: unknown): boolean {
    return typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'undefined' ||
        value === null
}

function formatNumber(value: number): string {
    if (Math.floor(value) === value) {
        return value.toString()
    }

    return value.toFixed(2).toString()
}

class Sheet {
    private sheet_elm: HTMLElement
    private records: StoredRecord[]
    private keys_to_iter: string[][]
    private header_field_names: string[]
    private is_first_time: boolean

    constructor() {
        this.sheet_elm = document.querySelector('#sheet')!
        this.records = []
        this.keys_to_iter = []
        this.header_field_names = []
        this.is_first_time = true
        this.clearTableHeader()
        this.clearTableBody()
    }

    clearTableHeader() {
        clearChildren(this.sheet_elm.querySelector('.sheet__header')!)
    }

    clearTableBody() {
        clearChildren(this.sheet_elm.querySelector('.sheet__body')!)
    }

    static createColumn(tag_name: string, class_list: string[] = [], inner_text: string = ''): HTMLElement {
        const new_elm = document.createElement(tag_name)
        new_elm.classList.add(...class_list)
        new_elm.innerText = inner_text

        return new_elm
    }

    static createRow(items_of_one_row: PrimitiveType[]): HTMLElement {
        const tr_elm = document.createElement('tr')
        tr_elm.classList.add('sheet__row')

        for (const item_value of items_of_one_row.map(
            x => typeof x === 'undefined' || x === null ? '' :
                typeof x === 'number' ? formatNumber(x) : x.toString()
        )) {
            tr_elm.appendChild(Sheet.createColumn('td', ['sheet__col'], item_value))
        }

        return tr_elm
    }

    updateHeader() {
        const sheet_header_elm: HTMLElement = this.sheet_elm.querySelector('.sheet__header')!
        this.clearTableHeader()
        sheet_header_elm.appendChild(Sheet.createRow(this.header_field_names))
    }

    inesrtRecord(record_items: PrimitiveType[]) {
        const sheet_body_elm: HTMLElement = this.sheet_elm.querySelector('.sheet__body')!
        const new_row = Sheet.createRow(record_items)

        if (sheet_body_elm.firstChild !== null) {
            sheet_body_elm.insertBefore(new_row, sheet_body_elm.firstChild)
        } else {
            sheet_body_elm.appendChild(new_row)
        }
    }

    insertBatch(data_of_rows: PrimitiveType[][]) {
        for (const record_items of data_of_rows) {
            this.inesrtRecord(record_items)
        }
    }

    augmentRecordColumns() {
        const sheet_body_elm: HTMLElement = this.sheet_elm.querySelector('.sheet__body')!
        const row_elm_list = Array.from(sheet_body_elm.querySelectorAll<HTMLElement>('.sheet__row'))

        for (const row_elm of row_elm_list) {
            const diff = this.header_field_names.length - row_elm.childNodes.length
            if (diff <= 0) {
                continue
            }

            for (let i = 0; i < diff; i += 1) {
                row_elm.appendChild(Sheet.createColumn('td', ['sheet__col']))
            }
        }
    }

    parseKeysToIter(json_data: any) {
        const keys_field_name: string = 'keys_to_iter'

        if (!(keys_field_name in json_data)) {
            return
        }

        if (!(Array.isArray(json_data[keys_field_name]))) {
            return
        }

        this.keys_to_iter = json_data[keys_field_name].map(
            x => Array.isArray(x) ?
                x.map(y => typeof y === 'string' ? y : '') :
                [typeof x === 'string' ? x : '']
        )
        this.is_first_time = false
    }

    static rectifyRecord(raw_record: any): StoredRecord {
        function handleSpecificalValue(value: any): string {
            return typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean' ?
                value.toString() :
                Array.isArray(value) ?
                    handleArray(value) :
                    typeof value === 'object' ?
                        handleObject(value) :
                        ''
        }

        function handleObject(object_field: any): string {
            const kv_list: string[] = []

            for (const key of Object.keys(object_field)) {
                const value = object_field[key]
                kv_list.push(`${key}:${handleSpecificalValue(value)}`)
            }

            return '{' + kv_list.join('') + '}'
        }

        function handleArray(array_field: any[]): string {
            return '[' + array_field.map(x => handleSpecificalValue(x)).join(',') + ']'
        }

        const rectified_record: StoredRecord = {}

        for (const key of Object.keys(raw_record)) {
            const value = raw_record[key]
            rectified_record[key] =
                isPrimitiveType(value) ?
                    value :
                    typeof value === 'object' ?
                        handleObject(value) :
                        Array.isArray(value) ?
                            handleArray(value) :
                            undefined
        }

        return rectified_record
    }

    extractRecords(data: any): StoredRecord[] {
        const records: StoredRecord[] = []

        for (const key_group of this.keys_to_iter) {
            let raw_record = data
            let is_valid = true

            for (const key of key_group) {
                if (!(key in raw_record)) {
                    is_valid = false
                    break
                }

                raw_record = raw_record[key]
            }

            if (is_valid && Array.isArray(raw_record)) {
                records.push(...raw_record.map(
                    x => typeof x === 'object' ?
                        Sheet.rectifyRecord(x) :
                        {}
                ))
            }
        }

        return records
    }

    static assembleHeader(records: StoredRecord[]): string[] {
        const result: string[] = []

        for (const record of records) {
            for (const key of Object.keys(record)) {
                if (result.indexOf(key) === -1) {
                    result.push(key)
                }
            }
        }

        return result
    }

    compareHeader(another_header_field_names: string[]): boolean {
        if (another_header_field_names.length !== this.header_field_names.length) {
            return false
        }

        for (let i = 0; i < another_header_field_names.length; i += 1) {
            if (this.header_field_names.indexOf(another_header_field_names[i]) === -1) {
                return false
            }
        }

        return true
    }

    augmentHeader(another_header_field_names: string[]) {
        for (const field_names of another_header_field_names) {
            if (this.header_field_names.indexOf(field_names) === -1) {
                this.header_field_names.push(field_names)
            }
        }
    }

    getOrderedValues(record: StoredRecord): PrimitiveType[] {
        const result: PrimitiveType[] = []

        for (const field_name of this.header_field_names) {
            if (field_name in record) {
                result.push(record[field_name])
            } else {
                result.push(undefined)
            }
        }

        return result
    }

    onUpdate(data: string) {
        try {
            const json_data = JSON.parse(data)

            if (this.is_first_time) {
                this.parseKeysToIter(json_data)
            }

            if (!('data' in json_data)) {
                return
            }

            const records = this.extractRecords(json_data['data'])
            const cur_header_field_names = Sheet.assembleHeader(records)

            if (!this.compareHeader(cur_header_field_names) &&
                cur_header_field_names.length >= this.header_field_names.length) {
                this.augmentHeader(cur_header_field_names)
                this.updateHeader()
                this.augmentRecordColumns()
            }

            this.records.push(...records)
            this.insertBatch(records.map(x => this.getOrderedValues(x)))
        } catch (e) {
            console.log(`Render@Sheet> Failed to parse data: ${e}`)
        }
    }

    orderMapForRecord(record: StoredRecord): string[] {
        const result: string[] = []

        for (const field_name of this.header_field_names) {
            if (field_name in record) {
                const value = record[field_name]
                result.push(typeof value === 'undefined' || value === null ? '' : value.toString())
            } else {
                result.push('')
            }
        }

        return result
    }

    getSave(): string {
        return [
            this.header_field_names.join(','),
            ...this.records.map(
                x => this.orderMapForRecord(x).join(',')
            )
        ].join('\n')
    }
}

class SaveButton {
    private button_elm: HTMLElement
    accessor is_handling: boolean

    constructor() {
        this.button_elm = document.querySelector('#save_button')!
        this.is_handling = false
    }

    bind(fn: () => void) {
        this.button_elm.addEventListener('click', fn)
    }
};

(async () => {
    const sheet = new Sheet()
    const save_button = new SaveButton()

    window.api.onUpdate((data: string) => {
        sheet.onUpdate(data)
    })

    save_button.bind(() => {
        if (save_button.is_handling) {
            return
        }
        save_button.is_handling = true
        window.api.send(sheet.getSave()).then((is_successed) => {
            console.log(`Render@SaveButton> Save status: ${is_successed}`)
            save_button.is_handling = false
        })
    })
})()
