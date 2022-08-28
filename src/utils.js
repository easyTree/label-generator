"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTmpFile = void 0;
const fs_1 = require("fs");
const deleteTmpFile = (file) => {
    const existsBefore = (0, fs_1.existsSync)(file.name);
    console.log(`❌a: '${file.name}' exists ${existsBefore}`);
    file.removeCallback();
    console.log(`❌b: '${file.name}' exists ${(0, fs_1.existsSync)(file.name)}`);
};
exports.deleteTmpFile = deleteTmpFile;
