
// import CryptoJS from "crypto-js"

import crypto from "crypto"

// const AesUtil = function (keySize, iterationCount) {
// 	this.keySize = keySize / 32;
// 	this.iterationCount = iterationCount;
// };

// AesUtil.prototype.generateKey = function (salt, passPhrase) {
// 	var key = CryptoJS.PBKDF2(
// 		passPhrase,
// 		CryptoJS.enc.Hex.parse(salt),
// 		{ keySize: this.keySize, iterations: this.iterationCount });
// 	return key;
// }

// AesUtil.prototype.encrypt = function (salt, iv, passPhrase, plainText) {
// 	var key = this.generateKey(salt, passPhrase);
// 	var encrypted = CryptoJS.AES.encrypt(
// 		plainText,
// 		key,
// 		{ iv: CryptoJS.enc.Hex.parse(iv) });
// 	return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
// }

// AesUtil.prototype.decrypt = function (salt, iv, passPhrase, cipherText) {
// 	var key = this.generateKey(salt, passPhrase);
// 	var cipherParams = CryptoJS.lib.CipherParams.create({
// 		ciphertext: CryptoJS.enc.Base64.parse(cipherText)
// 	});
// 	var decrypted = CryptoJS.AES.decrypt(
// 		cipherParams,
// 		key,
// 		{ iv: CryptoJS.enc.Hex.parse(iv) });
// 	return decrypted.toString(CryptoJS.enc.Utf8);
// }


// const iv = '3572BC298871B7A1E3D19DDD0379F3C2'
// const salt = 'F067372200488884D12C52F2F1AFB63A368C674538600AE0614C7858818C4C0E'
// const keySize = 128
// const iterationCount = 10000
// const passPhrase = "4133dd21adacd9c9f9bdse5cb7dfg1f3b81a846ge63e393a55bd8350d2d06f80s447a94ec6f400"

// const encrypt = (data) => {
// 	let transformedData = data
// 	if (typeof transformedData != 'string') {
// 		transformedData = JSON.stringify(transformedData)
// 	}

// 	const aesUtil = new AesUtil(keySize, iterationCount)
// 	const encrypted = aesUtil.encrypt(salt, iv, passPhrase, transformedData)

// 	return encrypted
// }

// const decrypt = (string) => {
// 	const aesUtil = new AesUtil(keySize, iterationCount)
// 	const decrypted = aesUtil.decrypt(salt, iv, passPhrase, string)
	
// 	try {
// 		return JSON.parse(decrypted)
// 	} catch (e) {
// 		return null
// 	}
// }


const algorithm = 'aes-256-cbc'
const iv = 'somerandomnonsense'.toString('hex').slice(0, 16)
const keyBuffer = Buffer.from("w9z$C&F)J@NcRfUjXn2r5u7x!A%D*G-K",'utf8');



function decrypt(encryptedString) {
	try {
		const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv)
		const decrypted = decipher.update(encryptedString, 'hex', 'utf8') + decipher.final('utf8')
		return decrypted
	} catch (e) {
		console.log('decrypt exception', e)
		return null
	}
}

function encrypt(string) {
	try {
		const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv)
		const encrypted = cipher.update(string, 'utf8', 'hex') + cipher.final('hex')
		return encrypted
	} catch (e) {
		console.log('encrypt exception', e)
		return null
	}
}


export {encrypt, decrypt}
export default {encrypt, decrypt}