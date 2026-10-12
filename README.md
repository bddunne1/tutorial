# Aamstrand Procedure Library

A small static website for documenting and training on business procedures.
No build step: open `index.html` in a browser, or host the folder anywhere that
serves static files (GitHub Pages works: Settings → Pages → deploy from branch).

## Layout

```
index.html                 Library home: one card per procedure
order-entry.html           Order Entry procedure (QuickBooks sales orders)
check-pricing.html         How to Check Pricing (price list, purchase history, item search)
pick-pack.html             Pick & Pack procedure (fulfillment worksheet)
assets/css/style.css       Shared styles for every page (light + dark, print)
assets/js/main.js          Shared behavior: contents rail, progress, lightbox, tabs, knowledge check
assets/js/<procedure>.js   Page-only tools (calculators, practice sheets, pickers)
assets/img/<procedure>/    Screenshots and examples for each procedure
```

## Adding a new procedure

1. Copy `order-entry.html` to a new file, e.g. `receiving.html`.
2. Change `<title>`, the breadcrumb, and `data-procedure="receiving"` on `<body>`
   (that name keys the "Your progress" tracker, which is saved in each person's browser).
3. Replace the sections. The building blocks you can reuse:
   - **Stage section**: `<section class="section" id="…">` with a `stage-badge`,
     ending in a `<label class="complete"><input type="checkbox" data-complete="…">`.
     Each `data-complete` value counts toward the progress bar; give the matching
     contents link and flow card `data-stage="…"` so they tick off too.
   - **Numbered steps**: `<ol class="steps"><li class="step"><div class="step__body">…`
   - **Callouts**: `callout callout--tip`, `callout--warn`, `callout--note`
   - **Screenshot**: `<figure class="figure"><button type="button" class="figure__frame" data-zoom><img …></button><figcaption>…</figcaption></figure>`
     (click to enlarge is automatic)
   - **QuickBooks field / item code**: `<span class="field">MINORD</span>`;
     on-screen button names: `<span class="ui">Save &amp; New</span>`;
     handwritten red marks: `<span class="redpen">C/C</span>`
   - **Tabs**: see the PO examples viewer in `order-entry.html`
   - **Knowledge check**: an empty `<form class="quiz" id="quiz-form">` plus a
     `<script type="application/json" id="quiz-data">` list of
     `{ "q": question, "a": [options], "c": index of the right option, "why": explanation }`
     (see the bottom of any procedure page)
4. Put images in `assets/img/<procedure>/`.
5. Add a card for it in `index.html` (change a "Planned" card into a link, or add a new one).

Printing a page from the browser gives a clean manual: navigation, calculators and
the quiz are hidden, and all PO example tabs print.
