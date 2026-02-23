const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!';

/**
 * Encrypt face descriptor data
 * @param {Array} faceDescriptor - Array of face descriptor values
 * @returns {String} - Encrypted string
 */
const encryptFaceData = (faceDescriptor) => {
  try {
    const dataString = JSON.stringify(faceDescriptor);
    // Use CBC mode which is well supported by CryptoJS
    const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt face data: ' + error.message);
  }
};

/**
 * Decrypt face descriptor data
 * @param {String} encryptedData - Encrypted face descriptor string
 * @returns {Array} - Decrypted face descriptor array
 */
const decryptFaceData = (encryptedData) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const dataString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!dataString) {
      throw new Error('Decryption returned empty string');
    }
    return JSON.parse(dataString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt face data: ' + error.message);
  }
};

/**
 * Calculate Euclidean distance between two face descriptors
 * @param {Array} descriptor1 - First face descriptor
 * @param {Array} descriptor2 - Second face descriptor
 * @returns {Number} - Euclidean distance
 */
const calculateFaceDistance = (descriptor1, descriptor2) => {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Face descriptors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  return Math.sqrt(sum);
};

/**
 * Compare face descriptors with threshold
 * @param {Array} descriptor1 - First face descriptor
 * @param {Array} descriptor2 - Second face descriptor
 * @param {Number} threshold - Match threshold (default: 0.6)
 * @returns {Boolean} - True if faces match
 */
const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  const distance = calculateFaceDistance(descriptor1, descriptor2);
  return distance < threshold;
};

module.exports = {
  encryptFaceData,
  decryptFaceData,
  calculateFaceDistance,
  compareFaces,
};
