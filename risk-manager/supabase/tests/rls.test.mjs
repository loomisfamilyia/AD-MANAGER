/**
 * Security rules test for schema.sql.
 *
 * Runs the real install script on PGlite (Postgres compiled to WebAssembly)
 * with a stub of the parts of Supabase it depends on — the auth and storage
 * schemas and the anon/authenticated roles — then attacks it the way a
 * curious or malicious client would. Exits non-zero on any failure.
 *
 *   npm run test:rls
 *
 * Every new rule in schema.sql gets a test here. The point of this file is
 * that "client A can't see client B's house" is something we've *checked*,
 * not something we believe.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");

// Just enough of Supabase for the schema to install and for auth.uid() /
// auth.jwt() to read the claims each test sets.
const STUB = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema public, auth, storage to anon, authenticated;
grant all on storage.objects to anon, authenticated;
grant execute on all functions in schema auth to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

const U = {
  A: "aaaaaaaa-0000-4000-8000-000000000001",
  B: "bbbbbbbb-0000-4000-8000-000000000002",
  C: "cccccccc-0000-4000-8000-000000000003", // anonymous sign-in
  S: "dddddddd-0000-4000-8000-000000000004", // staff
};

let failures = 0, passes = 0;
const ok = (cond, msg) => { if (cond) { passes++; } else { failures++; console.log("FAIL:", msg); } };

async function as(db, who, fn, { aal = "aal1", anonymous = false } = {}) {
  await db.exec("reset role");
  if (who === "anon") {
    await db.query("select set_config('request.jwt.claims', '', false)");
    await db.exec("set role anon");
  } else {
    const claims = JSON.stringify({ sub: U[who], role: "authenticated", aal, is_anonymous: anonymous });
    await db.query("select set_config('request.jwt.claims', $1, false)", [claims]);
    await db.exec("set role authenticated");
  }
  try { return await fn(); } finally { await db.exec("reset role"); }
}
async function expectError(p, msg, match) {
  try { await p; ok(false, msg + " (expected an error, got success)"); }
  catch (e) { ok(!match || match.test(e.message), msg + " (wrong error: " + e.message + ")"); }
}

const db = new PGlite();
await db.exec(STUB);
// Supabase creates this publication; PGlite may not support it, the schema copes either way.
try { await db.exec("create publication supabase_realtime"); } catch (e) { console.log("note: no publication support:", e.message); }
await db.exec(`insert into auth.users (id, email) values
  ('${U.A}','a@x'),('${U.B}','b@x'),('${U.C}',null),('${U.S}','s@x')`);

await db.exec(schema);
console.log("schema applied");
await db.exec(schema);
console.log("schema re-applied (idempotent)");
await db.exec(`insert into staff_members (user_id, display_name) values ('${U.S}', 'Jane at Loomis')`);

// --- A builds a world ---------------------------------------------------
const hA = await as(db, "A", async () => {
  const h = (await db.query("insert into households (display_name) values ('A family') returning id")).rows[0].id;
  const me = (await db.query("insert into people (household_id, is_self, first_name) values ($1, true, 'Alice') returning id", [h])).rows[0].id;
  const car = (await db.query(`insert into assets (household_id, kind, name, owner_person_id, details)
     values ($1, 'car', 'The CR-V', $2, '{"vin":"5j6rw2h89kl000000"}') returning id, vin`, [h, me])).rows[0];
  ok(car.vin === "5J6RW2H89KL000000", "vin generated column uppercases");
  const home = (await db.query("insert into assets (household_id, kind, name) values ($1, 'house_owned', 'Home') returning id", [h])).rows[0].id;
  await db.query("insert into assets (household_id, kind, name, parent_id) values ($1, 'roof', 'Roof', $2)", [h, home]);
  await db.query(`insert into coverage_choices (household_id, coverage_id, line, asset_id, stance) values ($1, 'auto_collision', 'auto', $2, 'need')`, [h, car.id]);
  // upsert on the generated target key, the way PostgREST would
  await db.query(`insert into coverage_choices (household_id, coverage_id, line, asset_id, stance) values ($1, 'auto_collision', 'auto', $2, 'want')
    on conflict (household_id, coverage_id, target_id) do update set stance = excluded.stance`, [h, car.id]);
  await db.query(`insert into coverage_choices (household_id, coverage_id, line, stance) values ($1, 'umbrella_personal', 'umbrella', 'need')`, [h]);
  await db.query("insert into budget_lines (household_id, line, monthly_amount) values ($1, 'auto', 120)", [h]);
  const n = (await db.query("select count(*)::int as n from coverage_choices where household_id = $1", [h])).rows[0].n;
  ok(n === 2, "upsert kept one row per coverage per target (got " + n + ")");
  const hu = (await db.query("select role from household_users where household_id = $1", [h])).rows;
  ok(hu.length === 1 && hu[0].role === "owner", "creator became owner");
  await expectError(db.query("insert into households (display_name) values ('second')"), "one world per login", /duplicate|unique/);
  return h;
});
const ids = await db.query("select id, kind from assets where household_id = $1", [hA]);
const carA = ids.rows.find(r => r.kind === "car").id;
const personA = (await db.query("select id from people where household_id = $1", [hA])).rows[0].id;

// --- B attacks A --------------------------------------------------------
const hB = await as(db, "B", async () => {
  const h = (await db.query("insert into households (display_name) values ('B family') returning id")).rows[0].id;
  for (const t of ["households", "people", "assets", "coverage_choices", "budget_lines", "household_users", "household_messages", "quote_requests", "household_activity", "staff_members"]) {
    const col = t === "households" ? "id" : t === "staff_members" ? "user_id" : "household_id";
    const r = t === "staff_members"
      ? await db.query(`select count(*)::int n from staff_members`)
      : await db.query(`select count(*)::int n from ${t} where ${col} = $1`, [hA]);
    ok(r.rows[0].n === 0, `B cannot read A's ${t}`);
  }
  await expectError(db.query("insert into assets (household_id, kind, name) values ($1, 'boat', 'pwned')", [hA]), "B cannot insert into A's household", /row-level security/);
  const upd = await db.query("update assets set name = 'pwned' where id = $1", [carA]);
  ok(upd.affectedRows === 0, "B cannot update A's car");
  const del = await db.query("delete from people where id = $1", [personA]);
  ok(del.affectedRows === 0, "B cannot delete A's person");
  await expectError(db.query("insert into household_users (household_id, user_id) values ($1, $2)", [hA, U.B]), "B cannot join A's household", /row-level security|permission/);
  // Cross-household references are unrepresentable
  await expectError(db.query("insert into assets (household_id, kind, name, owner_person_id) values ($1, 'car', 'x', $2)", [h, personA]), "B cannot point at A's person", /foreign key/);
  await expectError(db.query("insert into coverage_choices (household_id, coverage_id, line, asset_id, stance) values ($1, 'auto_collision', 'auto', $2, 'need')", [h, carA]), "B cannot choose coverage on A's car", /foreign key/);
  // Moving own row into A's household
  const myAsset = (await db.query("insert into assets (household_id, kind, name) values ($1, 'dog', 'Rex') returning id", [h])).rows[0].id;
  await expectError(db.query("update assets set household_id = $1 where id = $2", [hA, myAsset]), "B cannot move a row into A's household", /row-level security/);
  await expectError(db.query("select prm_mark_thread_read($1)", [hA]), "B cannot mark A's thread read", /not a member/);
  // Spoofing created_by on insert
  await expectError(db.query("insert into households (display_name, created_by) values ('spoof', $1)", [U.A]), "B cannot create a household as A", /row-level security|unique/);
  return h;
});

// --- A talks to Loomis ----------------------------------------------------
await as(db, "A", async () => {
  const m = (await db.query("insert into household_messages (household_id, body, sender_role, sender_name) values ($1, 'hi', 'staff', 'Totally Staff') returning sender_role, sender_name, sender_user_id", [hA])).rows[0];
  ok(m.sender_role === "client" && m.sender_name === null && m.sender_user_id === U.A, "client cannot post as staff");
  const m2 = (await db.query("insert into household_messages (household_id, body, sender_role) values ($1, 'x', 'system') returning sender_role", [hA])).rows[0];
  ok(m2.sender_role === "client", "client cannot post as system");
  const q = (await db.query("insert into quote_requests (household_id, lines, status, snapshot) values ($1, '{auto,umbrella}', 'won', '{\"fake\":true}') returning status, snapshot, requested_by", [hA])).rows[0];
  ok(q.status === "new", "client cannot set quote status");
  ok(!q.snapshot.fake && q.snapshot.assets.length === 3 && q.snapshot.coverage_choices.length === 2, "snapshot built server-side (" + JSON.stringify(Object.keys(q.snapshot)) + ")");
  ok(q.requested_by === U.A, "requested_by stamped");
  const sys = (await db.query("select sender_role, body from household_messages where household_id = $1 and sender_role = 'system'", [hA])).rows;
  ok(sys.length === 1 && /auto, umbrella/.test(sys[0].body), "system message added to thread");
  const req = (await db.query("select count(*)::int n from coverage_choices where household_id = $1 and requested_at is not null and requested_at >= updated_at", [hA])).rows[0].n;
  ok(req === 2, "shields flipped to requested (" + req + ")");
  const upd = await db.query("update quote_requests set status = 'won' where household_id = $1", [hA]);
  ok(upd.affectedRows === 0, "client cannot update quote status later");
  const updm = await db.query("update household_messages set body = 'rewritten' where household_id = $1", [hA]);
  ok(updm.affectedRows === 0, "client cannot rewrite messages");
  const delm = await db.query("delete from household_messages where household_id = $1", [hA]);
  ok(delm.affectedRows === 0, "client cannot delete messages");
  await expectError(db.query("insert into insurance_policies (household_id, line, carrier) values ($1, 'auto', 'Fake Mutual')", [hA]), "client cannot create an in-force policy", /row-level security/);
  await expectError(db.query("insert into household_agency (household_id, status) values ($1, 'client')", [hA]), "client cannot write agency status", /row-level security/);
  await expectError(db.query("insert into property_records (household_id, asset_id, provider, summary) values ($1, $2, 'fake', '{}')", [hA, carA]), "client cannot forge public records", /row-level security/);
  await db.query("select prm_mark_thread_read($1)", [hA]);
  const unread = (await db.query("select count(*)::int n from household_messages where household_id = $1 and sender_role <> 'client' and read_by_client_at is null", [hA])).rows[0].n;
  ok(unread === 0, "client marked thread read");
});

// --- Anonymous sign-in C ------------------------------------------------
await as(db, "C", async () => {
  const h = (await db.query("insert into households (display_name) values ('anon') returning id")).rows[0].id;
  await db.query("insert into assets (household_id, kind, name) values ($1, 'cat', 'Mittens')", [h]);
  ok(true, "anonymous user can build a world");
  await expectError(db.query("insert into household_messages (household_id, body) values ($1, 'spam')", [h]), "anonymous user cannot message staff", /row-level security/);
  await expectError(db.query("insert into quote_requests (household_id, lines) values ($1, '{pet}')", [h]), "anonymous user cannot request quotes", /row-level security/);
}, { anonymous: true });

// --- Logged-out visitor ---------------------------------------------------
await as(db, "anon", async () => {
  await expectError(db.query("select * from households"), "logged-out visitor has no table access", /permission denied/);
  await expectError(db.query("select * from assets"), "logged-out visitor has no asset access", /permission denied/);
});

// --- Staff without and with MFA -------------------------------------------
await as(db, "S", async () => {
  const n = (await db.query("select count(*)::int n from households")).rows[0].n;
  ok(n === 0, "staff without MFA sees nothing (" + n + ")");
}, { aal: "aal1" });
await as(db, "S", async () => {
  const n = (await db.query("select count(*)::int n from households")).rows[0].n;
  ok(n === 3, "staff with MFA sees every household (" + n + ")");
  const p = (await db.query("insert into insurance_policies (household_id, line, carrier) values ($1, 'auto', 'Real Mutual') returning id", [hA])).rows[0].id;
  await db.query("insert into insurance_policy_links (household_id, policy_id, asset_id) values ($1, $2, $3)", [hA, p, carA]);
  await expectError(db.query("insert into insurance_policy_links (household_id, policy_id, asset_id) values ($1, $2, $3)", [hB, p, carA]), "policy links can't cross households", /foreign key/);
  const m = (await db.query("insert into household_messages (household_id, body) values ($1, 'Hello from Loomis') returning sender_role, sender_name", [hA])).rows[0];
  ok(m.sender_role === "staff" && m.sender_name === "Jane at Loomis", "staff message stamped with staff name");
  await db.query("update quote_requests set status = 'in_review' where household_id = $1", [hA]);
  const act = (await db.query("select count(*)::int n from household_activity where household_id = $1", [hA])).rows[0].n;
  ok(act > 0, "activity trail recorded (" + act + ")");
}, { aal: "aal2" });
await db.exec(`update staff_members set is_active = false where user_id = '${U.S}'`);
await as(db, "S", async () => {
  const n = (await db.query("select count(*)::int n from households")).rows[0].n;
  ok(n === 0, "deactivated staff loses access on the next request (" + n + ")");
}, { aal: "aal2" });
await db.exec(`update staff_members set is_active = true where user_id = '${U.S}'`);
await as(db, "A", async () => {
  const pol = (await db.query("select carrier from insurance_policies where household_id = $1", [hA])).rows;
  ok(pol.length === 1 && pol[0].carrier === "Real Mutual", "client can read their verified policy");
  const s = (await db.query("select status from quote_requests where household_id = $1", [hA])).rows[0].status;
  ok(s === "in_review", "client sees staff's status update");
});

// --- Storage ------------------------------------------------------------
await as(db, "A", async () => {
  await db.query("insert into storage.objects (bucket_id, name) values ('household-files', $1)", [hA + "/car.jpg"]);
  ok(true, "A can upload into own folder");
  await expectError(db.query("insert into storage.objects (bucket_id, name) values ('household-files', $1)", [hB + "/x.jpg"]), "A cannot upload into B's folder", /row-level security/);
  await expectError(db.query("insert into storage.objects (bucket_id, name) values ('household-files', 'not-a-uuid/x.jpg')"), "malformed path denied, not crashed", /row-level security/);
});
await as(db, "B", async () => {
  const n = (await db.query("select count(*)::int n from storage.objects where bucket_id = 'household-files'")).rows[0].n;
  ok(n === 0, "B cannot see A's files");
});

// --- Cascade delete by owner keeps the audit trail -------------------------
await as(db, "B", async () => {
  const d = await db.query("delete from households where id = $1", [hB]);
  ok(d.affectedRows === 1, "owner can delete their household");
});
const trail = (await db.query("select count(*)::int n from household_activity where household_id = $1", [hB])).rows[0].n;
ok(trail > 0, "audit trail survives household deletion");

// --- Collision guard on a fresh database ------------------------------------
const db2 = new PGlite();
await db2.exec(STUB);
await db2.exec("create table people (id serial primary key, name text)");
await expectError(db2.exec(schema), "refuses to run over a foreign `people` table", /public\.people already exists/);

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
