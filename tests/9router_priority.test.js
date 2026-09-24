const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "../src/9router_priority.js"), "utf8");

async function run(priority, models) {
  const logs = [];
  const updates = [];
  const client = {
    getCombos: async () => ({ success: true, data: { combos: [{ id: 1, name: "combo", models }] } }),
    updateCombo: async (id, update) => {
      updates.push({ id, ...update });
      return { success: true };
    },
  };
  vm.runInNewContext(script, {
    require: name => name === "node:path" ? path : client,
    process: { argv: ["node", priority], execPath: "/usr/bin/node" },
    console: { log: value => logs.push(value), error: error => { throw error; } },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { logs, updates };
}

(async () => {
  assert.deepEqual((await run("get", ["cx/a", "cc/b"])).logs, ["codex"]);
  assert.deepEqual((await run("get", ["cc/b", "cx/a"])).logs, ["claude"]);
  assert.equal(JSON.stringify((await run("claude", ["cx/a", "cc/b"])).updates),
    JSON.stringify([{ id: 1, models: ["cc/b", "cx/a"] }]));
})().catch(error => { console.error(error); process.exitCode = 1; });
