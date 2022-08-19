import path from 'path'
import { mergeFiles2 } from './merger2'

const base = path.resolve('./files/merge')
const inputFolder = path.join(base, 'input1')
// const outputFolder = path.join(base, 'output')
// const _outputFileName = 'merged.pdf'
// const outputFilePath = path.join(outputFolder, _outputFileName)

// const files = readdirSync(inputFolder, { withFileTypes: true })
//     .filter(item => !item.isDirectory())
//     .map(item => path.resolve(inputFolder, item.name))
// console.log(files)

const files = [
    'label-template.pdf',
    'Resume_Lee_James_Doran-Constant__Remote_TypeScript_contractor_specialising_in_Web,_Mobile,_Cloud_and_3D_experiences.pdf'
].map(item => path.resolve(inputFolder, item))

mergeFiles2({
    baseFile: files[0],
    overlayFile: files[1],
    callback: outputFile => {
        console.log(`our outputFile is '${outputFile.name}'`)
    },
    autoDeleteOutputFileAfterCallback: true
})
