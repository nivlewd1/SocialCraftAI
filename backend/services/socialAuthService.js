const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : Buffer.alloc(32); // Ensure 32 bytes
const ivLength = 16;

const decryptToken = (text) => {
  if (!text) return null;

  // Check if text is in iv:encrypted format
  if (!text.includes(':')) {
    return text; // Assume plain text if not formatted
  }

  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return text; // Fallback to returning original text
  }
};

module.exports = { decryptToken };
