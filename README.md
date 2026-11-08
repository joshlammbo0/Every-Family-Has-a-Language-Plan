# Every Family Has a Language Plan

*A research-backed guide to raising children with more than one language.*
Final project for **LING 2050: How Languages Are Learned** (Georgetown University, Fall 2026, Prof. Meg Montee).

The site teaches non-expert parents and future parents what **Family Language Policy (FLP)** is — beliefs, practices, and management — why intentional planning matters, which common myths the research complicates, and how to build a realistic, revisable language plan at home. It ends with an interactive **Language Plan Builder** that produces a printable one-page worksheet entirely in the browser.

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

## Privacy

The Plan Builder keeps answers in memory only. There are no cookies, no localStorage, no analytics, and no network requests other than the font stylesheet. Closing the tab erases everything.

## Accessibility

Semantic landmarks and heading order, a skip link, visible focus states, `aria-expanded`/`aria-controls` on every disclosure, the WAI-ARIA tabs pattern with arrow-key navigation, labelled form controls grouped in fieldsets, a live region for the generated plan, `prefers-reduced-motion` support, and WCAG AA color contrast throughout.

## 3-minute presentation route

1. **Hero (20 s).** Read the headline question aloud: *"Your family may already have a language policy. Is it the one you want?"* Point out the three woven strands — beliefs, practices, management — that structure the whole site.
2. **What is FLP? (40 s).** Click **Practices**. Show the Okafor–Lindqvist example: stated plan versus what actually happens between 6 and 8 p.m. Click a source marker (e.g. *Hoff et al., 2012*) to show the tooltip and the jump to the reference.
3. **Myths (40 s).** Open myth 2, *"OPOL is the only approach that works,"* and read the De Houwer (2007) finding: neither necessary nor sufficient. Mention that every reality is nuanced and sourced.
4. **Plan Builder (60 s).** Fill it in live — e.g. Russian / English, "talking with grandparents," you fluent, partner does not speak it, relatives far away, toddler, "nothing yet," routines: bath + calls + books, goal: conversation. Show the generated plan, then click **Print or save as PDF** to show the one-page worksheet.
5. **Sources and close (20 s).** Scroll to Sources: two course readings plus the lecture, five independently found peer-reviewed articles, "how we used it" notes, and the disclaimer. Close on the thesis banner: *not one perfect rule, but an intentional, flexible plan.*

## Research base

Course sources: Ortega (2013) Introduction; Pavlenko (2015); Gass, Behney & Plonsky (2020) Ch. 4; Montee (2026) "Myths & Misconceptions" lecture; De Houwer (2009) *An Introduction to Bilingual Development*, Chs. 1–6 (page-cited).

Independently found: King, Fogle & Logan-Terry (2008); De Houwer (2007); De Houwer (2015); Hoff et al. (2012); Byers-Heinlein (2013). Framework and supporting: Spolsky (2012); Place & Hoff (2011).

See `research-notes.md` for the claim-by-claim map and the items to confirm before submission.
