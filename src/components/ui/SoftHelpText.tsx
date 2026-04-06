"use client";

import { useState, type ReactNode } from "react";

interface SoftHelpTextProps {
  /** Texte du lien cliquable */
  trigger: string;
  /** Texte d'aide affiché au clic */
  children: ReactNode;
  className?: string;
}

/**
 * Lien secondaire discret + aide pliable.
 * Style : 13px, opacité réduite, souligné.
 */
export function SoftHelpText({ trigger, children, className = "" }: SoftHelpTextProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`text-center mt-t-sm ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="font-inter text-[13px] text-t-creme/50 underline underline-offset-[3px] bg-transparent border-none cursor-pointer transition-opacity duration-200 hover:text-t-creme/70"
      >
        {trigger}
      </button>
      {open && (
        <p className="font-inter text-sm text-t-creme/60 italic mt-2 leading-relaxed">
          {children}
        </p>
      )}
    </div>
  );
}
