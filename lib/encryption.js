import crypto from "crypto-js"

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