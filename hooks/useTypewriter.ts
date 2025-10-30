import { useState, useEffect } from 'react';

interface TypewriterResult {
  text: string;
  isComplete: boolean;
}

export const useTypewriter = (
  fullText: string,
  speed: number = 50,
  enabled: boolean = true
): TypewriterResult => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayText('');
      setCurrentIndex(0);
      setIsComplete(false);
      return;
    }

    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === fullText.length && fullText.length > 0) {
      setIsComplete(true);
    }
  }, [currentIndex, fullText, speed, enabled]);

  // Reset quando o texto mudar
  useEffect(() => {
    if (enabled) {
      setDisplayText('');
      setCurrentIndex(0);
      setIsComplete(false);
    }
  }, [fullText, enabled]);

  return { text: displayText, isComplete };
};

