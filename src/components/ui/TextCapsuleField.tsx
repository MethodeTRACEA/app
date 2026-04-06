"use client";

interface TextCapsuleFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** true = textarea multiligne, false = input simple */
  multiline?: boolean;
  rows?: number;
  className?: string;
}

/**
 * Champ capsule TRACÉA : large, beige translucide, placeholder doux.
 * Classe de base : .t-input (définie dans globals.css).
 */
export function TextCapsuleField({
  value,
  onChange,
  placeholder = "",
  multiline = false,
  rows = 3,
  className = "",
}: TextCapsuleFieldProps) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`t-input resize-none ${className}`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`t-input ${className}`}
    />
  );
}
