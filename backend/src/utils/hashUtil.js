const crypto = require('crypto');


function sha256Hex(bufferOrString) {
const hash = crypto.createHash('sha256');
hash.update(bufferOrString);
return hash.digest('hex');
}


module.exports = { sha256Hex };