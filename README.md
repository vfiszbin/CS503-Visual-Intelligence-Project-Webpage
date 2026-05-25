# CS503 Visual Intelligence Project Webpage

Static GitHub Pages webpage for **Flow Matching for Probabilistic Image Geolocalization in Switzerland**.

## Structure

```text
index.html                         # Page shell: metadata, title, abstract, navigation
content/sections/                  # Maintainable section partials loaded by JavaScript
static/data/metrics.json           # Final quantitative results used by the experiments table
static/images/teaser/              # Teaser and task framing images
static/images/method/              # Model and pipeline diagrams
static/images/results/             # Quantitative and canton-level visualizations
static/images/examples/            # Qualitative road and railway examples
static/docs/                       # Final slides, progress report, and proposal
static/js/include-sections.js      # Loads section partials and renders metrics
```

## Local Preview

Because sections are loaded with `fetch`, preview with a local HTTP server instead of opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Content Source Priority

The webpage follows the final presentation first, the progress presentation second, and the proposal only for stable motivation or related-work context.
