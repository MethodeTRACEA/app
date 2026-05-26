"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const NPS_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const Q2_OPTIONS = [
  { value: "oui_une_fois", label: "Oui, une fois" },
  { value: "oui_plusieurs", label: "Oui, plusieurs fois" },
  { value: "non", label: "Non, je me suis arrêté·e en route" },
] as const;

export default function RetourPage() {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState<number | null>(null);
  const [q5b, setQ5b] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit =
    q1.trim().length > 0 &&
    q2.length > 0 &&
    q3.trim().length > 0 &&
    q5 !== null &&
    status !== "submitting";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/retour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q1, q2, q3, q4, q5, q5b }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(data.error || "Envoi impossible");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Envoi impossible");
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="retour-root">
        <div className="retour-wrap">
          {status === "success" ? (
            <div className="retour-success" role="status" aria-live="polite">
              <h1 className="retour-success-title">Merci.</h1>
              <p className="retour-success-text">Ton retour est précieux.</p>
            </div>
          ) : (
            <>
              <header className="retour-header">
                <h1 className="retour-title">Ton retour sur TRACÉA.</h1>
                <p className="retour-subtitle">
                  5 minutes. Rien de formel, juste ce que tu as vraiment vécu.
                </p>
              </header>

              <form className="retour-form" onSubmit={handleSubmit} noValidate>
                {/* Q1 */}
                <div className="retour-card">
                  <label htmlFor="q1" className="retour-label">
                    Quand tu as ouvert TRACÉA pour la première fois, qu&apos;est-ce que tu as compris en quelques secondes&nbsp;?
                  </label>
                  <textarea
                    id="q1"
                    className="retour-textarea"
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Q2 */}
                <div className="retour-card">
                  <fieldset className="retour-fieldset">
                    <legend className="retour-label">
                      As-tu traversé au moins une fois les 6 étapes T·R·A·C·E·A jusqu&apos;au bout&nbsp;?
                    </legend>
                    <div className="retour-radios">
                      {Q2_OPTIONS.map((opt) => (
                        <label key={opt.value} className="retour-radio">
                          <input
                            type="radio"
                            name="q2"
                            value={opt.value}
                            checked={q2 === opt.value}
                            onChange={(e) => setQ2(e.target.value)}
                            required
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {/* Q3 */}
                <div className="retour-card">
                  <label htmlFor="q3" className="retour-label">
                    Si tu devais expliquer à quelqu&apos;un ce qu&apos;est TRACÉA en une ou deux phrases, que dirais-tu&nbsp;?
                  </label>
                  <textarea
                    id="q3"
                    className="retour-textarea"
                    value={q3}
                    onChange={(e) => setQ3(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Q4 */}
                <div className="retour-card">
                  <label htmlFor="q4" className="retour-label">
                    Y a-t-il eu un moment ou un écran qui t&apos;a fait hésiter, décrocher, ou sortir de l&apos;app&nbsp;?
                    <span className="retour-optional"> (facultatif)</span>
                  </label>
                  <textarea
                    id="q4"
                    className="retour-textarea"
                    value={q4}
                    onChange={(e) => setQ4(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Q5 */}
                <div className="retour-card">
                  <span className="retour-label">
                    Sur une échelle de 0 à 10, quelle est la probabilité que tu recommandes TRACÉA à quelqu&apos;un qui en aurait besoin&nbsp;?
                  </span>
                  <div className="retour-nps" role="radiogroup" aria-label="Note de 0 à 10">
                    {NPS_VALUES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={q5 === n}
                        className={`retour-nps-btn${q5 === n ? " is-selected" : ""}`}
                        onClick={() => setQ5(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q5b */}
                <div className="retour-card">
                  <label htmlFor="q5b" className="retour-label">
                    En une phrase, qu&apos;est-ce qui explique ta note&nbsp;?
                    <span className="retour-optional"> (facultatif)</span>
                  </label>
                  <textarea
                    id="q5b"
                    className="retour-textarea"
                    value={q5b}
                    onChange={(e) => setQ5b(e.target.value)}
                    rows={3}
                  />
                </div>

                {status === "error" && (
                  <p className="retour-error" role="alert">
                    {errorMsg || "Envoi impossible. Réessaie dans un instant."}
                  </p>
                )}

                <button
                  type="submit"
                  className="retour-submit"
                  disabled={!canSubmit}
                >
                  {status === "submitting" ? "Envoi…" : "Envoyer"}
                </button>
              </form>
            </>
          )}

          <footer className="retour-footer">
            <p>
              TRACÉA ne remplace pas un suivi psychologique ou thérapeutique.
              <br />
              En cas de crise grave, le 3114 est joignable 24h/24, gratuit, anonyme.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

const styles = `
.retour-root {
  --t-bg: #1A120D;
  --t-bg-deep: #120D09;
  --t-bg-mid: #241A13;
  --t-surface: rgba(46, 40, 37, 0.82);
  --t-accent: #B8634F;
  --t-accent-light: #C97B6A;
  --t-cream: #F0E6D6;
  --t-cream-dim: rgba(240, 230, 214, 0.44);
  --t-taupe: #6F6A64;
  --t-input-bg: rgba(255,255,255,0.05);
  --t-input-border: rgba(240,230,214,0.15);

  min-height: 100dvh;
  background: var(--t-bg);
  color: var(--t-cream);
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  padding: 24px 16px 48px;
  -webkit-font-smoothing: antialiased;
}
@media (min-width: 720px) {
  .retour-root { padding: 48px 24px 64px; font-size: 17px; }
}

.retour-wrap {
  max-width: 560px;
  margin: 0 auto;
}

.retour-header {
  margin-bottom: 28px;
}
@media (min-width: 720px) {
  .retour-header { margin-bottom: 36px; }
}

.retour-title {
  font-family: 'Cormorant Garamond', 'EB Garamond', Georgia, serif;
  font-weight: 400;
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: 0.005em;
  margin: 0 0 12px;
  color: var(--t-cream);
}
@media (min-width: 720px) {
  .retour-title { font-size: 42px; }
}

.retour-subtitle {
  color: var(--t-cream-dim);
  font-size: 15px;
  margin: 0;
}
@media (min-width: 720px) {
  .retour-subtitle { font-size: 16px; }
}

.retour-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.retour-card {
  background: var(--t-surface);
  border: 1px solid rgba(240,230,214,0.06);
  border-radius: 12px;
  padding: 20px;
}

.retour-fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}

.retour-label {
  display: block;
  color: var(--t-cream);
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 12px;
  line-height: 1.5;
}
@media (min-width: 720px) {
  .retour-label { font-size: 16px; }
}

.retour-optional {
  color: var(--t-cream-dim);
  font-weight: 400;
}

.retour-textarea {
  width: 100%;
  display: block;
  background: var(--t-input-bg);
  border: 1px solid var(--t-input-border);
  border-radius: 8px;
  color: var(--t-cream);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  padding: 12px 14px;
  resize: vertical;
  min-height: 92px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  box-sizing: border-box;
}
@media (min-width: 720px) {
  .retour-textarea { font-size: 16px; }
}
.retour-textarea:focus {
  border-color: var(--t-accent-light);
  box-shadow: 0 0 0 1px var(--t-accent-light);
}

.retour-radios {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.retour-radio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--t-input-bg);
  border: 1px solid var(--t-input-border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--t-cream);
  font-size: 15px;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.retour-radio:hover {
  border-color: rgba(240,230,214,0.28);
}
.retour-radio input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(240,230,214,0.35);
  background: transparent;
  margin: 0;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: border-color 150ms ease;
}
.retour-radio input[type="radio"]:checked {
  border-color: var(--t-accent-light);
}
.retour-radio input[type="radio"]:checked::after {
  content: "";
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--t-accent);
}
.retour-radio:has(input[type="radio"]:checked) {
  border-color: var(--t-accent-light);
}

.retour-nps {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
@media (min-width: 480px) {
  .retour-nps { grid-template-columns: repeat(11, 1fr); }
}

.retour-nps-btn {
  appearance: none;
  -webkit-appearance: none;
  background: var(--t-input-bg);
  border: 1px solid var(--t-input-border);
  color: var(--t-cream-dim);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  height: 40px;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
  padding: 0;
}
.retour-nps-btn:hover {
  border-color: rgba(240,230,214,0.28);
  color: var(--t-cream);
}
.retour-nps-btn.is-selected {
  background: var(--t-accent);
  color: #FFFFFF;
  border-color: var(--t-accent);
}
.retour-nps-btn:focus-visible {
  outline: 2px solid var(--t-accent-light);
  outline-offset: 2px;
}

.retour-submit {
  margin-top: 8px;
  width: 100%;
  height: 52px;
  background: var(--t-accent);
  color: #FFFFFF;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 150ms ease, opacity 150ms ease;
}
.retour-submit:hover:not(:disabled) {
  background: var(--t-accent-light);
}
.retour-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.retour-error {
  color: #E8A89A;
  background: rgba(184, 99, 79, 0.12);
  border: 1px solid rgba(184, 99, 79, 0.3);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  margin: 0;
}

.retour-success {
  min-height: 50dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 0;
}
.retour-success-title {
  font-family: 'Cormorant Garamond', 'EB Garamond', Georgia, serif;
  font-weight: 400;
  font-size: 40px;
  margin: 0 0 8px;
  color: var(--t-cream);
}
.retour-success-text {
  color: var(--t-cream-dim);
  font-size: 16px;
  margin: 0;
}

.retour-footer {
  margin-top: 40px;
  text-align: center;
  color: var(--t-cream-dim);
  font-size: 13px;
  line-height: 1.6;
}
.retour-footer p { margin: 0; }
`;
