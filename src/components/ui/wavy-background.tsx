"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  waveY = 0.5,
  waveCount = 5,
  lowPower = false,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  /** vertical position of the waves, 0 (top) → 1 (bottom) */
  waveY?: number;
  waveCount?: number;
  /** phones: draw at 1/3 resolution (the browser's upscaling softens it, so no blur filter), 30fps */
  lowPower?: boolean;
  [key: string]: any;
}) => {
  const noise = createNoise3D();
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: any,
    canvas: any;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  // In low-power mode the canvas holds fewer pixels and is stretched to full size by CSS.
  const scale = lowPower ? 1 / 3 : 1;
  const setup = () => {
    w = ctx.canvas.width = Math.ceil(window.innerWidth * scale);
    h = ctx.canvas.height = Math.ceil(window.innerHeight * scale);
    ctx.filter = lowPower ? "none" : `blur(${blur}px)`;
  };
  const init = () => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    setup();
    nt = 0;
    onResize = setup;
    window.addEventListener("resize", onResize);
    render();
  };

  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ];
  const drawWave = (n: number) => {
    nt += getSpeed();
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = (waveWidth || 50) * scale;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      // x / y are computed in full-size pixels, then drawn at the canvas scale
      for (x = 0; x < w / scale; x += lowPower ? 10 : 5) {
        var y = noise(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x * scale, y * scale + h * waveY);
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  let animationId: number;
  let onResize: () => void = () => {};
  let lastFrame = 0;
  const render = (now = 0) => {
    animationId = requestAnimationFrame(render);
    if (lowPower) {
      if (now - lastFrame < 33) return; // ~30fps is plenty for slow waves
      lastFrame = now;
    }
    if (backgroundFill === "transparent") {
      ctx.clearRect(0, 0, w, h);
    } else {
      ctx.fillStyle = backgroundFill || "black";
      ctx.globalAlpha = waveOpacity || 0.5;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalAlpha = waveOpacity || 0.5;
    drawWave(waveCount);
  };

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0 h-full w-full"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari && !lowPower ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
