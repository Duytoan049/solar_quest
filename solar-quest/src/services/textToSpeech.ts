/**
 * Text-to-Speech Service using Web Speech API
 * Supports Vietnamese and English voices
 */

export interface TTSOptions {
    rate?: number; // 0.1 to 10 (default: 1)
    pitch?: number; // 0 to 2 (default: 1)
    volume?: number; // 0 to 1 (default: 1)
    lang?: string; // 'vi-VN' or 'en-US'
}

class TextToSpeechService {
    private synth: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private isPaused: boolean = false;
    private voicesLoaded: boolean = false;

    constructor() {
        this.synth = window.speechSynthesis;
        this.initVoices();
    }

    /**
     * Initialize and wait for voices to be loaded
     */
    private initVoices(): void {
        // Voices might not be loaded immediately
        if (this.synth.getVoices().length > 0) {
            this.voicesLoaded = true;
        }

        // Listen for voices changed event
        if ('onvoiceschanged' in this.synth) {
            this.synth.onvoiceschanged = () => {
                this.voicesLoaded = true;
                console.log('TTS voices loaded:', this.synth.getVoices().length);
            };
        }
    }

    /**
     * Get available voices
     */
    getVoices(): SpeechSynthesisVoice[] {
        return this.synth.getVoices();
    }

    /**
     * Get Vietnamese voice (fallback to first available)
     */
    getVietnameseVoice(): SpeechSynthesisVoice | null {
        const voices = this.getVoices();

        // Try to find Vietnamese voice
        const viVoice = voices.find(
            (voice) =>
                voice.lang.includes("vi") || voice.lang.includes("VN")
        );

        // Fallback: Try Google Vietnamese
        const googleVi = voices.find((voice) =>
            voice.name.toLowerCase().includes("vietnamese")
        );

        // Fallback: Any voice with 'vi' in name
        const anyVi = voices.find((voice) =>
            voice.name.toLowerCase().includes("vi")
        );

        return viVoice || googleVi || anyVi || voices[0] || null;
    }

    /**
     * Get English voice
     */
    getEnglishVoice(): SpeechSynthesisVoice | null {
        const voices = this.getVoices();

        // Try US English first
        const enUS = voices.find((voice) => voice.lang === "en-US");

        // Fallback: Any English
        const anyEn = voices.find((voice) => voice.lang.startsWith("en"));

        return enUS || anyEn || voices[0] || null;
    }

    /**
     * Speak text with options
     */
    speak(
        text: string,
        options: TTSOptions = {},
        onEnd?: () => void,
        onError?: (error: Error) => void
    ): void {
        // Cancel any ongoing speech
        this.cancel();

        if (!text.trim()) return;

        // Force load voices if not loaded
        if (!this.voicesLoaded) {
            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                this.voicesLoaded = true;
            }
        }

        console.log('TTS Speaking:', text.substring(0, 50) + '...', 'Lang:', options.lang);

        const utterance = new SpeechSynthesisUtterance(text);

        // Apply options
        utterance.rate = options.rate ?? 1.0;
        utterance.pitch = options.pitch ?? 1.0;
        utterance.volume = options.volume ?? 1.0;
        utterance.lang = options.lang ?? "vi-VN";

        // Select appropriate voice
        const voice =
            options.lang === "en-US"
                ? this.getEnglishVoice()
                : this.getVietnameseVoice();

        if (voice) {
            utterance.voice = voice;
            console.log('TTS Voice selected:', voice.name, voice.lang);
        } else {
            console.warn('TTS No voice found for lang:', options.lang);
        }

        // Event handlers
        utterance.onend = () => {
            console.log('TTS Finished');
            this.currentUtterance = null;
            this.isPaused = false;
            if (onEnd) onEnd();
        };

        utterance.onerror = (event) => {
            // Some browsers report 'interrupted' when speech is cancelled/paused.
            // Treat 'interrupted' as a non-fatal interruption (expected when calling cancel/resume/etc.).
            const evt: any = event as any;
            const errCode = evt && evt.error ? String(evt.error) : '';
            if (errCode === 'interrupted') {
                console.debug('TTS interrupted (expected during cancel/pause)');
                this.currentUtterance = null;
                this.isPaused = false;
                return;
            }

            console.error('TTS Error:', event);
            this.currentUtterance = null;
            this.isPaused = false;
            if (onError) onError(new Error(errCode || 'unknown'));
        };

        utterance.onstart = () => {
            console.log('TTS Started');
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    /**
     * Pause current speech
     */
    pause(): void {
        if (this.synth.speaking && !this.isPaused) {
            this.synth.pause();
            this.isPaused = true;
        }
    }

    /**
     * Resume paused speech
     */
    resume(): void {
        if (this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
        }
    }

    /**
     * Stop and cancel current speech
     */
    cancel(): void {
        this.synth.cancel();
        this.currentUtterance = null;
        this.isPaused = false;
    }

    /**
     * Check if currently speaking
     */
    isSpeaking(): boolean {
        return this.synth.speaking;
    }

    /**
     * Check if paused
     */
    isPausedState(): boolean {
        return this.isPaused;
    }
}

// Singleton instance
export const ttsService = new TextToSpeechService();

// Helper function to initialize voices (call this on app mount)
export function initializeTTS(): Promise<void> {
    return new Promise((resolve) => {
        const synth = window.speechSynthesis;

        // Voices might not be loaded immediately
        if (synth.getVoices().length > 0) {
            resolve();
        } else {
            // Wait for voices to be loaded
            synth.addEventListener("voiceschanged", () => {
                resolve();
            });

            // Fallback timeout
            setTimeout(resolve, 1000);
        }
    });
}

// Auto-detect language from text
export function detectLanguage(text: string): "vi-VN" | "en-US" {
    // Simple detection: if text has Vietnamese characters, it's Vietnamese
    const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

    return vietnameseChars.test(text) ? "vi-VN" : "en-US";
}
