const path = require("node:path");

const priority = process.argv[1];
if (priority !== "codex" && priority !== "claude") {
  throw new Error("Choose Codex or Claude");
}

const client = require(path.resolve(
  path.dirname(process.execPath),
  "../lib/node_modules/9router/src/cli/api/client.js"
));

async function main() {
  const result = await client.getCombos();
  if (!result.success) throw new Error(result.error);

  let matched = 0;
  for (const combo of result.data.combos) {
    const models = combo.models;
    if (!Array.isArray(models) || models.length !== 2 ||
        !models.some(model => model.startsWith("cx/")) ||
        !models.some(model => model.startsWith("cc/"))) continue;

    matched++;
    const first = priority === "codex" ? "cx/" : "cc/";
    if (models[0].startsWith(first)) continue;

    const updated = await client.updateCombo(combo.id, { models: [models[1], models[0]] });
    if (!updated.success) throw new Error(`${combo.name}: ${updated.error}`);
  }
  if (!matched) throw new Error("No two-model cx/ and cc/ combos found");
  console.log(`${priority} first in ${matched} combos`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
