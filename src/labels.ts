import HummusRecipe, { TextBox } from 'hummus-recipe'

import {
    DebugFlags,
    LabelInfo,
    LabelSheetSpec,
    PdfMetaData
} from './types'

export const generateFoodLabelPdf = async ({
    labelInfo,
    spec,
    pdfMetaData,
    outputFilePath,
    debug
}: {
    labelInfo: LabelInfo[]
    spec: LabelSheetSpec
    pdfMetaData: PdfMetaData
    outputFilePath: string
    debug?: DebugFlags
}) => {
    const pdfDoc = new HummusRecipe('new', outputFilePath, {
        version: 1.6,
        ...pdfMetaData
    })

    const addPage = () => pdfDoc.createPage('a4')

    addPage()

    const { pageNumber, width, height, rotate } = pdfDoc.pageInfo(1)

    const labelsPerPage =
        spec.label.horizontalCount * spec.label.verticalCount
    const pagesNeeded = Math.ceil(labelInfo.length / labelsPerPage)
    const lastPageLabelCount = labelInfo.length % labelsPerPage

    const mm = {
        width: spec.paper.width_mm,
        height: spec.paper.height_mm,
        margins: spec.paper.margins_mm
    }
    const doc = { width, height }
    const scale = {
        x: doc.width / mm.width,
        y: doc.height / mm.height
    }
    const mmInner = {
        width: mm.width - mm.margins.left - mm.margins.right,
        height: mm.height - mm.margins.top - mm.margins.bottom
    }

    const box = (
        mmx1: number,
        mmy1: number,
        mmx2: number,
        mmy2: number,
        stroke: string,
        lw: number,
        opacity = 1
    ) => {
        const hlw = lw / 2
        const s = {
            x1: mmx1 * scale.x,
            y1: mmy1 * scale.y,
            x2: mmx2 * scale.x,
            y2: mmy2 * scale.y
        }

        const coords = [
            [s.x1 + hlw, s.y1 + hlw],
            [s.x2 - hlw, s.y1 + hlw],
            [s.x2 - hlw, s.y2 - hlw],
            [s.x1 + hlw, s.y2 - hlw],
            [s.x1 + hlw, s.y1 + hlw]
        ]
        pdfDoc.polygon(coords, {
            stroke,
            lineWidth: lw,
            opacity
        })
    }

    const labelBox = (
        mmx: number,
        mmy: number,
        labelInfo: LabelInfo
    ) => {
        const cr = spec.label.cornerRadius_mm
        const right = mmx + spec.label.width_mm - cr
        const bottom = mmy + spec.label.height_mm - cr

        if (debug?.labelBoxes) {
            box(mmx + cr, mmy + cr, right, bottom, '#ff0000', 2, 0.2)
        }

        const text = ({
            text,
            x,
            y,
            size = 12,
            align = 'left top',
            textBox = {},
            bold = false
        }: {
            text: string
            x: number
            y: number
            size?: number
            align?: string
            textBox?: TextBox
            bold?: boolean
        }) => {
            pdfDoc.text(text, scale.x * x, scale.y * y, {
                color: bold ? '#ffffff' : '#333333',
                size,
                ...(bold
                    ? { hilite: { color: '#333333', opacity: 0.8 } }
                    : {}),
                font: 'Helvetica',
                align: align,
                textBox
            })
        }

        const {
            className,
            date,
            firstName,
            lastName,
            description,
            allergenInfo
        } = labelInfo

        const pad = 2
        const voff = 5.5
        const left = mmx + cr + pad
        const top = mmy + cr + pad
        let y = top

        text({ text: `Class: ${className}`, x: left, y })
        text({
            text: date,
            x: right - pad,
            y,
            size: 10,
            align: 'right top'
        })

        y += voff * 1.2

        text({
            text: `${firstName} ${lastName}`,
            x: left,
            y,
            size: 10,
            bold: true
        })

        y += voff * 0.8

        text({
            text: description,
            x: left,
            y,
            size: 10,
            align: 'left top',
            textBox: {
                ...(debug?.wrapBoxes
                    ? {
                          style: {
                              stroke: '#00ffff',
                              lineWidth: 2,
                              opacity: 0.2
                          }
                      }
                    : {}),
                width: (spec.label.width_mm - pad * 4) * scale.x,
                height: 22
            }
        })

        y += voff * 1.7
        text({
            text: 'Allergen Info',
            x: left,
            y,
            size: 10,
            align: 'left top',
            bold: true
        })

        y += voff * 0.8
        text({
            text: allergenInfo,
            x: left,
            y,
            size: 10,
            align: 'left top'
        })
    }

    const generateLabelsForPage = (page: number, count: number) => {
        let i = (page - 1) * labelsPerPage
        let j = 0
        for (
            let x = 0, mmx = mm.margins.left;
            x < spec.label.horizontalCount && j < count;
            x++,
                mmx +=
                    spec.label.width_mm + spec.label.horizontalGap_mm
        ) {
            for (
                let y = 0, mmy = mm.margins.top;
                y < spec.label.verticalCount && j < count;
                j++,
                    y++,
                    mmy +=
                        spec.label.height_mm +
                        spec.label.verticalGap_mm
            ) {
                labelBox(mmx, mmy, labelInfo[i++])
            }
        }

        if (debug?.pageEdge) {
            box(
                mm.margins.left,
                mm.margins.top,
                mm.margins.left + mmInner.width,
                mm.margins.top + mmInner.height,
                'green',
                1,
                0.2
            )
        }
    }

    for (let page = 1; page <= pagesNeeded; page++) {
        if (page > 1) {
            addPage() // first page created earlier to get page dimensions
        }
        generateLabelsForPage(
            page,
            page < pagesNeeded ? labelsPerPage : lastPageLabelCount
        )
        pdfDoc.endPage()
    }

    pdfDoc.endPDF()
}
