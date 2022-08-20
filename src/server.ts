import express, { Response } from 'express'
import responseTime from 'response-time'
import path from 'path'
import tmp from 'tmp'
import { generateFoodLabelPdf } from './labels'
import { mergeFiles } from './merger'
import {
    DebugRequest,
    GenerateKitchenLabelsRequest,
    TypedRequestBody
} from './types'
import { deleteTmpFile } from './utils'

const app = express()
app.use(express.json())
app.use(responseTime())

app.get('/info', (_req, res) => {
    res.send({ now: new Date ()})
})

app.post('/info', (req: TypedRequestBody<DebugRequest>, res) => {
    const { body } = req
    const { json, echoBody, echoBodySize } = body

    res.send({ 
        now: new Date (), 
        ...(echoBodySize? { bodySize: JSON.stringify(json, null, 2).length }:{}), 
        ...(echoBody ? { body } : {})
    })
})

app.post(
    '/generate-labels',
    async (
        req: TypedRequestBody<GenerateKitchenLabelsRequest>,
        res: Response
    ) => {
        const { body } = req

        const outputFile = tmp.fileSync({ postfix: '.pdf' })
        const outputFilePath = outputFile.name

        const { className, date } = body.labelInfos[0]
        const { debug } = body

        await generateFoodLabelPdf({
            labelInfo: body.labelInfos,
            spec: {
                // measured:
                paper: {
                    width_mm: 210,
                    height_mm: 297,
                    margins_mm: {
                        top: 13.08,
                        right: 6.36,
                        bottom: 12.38,
                        left: 7.07
                    }
                },
                label: {
                    width_mm: 64.4,
                    height_mm: 33.9,
                    horizontalCount: 3,
                    verticalCount: 8,
                    cornerRadius_mm: 1.41,
                    horizontalGap_mm: 1.77,
                    verticalGap_mm: 0
                }

                // specified:
                // paper: {
                //     width_mm: 210,
                //     height_mm: 297,
                //     margins_mm: {
                //         top: 12.9,
                //         right: 7,
                //         bottom: 12.9,
                //         left: 7
                //     }
                // },
                // label: {
                //     width_mm: 63,
                //     height_mm: 33.9,
                //     horizontalCount: 3,
                //     verticalCount: 8,
                //     cornerRadius_mm: 1.5,
                //     horizontalGap_mm: 2,
                //     verticalGap_mm: 0
                // }
            },
            pdfMetaData: {
                author: 'Lee',
                subject: 'kitchen labels',
                title: `Kitchen labels for class '${className}'`
            },
            outputFilePath,
            debug
        })

        let sendFilePath = outputFilePath
        let cleanup2 = () => {
            console.log('*********** blank cleanup2!')
        }

        if (debug?.labels) {
            const base = path.resolve('./files/merge')
            const inputFolder = path.join(base, 'input1')
            const templatePath = path.resolve(
                inputFolder,
                'label-template.pdf'
            )

            const mergedFile = await mergeFiles({
                baseFile: templatePath,
                overlayFile: outputFilePath
            })
            sendFilePath = mergedFile.name
            cleanup2 = () => {
                console.log('*********** cleanup2!')
                deleteTmpFile(mergedFile)
            }
        }

        const downloadFilename = `Kitchen_labels_for_class_${className.replace(
            /[ ]/g,
            '_'
        )}_on_${date.replace(/[ ]/g, '_').replace(/[/]/g, '.')}.pdf`

        let cleanup1 = () => {
            console.log('*********** cleanup1!')
            deleteTmpFile(outputFile)
        }

        res.download(sendFilePath, downloadFilename, (err: any) => {
            if (err) {
                console.log(`❌ Error: ${err}`)
            } else {
            }
            res.end()
            // cleanup1() // <-- something is preventing deletion
            cleanup2()
        })
    }
)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`** Server listening on port ${PORT}`)
})
