import { useEffect, useRef, useState, useCallback } from "react";
import { Toolbar } from "./Toolbar.jsx";

const INITIAL_STATE = { tool: "pen", color: "#ffffff", strokeWidth: 2 };

export function WhiteboardCanvas({ roomId, socket, readOnly = false }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState(INITIAL_STATE.tool);
  const [color, setColor] = useState(INITIAL_STATE.color);
  const [strokeWidth, setStrokeWidth] = useState(INITIAL_STATE.strokeWidth);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const startPoint = useRef(null);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = getCtx().getImageData(0, 0, canvas.width, canvas.height);
    setHistory((h) => [...h, imageData]);
    setRedoStack([]);
  }, [getCtx]);

  const handlePointerDown = useCallback((e) => {
    if (readOnly) return;
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    lastPoint.current = pos;
    startPoint.current = pos;

    if (tool === "pen" || tool === "eraser") {
      saveSnapshot();
      const ctx = getCtx();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }, [readOnly, tool, getPos, getCtx, saveSnapshot]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing.current || readOnly) return;
    e.preventDefault();
    const ctx = getCtx();
    const pos = getPos(e);

    if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPoint.current = pos;
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = strokeWidth * 5;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }, [readOnly, tool, color, strokeWidth, getCtx, getPos]);

  const handlePointerUp = useCallback((e) => {
    if (!isDrawing.current || readOnly) return;
    e.preventDefault();
    isDrawing.current = false;

    const ctx = getCtx();
    const pos = getPos(e);
    const start = startPoint.current;

    if (tool === "line") {
      saveSnapshot();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "rect") {
      saveSnapshot();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.strokeRect(start.x, start.y, pos.x - start.x, pos.y - start.y);
    } else if (tool === "circle") {
      saveSnapshot();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      const r = Math.sqrt(Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
    lastPoint.current = null;
    startPoint.current = null;
  }, [readOnly, tool, color, strokeWidth, getCtx, getPos, saveSnapshot]);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const next = [...h];
      const last = next.pop();
      setRedoStack((r) => [...r, last]);
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (next.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.putImageData(next[next.length - 1], 0, 0);
      }
      return next;
    });
  }, [getCtx]);

  const handleRedo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = [...r];
      const item = next.pop();
      setHistory((h) => [...h, item]);
      getCtx().putImageData(item, 0, 0);
      return next;
    });
  }, [getCtx]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveSnapshot();
    getCtx().clearRect(0, 0, canvas.width, canvas.height);
  }, [getCtx, saveSnapshot]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 1200;
    canvas.height = canvas.offsetHeight || 800;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0d0f14]">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        style={{ cursor: tool === "eraser" ? "cell" : tool === "select" ? "default" : "crosshair" }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      {!readOnly && (
        <Toolbar
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          onToolChange={setTool}
          onColorChange={setColor}
          onStrokeWidthChange={setStrokeWidth}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onExport={handleExport}
          canUndo={history.length > 0}
          canRedo={redoStack.length > 0}
        />
      )}
    </div>
  );
}

export default WhiteboardCanvas;
