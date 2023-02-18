# File Reader Reverse (TS)

Node.JS library to read files line-by-line from bottom (backwards)
This library will give you the last line first.

### Installing

#### Using yarn
```bash
yarn add file-reader-reverse
```

#### Using npm
```bash
npm install file-reader-reverse --save
```

### Usage

#### In non-async context
```javascript
import { ReverseFileReader } from 'file-reader-reverse'

const reader = new ReverseFileReader('filepath')
const generator = reader.getLatestEntires() // Returns an async generator

generator.next().then(line => { /* line 1 */ })
generator.next().then(line => { /* line 2 */ })
...

```

#### In async context
```javascript
import { ReverseFileReader } from 'file-reader-reverse'

async function read() {
  const reader = new ReverseFileReader('filepath')

  for (await const line of reader.getLatestEntires()) {
    console.log(line)
    ...
  }
}

```

You may also pass an offset and limit to getLatestEntires(offset?: number, limit?: number)

```javascript
  const reader = new ReverseFileReader('filepath')

  // Skip last 5 lines and read till start of file
  const generator = reader.getLatestEntires(5, Infinity)

  // Skip last 12 files and read next 16 lines 
  // (till 28th line from bottom of file)
  const generator = reader.getLatestEntires(12, 16)

  // Read from end to start of file
  const generator = reader.getLatestEntires(0, Infinity)
```
