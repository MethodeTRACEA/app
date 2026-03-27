"use client";

interface IntensitySliderProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  disabled?: boolean;
}

const LABELS = [
  "",
  "Calme",
  "Léger",
  "Modéré",
  "Élevé",
  "Inconfortable",
  "Fenêtre haute",
  "Intense",
  "Très intense",
  "Débordement",
  "Submersion",
];

export function IntensitySlider({
  value,
  onChange,
  label = "Intensité émotionnelle",
  disabled = false,
}: IntensitySliderProps) {
  const pct = (value / 10) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium tracking-widest uppercase text-warm-gray">
          {label}
        </span>
        <span className="font-serif text-2xl text-espresso">{value}/10</span>
      </div>
      <div className="relative">
        <div className="ira-bar h-3 rounded-full">
          <div className="ira-fill rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-[0.65rem] text-warm-gray">
        <span>0</span>
        <span>Calme</span>
        <span>Fenêtre</span>
        <span>Débordement</span>
        <span>10</span>
      </div>
      <p className="text-sm text-warm-gray italic font-body">{LABELS[value]}</p>
    </div>
  );
}
