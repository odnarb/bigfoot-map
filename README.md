# Mapping Sasquatch

An open-source, crowd-sourced map and research tool for cataloging Sasquatch encounters with a focus on **behavioral patterns**, not just sightings.

This project is early-stage and research-oriented.

---

## What this is
- An interactive map of reported encounters
- A behavior-focused data model (vocalizations, structures, avoidance, etc.)
- A foundation for future pattern analysis and visualization

## What this is NOT
- A claim of proof
- A monetized product
- A replacement for established databases (e.g. BFRO)

---

## Current Features
- Google Maps–based encounter map
- Clickable markers with report details
- Early-stage behavior tagging
- Open data (stored locally / in-repo for now)

## Roadmap (high level)
- Behavior profiles & visualizations
- Region-based behavior analysis
- Improved submission & follow-up flow
- Optional cloud backend (later)

## Installation Requires node.js
I suggest you look to nvm for installing node: https://github.com/nvm-sh/nvm

---

## Google Maps Setup (Required)

This project uses the **Google Maps JavaScript API**.  
You must create a Google Maps API key and enable the Maps API for the app to run correctly.

### 1) Create a Google Maps API key
1. Go to https://console.cloud.google.com/
2. Create or select a Google Cloud project
3. Navigate to **APIs & Services → Library**
4. Enable:
   - **Maps JavaScript API**
5. Go to **APIs & Services → Credentials**
6. Create an **API key**

> Optional but recommended:
> - Restrict the key to **HTTP referrers** (e.g. `http://localhost:*`)
> - Restrict usage to **Maps JavaScript API**

---

### 2) Configure environment variables
Create a file named **`.env.local`** in the project root with the api key:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

⚠️ Do not commit .env.local to the repository.
It is already included in .gitignore.

## Common issues

Blank map or gray grid → API key missing or invalid

Billing-related errors → Billing must be enabled on the Google Cloud project (required by Google, even for free-tier usage)

process.env is undefined → Make sure the variable name is prefixed with VITE_

## Running locally
```bash
git clone https://github.com/odnarb/mapping-sasquatch
cd mapping-sasquatch
tar xvf data.tar
npm install
npm run dev
```

Then open http://localhost:5173
 (or whatever port).

## Data

No private submissions are stored here

## Contributing

Issues, ideas, and PRs welcome.
This is a research and tooling project, not a belief system.

## Disclaimer

This project documents reports and patterns.
Interpretation is left to the reader.

## Credits
BFRO, KMZ data
Bobbie Short, other sightings (yet to be utilized)