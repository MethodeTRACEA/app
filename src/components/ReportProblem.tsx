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
      <a
        href={HREF}
        className="font-inter text-xs t-text-ghost opacity-60 hover:opacity-100 transition-opacity underline"
      >
        Signaler un problème
      </a>
    </div>
  );
}
