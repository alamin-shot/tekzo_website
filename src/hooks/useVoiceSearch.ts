import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { SpeechRecognitionLike, VoiceSearchState } from "@/types/search";

// Browser speech-to-text for the search bar (Chrome/Edge/Safari;
// silently unavailable elsewhere). Calls onTranscript with the result.
export function useVoiceSearch(onTranscript: (transcript: string) => void): VoiceSearchState {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const toggleListening = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = ({ results }) => {
      onTranscript(results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  return { isListening, toggleListening };
}
