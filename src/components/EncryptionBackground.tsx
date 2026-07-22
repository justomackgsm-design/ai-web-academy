import React, { useEffect, useRef } from "react";

export default function EncryptionBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    // Professional hacking/coding characters — binary, hex, code syntax
    const codeChars = [
      "0","1","0","1","1","0","0","1",
      "A","B","C","D","E","F",
      "{","}","[","]","(",")",";","=>","&&","||","!=","==",
      "AI","ML","API","SSL","TLS","256","512",
      "def","var","let","fn","if","for","return",
      "0x","ff","a3","7d","9c","b2","e5","4f",
      ">>>","<<<","/*","*/","//","#!",
      "∑","∞","λ","π","Ω","∂","∇",
    ];

    // Streams in 3 color layers for depth
    type ColorLayer = "green" | "blue" | "purple";

    interface Stream {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      opacity: number;
      layer: ColorLayer;
      fontSize: number;
    }

    const fontSize = 13;
    let streams: Stream[] = [];

    const layerColors: Record<ColorLayer, { head: string; near: string; tail: string; shadow: string }> = {
      green:  { head: "rgba(0, 255, 100, OPACITY)", near: "rgba(0, 200, 70, OPACITY)", tail: "rgba(0, 140, 40, OPACITY)", shadow: "#00ff64" },
      blue:   { head: "rgba(0, 180, 255, OPACITY)", near: "rgba(0, 140, 210, OPACITY)", tail: "rgba(0, 90, 160, OPACITY)", shadow: "#00b4ff" },
      purple: { head: "rgba(160, 80, 255, OPACITY)", near: "rgba(120, 60, 200, OPACITY)", tail: "rgba(80, 30, 160, OPACITY)", shadow: "#a050ff" },
    };

    const initStreams = () => {
      streams = [];
      const columns = Math.ceil(window.innerWidth / 22);
      for (let i = 0; i < columns; i++) {
        const layers: ColorLayer[] = ["green", "green", "green", "blue", "purple"]; // mostly green (Matrix style)
        const layer = layers[Math.floor(Math.random() * layers.length)];
        streams.push({
          x: i * 22 + Math.random() * 4,
          y: Math.random() * -window.innerHeight * 1.5,
          speed: 0.8 + Math.random() * 2.5,
          chars: Array.from({ length: 12 + Math.floor(Math.random() * 25) }, () =>
            codeChars[Math.floor(Math.random() * codeChars.length)]
          ),
          opacity: 0.04 + Math.random() * 0.14,
          layer,
          fontSize: fontSize + Math.floor(Math.random() * 3),
        });
      }
    };
    initStreams();
    window.addEventListener("resize", initStreams);

    let animationFrameId: number;

    const draw = () => {
      // Dark fade for clear trailing effect
      ctx.fillStyle = "rgba(248, 250, 252, 0.10)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      streams.forEach((stream) => {
        const colors = layerColors[stream.layer];

        for (let j = 0; j < stream.chars.length; j++) {
          const charY = stream.y - j * stream.fontSize * 1.3;
          if (charY < -60 || charY > window.innerHeight + 60) continue;

          const char = stream.chars[j];
          const isHead = j === 0;
          const isNear = j < 4;

          const opStr = (mult: number) => String(Math.min(stream.opacity * mult, 1));

          if (isHead) {
            ctx.fillStyle = colors.head.replace("OPACITY", opStr(3.5));
            ctx.font = `bold ${stream.fontSize + 2}px "Courier New", monospace`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = colors.shadow;
          } else if (isNear) {
            ctx.fillStyle = colors.near.replace("OPACITY", opStr(2.2));
            ctx.font = `600 ${stream.fontSize}px "Courier New", monospace`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = colors.shadow;
          } else {
            ctx.fillStyle = colors.tail.replace("OPACITY", opStr(1));
            ctx.font = `${stream.fontSize - 1}px "Courier New", monospace`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(char, stream.x, charY);
          ctx.shadowBlur = 0;
        }

        stream.y += stream.speed;

        // Mutate characters randomly for glitch feel
        if (Math.random() < 0.04) {
          const idx = Math.floor(Math.random() * stream.chars.length);
          stream.chars[idx] = codeChars[Math.floor(Math.random() * codeChars.length)];
        }

        // Reset when off screen
        if (stream.y - stream.chars.length * stream.fontSize * 1.3 > window.innerHeight) {
          stream.y = -60;
          stream.speed = 0.8 + Math.random() * 2.5;
          stream.opacity = 0.04 + Math.random() * 0.14;
          const layers: ColorLayer[] = ["green", "green", "green", "blue", "purple"];
          stream.layer = layers[Math.floor(Math.random() * layers.length)];
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("resize", initStreams);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="encryption-background-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.35, mixBlendMode: "multiply" }}
    />
  );
}
