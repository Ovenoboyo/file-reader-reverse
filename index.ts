import { createReadStream, read, ReadStream } from "fs"
import { stat, open } from "fs/promises"
import path from "path"
import { createInterface } from "readline"

export class ReverseFileReader {
  constructor(private filename: string) {}

  public async *getLatestEntires(offset = 0, limit = Infinity) {
    const logFile = this.filename

    const stats = await stat(logFile)
    const fileDescriptor = await open(logFile)

    let chunkSize = Math.min(1024 * 64, stats.size - 1)
    let position = stats.size - chunkSize

    let lastElem = ""

    let lineCount = 0

    const limitIsFinite = isFinite(limit)
    const offsetIsNonZero = offset !== 0

    while (position >= 0) {
      const buffer = Buffer.alloc(chunkSize, undefined, "utf-8")
      const buf = await new Promise<Buffer>((resolve) => {
        read(
          fileDescriptor.fd,
          buffer,
          0,
          chunkSize,
          position,
          (err, _, buffer) => {
            if (err !== null) {
              throw err
            }
            resolve(buffer)
          }
        )
      })

      const str = buf.toString("utf-8") + lastElem
      const split = str.split(/\n|\r/).reverse()
      lastElem = ""

      if (offsetIsNonZero) {
        const newLineCount = lineCount + split.length
        if (newLineCount < offset) {
          lineCount = newLineCount
          continue
        }

        const requiredLines = newLineCount - offset
        split.splice(0, split.length - requiredLines)
      }

      if (split.length > 1) {
        lastElem = split[split.length - 1]
        split.splice(split.length - 1, 1)

        if (limitIsFinite) {
          const newLineCount = lineCount + split.length
          if (newLineCount > limit) {
            yield split.slice(0, Math.max(limit - lineCount, 0))
          } else {
            yield split
          }

          lineCount = newLineCount
        } else {
          yield split
        }
      } else {
        lastElem = str
      }

      if (limitIsFinite && lineCount >= limit) {
        await fileDescriptor.close()
        return
      }

      chunkSize = Math.min(chunkSize, position || 1)
      position -= chunkSize
    }

    yield [lastElem]

    await fileDescriptor.close()
  }
}
