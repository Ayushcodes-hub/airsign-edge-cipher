// Local client wrapper executing inference completely in browser WebAssembly cache layers
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

export class LocalPredictorEngine {
    constructor() {
        this.generator = null;
        this.isLoaded = false;
    }

    async initialize(statusCallback) {
        try {
            statusCallback("// FETCHING LIGHTWEIGHT ATOMIC MODEL INTO LOCAL CACHE...");
            // Allocating local pipeline for masked text fill token generation tasks
            this.generator = await pipeline('fill-mask', 'Xenova/pico-bert', {
                device: 'wasm',
                dtype: 'fp32'
            });
            this.isLoaded = true;
            statusCallback("// LOCAL TRANSFORMERS.JS INSTANCE RUNNING WORKLOADS OFFLINE");
        } catch (err) {
            console.error("Local inference model crashed:", err);
            statusCallback("// RUNTIME MODEL ERROR - FALLING BACK TO HYBRID SYSTEM ARCHITECTURE");
        }
    }

    async getSuggestion(currentText) {
        if (!this.isLoaded || !currentText.trim()) return "";
        try {
            const tokens = currentText.trim().split(/\s+/);
            const partialPrompt = tokens.join(" ") + " [MASK]";
            
            const results = await this.generator(partialPrompt, { topk: 1 });
            if (results && results.length > 0) {
                const predictedWord = results[0].token_str.toUpperCase().replace(/[^A-Z]/g, '');
                return predictedWord;
            }
        } catch (e) {
            return "";
        }
        return "";
    }
}