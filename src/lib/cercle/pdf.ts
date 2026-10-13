import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  CONDITIONS,
  CONDITIONS_TITRE,
  FORMULAIRE_RETRACTATION,
} from "./textes";
import { TEXTES_VERSION } from "./config";

// ===================================================================
// Le Cercle TRACÉA en ligne — PDF joints à l'email de confirmation.
//   - les conditions d'inscription (même texte que /cercle/conditions) ;
//   - le formulaire type de rétractation (annexe R221-1 C. conso).
// Fabriqués à la demande, côté serveur, à partir de src/lib/cercle/
// textes.ts. Polices standard PDF (Helvetica) : rien à télécharger.
// ===================================================================

const A4: [number, number] = [595.28, 841.89];
const MARGE = 60;
const LARGEUR = A4[0] - MARGE * 2;

const ESPRESSO = rgb(0.17, 0.12, 0.08);
const CORPS = rgb(0.29, 0.23, 0.18);
const TERRA = rgb(0.54, 0.29, 0.18);

// Les polices standard PDF ne connaissent que l'alphabet « WinAnsi » :
// on remplace les rares caractères hors de cet alphabet.
function propre(t: string): string {
  return t
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ | /g, " ")
    .replace(/‑/g, "-");
}

class Redacteur {
  private page: PDFPage;
  private y: number;
  constructor(
    private doc: PDFDocument,
    private regular: PDFFont,
    private bold: PDFFont
  ) {
    this.page = doc.addPage(A4);
    this.y = A4[1] - MARGE;
  }

  private nouvellePageSiBesoin(hauteur: number) {
    if (this.y - hauteur < MARGE) {
      this.page = this.doc.addPage(A4);
      this.y = A4[1] - MARGE;
    }
  }

  private lignes(texte: string, font: PDFFont, taille: number): string[] {
    const mots = propre(texte).split(/\s+/);
    const out: string[] = [];
    let ligne = "";
    for (const mot of mots) {
      const essai = ligne ? `${ligne} ${mot}` : mot;
      if (font.widthOfTextAtSize(essai, taille) > LARGEUR && ligne) {
        out.push(ligne);
        ligne = mot;
      } else {
        ligne = essai;
      }
    }
    if (ligne) out.push(ligne);
    return out;
  }

  texte(
    t: string,
    opts: { taille?: number; gras?: boolean; couleur?: ReturnType<typeof rgb>; interligne?: number; apres?: number } = {}
  ) {
    const taille = opts.taille ?? 10.5;
    const font = opts.gras ? this.bold : this.regular;
    const interligne = opts.interligne ?? taille * 1.5;
    for (const l of this.lignes(t, font, taille)) {
      this.nouvellePageSiBesoin(interligne);
      this.page.drawText(l, {
        x: MARGE,
        y: this.y - taille,
        size: taille,
        font,
        color: opts.couleur ?? CORPS,
      });
      this.y -= interligne;
    }
    this.y -= opts.apres ?? 6;
  }

  espace(h: number) {
    this.y -= h;
  }

  trait() {
    this.nouvellePageSiBesoin(12);
    this.page.drawLine({
      start: { x: MARGE, y: this.y },
      end: { x: MARGE + 36, y: this.y },
      thickness: 1.5,
      color: TERRA,
    });
    this.y -= 12;
  }

  ligneAEcrire() {
    this.nouvellePageSiBesoin(26);
    this.y -= 18;
    this.page.drawLine({
      start: { x: MARGE, y: this.y },
      end: { x: MARGE + LARGEUR, y: this.y },
      thickness: 0.5,
      color: rgb(0.7, 0.66, 0.6),
    });
    this.y -= 14;
  }
}

async function nouveauDocument(titre: string) {
  const doc = await PDFDocument.create();
  doc.setTitle(titre);
  doc.setAuthor("Alyson Sire EI");
  doc.setCreator("Le Cercle TRACÉA en ligne");
  doc.setLanguage("fr-FR");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  return { doc, r: new Redacteur(doc, regular, bold) };
}

let cacheConditions: Uint8Array | null = null;
let cacheFormulaire: Uint8Array | null = null;

export async function pdfConditions(): Promise<Uint8Array> {
  if (cacheConditions) return cacheConditions;
  const { doc, r } = await nouveauDocument("Conditions d'inscription · Le Cercle TRACÉA en ligne");
  r.texte("Le Cercle TRACÉA en ligne", { taille: 10, gras: true, couleur: TERRA, apres: 2 });
  r.texte(CONDITIONS_TITRE, { taille: 20, gras: true, couleur: ESPRESSO, interligne: 26, apres: 4 });
  r.texte(`Version du ${formatVersion(TEXTES_VERSION)}`, { taille: 9, apres: 14 });
  for (const s of CONDITIONS) {
    r.espace(6);
    r.trait();
    r.texte(s.titre, { taille: 12.5, gras: true, couleur: ESPRESSO, apres: 2 });
    for (const p of s.paragraphes) r.texte(p, { apres: 6 });
  }
  cacheConditions = await doc.save();
  return cacheConditions;
}

export async function pdfFormulaireRetractation(): Promise<Uint8Array> {
  if (cacheFormulaire) return cacheFormulaire;
  const f = FORMULAIRE_RETRACTATION;
  const { doc, r } = await nouveauDocument("Formulaire de rétractation · Le Cercle TRACÉA en ligne");
  r.texte("Le Cercle TRACÉA en ligne", { taille: 10, gras: true, couleur: TERRA, apres: 2 });
  r.texte(f.titre, { taille: 20, gras: true, couleur: ESPRESSO, interligne: 26, apres: 10 });
  r.texte(f.consigne, { apres: 14 });
  r.texte(f.destinataire, { gras: true, couleur: ESPRESSO, apres: 14 });
  const [notification, ...champs] = f.lignes;
  r.texte(notification, { apres: 2 });
  r.ligneAEcrire();
  r.ligneAEcrire();
  for (const c of champs) {
    r.espace(8);
    r.texte(c, { apres: 0 });
    r.ligneAEcrire();
  }
  r.espace(10);
  r.texte(f.note, { taille: 9 });
  cacheFormulaire = await doc.save();
  return cacheFormulaire;
}

function formatVersion(v: string): string {
  const d = new Date(`${v}T12:00:00+02:00`);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}
