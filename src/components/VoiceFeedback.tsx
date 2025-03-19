
import { useEffect, useRef } from 'react';

type VoiceFeedbackProps = {
  text: string | null;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  play?: boolean;
};

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({
  text,
  rate = 1,
  pitch = 1,
  volume = 1,
  lang = 'en-IN',
  onStart,
  onEnd,
  play = true,
}) => {
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const previousTextRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis is not supported in this browser');
      return;
    }

    // Clean up previous utterance
    if (speechSynthRef.current) {
      window.speechSynthesis.cancel();
    }

    // If there's no text or we shouldn't play, do nothing
    if (!text || !play) return;

    // Don't repeat the same text unless explicitly reset
    if (text === previousTextRef.current) return;
    
    previousTextRef.current = text;

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;

    // Add event handlers
    utterance.onstart = () => {
      console.log('Speech started:', text);
      onStart?.();
    };

    utterance.onend = () => {
      console.log('Speech ended');
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    // Store reference to current utterance
    speechSynthRef.current = utterance;

    // Speak the text
    window.speechSynthesis.speak(utterance);

    // Clean up on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, rate, pitch, volume, lang, onStart, onEnd, play]);

  // This component doesn't render anything visible
  return null;
};

export default VoiceFeedback;
