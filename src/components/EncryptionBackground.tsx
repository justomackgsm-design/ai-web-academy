import React, { useEffect, useRef } from "react";

export default function EncryptionBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Cryptographic and digital characters
    const cryptoChars = [
      "0", "1", "0", "1", "0", "1", // heavily prioritize binary
      "A", "B", "C", "D", "E", "F", "X", "Y", "Z", // hex & algebra
      "🔒", "🔓", "🔑", "🛡️", "🔑", "💻", // cybersecurity emojis
      "★", "✦", "◆", "▲", "✖", "✚", // technical glyphs
      "0x", "ff", "a3", "7d", "9c", "e5" // byte snippets
    ];

    const keywords = ["ENCRYPT", "DECRYPT", "SECURE", "ELITE", "CIPHER", "HASH", "KEY", "SSL", "TLS", "AI"];

    // Stream state
    const fontSize = 14;
    let columns = Math.ceil(window.innerWidth / 20);
    
    interface Stream {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      opacity: number;
      word?: string;
      wordIndex?: number;
    }

    let streams: Stream[] = [];

    const initStreams = () => {
      columns = Math.ceil(window.innerWidth / 20);
      streams = [];
      for (let i = 0; i < columns; i++) {
        // Randomly select if this column will show a keyword
        const hasKeyword = Math.random() < 0.12;
        const word = hasKeyword ? keywords[Math.floor(Math.random() * keywords.length)] : undefined;
        
        streams.push({
          x: i * 20 + Math.random() * 5,
          y: Math.random() * -window.innerHeight,
          speed: 1.2 + Math.random() * 3,
          chars: Array.from({ length: 15 + Math.floor(Math.random() * 20) }, () => 
            cryptoChars[Math.floor(Math.random() * cryptoChars.length)]
          ),
          opacity: 0.05 + Math.random() * 0.18, // subtle overlay to maintain readability of text on top
          word,
          wordIndex: word ? 0 : undefined
        });
      }
    };

    initStreams();

    // Reinitialize streams on resize to fit the screen
    const handleResizeInit = () => {
      initStreams();
    };
    window.addEventListener("resize", handleResizeInit);

    let animationFrameId: number;

    const draw = () => {
      // Clear with a slight fade effect to create the tail/trail of falling code
      ctx.fillStyle = "rgba(248, 250, 252, 0.12)"; // match bg-slate-50 slightly to wash out
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      streams.forEach((stream) => {
        // Draw the stream characters
        for (let j = 0; j < stream.chars.length; j++) {
          const charY = stream.y - (j * fontSize * 1.2);
          
          // Skip drawing if outside viewport
          if (charY < -50 || charY > window.innerHeight + 50) continue;

          // Determine character to draw
          let char = stream.chars[j];
          
          // If stream has a word, substitute characters at the head with word letters
          if (stream.word && j < stream.word.length) {
            char = stream.word[j];
          }

          // Visual treatment: head is brighter, trail is dimmer
          const isHead = j === 0;
          const isNearHead = j < 3;
          
          if (isHead) {
            ctx.fillStyle = `rgba(79, 70, 229, ${stream.opacity * 2.2})`; // glowing Indigo-600
            ctx.font = `bold ${fontSize + 2}px "JetBrains Mono", monospace`;
          } else if (isNearHead) {
            ctx.fillStyle = `rgba(99, 102, 241, ${stream.opacity * 1.5})`; // Indigo-500
            ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
          } else {
            ctx.fillStyle = `rgba(129, 140, 248, ${stream.opacity})`; // Indigo-400
            ctx.font = `${fontSize - 1}px "JetBrains Mono", monospace`;
          }

          // Draw shadows for high-fidelity glowing effect
          ctx.shadowBlur = isHead ? 6 : 0;
          ctx.shadowColor = "#6366f1";

          ctx.fillText(char, stream.x, charY);
          
          // Reset shadow
          ctx.shadowBlur = 0;
        }

        // Move the stream down
        stream.y += stream.speed;

        // Mutate some characters randomly for animation effect
        if (Math.random() < 0.05) {
          const mutateIndex = Math.floor(Math.random() * stream.chars.length);
          stream.chars[mutateIndex] = cryptoChars[Math.floor(Math.random() * cryptoChars.length)];
        }

        // Reset stream when it goes off screen
        if (stream.y - (stream.chars.length * fontSize * 1.2) > window.innerHeight) {
          stream.y = -50;
          stream.speed = 1.2 + Math.random() * 3;
          const hasKeyword = Math.random() < 0.12;
          stream.word = hasKeyword ? keywords[Math.floor(Math.random() * keywords.length)] : undefined;
          stream.opacity = 0.05 + Math.random() * 0.18;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("resize", handleResizeInit);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="encryption-background-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
