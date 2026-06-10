// ===================================================================
// TRACÉA — Test E2E chantier 38 (durcissement Security Advisor)
// ===================================================================
// Cible : prod déployée (https://www.methodetracea.fr).
// Couvre :
//   - non-admin → 403 sur /api/admin/stats
//   - admin → 200 avec stats NON VIDES (total_sessions > 0)
//   - cleanup complet (incl. orphan proofs créées en chemin)
//
// Lancer : node --env-file=.env.local scripts/test-admin-stats.mjs
// ===================================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = "https://www.methodetracea.fr";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_KEY) {
  console.error("[FATAL] Env vars Supabase manquantes");
  process.exit(2);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results = [];
function record(step, pass, detail = "") {
  results.push({ step, pass, detail });
  const tag = pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${step}${detail ? " — " + detail : ""}`);
}

const TEST_EMAIL = `admin-test-${Date.now()}@example.com`;
const TEST_PASSWORD = `T-${Math.random().toString(36).slice(2)}${Math.random()
  .toString(36)
  .slice(2)}!Aa1`;
let testUserId = null;
let accessToken = null;

async function preCleanup() {
  try {
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    const leftover = (data?.users ?? []).filter((u) =>
      (u.email ?? "").startsWith("admin-test-")
    );
    for (const u of leftover) {
      console.log(`[pre] removing leftover ${u.email}`);
      await admin.from("sessions").delete().eq("user_id", u.id);
      await admin.from("consent_logs").delete().eq("user_id", u.id);
      await admin.from("withdrawal_consents").delete().eq("user_id", u.id);
      await admin.from("profiles").delete().eq("id", u.id);
      await admin.auth.admin.deleteUser(u.id);
    }
  } catch (e) {
    console.log(`[pre] error (acceptable): ${e.message}`);
  }
}

async function step1_createNonAdmin() {
  const { data: u, error: ue } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (ue) {
    record("1. Create test user", false, ue.message);
    return false;
  }
  testUserId = u.user.id;

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: sd, error: se } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (se || !sd?.session?.access_token) {
    record(
      "1. Create + sign-in (non-admin)",
      false,
      se?.message ?? "no session"
    );
    return false;
  }
  accessToken = sd.session.access_token;
  record(
    "1. Create + sign-in (non-admin)",
    true,
    `user=${testUserId.slice(0, 8)}`
  );
  return true;
}

async function step2_nonAdminForbidden() {
  const res = await fetch(`${APP_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const ok = res.status === 403;
  record("2. Non-admin → 403", ok, `status=${res.status}`);
  return ok;
}

async function step3_promoteAndInsertSession() {
  const { error: uErr } = await admin
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", testUserId);
  if (uErr) {
    record(
      "3a. SET is_admin=true (service_role bypass RLS)",
      false,
      uErr.message
    );
    return false;
  }
  record("3a. SET is_admin=true (service_role bypass RLS)", true);

  // Insert d'une session avec TOUTES les colonnes utiles renseignées
  // explicitement (date dans la fenêtre 7d pour faire grimper les
  // compteurs sessions_last_7d / active_users_7d / weekly).
  const nowIso = new Date().toISOString();
  const { error: sErr } = await admin.from("sessions").insert({
    user_id: testUserId,
    date: nowIso,
    context: "autre",
    intensity_before: 7,
    intensity_after: 4,
    completed: true,
    created_at: nowIso,
  });
  if (sErr) {
    record(
      "3b. Insert 1 session (toutes colonnes utiles renseignées)",
      false,
      sErr.message
    );
    return false;
  }
  record("3b. Insert 1 session (toutes colonnes utiles renseignées)", true);
  return true;
}

async function step4_adminGetsStats() {
  const res = await fetch(`${APP_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status !== 200) {
    const t = await res.text();
    record("4a. Admin → 200", false, `status=${res.status}: ${t.slice(0, 200)}`);
    return false;
  }
  record("4a. Admin → 200", true);

  const body = await res.json();
  const stats = body?.stats;
  const weekly = body?.weekly;

  const okStats =
    stats &&
    typeof stats.total_sessions === "number" &&
    stats.total_sessions > 0;
  const okWeekly = Array.isArray(weekly);

  record(
    "4b. body.stats.total_sessions > 0 (stats NON VIDES)",
    okStats,
    `total_sessions=${stats?.total_sessions} total_users=${stats?.total_users} active_7d=${stats?.active_users_7d}`
  );
  record(
    "4c. body.weekly est un array",
    okWeekly,
    `length=${weekly?.length ?? "n/a"}`
  );
  return okStats && okWeekly;
}

async function step5_finalCleanup() {
  if (!testUserId) {
    record("5. Final cleanup", true, "nothing to clean");
    return;
  }
  try {
    await admin.from("sessions").delete().eq("user_id", testUserId);
    await admin.from("consent_logs").delete().eq("user_id", testUserId);
    await admin
      .from("withdrawal_consents")
      .delete()
      .eq("user_id", testUserId);
    await admin.from("profiles").delete().eq("id", testUserId);
    await admin.auth.admin.deleteUser(testUserId);
    record("5. Final cleanup", true);
  } catch (e) {
    record("5. Final cleanup", false, e.message);
  }
}

(async () => {
  console.log(`[INFO] Target: ${APP_URL}`);
  console.log(`[INFO] Test email: ${TEST_EMAIL}`);
  await preCleanup();
  if (!(await step1_createNonAdmin())) {
    await step5_finalCleanup();
    return summarize();
  }
  await step2_nonAdminForbidden();
  if (!(await step3_promoteAndInsertSession())) {
    await step5_finalCleanup();
    return summarize();
  }
  await step4_adminGetsStats();
  await step5_finalCleanup();
  summarize();
})().catch(async (e) => {
  console.error("[FATAL]", e);
  await step5_finalCleanup();
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
