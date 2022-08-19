import path from 'path'
import { mergeFiles2 } from './merger2'

const base = './files/merge'
const inputFolder = `${base}/input1`
const outputFolder = `${base}/output`
const outputFileName = 'merged.pdf'

// unlinkSync(outputFileName)

// const files = readdirSync(inputFolder, { withFileTypes: true })
//     .filter(item => !item.isDirectory())
//     .map(item => path.resolve(inputFolder, item.name))
// console.log(files)

const files = [
    'label-template.pdf',
    'Resume_Lee_James_Doran-Constant__Remote_TypeScript_contractor_specialising_in_Web,_Mobile,_Cloud_and_3D_experiences.pdf'
].map(item => path.resolve(inputFolder, item))

mergeFiles2(
    files[0],
    files[1],
    outputFolder,
    outputFileName,
    'Print PDF',
    'lunchclub',
    'Make List Labels for School <school> on <day> for sitting <sitting>.'
)
