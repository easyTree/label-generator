import { existsSync } from 'fs'
import tmp from 'tmp'

export const deleteTmpFile = (file: tmp.FileResult) => {
    console.log(`❌a: '${file.name}' exists ${existsSync(file.name)}`)

    file.removeCallback()

    console.log(`❌b: '${file.name}' exists ${existsSync(file.name)}`)
}
