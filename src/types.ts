export type PdfMetaData = {
    title: string
    author: string
    subject: string
}

export type LabelSheetSpec = {
    paper: {
        width_mm: number
        height_mm: number
        margins_mm: {
            top: number
            right: number
            bottom: number
            left: number
        }
    }

    label: {
        width_mm: number
        height_mm: number
        horizontalCount: number
        verticalCount: number
        cornerRadius_mm: number
        horizontalGap_mm: number
        verticalGap_mm: number
    }
}

export type LabelInfo = {
    className: string
    date: string
    firstName: string
    lastName: string
    description: string
    allergenInfo: string
}

export interface DebugFlags {
    labels: true
    labelBoxes: true
    pageEdge: true
    wrapBoxes: true
}

export interface GenerateKitchenLabelsRequest {
    debug?: DebugFlags
    labelInfos: LabelInfo[]
}

export interface TypedRequestBody<T> extends Express.Request {
    body: T
}
