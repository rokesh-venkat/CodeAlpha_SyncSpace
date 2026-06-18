import { Undo2, Redo2, Trash2, Download, ZoomIn, ZoomOut } from "lucide-react";
import { DrawingTools } from "./DrawingTools.jsx";
import { ColorPicker } from "./ColorPicker.jsx";

const STROKE_WIDTHS = [1, 2, 4, 8];

export function Toolbar({ tool, color, strokeWidth, onToolChange, onColorChange, onStrokeWidthChange, onUndo, onRedo, onClear, onExport, canUndo, canRedo }) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
      <DrawingTools activeTool={tool} onToolChange={onToolChange} />

      <div className="flex flex-col gap-1.5 p-2 bg-[#1a1d27] rounded-xl border border-white/10">
        <span className="text-[9px] text-white/30 uppercase tracking-wider px-1">Width</span>
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            onClick={() => onStrokeWidthChange(w)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              strokeWidth === w ? "bg-violet-600" : "hover:bg-white/10"
            }`}
          >
            <div className="bg-white rounded-full" style={{ width: w * 3, height: w * 3 }} />
          </button>
        ))}
      </div>

      <ColorPicker value={color} onChange={onColorChange} />

      <div className="flex flex-col gap-1 p-2 bg-[#1a1d27] rounded-xl border border-white/10">
        <button onClick={onUndo} disabled={!canUndo} title="Undo" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <Undo2 size={15} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <Redo2 size={15} />
        </button>
        <button onClick={onClear} title="Clear" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 size={15} />
        </button>
        <button onClick={onExport} title="Export PNG" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
          <Download size={15} />
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
