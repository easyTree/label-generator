import HummusRecipe from 'hummus-recipe'
import tmp from 'tmp'

export const mergeFiles2 = async ({
    baseFile,
    overlayFile
}: {
    baseFile: string
    overlayFile: string
}) => {
    console.log(`mergeFiles2 (
        baseFile: '${baseFile}',
        overlayFile: '${overlayFile}'
    )`)

    const outputFile = tmp.fileSync({ postfix: '.pdf' })
    const outputFilePath = outputFile.name
    console.log(`outputFilePath: '${outputFilePath}'`)

    new HummusRecipe(baseFile, outputFilePath, {
        version: 1.6
    })
        .editPage(1)
        .overlay(overlayFile, 0, 0)
        .endPage()
        .endPDF((blah: any) => {
            console.log(`blah: ${JSON.stringify(blah, null, 2)}`)
        })

    return outputFile
}
