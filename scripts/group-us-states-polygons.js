import fs from 'fs'

const input = "../data/us-state-boundaries.json";         // input array of states
const output = "../data/US-States-Polygons-Map.json";     // <- abbrev -> coordinates

const states = JSON.parse(fs.readFileSync(input, "utf8"));

if (!Array.isArray(states)) {
    console.error("Input must be an array of state objects.");
    process.exit(1);
}

const out = {};
let skipped = 0;

for (const s of states) {
    const abbrev = s?.stusab;
    const coords = s?.st_asgeojson?.geometry?.coordinates;

    if (!abbrev || !coords) {
        skipped++;
        continue;
    }

    // Store raw GeoJSON coordinates (lon,lat order). Works for Polygon or MultiPolygon.
    out[abbrev] = coords;
}

fs.writeFileSync(output, JSON.stringify(out, null, 2), "utf8");

console.log(`✅ Wrote polygon coordinates for ${Object.keys(out).length} states`);
if (skipped) console.log(`ℹ️ Skipped ${skipped} records missing stusab or coordinates`);
console.log(`→ ${output}`);
