import fs from "fs"

const input = "../data/BFRO/BFRO-Reports-with-states.json";
const output = "../data/BFRO/BFRO-reports-states-map.json";

const data = JSON.parse(fs.readFileSync(input, "utf8"));
const grouped = {};

for (const r of data) {
  if (!r.state_abbrev) continue;
  if (!grouped[r.state_abbrev]) grouped[r.state_abbrev] = [];
  grouped[r.state_abbrev].push(r);
}

fs.writeFileSync(output, JSON.stringify(grouped, null, 2));
console.log(`✅ Grouped ${data.length} reports into ${Object.keys(grouped).length} states.`);
console.log(`→ Saved to ${output}`);
