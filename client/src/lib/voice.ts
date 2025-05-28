export class VoiceInput {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(onResult: (text: string) => void, onError?: (error: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = 'Speech recognition not supported';
        onError?.(error);
        reject(new Error(error));
        return;
      }

      if (this.isListening) {
        resolve();
        return;
      }

      this.isListening = true;

      this.recognition.onresult = (event) => {
        const result = event.results[0];
        if (result.isFinal) {
          const text = result[0].transcript;
          onResult(text);
          this.isListening = false;
          resolve();
        }
      };

      this.recognition.onerror = (event) => {
        const error = `Speech recognition error: ${event.error}`;
        onError?.(error);
        this.isListening = false;
        reject(new Error(error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        const errorMessage = 'Failed to start speech recognition';
        onError?.(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceInput = new VoiceInput();
