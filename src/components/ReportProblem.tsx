"use client";

const SUBJECT = "Problème rencontré sur TRACÉA";

const BODY = `Quelques mots sur ce qui s'est passé :

À quel moment dans l'app :
`;

const HREF = `mailto:bonjour@methodetracea.fr?subject=${encodeURIComponent(
  SUBJECT
)}&body=${encodeURIComponent(BODY)}`;

export function ReportProblem() {
  return (
    <div className="text-center mt-2">
      {/* WCAG AA (chantier 60, Lighthouse) : t-text-ghost + opacity-60
          cumulés donnaient un ratio de 1,71. t-text-secondary seul
          atteint ~5,7 sur le fond sombre, tout en restant discret. */}
      <a
        href={HREF}
        className="font-inter text-xs t-text-secondary hover:t-text-beige transition-colors underline"
      >
        Signaler un problème
      </a>
    </div>
  );
}
