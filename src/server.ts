import express, { Response } from 'express'
import { existsSync, writeFileSync } from 'fs'
import path from 'path'
import responseTime from 'response-time'
import tmp from 'tmp'
import { generateFoodLabelPdf } from './labels'
import { mergeFiles } from './merger'
import {
    DebugRequest,
    GenerateKitchenLabelsRequest,
    OverlayPdfOntoLabelsRequest,
    TypedRequestBody
} from './types'
import { deleteTmpFile, json } from './utils'

import cors from 'cors'

const app = express()

const whitelist = ['http://localhost:3000']
const corsInstance = cors({
    origin: (origin, callback) => {
        console.log(`origin: '${origin}'`)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
})
app.options('*', corsInstance)
app.use(corsInstance)
app.use(responseTime())
app.use(express.json())

app.get('/info', (_req, res) => {
    try {
        res.send({ now: new Date() })
    } catch (error) {
        console.log(`❌ error: ${json(error)}`)
    }
})

app.post('/info', (req: TypedRequestBody<DebugRequest>, res) => {
    try {
        const { body } = req
        const { json, echoBody, echoBodySize } = body

        res.send({
            now: new Date(),
            ...(echoBodySize
                ? { bodySize: JSON.stringify(json, null, 2).length }
                : {}),
            ...(echoBody ? { body } : {})
        })
    } catch (error) {
        console.log(`❌ error: ${json(error)}`)
    }
})

app.post(
    '/overlay-pdf-onto-labels',
    async (
        {
            body: { pdf }
        }: TypedRequestBody<OverlayPdfOntoLabelsRequest>,
        res
    ) => {
        try {
            const outputFile = tmp.fileSync({ postfix: '.pdf' })
            const outputFilePath = outputFile.name

            const base = path.resolve('./files/merge')
            const inputFolder = path.join(base, 'input1')
            const templatePath = path.resolve(
                inputFolder,
                'label-template.pdf'
            )
            const buff = Buffer.from(pdf, 'base64')

            writeFileSync(outputFilePath, buff)
            console.log(
                `🍕 wrote base64-decoded pdf to outputFile: '${outputFilePath}'`
            )

            const mergedFile = await mergeFiles({
                baseFile: templatePath,
                overlayFile: outputFilePath
            })
            const cleanupMergedFile = () => {
                console.log(
                    '*********** /overlay-pdf-onto-labels - cleanup mergedFile!'
                )
                deleteTmpFile(mergedFile)
            }
            const cleanupOutputFile = () => {
                console.log(
                    '*********** /overlay-pdf-onto-labels - cleanup outputFile!'
                )
                deleteTmpFile(outputFile)
            }
            const downloadFilename = `merged-file.pdf`

            res.download(
                mergedFile.name,
                downloadFilename,
                (err: any) => {
                    if (err) {
                        console.log(`❌ Error: ${err}`)
                    } else {
                    }
                    res.end()
                    cleanupOutputFile() // <-- something is preventing deletion
                    cleanupMergedFile()
                }
            )
        } catch (error) {
            console.log(`❌ error: ${json(error)}`)
        }
    }
)

app.post(
    '/generate-labels',
    async (
        req: TypedRequestBody<GenerateKitchenLabelsRequest>,
        res: Response
    ) => {
        try {
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
            let cleanupMergedFile = () => {
                console.log(
                    '*********** /generate-labels - blank cleanup2!'
                )
            }

            if (debug?.labels) {
                const base = path.resolve('./files/merge')
                const inputFolder = path.join(base, 'input1')
                const templatePath = path.resolve(
                    inputFolder,
                    'label-template.pdf'
                )

                console.log(
                    `Does file '${templatePath}' exist? : ${existsSync(
                        templatePath
                    )}`
                )

                const mergedFile = await mergeFiles({
                    baseFile: templatePath,
                    overlayFile: outputFilePath
                })
                sendFilePath = mergedFile.name
                cleanupMergedFile = () => {
                    console.log(
                        '*********** /generate-labels - cleanup mergedFile!'
                    )
                    deleteTmpFile(mergedFile)
                }
            }

            const downloadFilename = `Kitchen_labels_for_class_${className.replace(
                /[ ]/g,
                '_'
            )}_on_${date
                .replace(/[ ]/g, '_')
                .replace(/[/]/g, '.')}.pdf`

            const cleanupOutputFile = () => {
                console.log(
                    '*********** /generate-labels - cleanup outputFile!'
                )
                deleteTmpFile(outputFile)
            }

            res.download(
                sendFilePath,
                downloadFilename,
                (err: any) => {
                    if (err) {
                        console.log(`❌ Error: ${err}`)
                    } else {
                    }
                    res.end()
                    cleanupOutputFile() // <-- something is preventing deletion
                    cleanupMergedFile()
                }
            )
        } catch (error) {
            console.log(`❌ error: ${json(error)}`)
        }
    }
)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`** Server listening on port ${PORT}`)
})
