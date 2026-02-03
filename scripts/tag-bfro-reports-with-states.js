import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';

/**
 * Adjust these paths as needed
 */
const REPORTS_PATH = path.resolve('../data/BFRO/BFRO-Reports.json');
const STATES_PATH = path.resolve('../data/us-state-boundaries.json');
const OUTPUT_PATH = path.resolve('../data/BFRO/BFRO-Reports-with-states.json');

/**
 * Load JSON helpers
 */
const loadJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const saveJson = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2));

/**
 * Convert your states file rows into GeoJSON Features
 * Expects fields: stusab (abbr), name/basename, st_asgeojson: { type, geometry }
 * Some datasets wrap geometry like { type:"Feature", geometry:{...} } — we normalize it.
 */
function statesToFeatureCollection(statesRows) {
    const features = statesRows.map((row) => {
        // Extract geometry
        let geom = null;
        if (row.st_asgeojson?.type === 'Feature') {
            geom = row.st_asgeojson.geometry;
        } else if (row.st_asgeojson?.type && row.st_asgeojson?.coordinates) {
            // Already a geometry
            geom = { type: row.st_asgeojson.type, coordinates: row.st_asgeojson.coordinates };
        } else if (row.st_asgeojson?.geometry) {
            // e.g., { geometry: {...} }
            geom = row.st_asgeojson.geometry;
        } else if (row.geometry) {
            geom = row.geometry;
        } else {
            throw new Error(`No geometry found for state row: ${row.name || row.basename || row.stusab}`);
        }

        // Ensure valid type
        if (!['Polygon', 'MultiPolygon'].includes(geom.type)) {
            throw new Error(`Unexpected geometry type ${geom.type} for ${row.stusab || row.name}`);
        }

        return {
            type: 'Feature',
            properties: {
                name: row.name || row.basename,
                stusab: row.stusab,
                geoid: row.geoid || row.state,
            },
            geometry: geom,
        };
    });

    return {
        type: 'FeatureCollection',
        features,
    };
}

/**
 * For each report, find which state polygon contains it.
 * If none contain it (e.g., slightly offshore), optionally assign the nearest by state centroid.
 */
function tagReportsWithStates(reports, statesFc, { fallbackToNearest = true } = {}) {
    // Precompute centroids for fallback
    const stateCentroids = statesFc.features.map((f) => ({
        feature: f,
        centroid: turf.centroid(f),
    }));

    const result = reports.map((r) => {
        const { position } = r;
        if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
            return { ...r, state: null, stusab: null, _reason: 'missing_position' };
        }

        // GeoJSON coordinates are [lng, lat]
        const pt = turf.point([position.lng, position.lat]);

        // First: containment test
        let matched = null;
        for (const stateFeature of statesFc.features) {
            if (turf.booleanPointInPolygon(pt, stateFeature, { ignoreBoundary: false })) {
                matched = stateFeature;
                break;
            }
        }

        if (!matched && fallbackToNearest) {
            // Fallback: choose the state with the nearest centroid
            let best = { dist: Infinity, feature: null };
            for (const sc of stateCentroids) {
                const d = turf.distance(pt, sc.centroid, { units: 'kilometers' });
                if (d < best.dist) best = { dist: d, feature: sc.feature };
            }
            matched = best.feature;
        }

        if (matched) {
            return {
                ...r,
                state: matched.properties.name,
                state_abbrev: matched.properties.stusab,
            };
        } else {
            return { ...r, state: null, state_abbrev: null, _reason: 'no_match' };
        }
    });

    return result;
}

function main() {
    const reports = loadJson(REPORTS_PATH);       // Array of reports
    const statesRows = loadJson(STATES_PATH);     // Array of state rows (with st_asgeojson)

    if (!Array.isArray(reports)) {
        throw new Error('reports.json must be an array of report objects');
    }
    if (!Array.isArray(statesRows)) {
        throw new Error('us_states.json must be an array of state rows');
    }

    const statesFc = statesToFeatureCollection(statesRows);
    const enriched = tagReportsWithStates(reports, statesFc, { fallbackToNearest: true });

    saveJson(OUTPUT_PATH, enriched);

    // Quick stats
    const matched = enriched.filter(r => r.state_abbrev);
    const unmatched = enriched.filter(r => !r.state_abbrev);
    console.log(`Tagged ${matched.length}/${enriched.length} reports with states.`);
    if (unmatched.length) {
        const sample = unmatched.slice(0, 5).map(r => ({
            id: r.bfroReportId, lat: r.position?.lat, lng: r.position?.lng, reason: r._reason,
        }));
        console.log('Unmatched sample:', sample);
    }
}

main();
