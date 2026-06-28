// Insère un bloc de données structurées JSON-LD dans la page.
// Rendu côté serveur, invisible pour le visiteur (script non affiché).
// Le remplacement de "<" évite toute fermeture prématurée de script.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
