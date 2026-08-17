/**
 * Auth Integration Tests
 * ---------------------
 * Tests the /api/v1/account/signup and /api/v1/account/login endpoints
 * against the *live* local backend (no mocking).
 *
 * Run:  node tests/auth/signup-login.test.js
 */

const BASE = process.env.TEST_API_BASE || "http://localhost:8000";

// Unique test user each run to avoid "user already exists"
const timestamp = Date.now();
const TEST_USER = {
  name: `TestUser${timestamp}`,
  email: `testuser${timestamp}@example.com`,
  password: "Test@12345",
};

// ─────────────────────────── helpers ──────────────────────────
async function post(path, body) {
  const url = `${BASE}${path}`;
  console.log(`\n→ POST ${url}`);
  console.log(`  Body: ${JSON.stringify(body)}`);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  console.log(`  Status: ${res.status}`);
  console.log(`  Response: ${text.slice(0, 500)}`);

  return { status: res.status, json, text, headers: res.headers };
}

async function get(path, cookies = "") {
  const url = `${BASE}${path}`;
  console.log(`\n→ GET ${url}`);
  const headers = { "Content-Type": "application/json" };
  if (cookies) headers["Cookie"] = cookies;

  const res = await fetch(url, { headers });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  console.log(`  Status: ${res.status}`);
  console.log(`  Response: ${text.slice(0, 500)}`);

  return { status: res.status, json, text, headers: res.headers };
}

// ─────────────────────────── tests ──────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${testName}`);
    failed++;
    failures.push(testName);
  }
}

async function runTests() {
  console.log("═══════════════════════════════════════════════");
  console.log(" ViewTube Auth Integration Tests");
  console.log(`═══════════════════════════════════════════════`);
  console.log(`Backend: ${BASE}`);
  console.log(`Test user: ${TEST_USER.email}`);

  // ──────────── Test 1: Health Check ────────────
  console.log("\n── Test 1: Backend Reachability ──");
  try {
    const res = await fetch(`${BASE}/api/v1/videos/allVideo`);
    assert(res.status === 200 || res.status === 304, `Backend reachable (status=${res.status})`);
  } catch (err) {
    assert(false, `Backend reachable (connection refused: ${err.message})`);
    console.log("\n⛔ Backend is not running. Start it with: npm run backend");
    return;
  }

  // ──────────── Test 2: Signup with missing fields ────────────
  console.log("\n── Test 2: Signup – Missing Fields ──");
  {
    const { status, json } = await post("/api/v1/account/signup", {
      name: "",
      email: "",
      password: "",
    });
    assert(status === 422, `Returns 422 for empty fields (got ${status})`);
  }

  // ──────────── Test 3: Signup with invalid email ────────────
  console.log("\n── Test 3: Signup – Invalid Email ──");
  {
    const { status } = await post("/api/v1/account/signup", {
      name: "Test",
      email: "not-an-email",
      password: "password123",
    });
    assert(status === 422, `Returns 422 for invalid email (got ${status})`);
  }

  // ──────────── Test 4: Signup with short password ────────────
  console.log("\n── Test 4: Signup – Short Password ──");
  {
    const { status } = await post("/api/v1/account/signup", {
      name: "Test",
      email: "test@example.com",
      password: "123",
    });
    assert(status === 422, `Returns 422 for short password (got ${status})`);
  }

  // ──────────── Test 5: Successful Signup ────────────
  console.log("\n── Test 5: Signup – Valid User ──");
  let signupResult;
  {
    const { status, json } = await post("/api/v1/account/signup", TEST_USER);
    signupResult = { status, json };
    assert(status === 201, `Returns 201 for new user (got ${status})`);
    assert(json?.data?.name === TEST_USER.name || json?.data?.user?.name === TEST_USER.name, `Response contains user name`);
  }

  // ──────────── Test 6: Duplicate Signup ────────────
  console.log("\n── Test 6: Signup – Duplicate User ──");
  {
    const { status } = await post("/api/v1/account/signup", TEST_USER);
    assert(status === 409, `Returns 409 for duplicate (got ${status})`);
  }

  // ──────────── Test 7: Login with wrong password ────────────
  console.log("\n── Test 7: Login – Wrong Password ──");
  {
    const { status } = await post("/api/v1/account/login", {
      email: TEST_USER.email,
      password: "WrongPassword123",
    });
    assert(status === 400, `Returns 400 for wrong password (got ${status})`);
  }

  // ──────────── Test 8: Login with correct credentials ────────────
  console.log("\n── Test 8: Login – Correct Credentials ──");
  let cookies = "";
  {
    const { status, json, headers } = await post("/api/v1/account/login", {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
    assert(status === 200, `Returns 200 for valid login (got ${status})`);
    assert(json?.data?.accessToken, `Response contains accessToken`);

    // Extract set-cookie headers
    const setCookies = headers.getSetCookie?.() || [];
    cookies = setCookies.map((c) => c.split(";")[0]).join("; ");
    console.log(`  Cookies received: ${cookies ? "Yes" : "No (none set)"}`);
    assert(cookies.includes("accessToken"), `accessToken cookie is set`);
  }

  // ──────────── Test 9: GET /me with auth cookies ────────────
  console.log("\n── Test 9: GET /me – Authenticated ──");
  {
    const { status, json } = await get("/api/v1/account/me", cookies);
    assert(status === 200, `Returns 200 for authenticated user (got ${status})`);
    // Note: /me only returns _id, avatar, username, role — no email in the select
    assert(json?.data?.username, `Response contains username`);
  }

  // ──────────── Test 10: GET /me without auth ────────────
  console.log("\n── Test 10: GET /me – Unauthenticated ──");
  {
    const { status } = await get("/api/v1/account/me");
    assert(status === 401, `Returns 401 without cookies (got ${status})`);
  }

  // ──────────── Summary ────────────
  console.log("\n═══════════════════════════════════════════════");
  console.log(` Results: ${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log(` Failed tests:`);
    failures.forEach((f) => console.log(`   ❌ ${f}`));
  }
  console.log("═══════════════════════════════════════════════");
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
