"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReverseFileReader = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
class ReverseFileReader {
    filename;
    constructor(filename) {
        this.filename = filename;
    }
    async *getLatestEntires(offset = 0, limit = Infinity) {
        const logFile = this.filename;
        const stats = await (0, promises_1.stat)(logFile);
        const fileDescriptor = await (0, promises_1.open)(logFile);
        let chunkSize = Math.min(1024 * 64, stats.size - 1);
        let position = stats.size - chunkSize;
        let lastElem = "";
        let lineCount = 0;
        const limitIsFinite = isFinite(limit);
        const offsetIsNonZero = offset !== 0;
        while (position >= 0) {
            const buffer = Buffer.alloc(chunkSize, undefined, "utf-8");
            const buf = await new Promise((resolve) => {
                (0, fs_1.read)(fileDescriptor.fd, buffer, 0, chunkSize, position, (err, _, buffer) => {
                    if (err !== null) {
                        throw err;
                    }
                    resolve(buffer);
                });
            });
            const str = buf.toString("utf-8") + lastElem;
            const split = str.split(/\n|\r/).reverse();
            lastElem = "";
            if (offsetIsNonZero) {
                const newLineCount = lineCount + split.length;
                if (newLineCount < offset) {
                    lineCount = newLineCount;
                    continue;
                }
                const requiredLines = newLineCount - offset;
                split.splice(0, split.length - requiredLines);
            }
            if (split.length > 1) {
                lastElem = split[split.length - 1];
                split.splice(split.length - 1, 1);
                if (limitIsFinite) {
                    const newLineCount = lineCount + split.length;
                    if (newLineCount > limit) {
                        yield split.slice(0, Math.max(limit - lineCount, 0));
                    }
                    else {
                        yield split;
                    }
                    lineCount = newLineCount;
                }
                else {
                    yield split;
                }
            }
            else {
                lastElem = str;
            }
            if (limitIsFinite && lineCount >= limit) {
                await fileDescriptor.close();
                return;
            }
            chunkSize = Math.min(chunkSize, position || 1);
            position -= chunkSize;
        }
        yield [lastElem];
        await fileDescriptor.close();
    }
}
exports.ReverseFileReader = ReverseFileReader;
