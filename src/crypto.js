// Polyalphabetic structural matrix algorithm handles symbols and multi-case sequences smoothly
export function runVigenereCipher(text, key, decryptMode = false) {
    let result = "";
    const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (cleanKey.length === 0) return text;

    let keyIndex = 0;
    for (let i = 0; i < text.length; i++) {
        const characterCode = text.charCodeAt(i);

        // Map translations cleanly within standard print-character bounds (ASCII 32 to 126)
        if (characterCode >= 32 && characterCode <= 126) {
            let shiftFactor = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
            if (decryptMode) shiftFactor = -shiftFactor;

            let normalizedPosition = characterCode - 32;
            let targetOffset = (normalizedPosition + shiftFactor) % 95;
            if (targetOffset < 0) targetOffset += 95;

            result += String.fromCharCode(targetOffset + 32);
            keyIndex++;
        } else {
            result += text[i];
        }
    }
    return result;
}

export function convertTextToBinaryBits(text) {
    return text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

export function convertBinaryBitsToText(binary) {
    let resultText = [];
    for (let i = 0; i < binary.length; i += 8) {
        resultText.push(String.fromCharCode(parseInt(binary.slice(i, i + 8), 2)));
    }
    return resultText.join('');
}