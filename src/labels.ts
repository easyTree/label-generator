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
        author: 'John Doe',
        title: 'Hummus Recipe',
        subject: 'A brand new PDF'
    }).createPage('a4')

    const { pageNumber, width, height, rotate } = pdfDoc.pageInfo(1)

    // spec.paper.margins

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
    console.log(`🚀🚀🚀 scale: ${JSON.stringify(scale, null, 2)}`)
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
        lw: number
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
            // color: 'red',
            stroke,
            // fill: 'blue',
            lineWidth: lw
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
            box(mmx + cr, mmy + cr, right, bottom, 'red', 2)
        }

        const text = (
            text: string,
            x: number,
            y: number,
            size = 12,
            align = 'left top',
            textBox: TextBox = {}
        ) => {
            pdfDoc.text(text, scale.x * x, scale.y * y, {
                color: '#333333',
                size,
                // bold: true,
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

        text(`Class: ${className}`, left, y)
        text(date, right - pad, y, 10, 'right top')

        y += voff

        text(`${firstName} ${lastName}`, left, y, 10)

        y += voff

        text(description, left, y, 10, 'left top', {
            ...(debug?.wrapBoxes
                ? { style: { stroke: 'red', lineWidth: 2 } }
                : {}),
            width: (spec.label.width_mm - pad * 4) * scale.x,
            height: 22
        })

        y += voff * 1.5
        text('Allergen Info', left, y, 10, 'left top')

        y += voff
        text(allergenInfo, left, y, 10, 'left top')
    }
    let i = 0
    for (
        let x = 0, mmx = mm.margins.left;
        x < spec.label.horizontalCount;
        x++, mmx += spec.label.width_mm + spec.label.horizontalGap_mm
    ) {
        for (
            let y = 0, mmy = mm.margins.top;
            y < spec.label.verticalCount;
            y++,
                mmy +=
                    spec.label.height_mm + spec.label.verticalGap_mm
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
            1
        )
    }

    pdfDoc.endPage().endPDF()
}
