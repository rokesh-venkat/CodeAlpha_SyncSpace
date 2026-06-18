import { useEffect, useRef } from "react";

export function AudioVisualizer({ stream, active = true, bars = 20, height = 32, color = "#8b5cf6" }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!stream || !active) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;

    const source = audioCtx.createMediaStreamSource(stream);
    sourceRef.current = source;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bars;
      const step = Math.floor(dataArray.length / bars);

      for (let i = 0; i < bars; i++) {
        const value = dataArray[i * step] / 255;
        const barHeight = Math.max(2, value * canvas.height);
        const x = i * barWidth;
        const y = (canvas.height - barHeight) / 2;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4 + value * 0.6;
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      source.disconnect();
      audioCtx.close();
    };
  }, [stream, active, bars, color]);

  return (
    <canvas
      ref={canvasRef}
      width={bars * 8}
      height={height}
      className="opacity-80"
      style={{ display: active ? "block" : "none" }}
    />
  );
}

export default AudioVisualizer;
