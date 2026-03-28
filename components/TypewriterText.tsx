import { useState, useEffect, useRef } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface TypewriterTextProps {
  text: string;
  active: boolean;
  delay?: number;
  startDelay?: number;
  style?: StyleProp<TextStyle>;
}

export function TypewriterText({
  text,
  active,
  delay = 30,
  startDelay = 0,
  style,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (active && !hasPlayed.current) {
      hasPlayed.current = true;
      const startTyping = () => {
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setVisibleCount(i);
          if (i >= text.length) clearInterval(interval);
        }, delay);
      };
      if (startDelay > 0) {
        setTimeout(startTyping, startDelay);
      } else {
        startTyping();
      }
    }
  }, [active]);

  useEffect(() => {
    hasPlayed.current = false;
    setVisibleCount(0);
  }, [text]);

  return (
    <Text style={style}>
      {text.slice(0, visibleCount)}
      {visibleCount < text.length && <Text style={{ opacity: 0 }}>{text.slice(visibleCount)}</Text>}
    </Text>
  );
}
