"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#1A120D",
          color: "#F0E6D6",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.5,
              fontWeight: 300,
              color: "rgba(240,230,214,0.85)",
              margin: "0 0 28px",
            }}
          >
            Quelque chose n&apos;a pas fonctionn&eacute;. Tu peux recharger la page ou revenir plus tard.
          </p>

          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.5,
              fontWeight: 300,
              color: "rgba(240,230,214,0.60)",
              margin: "0 0 28px",
            }}
          >
            Si tu vis un moment difficile, tu peux appeler le{" "}
            <a
              href="tel:3114"
              style={{
                color: "#F0E6D6",
                textDecoration: "underline",
              }}
            >
              3114
            </a>
            {" "}(gratuit, 24h/24).
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "14px 28px",
              borderRadius: "999px",
              border: "1px solid rgba(212,169,106,0.50)",
              background: "rgba(212,169,106,0.18)",
              color: "#F0E6D6",
              fontSize: "16px",
              fontWeight: 400,
              letterSpacing: "0.03em",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
