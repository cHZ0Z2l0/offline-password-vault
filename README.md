# Offline Encrypted Credential Vault

A lightweight, fully offline password manager built with vanilla HTML and JavaScript.  
No server. No cloud. No network calls. Just a file, a passphrase, and strong cryptography.

---

## Why I Built This

I wanted a credential store I could fully trust — one where the security model was transparent to me because I wrote it myself. Storing passwords in a spreadsheet felt wrong. Cloud-based managers felt like trading one risk for another. So I built my own.

The result is a single HTML file you can run in any browser, with no internet connection required.

---

## How It Works

### Encryption
1. You type your plaintext (e.g. a list of credentials) and supply a passphrase
2. A **random salt** is generated using `sodium.randombytes_buf`
3. The passphrase is run through **Argon2** (`crypto_pwhash`) with the salt to derive a strong encryption key — this makes brute-force attacks expensive
4. A **random nonce** is generated
5. The plaintext is encrypted using **XSalsa20-Poly1305** (`crypto_secretbox_easy`) — an authenticated encryption scheme that detects tampering
6. Salt + nonce + ciphertext are packed together and encoded as a **Base64 string** for easy storage

### Decryption
1. You paste the Base64 blob and supply the same passphrase
2. The salt and nonce are extracted from the blob
3. The key is re-derived from your passphrase + salt using the same Argon2 parameters
4. The ciphertext is decrypted and authenticated
5. If the passphrase is wrong, decryption fails — the library does not return garbage, it throws

### Legacy Fallback
Older entries encrypted with **CryptoJS AES** are still supported via an automatic fallback — demonstrating forward-thinking about data migration and backward compatibility.

---

## Security Design Decisions

| Decision | Reason |
|---|---|
| Fully offline | Eliminates network attack surface entirely |
| libsodium.js over Web Crypto API | Battle-tested, opinionated API that makes it hard to use incorrectly |
| Argon2 for key derivation | Memory-hard algorithm — resists GPU brute-force attacks |
| Random salt per encryption | Same passphrase produces a different ciphertext every time |
| Authenticated encryption (Poly1305 MAC) | Detects if the ciphertext has been tampered with |
| Code is public, encrypted data stays local | Security comes from the passphrase, not from hiding the algorithm *(Kerckhoffs's principle)* |

---

## Tech Stack

- **HTML / JavaScript** — no frameworks, no build tools
- **[libsodium.js](https://github.com/jedisct1/libsodium.js)** — primary encryption (XSalsa20-Poly1305 + Argon2)
- **[CryptoJS](https://github.com/brix/crypto-js)** — legacy AES fallback

---

## Running It

1. Clone or download this repo
2. Open `javascriptEncryptDecrypt.html` in any modern browser
3. No install, no server, no dependencies to fetch

---

## About the Author

Built by **Patrich Tan** — a developer with 15+ years of experience in software systems, data integration, and security-conscious design.

---

## License

MIT — use it, learn from it, improve it.
