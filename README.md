# Every Family Has a Language Plan

*A research-backed guide to raising children with more than one language.*
Final project for **LING 2050: How Languages Are Learned** (Georgetown University, Fall 2026, Prof. Meg Montee).

The site teaches non-expert parents and future parents what **Family Language Policy (FLP)** is — beliefs, practices, and management — why intentional planning matters, which common myths the research complicates, and how to build a realistic, revisable language plan at home. A **quick guide** under the hero gives busy parents the three-minute reading version; a **"What do I say in the moment?"** card turns the research into a script; and the interactive **Language Plan Builder** produces a one-page plan (a reason, a first routine with a named person, the next person to involve, and a check-in date) entirely in the browser, printable or downloadable as text.

Live site: <https://joshlammbo0.github.io/Every-Family-Has-a-Language-Plan/>

## Run it locally

No build step and no dependencies. Any static file server works; `serve.js` is a 20-line zero-dependency one included for convenience.

```bash
cd "Every Family Has a Language Plan"
node serve.js
```

Then open <http://localhost:8865>.

Alternatives: `python3 -m http.server 8865`, `npx serve .`, or simply double-click `index.html` (everything works from `file://` too). Fonts are self-hosted in `assets/fonts/`, so the page makes no third-party requests.

Locally, the folder is also registered in the Claude desktop app as the `family-language-plan` preview server.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, FLP explainer, why it matters, myths, plan builder, scenarios, start-this-week, sources |
| `styles.css` | Design tokens, layout, components, and the print stylesheet for the one-page worksheet |
| `app.js` | Nav, accordions, tabs, citation tooltips, and the Plan Builder (validation, plan generation, print, text download) |
| `serve.js` | Optional zero-dependency local static server (`node serve.js`) |
| `assets/favicon.svg` | Three-strand mark used in the tab icon and header |
| `assets/fonts/` | Self-hosted Fraunces and Inter (SIL Open Font License) |
| `assets/share.png` | Link-preview image |
| `assets/intro.mp4`, `intro.vtt`, `intro-poster.jpg` | The 89-second author introduction (H.264/AAC), its captions, and its poster frame |
| `assets/howto.mp4`, `howto.vtt`, `howto-poster.jpg` | The 63-second "How to use this builder" walkthrough, its captions, and its poster frame |
| `assets/inmoment.mp4`, `inmoment.vtt`, `inmoment-poster.jpg` | The 67-second "What to do when your child answers in English" video, its captions, and its poster frame |
| `research-notes.md` | Claim-to-source map: every substantive claim on the site and the exact source behind it |
| `REFLECTION-OUTLINE.md` | Outline for the separate reflection paper |

## Privacy

The introduction video is self-hosted (no third-party player). The Plan Builder keeps answers in memory only. There are no cookies, no localStorage, no analytics, and no network requests at all. Closing the tab erases everything, which the page says plainly next to the form.

## Accessibility

Semantic landmarks and heading order, a skip link, visible focus states, native `<details>` for the myths and reference notes, `aria-expanded`/`aria-controls` on the framework cards, the WAI-ARIA tabs pattern with arrow-key navigation, labelled form controls grouped in fieldsets with inline errors tied to the field, `aria-current="step"` and a real progress bar in the builder, focus moved to the destination heading on in-page navigation, `prefers-reduced-motion` respected in CSS and in scripted scrolling, and WCAG AA color contrast on text and controls.

## 3-minute presentation route

1. **First screen (20 s).** Read the headline and the one-line promise: one reason, one routine, one person. Mention the captioned 90-second introduction just below (no need to play it in class). Point out the three strands in the illustration; click **what you do** to show it opens the matching card.
2. **The quick guide (30 s).** Three points, each with a source chip. Hover a chip for the tooltip; click one to jump to the reference and use the "back to where you were reading" link to return.
3. **Myths and the script (40 s).** Show the question-and-short-answer format, open *Is "one parent, one language" the only way?*, then scroll to **What do I say in the moment?** and read the juice exchange aloud.
4. **Plan Builder (60 s).** Russian / English; talking with relatives; you fluent, co-parent does not speak it, relatives far away; baby; nothing yet; routines bath + cooking; goal conversation. Show the four-tile summary (reason, first routine, next person, check-in date), open **The full plan**, then **Print / save PDF**. Say that nothing leaves the browser.
5. **Research & References (20 s).** The three counts, one "How I used it" disclosure.

## Research base

Course sources: Ortega (2013) Introduction; Pavlenko (2015); Gass, Behney & Plonsky (2020) Ch. 4; De Houwer (2009) *An Introduction to Bilingual Development*, Chs. 1–6 (page-cited).

Independently found: King, Fogle & Logan-Terry (2008); De Houwer (2007); De Houwer (2015); Hoff et al. (2012); Byers-Heinlein (2013). Framework and supporting: Spolsky (2012); Place & Hoff (2011).

See `research-notes.md` for the claim-by-claim map and the items to confirm before submission.
