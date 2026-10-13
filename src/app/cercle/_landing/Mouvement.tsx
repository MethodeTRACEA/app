"use client";

import { useEffect, useState } from "react";

// ===================================================================
// Mouvement discret de la page du Cercle + barre « Je m'inscris ».
//
// Apparitions : les éléments [data-reveal] reçoivent .is-in quand ils
// arrivent à l'écran. La classe .cl-motion n'est posée sur la page que
// si le téléphone n'a PAS demandé de réduire les animations ; sans elle,
// tout est visible et immobile (et sans JavaScript aussi).
// Les éléments déjà visibles au chargement sont marqués avant que les
// animations s'activent : pas de clignotement du premier écran.
//
// Barre du bas (téléphone, via CSS) : visible après le premier écran,
// masquée quand le formulaire est à l'écran.
// ===================================================================

export function Mouvement({
  racineId,
  heroId,
  formId,
  barre,
}: {
  racineId: string;
  heroId: string;
  formId: string;
  barre: boolean;
}) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const racine = document.getElementById(racineId);
    if (!racine) return;
    const reduire = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduire || !("IntersectionObserver" in window)) return;

    const elements = Array.from(racine.querySelectorAll<HTMLElement>("[data-reveal]"));
    const h = window.innerHeight;
    for (const el of elements) {
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > 0) el.classList.add("is-in");
    }
    racine.classList.add("cl-motion");

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    elements.filter((el) => !el.classList.contains("is-in")).forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [racineId]);

  useEffect(() => {
    if (!barre || !("IntersectionObserver" in window)) return;
    const hero = document.getElementById(heroId);
    const form = document.getElementById(formId);
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) setHeroVisible(e.isIntersecting);
        if (e.target === form) setFormVisible(e.isIntersecting);
      }
    });
    if (hero) obs.observe(hero);
    if (form) obs.observe(form);
    return () => obs.disconnect();
  }, [barre, heroId, formId]);

  if (!barre) return null;
  const montree = !heroVisible && !formVisible;

  return (
    <div className={`cl-barre${montree ? " is-shown" : ""}`} aria-hidden={!montree}>
      <a href={`#${formId}`} className="cl-cta" tabIndex={montree ? 0 : -1}>
        {"Je m'inscris · 12 €"}
      </a>
    </div>
  );
}
