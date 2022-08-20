import HummusRecipe from 'hummus-recipe'
import tmp from 'tmp'

export const mergeFiles = async ({
    baseFile,
    overlayFile
}: {
    baseFile: string
    overlayFile: string
}) => {
    const outputFile = tmp.fileSync({ postfix: '.pdf' })

    const outputFilePath = outputFile.name

    const overlayDoc = new HummusRecipe(overlayFile)
    const pageCount = overlayDoc.getPageCount()

    let multiPageBaseFile: tmp.FileResult | null = null
    if (pageCount > 1) {
        multiPageBaseFile = tmp.fileSync({ postfix: '.pdf' })
        const multiPageBaseDoc = new HummusRecipe(
            'new',
            multiPageBaseFile.name,
            { version: 1.6 }
        )
        for (let i = 1; i <= pageCount; i++) {
            multiPageBaseDoc.appendPage(baseFile, 1)
        }
        multiPageBaseDoc.endPDF()
    }

    const doc = new HummusRecipe(
        multiPageBaseFile !== null
            ? multiPageBaseFile.name
            : baseFile,
        outputFilePath,
        {
            version: 1.6
        }
    )

    for (let i = 1; i <= pageCount; i++) {
        doc.editPage(i)
            .overlay(overlayFile, 0, 0, { page: i })
            .endPage()
    }

    doc.endPDF()

    if (multiPageBaseFile !== null) {
        // deleteTmpFile(multiPageBaseFile)
    }
    return outputFile
}
