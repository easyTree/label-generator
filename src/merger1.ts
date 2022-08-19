import PdfMerger from 'pdf-merger-js'
const merger = new PdfMerger()

export const mergeFiles1 = async (
    inputFilenames: string[],
    outputFilename: string
) => {
    const promises = inputFilenames.map(async file => {
        await merger.add(file)
    })
    await Promise.all(promises)
    await merger.save(outputFilename) //save under given name and reset the internal document
}
