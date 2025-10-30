import crypto from 'crypto';


function sha256Hex(bufferOrString) {
const hash = crypto.createHash('sha256');
hash.update(bufferOrString);
return hash.digest('hex');
}

export { sha256Hex };
