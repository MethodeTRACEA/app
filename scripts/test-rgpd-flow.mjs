// ===================================================================
// TRACÉA — Test E2E chantier 33 (consentement RGPD)
// ===================================================================
// Cible : prod déployée (https://www.methodetracea.fr)
// Crée un utilisateur jetable, exerce le flux complet, nettoie.
// Lancer : node --env-file=.env.local scripts/test-rgpd-flow.mjs
// ===================================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = "https://www.methodetracea.fr";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error("[FATAL] Env vars Supabase manquantes");
  process.exit(2);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results = [];
function record(step, pass, detail = "") {
  results.push({ step, pass, detail });
  const tag = pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${step}${detail ? " — " + detail : ""}`);
}

const TEST_EMAIL = `rgpd-test-${Date.now()}@example.com`;
const TEST_PASSWORD = `Tst-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}!Aa1`;
let testUserId = null;
let accessToken = null;

async function preCleanup() {
  // Cleanup ciblé : on ne purge QUE les users de test (email préfixé
  // rgpd-test-) et leurs proofs. Volontairement PAS de purge des
  // proofs orphelines (user_id sans auth.users vivant) — ces orphans
  // peuvent appartenir à de vraies utilisatrices ayant supprimé leur
  // compte (rétention art. 17.3 RGPD, chantier 34). Le test reste
  // strictement à l'intérieur de son périmètre.
  try {
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    const leftover = (data?.users ?? []).filter((u) =>
      (u.email ?? "").startsWith("rgpd-test-")
    );
    for (const u of leftover) {
      console.log(`[cleanup-pre] removing leftover ${u.email}`);
      await admin.from("consent_logs").delete().eq("user_id", u.id);
      await admin.from("withdrawal_consents").delete().eq("user_id", u.id);
      await admin.from("profiles").delete().eq("id", u.id);
      await admin.auth.admin.deleteUser(u.id);
    }
  } catch (e) {
    console.log(`[cleanup-pre] error (acceptable): ${e.message}`);
  }
}

async function step1_createUser() {
  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) {
    record("1. Create test user (admin)", false, error.message);
    return false;
  }
  testUserId = data.user.id;

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: sessData, error: sessErr } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (sessErr || !sessData?.session?.access_token) {
    record("1. Create test user (admin)", false, "sign-in failed: " + (sessErr?.message ?? "no session"));
    return false;
  }
  accessToken = sessData.session.access_token;
  record("1. Create test user (admin) + sign-in", true, `user=${testUserId.slice(0, 8)}…`);
  return true;
}

async function step2_post() {
  const res = await fetch(`${APP_URL}/api/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ wordingVersion: "v1" }),
  });
  if (res.status !== 200) {
    const t = await res.text();
    record("2a. POST /api/consent → 200", false, `got ${res.status}: ${t.slice(0, 200)}`);
    return false;
  }
  record("2a. POST /api/consent → 200", true);

  const { data, error } = await admin
    .from("consent_logs")
    .select("*")
    .eq("user_id", testUserId);
  if (error) {
    record("2b. 3 lignes granted=true en DB", false, error.message);
    return false;
  }
  if ((data?.length ?? 0) !== 3) {
    record("2b. 3 lignes granted=true en DB", false, `expected 3, got ${data?.length}`);
    return false;
  }
  const types = new Set(data.map((r) => r.consent_type));
  const expected = ["data_processing", "sensitive_data", "local_storage_usage"];
  const allTypes = expected.every((t) => types.has(t));
  const allGranted = data.every((r) => r.granted === true);
  const allV1 = data.every((r) => r.version === "v1");
  const allSnap = data.every(
    (r) => typeof r.wording_snapshot === "string" && r.wording_snapshot.length > 0
  );
  const ok = allTypes && allGranted && allV1 && allSnap;
  record(
    "2b. 3 lignes granted=true, types corrects, v1, snapshot non-vide",
    ok,
    `types=${[...types].join("|")} granted=${allGranted} v1=${allV1} snap=${allSnap}`
  );
  return ok;
}

async function step3_get() {
  const res = await fetch(`${APP_URL}/api/consent`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status !== 200) {
    record("3. GET /api/consent → hasValidConsent:true", false, `status ${res.status}`);
    return false;
  }
  const body = await res.json();
  const ok = body?.hasValidConsent === true && body?.version === "v1" && typeof body?.acceptedAt === "string";
  record("3. GET /api/consent → hasValidConsent:true", ok, JSON.stringify(body));
  return ok;
}

async function step4_delete() {
  const res = await fetch(`${APP_URL}/api/consent`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status !== 200) {
    const t = await res.text();
    record("4a. DELETE /api/consent → 200", false, `status ${res.status}: ${t.slice(0, 200)}`);
    return false;
  }
  record("4a. DELETE /api/consent → 200", true);

  const { data } = await admin
    .from("consent_logs")
    .select("*")
    .eq("user_id", testUserId)
    .eq("granted", false);
  const types = new Set((data ?? []).map((r) => r.consent_type));
  const expected = ["data_processing", "sensitive_data", "local_storage_usage"];
  const ok = (data?.length ?? 0) === 3 && expected.every((t) => types.has(t));
  record("4b. 3 lignes granted=false en DB", ok, `count=${data?.length} types=${[...types].join("|")}`);
  return ok;
}

async function step5_getAfterRevoke() {
  const res = await fetch(`${APP_URL}/api/consent`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status !== 200) {
    record("5. GET /api/consent post-revoke → hasValidConsent:false", false, `status ${res.status}`);
    return false;
  }
  const body = await res.json();
  const ok = body?.hasValidConsent === false;
  record("5. GET /api/consent post-revoke → hasValidConsent:false (TEST CLÉ)", ok, JSON.stringify(body));
  return ok;
}

async function step6_export() {
  const res = await fetch(`${APP_URL}/api/export`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status !== 200) {
    const t = await res.text();
    record("6. /api/export smoke", false, `status ${res.status}: ${t.slice(0, 200)}`);
    return false;
  }
  const body = await res.json();
  const ok = Array.isArray(body?.consent_logs) && body.consent_logs.length === 6;
  record(
    "6. /api/export smoke (6 lignes consent_logs: 3 granted + 3 revoked)",
    ok,
    `consent_logs.length=${body?.consent_logs?.length}`
  );
  return ok;
}

async function step7_accountDelete() {
  const res = await fetch(`${APP_URL}/api/account/delete`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status !== 200) {
    const t = await res.text();
    record("7a. /api/account/delete → 200", false, `status ${res.status}: ${t.slice(0, 200)}`);
    return false;
  }
  record("7a. /api/account/delete → 200", true);

  const { data: { users } = { users: [] } } = await admin.auth.admin.listUsers({ perPage: 200 });
  const stillExists = users.find((u) => u.id === testUserId);
  const { data: consentRows } = await admin
    .from("consent_logs")
    .select("*")
    .eq("user_id", testUserId);
  // Chantier 34 : les preuves de consentement DOIVENT survivre.
  // Le test a inséré 3 lignes granted=true (POST) + 3 lignes
  // granted=false (DELETE), donc on attend 6 lignes intactes.
  const okPreserved =
    !stillExists && (consentRows?.length ?? 0) === 6;
  record(
    "7b. user supprimé MAIS consent_logs préservés (art. 17.3)",
    okPreserved,
    `user_exists=${!!stillExists} consent_count=${consentRows?.length ?? 0}`
  );
  return okPreserved;
}

async function step8_finalCleanup() {
  if (!testUserId) {
    record("8. Final cleanup", true, "nothing to clean");
    return;
  }
  try {
    // Best-effort. Post-chantier 34 :
    //   - consent_logs/withdrawal_consents pour testUserId survivent
    //     à step 7 (rétention art. 17.3) → on les nettoie ici
    //     explicitement pour ne pas accumuler d'orphans en
    //     environnement de TEST. En prod cette purge ne se produit
    //     jamais (l'orphan est volontaire) ;
    //   - profiles + auth.users sont déjà supprimés par step 7 (no-op
    //     côté API, juste un signal d'OK silencieux ici).
    await admin.from("consent_logs").delete().eq("user_id", testUserId);
    await admin.from("withdrawal_consents").delete().eq("user_id", testUserId);
    await admin.from("profiles").delete().eq("id", testUserId);
    await admin.auth.admin.deleteUser(testUserId);
    record("8. Final cleanup", true);
  } catch (e) {
    record("8. Final cleanup", false, e.message);
  }
}

(async () => {
  console.log(`[INFO] Target: ${APP_URL}`);
  console.log(`[INFO] Test email: ${TEST_EMAIL}`);
  await preCleanup();
  if (!(await step1_createUser())) {
    await step8_finalCleanup();
    return summarize();
  }
  await step2_post();
  await step3_get();
  await step4_delete();
  await step5_getAfterRevoke();
  await step6_export();
  await step7_accountDelete();
  await step8_finalCleanup();
  summarize();
})().catch(async (e) => {
  console.error("[FATAL]", e);
  await step8_finalCleanup();
  summarize();
});

function summarize() {
  console.log("\n=== SUMMARY ===");
  for (const r of results) {
    console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.step}`);
  }
  const fails = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - fails}/${results.length} passed`);
  process.exit(fails > 0 ? 1 : 0);
}
