const fs = require('fs');
const path = require('path');

let files = fs.readdirSync(process.cwd()),
    ignored = fs.readFileSync(path.resolve(process.cwd(), '.npmignore')).toString().split('\n');

for (let fileName of files) {
    if (!ignored.includes(fileName)) {
        fs.copyFileSync(fileName, `./dist/${fileName}`);
    }
}
