import AES from "crypto-js/aes";
import Utf8 from 'crypto-js/enc-utf8'


const secretKey = process.env.SECRET_KEY || "";


// encrypt user data
export function encryptData(payload:any): string {
    const jsonData = JSON.stringify(payload);
    const securedData = AES.encrypt(jsonData, secretKey).toString();
    return securedData;
}

// decrypt userData
export function decryptData(cypherText: string): any {
    try {
        const bytes = AES.decrypt(cypherText, secretKey);
        const decryptedData = bytes.toString(Utf8);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.log("decryption failed: ", error);
        return null;

    }
}
