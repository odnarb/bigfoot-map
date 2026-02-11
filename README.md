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

---

## Requirements
- **Node.js** (recommended via nvm)  
  https://github.com/nvm-sh/nvm

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
Create a file named **`.env.local`** in the project root:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

⚠️ Do **not** commit `.env.local` to the repository.  
It is already included in `.gitignore`.

---

## Common issues
- **Blank map or gray grid**  
  → API key missing or invalid

- **Billing-related errors**  
  → Billing must be enabled on the Google Cloud project  
  (required by Google, even for free-tier usage)

- **`process.env` is undefined**  
  → Make sure the variable name is prefixed with `VITE_`

---

## Running locally
```bash
git clone https://github.com/odnarb/mapping-sasquatch
cd mapping-sasquatch
tar xvf data.tar
npm install
npm run dev
```

Then open the local URL shown in the terminal  
(usually `http://localhost:5173`).

---

## Light & Dark Map Styles (Console-Controlled)

TODO: Build out some instructions on light/dark modes and Google Console controlling map styles.

---

## Data
- No private submissions are stored in this repository
- Current data is public, test, or research-derived

---

## Contributing
Contributions are welcome, even at this early stage.

For now, the process is intentionally simple:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a Pull Request against the `dev` branch

Ideas, fixes, data improvements, and documentation updates are all appreciated.

This is a research and tooling project — constructive discussion is encouraged.

---

## Disclaimer
This project documents reported encounters and observed patterns.  
Interpretation is left to the reader.

---

## Credits
- BFRO (KMZ source data)
- Bobbie Short for sightings/behavioral data (to be integrated)
