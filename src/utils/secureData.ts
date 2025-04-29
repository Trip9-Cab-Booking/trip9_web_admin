import AES from "crypto-js/aes";
import Utf8 from 'crypto-js/enc-utf8'

const secretKey = process.env.SECRET_KEY || "";

// encrypt user data
export function encryptData(payload: Record<string, unknown>): string {
    const jsonData = JSON.stringify(payload);
    const securedData = AES.encrypt(jsonData, secretKey).toString();
    return securedData;
}

// decrypt userData
export function decryptData(cypherText: string): Record<string, unknown> | null {
    try {
        const bytes = AES.decrypt(cypherText, secretKey);
        const decryptedData = bytes.toString(Utf8);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.log("decryption failed: ", error);
        return null;

    }
}



// export async function encryptData(text: string, password: string = secretKey): Promise<string> {
//     // debugger
//     const encoder = new TextEncoder();
//     const keyMaterial = await crypto.subtle.importKey(
//       "raw",
//       encoder.encode(password),
//       { name: "PBKDF2" },
//       false,
//       ["deriveBits", "deriveKey"]
//     );

//     // Generate a random salt
//     const salt = crypto.getRandomValues(new Uint8Array(16));

//     // Derive a key using PBKDF2 with HMAC SHA-256
//     const key = await crypto.subtle.deriveKey(
//       {
//         name: "PBKDF2",
//         salt,
//         iterations: 65536,
//         hash: "SHA-256"
//       },
//       keyMaterial,
//       { name: "AES-GCM", length: 256 },
//       true,
//       ["encrypt"]
//     );

//     // Generate a random IV
//     const iv = crypto.getRandomValues(new Uint8Array(12));

//     // Convert plaintext to ArrayBuffer
//     const encodedText = encoder.encode(text);

//     // Encrypt the data using AES-GCM
//     const encryptedData = await crypto.subtle.encrypt(
//       { name: "AES-GCM", iv },
//       key,
//       encodedText
//     );

//     // Concatenate salt, iv, and ciphertext into a single array
//     const result = new Uint8Array([...iv, ...salt, ...new Uint8Array(encryptedData)]);
//     //   const binaryString = result.reduce((acc, byte) => {
//     //     return acc + String.fromCharCode(byte);
//     // }, '');
//     // return btoa(binaryString);
//     // Convert the result to a Base64 string
//     // return btoa(String.fromCharCode(...result));
//     return uint8ArrayToBase64(result);
//   }

//   function uint8ArrayToBase64(bytes: Uint8Array): string {
//     let binary = '';
//     for (let i = 0; i < bytes.length; i++) {
//       binary += String.fromCharCode(bytes[i]);
//     }
//     return btoa(binary);
//   }

//   export async function decryptData(encryptedData: string, password: string = secretKey): Promise<string> {
//     const encoder = new TextEncoder();
//     const decoder = new TextDecoder();

//     // Convert Base64 string to Uint8Array
//     const array = new Uint8Array(atob(encryptedData).split("").map(c => c.charCodeAt(0)));

//     // Extract salt, iv, and ciphertext from the array
//     const iv = array.slice(0, 12);
//     const salt = array.slice(12, 28);
//     const ciphertext = array.slice(28);

//     // Derive the key using PBKDF2 with HMAC SHA-256
//     const keyMaterial = await crypto.subtle.importKey(
//       "raw",
//       encoder.encode(password),
//       { name: "PBKDF2" },
//       false,
//       ["deriveBits", "deriveKey"]
//     );

//     const key = await crypto.subtle.deriveKey(
//       {
//         name: "PBKDF2",
//         salt,
//         iterations: 65536,
//         hash: "SHA-256"
//       },
//       keyMaterial,
//       { name: "AES-GCM", length: 256 },
//       true,
//       ["decrypt"]
//     );

//     // Decrypt the ciphertext using AES-GCM
//     const decryptedData = await crypto.subtle.decrypt(
//       { name: "AES-GCM", iv },
//       key,
//       ciphertext
//     );
//       // Convert the decrypted data to string
//       return decoder.decode(decryptedData);

//     }
