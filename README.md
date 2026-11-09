# Every Family Has a Language Plan

*A research-backed guide to raising children with more than one language.*
Final project for **LING 2050: How Languages Are Learned** (Georgetown University, Fall 2026, Prof. Meg Montee).

The site teaches non-expert parents and future parents what **Family Language Policy (FLP)** is — beliefs, practices, and management — why intentional planning matters, which common myths the research complicates, and how to build a realistic, revisable language plan at home. A **3-minute version** under the hero gives busy parents the shortcut; a **"What do I say in the moment?"** card turns the research into a script; and the interactive **Language Plan Builder** produces a printable one-page worksheet entirely in the browser.

Live site: <https://joshlammbo0.github.io/Every-Family-Has-a-Language-Plan/>

## Run it locally

No build step and no dependencies. Any static file server works; `serve.js` is a 20-line zero-dependency one included for convenience.

```bash
cd "Every Family Has a Language Plan"
node serve.js
```

Then open <http://localhost:8865>.

Alternatives: `python3 -m http.server 8865`, `npx serve .`, or simply double-click `index.html` (everything works from `file://` too; the only network request is for the Google Fonts stylesheet, and the site falls back to system fonts offline).

Locally, the folder is also registered in the Claude desktop app as the `family-language-plan` preview server.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, FLP explainer, why it matters, myths, plan builder, scenarios, start-this-week, sources |
| `styles.css` | Design tokens, layout, components, and the print stylesheet for the one-page worksheet |
| `app.js` | Nav, accordions, tabs, citation tooltips, and the Plan Builder (validation, plan generation, print, text download) |
| `serve.js` | Optional zero-dependency local static server (`node serve.js`) |
| `assets/favicon.svg` | Three-strand mark used in the tab icon and header |
| `research-notes.md` | Claim-to-source map: every substantive claim on the site and the exact source behind it |
| `REFLECTION-OUTLINE.md` | Outline for the separate reflection paper |

## Privacy

The Plan Builder keeps answers in memory only. There are no cookies, no localStorage, no analytics, and no network requests other than the font stylesheet. Closing the tab erases everything.

## Accessibility

Semantic landmarks and heading order, a skip link, visible focus states, `aria-expanded`/`aria-controls` on every disclosure, the WAI-ARIA tabs pattern with arrow-key navigation, labelled form controls grouped in fieldsets, a live region for the generated plan, `prefers-reduced-motion` support, and WCAG AA color contrast throughout.

## 3-minute presentation route

1. **Hero (20 s).** Read the headline question aloud. Click the **Practices** label on the woven illustration: it jumps down and opens the matching card, showing that the three strands structure the whole site.
2. **The 3-minute version (30 s).** Scroll back up to the strip under the hero. One sentence on what FLP is, three things that matter most, and the plan builder. Point out a source chip and hover it to show the tooltip.
3. **Myths and the script card (40 s).** Open myth 2 (*OPOL is the only approach*) and read the De Houwer (2007) line: neither necessary nor sufficient. Then scroll to **"What do I say in the moment?"** and read the juice exchange aloud.
4. **Plan Builder (60 s).** Fill it in live: Russian / English, "talking with grandparents," you fluent, partner does not speak it, relatives far away, baby, "nothing yet," routines bath + calls, goal conversation. Show "Our why," the six numbered blocks, the suggested check-in date, then click **Print or save as PDF** for the one-page worksheet. Mention that nothing leaves the browser.
5. **Research & References (20 s).** Show the three counts (5 course sources, 5 core articles, 3 supporting works) and open one "How we used it." Close on the thesis banner: *not one perfect rule, but an intentional, flexible plan.*

## Research base

Course sources: Ortega (2013) Introduction; Pavlenko (2015); Gass, Behney & Plonsky (2020) Ch. 4; Montee (2026) "Myths & Misconceptions" lecture; De Houwer (2009) *An Introduction to Bilingual Development*, Chs. 1–6 (page-cited).

Independently found: King, Fogle & Logan-Terry (2008); De Houwer (2007); De Houwer (2015); Hoff et al. (2012); Byers-Heinlein (2013). Framework and supporting: Spolsky (2012); Place & Hoff (2011).

See `research-notes.md` for the claim-by-claim map and the items to confirm before submission.
