const COLORS = [
  "#ffffff", "#f87171", "#fb923c", "#fbbf24",
  "#4ade80", "#34d399", "#38bdf8", "#818cf8",
  "#c084fc", "#f472b6", "#64748b", "#000000",
];

export function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-[#1a1d27] rounded-xl border border-white/10">
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          title={color}
          className={`w-6 h-6 rounded-md transition-all ${
            value === color ? "ring-2 ring-white ring-offset-1 ring-offset-[#1a1d27] scale-110" : "hover:scale-110 hover:ring-1 hover:ring-white/40"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export default ColorPicker;
