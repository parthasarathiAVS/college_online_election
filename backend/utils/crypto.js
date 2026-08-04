const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Ensure the encryption key is exactly 32 bytes for aes-256-cbc
const SECRET_KEY = (process.env.VOTE_ENCRYPTION_KEY || 'voteverseaisecretkey123456789012').substring(0, 32).padEnd(32, '0');
const IV_LENGTH = 16;

function encrypt(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Encryption error');
  }
}

function decrypt(text) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption error');
  }
}

module.exports = { encrypt, decrypt };
