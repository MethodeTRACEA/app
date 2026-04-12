"use client";

interface ExitLinkProps {
  label?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Sortie douce TRACÉA : lien discret, non dominant.
 */
export function ExitLink({ label = "Quitter", href, onClick, className = "" }: ExitLinkProps) {
  const base = `font-inter text-[13px] t-text-secondary underline underline-offset-[3px] bg-transparent border-none cursor-pointer transition-opacity duration-200 hover:text-t-creme/60 ${className}`;

  if (href) {
    return <a href={href} className={base}>{label}</a>;
  }

  return (
    <button type="button" onClick={onClick} className={base}>
      {label}
    </button>
  );
}
