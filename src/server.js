"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const response_time_1 = __importDefault(require("response-time"));
const tmp_1 = __importDefault(require("tmp"));
const labels_1 = require("./labels");
const merger_1 = require("./merger");
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, response_time_1.default)());
app.get('/info', (_req, res) => {
    res.send({ now: new Date() });
});
app.post('/info', (req, res) => {
    const { body } = req;
    const { json, echoBody, echoBodySize } = body;
    res.send(Object.assign(Object.assign({ now: new Date() }, (echoBodySize
        ? { bodySize: JSON.stringify(json, null, 2).length }
        : {})), (echoBody ? { body } : {})));
});
app.post('/overlay-pdf-onto-labels', async (req, res) => {
    const outputFile = tmp_1.default.fileSync({ postfix: '.pdf' });
    const outputFilePath = outputFile.name;
    const base = path_1.default.resolve('./files/merge');
    const inputFolder = path_1.default.join(base, 'input1');
    const templatePath = path_1.default.resolve(inputFolder, 'label-template.pdf');
    const mergedFile = await (0, merger_1.mergeFiles)({
        baseFile: templatePath,
        overlayFile: outputFilePath
    });
    const cleanup = () => {
        console.log('*********** cleanup!');
        (0, utils_1.deleteTmpFile)(mergedFile);
    };
    const downloadFilename = `merged-file.pdf`;
    res.download(mergedFile.name, downloadFilename, (err) => {
        if (err) {
            console.log(`❌ Error: ${err}`);
        }
        else {
        }
        res.end();
        // cleanup1() // <-- something is preventing deletion
        cleanup();
    });
});
app.post('/generate-labels', async (req, res) => {
    const { body } = req;
    const outputFile = tmp_1.default.fileSync({ postfix: '.pdf' });
    const outputFilePath = outputFile.name;
    const { className, date } = body.labelInfos[0];
    const { debug } = body;
    await (0, labels_1.generateFoodLabelPdf)({
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
    });
    let sendFilePath = outputFilePath;
    let cleanup2 = () => {
        console.log('*********** blank cleanup2!');
    };
    if (debug === null || debug === void 0 ? void 0 : debug.labels) {
        const base = path_1.default.resolve('./files/merge');
        const inputFolder = path_1.default.join(base, 'input1');
        const templatePath = path_1.default.resolve(inputFolder, 'label-template.pdf');
        const mergedFile = await (0, merger_1.mergeFiles)({
            baseFile: templatePath,
            overlayFile: outputFilePath
        });
        sendFilePath = mergedFile.name;
        cleanup2 = () => {
            console.log('*********** cleanup2!');
            (0, utils_1.deleteTmpFile)(mergedFile);
        };
    }
    const downloadFilename = `Kitchen_labels_for_class_${className.replace(/[ ]/g, '_')}_on_${date.replace(/[ ]/g, '_').replace(/[/]/g, '.')}.pdf`;
    let cleanup1 = () => {
        console.log('*********** cleanup1!');
        (0, utils_1.deleteTmpFile)(outputFile);
    };
    res.download(sendFilePath, downloadFilename, (err) => {
        if (err) {
            console.log(`❌ Error: ${err}`);
        }
        else {
        }
        res.end();
        // cleanup1() // <-- something is preventing deletion
        cleanup2();
    });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`** Server listening on port ${PORT}`);
});
