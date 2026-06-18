import { Pencil, Square, Circle, Minus, Type, Eraser, MousePointer } from "lucide-react";

const TOOLS = [
  { id: "select", icon: MousePointer, label: "Select" },
  { id: "pen", icon: Pencil, label: "Pen" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "text", icon: Type, label: "Text" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

export function DrawingTools({ activeTool, onToolChange }) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-[#1a1d27] rounded-xl border border-white/10">
      {TOOLS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onToolChange(id)}
          title={label}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            activeTool === id
              ? "bg-violet-600 text-white"
              : "text-white/50 hover:text-white hover:bg-white/10"
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

export default DrawingTools;
