// Initialize sodium when the page loads
let sodiumInitialized = false;

// Initialize sodium
async function initSodium() {
    if (!sodiumInitialized) {
        await sodium.ready;
        sodiumInitialized = true;
        console.log("Sodium initialized successfully");
    }
}

// Call this when the page loads
window.onload = function() {
    // Start sodium initialization
    initSodium().catch(err => {
        console.error("Failed to initialize sodium:", err);
    });
};

async function encrypt()
{
	/*
	var origMessage = document.getElementById("encryptInput").value + "";
	var passPhrase = document.getElementById("encryptPassword").value + "";
	//alert("origMessage: " + origMessage + "passPhrase: " + passPhrase);
	var encrypted = CryptoJS.AES.encrypt(origMessage,passPhrase);	
	document.getElementById("encryptOutput").innerHTML = encrypted;
	return false;
	*/
	if(!sodiumInitialized)
	{
		await initSodium();
	}
	
	var origMessage = document.getElementById("encryptInput").value + "";
	var passPhrase = document.getElementById("encryptPassword").value + "";
	
	if (!origMessage || !passPhrase) {
        document.getElementById("encryptOutput").innerHTML = "Please provide both message and password";
        return false;
    }
	
	try
	{
		// Generate a random salt
        const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
		
		// Derive a key from the password
        const key = sodium.crypto_pwhash(
            sodium.crypto_secretbox_KEYBYTES,
            passPhrase,
            salt,
            sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_ALG_DEFAULT
        );
		
		// Generate a random nonce
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
		
		// Encrypt the message
        const ciphertext = sodium.crypto_secretbox_easy(origMessage, nonce, key);
		
		 // Combine salt, nonce, and ciphertext for storage
        const result = new Uint8Array(salt.length + nonce.length + ciphertext.length);
        result.set(salt, 0);
        result.set(nonce, salt.length);
        result.set(ciphertext, salt.length + nonce.length);
		
		// Convert to base64 for display - simplified approach
        let binaryString = '';
        for (let i = 0; i < result.length; i++) {
            binaryString += String.fromCharCode(result[i]);
        }
        const base64Result = btoa(binaryString);
		
		document.getElementById("encryptOutput").innerHTML = base64Result;
		
		// Log the format info for debugging
        console.log("Encrypted string format:");
        console.log("- Total length: " + base64Result.length);
        console.log("- Salt length: " + salt.length);
        console.log("- Nonce length: " + nonce.length);
        console.log("- Ciphertext length: " + ciphertext.length);
	}catch(error)
	{
		console.error("Encryption error:", error);
        document.getElementById("encryptOutput").innerHTML = "Encryption failed: " + error.message;
	}
	
	return false;
}

async function decrypt()
{
	/*
	var encryptedMessage = document.getElementById("decryptInput").value;
	var passPhrase = document.getElementById("decryptPassword").value;
	var decrypted = CryptoJS.AES.decrypt(encryptedMessage,passPhrase);
	document.getElementById("decryptOutput").innerHTML = decrypted.toString(CryptoJS.enc.Utf8);
	return false;
	*/
	
	const encryptedMessage = document.getElementById("decryptInput").value;
    const passPhrase = document.getElementById("decryptPassword").value;
	
	if (!encryptedMessage || !passPhrase) {
        document.getElementById("decryptOutput").innerHTML = "Please provide both message and password";
        return false;
    }
	
	try {
		if (!sodiumInitialized) {
            await initSodium();
        }
        
        // Convert from base64
        const binaryString = atob(encryptedMessage);
		const messageBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            messageBytes[i] = binaryString.charCodeAt(i);
        }
        
        // Extract the parts
        const saltLength = sodium.crypto_pwhash_SALTBYTES;
        const nonceLength = sodium.crypto_secretbox_NONCEBYTES;
        
        const salt = messageBytes.slice(0, saltLength);
        const nonce = messageBytes.slice(saltLength, saltLength + nonceLength);
        const ciphertext = messageBytes.slice(saltLength + nonceLength);
        
        // Derive key from password and salt - matching encrypt method
        const key = sodium.crypto_pwhash(
            sodium.crypto_secretbox_KEYBYTES,
            passPhrase,
            salt,
            sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_ALG_DEFAULT
        );
        
        // Decrypt
        const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
        const decryptedText = sodium.to_string(decrypted);
        
        document.getElementById("decryptOutput").innerHTML = decryptedText;
	}catch(error){
		console.log("Sodium decryption failed, try legacy CryptoJS method");
		
		try{
			const decrypted = CryptoJS.AES.decrypt(encryptedMessage, passPhrase);
			const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
			
			if (decryptedText) {
                document.getElementById("decryptOutput").innerHTML = decryptedText;
            } else {
                document.getElementById("decryptOutput").innerHTML = "Decryption failed";
            }
		}catch(cryptoJsError){
			console.error("Both decryption methods failed");
			document.getElementById("decryptOutput").innterHTML = "Decryption failed. do you know the passphrase?";
		}
	}
	
	return false;
}

function encryptSixtyFour()
{
	//var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
	
	var origMessage = document.getElementById("encryptSixtyFourInput").value;
	var encoded = window.btoa(origMessage);
	document.getElementById("encryptSixtyFourOutput").innerHTML = encoded + "";
	
	return false;
}