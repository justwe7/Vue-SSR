const path = require('path')
const utils = {}

utils.readFile = (fs, file, pwd) => {
  try {
    return fs.readFileSync(path.join(pwd, file), 'utf-8')
  } catch (e) {
    console.log('err-readfile', e)
  }
}

utils.resolve = file => path.resolve(__dirname, file)

module.exports = utils
