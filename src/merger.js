"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeFiles = void 0;
const hummus_recipe_1 = __importDefault(require("hummus-recipe"));
const tmp_1 = __importDefault(require("tmp"));
const mergeFiles = async ({ baseFile, overlayFile }) => {
    const outputFile = tmp_1.default.fileSync({ postfix: '.pdf' });
    const outputFilePath = outputFile.name;
    const overlayDoc = new hummus_recipe_1.default(overlayFile);
    const pageCount = overlayDoc.getPageCount();
    let multiPageBaseFile = null;
    if (pageCount > 1) {
        multiPageBaseFile = tmp_1.default.fileSync({ postfix: '.pdf' });
        const multiPageBaseDoc = new hummus_recipe_1.default('new', multiPageBaseFile.name, { version: 1.6 });
        for (let i = 1; i <= pageCount; i++) {
            multiPageBaseDoc.appendPage(baseFile, 1);
        }
        multiPageBaseDoc.endPDF();
    }
    const doc = new hummus_recipe_1.default(multiPageBaseFile !== null
        ? multiPageBaseFile.name
        : baseFile, outputFilePath, {
        version: 1.6
    });
    for (let i = 1; i <= pageCount; i++) {
        doc.editPage(i)
            .overlay(overlayFile, 0, 0, { page: i })
            .endPage();
    }
    doc.endPDF();
    if (multiPageBaseFile !== null) {
        // deleteTmpFile(multiPageBaseFile)
    }
    return outputFile;
};
exports.mergeFiles = mergeFiles;
