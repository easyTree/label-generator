import { existsSync } from 'fs'
import tmp from 'tmp'

export const deleteTmpFile = (file: tmp.FileResult) => {
    const existsBefore = existsSync(file.name)

    console.log(`❌a: '${file.name}' exists ${existsBefore}`)

    file.removeCallback()

    console.log(`❌b: '${file.name}' exists ${existsSync(file.name)}`)
}
