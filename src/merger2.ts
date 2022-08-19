import HummusRecipe from 'hummus-recipe'

// Maximum plottable height (915 mm) - Conversion to point
const maxPageHeight = 915 / 0.3528

export const mergeFiles2 = async (
    baseFile: string,
    overlayFile: string,
    outputPath: string,
    outputFile: string,
    title: string,
    author: string,
    subject: string
) => {
    console.log(`mergeFiles2 (
        '${baseFile}',
        '${overlayFile}',
        '${outputPath}',
        '${outputFile}',
        '${title}',
        '${author}',
        '${subject}'
        )`)

    // const one = new HummusRecipe(
    //     baseFile,
    //     `${path.join(outputPath, 'output1.pdf')}`
    // )
    // const two = new HummusRecipe(
    //     overlayFile,
    //     `${path.join(outputPath, 'output2.pdf')}`
    // )

    // const pi1 = one.pageInfo(1) as unknown as {
    //     width: number
    //     height: number
    //     rotate: number
    //     pageNumber: number
    // }
    // const pi2 = two.pageInfo(1) as unknown as {
    //     width: number
    //     height: number
    //     rotate: number
    //     pageNumber: number
    // }

    // const width = Math.max(pi1.width, pi2.width) + 30
    const doc = new HummusRecipe(baseFile, outputFile, {
        version: 1.6,
        author,
        title,
        subject
    })
        // .createPage(width, maxPageHeight)
        .editPage(1)
        .overlay(overlayFile, 0, 0)
        .endPage()
        .endPDF()
    // const doc2 = overlayFiles.reduce(
    //     (acc, file) => acc.overlay(file, 0, 0),
    //     doc
    // )
    // const doc3 = doc2.endPDF()
    // if (doc === doc2) {
    //     console.log('doc === doc2')
    // }
    // if (doc2 === doc3) {
    //     console.log('doc2 === doc3')
    // }
}
