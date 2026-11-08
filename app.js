/* Every Family Has a Language Plan — app logic
   Vanilla JS. Nothing here sends or stores data; the plan builder keeps
   its state in memory only and the printable worksheet is generated client-side. */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------------ */
  /* Mobile nav                                                          */
  /* ------------------------------------------------------------------ */
  const navToggle = $('.nav-toggle');
  const nav = $('#site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* Highlight the current section in the nav */
  const navLinks = $$('.site-nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.removeAttribute('aria-current'));
          const link = navLinks.find((a) => a.getAttribute('href') === '#' + entry.target.id);
          if (link) link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => io.observe(s));
  }

  /* ------------------------------------------------------------------ */
  /* FLP three-card explainer                                            */
  /* ------------------------------------------------------------------ */
  const flpCards = $$('.flp-card');
  flpCards.forEach((card) => {
    card.addEventListener('click', () => {
      const targetId = card.dataset.detail;
      const target = document.getElementById(targetId);
      const wasOpen = card.getAttribute('aria-expanded') === 'true';
      flpCards.forEach((c) => c.setAttribute('aria-expanded', 'false'));
      $$('.flp-detail').forEach((d) => { d.hidden = true; });
      if (!wasOpen && target) {
        card.setAttribute('aria-expanded', 'true');
        target.hidden = false;
        // Keep the detail panel in view on small screens
        if (window.innerWidth < 900) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Myth accordion                                                      */
  /* ------------------------------------------------------------------ */
  $$('.myth-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  /* ------------------------------------------------------------------ */
  /* Scenario tabs (WAI-ARIA tabs pattern)                               */
  /* ------------------------------------------------------------------ */
  const tabs = $$('[role="tab"]');
  function activateTab(tab) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activateTab(next); next.focus(); }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Start-this-week checklist                                           */
  /* ------------------------------------------------------------------ */
  $$('.week-item input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => cb.closest('.week-item').classList.toggle('done', cb.checked));
  });

  /* ------------------------------------------------------------------ */
  /* Citations: hover/focus tooltip + jump-and-flash                     */
  /* ------------------------------------------------------------------ */
  const SHORT_REFS = {
    ortega2013: 'Ortega, L. (2013). Introduction. In <em>Understanding second language acquisition</em> (2nd ed.). Routledge. <strong>Course reading.</strong>',
    pavlenko2015: 'Pavlenko, A. (2015). The dark side of the recent polyglot hype. <em>Psychology Today</em>. <strong>Course reading.</strong>',
    gass2020: 'Gass, Behney &amp; Plonsky (2020). <em>Second language acquisition: An introductory course</em> (4th ed.), Ch. 4. <strong>Course reading.</strong>',
    montee2026: 'Montee, M. (2026, Sept. 1). <em>Myths &amp; misconceptions</em> [LING 2050 lecture slides]. <strong>Course lecture.</strong>',
    dehouwer2009: 'De Houwer, A. (2009). <em>An introduction to bilingual development</em>. Multilingual Matters. <strong>Course reading.</strong>',
    dehouwer1999: 'De Houwer, A. (1999). Environmental factors in early bilingual development: The role of parental beliefs and attitudes. In <em>Bilingualism and migration</em> (pp. 75–96). Mouton de Gruyter.',
    king2008: 'King, Fogle &amp; Logan-Terry (2008). Family language policy. <em>Language and Linguistics Compass, 2</em>(5), 907–922.',
    dehouwer2007: 'De Houwer, A. (2007). Parental language input patterns and children\'s bilingual use. <em>Applied Psycholinguistics, 28</em>(3), 411–424.',
    dehouwer2015: 'De Houwer, A. (2015). Harmonious bilingual development. <em>International Journal of Bilingualism, 19</em>(2), 169–184.',
    hoff2012: 'Hoff et al. (2012). Dual language exposure and early bilingual development. <em>Journal of Child Language, 39</em>(1), 1–27.',
    byers2013: 'Byers-Heinlein, K. (2013). Parental language mixing. <em>Bilingualism: Language and Cognition, 16</em>(1), 32–48.',
    spolsky2012: 'Spolsky, B. (2012). Family language policy – the critical domain. <em>J. of Multilingual and Multicultural Development, 33</em>(1), 3–11.',
    place2011: 'Place &amp; Hoff (2011). Properties of dual language exposure that influence 2-year-olds\' bilingual proficiency. <em>Child Development, 82</em>(6), 1834–1849.'
  };
  let tip = null;
  function showTip(el) {
    const key = el.dataset.cite;
    if (!key || !SHORT_REFS[key]) return;
    hideTip();
    tip = document.createElement('div');
    tip.className = 'cite-tip';
    tip.setAttribute('role', 'tooltip');
    tip.innerHTML = SHORT_REFS[key] + '<br><span style="opacity:.75">Click to open the full reference.</span>';
    document.body.appendChild(tip);
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = r.left + window.scrollX + r.width / 2 - tw / 2;
    left = Math.max(12 + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - tw - 12));
    let top = r.top + window.scrollY - th - 10;
    if (r.top - th - 10 < 70) top = r.bottom + window.scrollY + 10;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hideTip() { if (tip) { tip.remove(); tip = null; } }
  $$('.cite').forEach((c) => {
    c.setAttribute('aria-label', c.textContent.trim() + ' — open reference');
    c.addEventListener('mouseenter', () => showTip(c));
    c.addEventListener('mouseleave', hideTip);
    c.addEventListener('focus', () => showTip(c));
    c.addEventListener('blur', hideTip);
    c.addEventListener('click', (e) => {
      const target = $(c.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      hideTip();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.remove('flash');
      void target.offsetWidth; // restart animation
      target.classList.add('flash');
      target.focus({ preventScroll: true });
      history.replaceState(null, '', c.getAttribute('href'));
    });
  });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* ------------------------------------------------------------------ */
  /* Toast                                                               */
  /* ------------------------------------------------------------------ */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Plan Builder                                                        */
  /* ------------------------------------------------------------------ */
  const form = $('#builder');
  if (!form) return;
  const steps = $$('.step', form);
  const stepItems = $$('#step-list li');
  const btnBack = $('#btn-back');
  const btnNext = $('#btn-next');
  const btnReset = $('#btn-reset');
  const errBox = $('#form-error');
  const progressBar = $('#progress-bar');
  const output = $('#plan-output');
  const TOTAL = 7;
  let current = 1;

  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function getAnswers() {
    const fd = new FormData(form);
    const all = (name) => fd.getAll(name);
    return {
      langTarget: (fd.get('langTarget') || '').trim(),
      langCommunity: (fd.get('langCommunity') || '').trim() || 'English',
      why: all('why'),
      me: fd.get('speakerMe'),
      partner: fd.get('speakerPartner'),
      relatives: fd.get('speakerRelatives'),
      caregiver: fd.get('speakerCaregiver'),
      stage: fd.get('stage'),
      support: all('support'),
      routine: all('routine'),
      goal: fd.get('goal')
    };
  }

  function validate(step) {
    const a = getAnswers();
    switch (step) {
      case 1:
        if (!a.langTarget) return 'Please name the language you want to grow or protect.';
        if (/\d/.test(a.langTarget) || a.langTarget.length < 2) return 'That does not look like a language name. Just the language, please.';
        if (!a.why.length) return 'Pick at least one reason — it becomes the "why" on your plan.';
        return '';
      case 2:
        if (!a.me) return 'Tell us how comfortable you are in the target language.';
        if (!a.partner) return 'Choose an option for a partner or co-parent (or "No co-parent").';
        if (!a.relatives) return 'Choose an option for grandparents or relatives.';
        if (!a.caregiver) return 'Choose an option for other caregivers (or "Not applicable").';
        return '';
      case 3: return a.stage ? '' : 'Pick the stage closest to your family.';
      case 4: return a.support.length ? '' : 'Choose at least one option — "Nothing yet" is a fine answer.';
      case 5: return a.routine.length ? '' : 'Pick at least one routine where the language could fit.';
      case 6: return a.goal ? '' : 'Choose the goal that matters most right now.';
      default: return '';
    }
  }

  function showStep(n) {
    current = n;
    steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === n));
    stepItems.forEach((li) => {
      const k = Number(li.dataset.step);
      li.classList.toggle('active', k === n);
      li.classList.toggle('done', k < n);
    });
    progressBar.style.width = Math.round(((n - 1) / (TOTAL - 1)) * 100) + '%';
    btnBack.disabled = n === 1;
    if (n === TOTAL) {
      btnNext.textContent = 'Done — back to top of plan';
    } else if (n === TOTAL - 1) {
      btnNext.textContent = 'Create my starting plan';
    } else {
      btnNext.textContent = 'Next';
    }
    errBox.hidden = true;
    const heading = $('h3', steps[n - 1]) || steps[n - 1];
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    const panelTop = form.getBoundingClientRect().top + window.scrollY - 90;
    if (Math.abs(window.scrollY - panelTop) > 80) window.scrollTo({ top: panelTop, behavior: 'smooth' });
  }

  btnNext.addEventListener('click', () => {
    if (current === TOTAL) { showStep(TOTAL); return; }
    const msg = validate(current);
    if (msg) {
      errBox.textContent = msg;
      errBox.hidden = false;
      return;
    }
    if (current === TOTAL - 1) renderPlan(getAnswers());
    showStep(current + 1);
  });
  btnBack.addEventListener('click', () => { if (current > 1) showStep(current - 1); });
  btnReset.addEventListener('click', () => {
    form.reset();
    output.innerHTML = '';
    showStep(1);
    toast('Cleared. Nothing was saved.');
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  // Pressing Enter in a text field should advance, not submit
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input[type="text"]')) { e.preventDefault(); btnNext.click(); }
  });

  /* ---------------- Plan content library ---------------- */

  const WHY_TEXT = {
    relatives: 'so our child can talk with grandparents and relatives in their own words',
    identity: 'because it is part of who we are and where we belong',
    faith: 'because it connects us to our faith and community life',
    future: 'because it opens doors later in life',
    home: 'because it is simply the language of our home',
    love: 'because we love it and want to share it'
  };

  // Routine templates: each returns a concrete, scripted habit for the target language L.
  const ROUTINES = {
    morning: (L) => `<strong>Mornings in ${L}.</strong> From wake-up to shoes-on, narrate what is happening in ${L}: "socks, then shoes," "it's raining, we need the coat." Same words every day is the point — repetition is how routines teach.`,
    meals: (L) => `<strong>One meal a day in ${L}.</strong> Pick the meal the fluent speaker is most likely to be at. Talk about the food, the day, the plan — real conversation, not vocabulary drills.`,
    car: (L) => `<strong>The car or stroller is ${L} territory.</strong> No screens, one playlist of ${L} songs, and a running commentary on what you pass. Captive audience, zero prep.`,
    play: (L) => `<strong>Fifteen minutes of ${L} play.</strong> Get on the floor and let your child lead; you supply the words in ${L} for what they are already doing. Follow their interest, not a lesson plan.`,
    reading: (L) => `<strong>Bedtime books in ${L}.</strong> Two books a night, same favorites on repeat. If your own ${L} is limited, picture books with few words are perfect — describe the pictures together.`,
    bath: (L) => `<strong>Bath and bedtime belong to ${L}.</strong> Songs, body parts, "warm or cold?", the goodnight ritual. It is the calmest, most affectionate slot of the day — exactly where a language sticks.`,
    cooking: (L) => `<strong>Cook one dish a week in ${L}.</strong> Ingredients, verbs, tasting, mess. Even better with a grandparent on a video call giving instructions.`,
    calls: (L) => `<strong>A standing ${L} video call.</strong> Same day, same time, with something to do together — a book to show, a toy to demonstrate, a song to sing — so it is not just "say hi."`,
    weekend: (L) => `<strong>A weekend outing in ${L}.</strong> The market, the park, the library: the fluent speaker takes the child solo and stays in ${L} the whole time.`
  };

  const STAGE = {
    future: {
      label: 'planning ahead',
      goal: (L) => `Before the baby arrives, make ${L} a comfortable, everyday part of <em>your own</em> life again, and line up the people who will speak it to your child.`,
      revisit: 'Revisit when the baby arrives, and again at six months — exhaustion rewrites every plan, and that is fine.',
      note: 'Right now the most powerful thing you can do is decide, out loud and with your partner, what role each language will play and who will be its people. Families with a clear sense that their own choices matter tend to act on them.'
    },
    baby: {
      label: 'baby or toddler',
      goal: (L) => `Make ${L} the language of warmth and routine: your child hears it every single day, from someone who loves them, in whole sentences.`,
      revisit: 'Revisit around the second birthday and before any childcare change, when the balance of languages usually shifts.',
      note: 'At this age, the amount of a language a child hears is the strongest predictor of how many words they will know in it. You are building a foundation, so protect daily exposure over anything fancy.'
    },
    preschool: {
      label: 'preschooler',
      goal: (L) => `Keep ${L} alive as the community language takes off: protected daily routines plus at least one new ${L} speaker in your child's week.`,
      revisit: 'Revisit at the start of each preschool or school year. Expect dips in output when the community language surges, and respond with more exposure rather than pressure.',
      note: 'Preschoolers often start answering in the community language. That is a normal "dilingual" pattern, not failure; the child understands and is making a social choice. Recast warmly and keep going.'
    },
    school: {
      label: 'school-age',
      goal: (L) => `Give ${L} a real job in your child's life — a relationship, a skill, or a community — so it competes with school and friends on purpose rather than by default.`,
      revisit: 'Revisit each term and after big social changes (a new school, a new best friend). Ask your child what they want; they are a stakeholder now.',
      note: 'School-age children can learn a great deal quickly, and many aspects of language are learned very well at this age. Reading in the language, a weekend program, or a meaningful role (translating for a grandparent, texting a cousin) often matters more than parent-led drills.'
    },
    teen: {
      label: 'tween or teen',
      goal: (L) => `Shift from "making" your teen use ${L} to giving them reasons to want it: identity, people, media, and travel they actually care about.`,
      revisit: 'Revisit together, as partners, a couple of times a year. Their reasons for wanting (or not wanting) the language will change fast; let the plan change with them.',
      note: 'Teens negotiate family language policy openly, and that is appropriate. Media in the language, friendships, a trip, or a heritage class with peers can do what parental insistence cannot. It is not too late; many people deepen a heritage language in adolescence and adulthood.'
    }
  };

  const GOAL = {
    conversation: {
      label: 'comfortable conversation with relatives',
      input: (L, a) => a.relatives === 'none'
        ? `Your goal is conversation, but you told us relatives who speak ${L} are not really in the picture. Find a substitute "relative": a community elder, a family friend, a regular babysitter — someone who will talk <em>with</em> your child in ${L}, not just at them.`
        : `Give the relatives a job. Instead of "say hi to Grandma," set up a shared activity for calls or visits — a book they both hold, a game, cooking instructions — so the conversation has something to be about. Fluent speakers add something to a child's skill that parents with limited fluency cannot, so let them lead.`
    },
    understanding: {
      label: 'understanding first — feeling at home in the language',
      input: (L, a) => `Understanding grows from hearing a lot of ${L} in whole, meaningful sentences. Narrate, read aloud, sing, and do not require answers in ${L}. If your child replies in ${esc(cap(a.langCommunity || 'the community language'))}, recast once and carry on; the comprehension is real even when the speaking lags.`
    },
    literacy: {
      label: 'reading and writing',
      input: (L, a) => `Build a ${L} shelf and a ${L} reading ritual first; print and letters make sense once the spoken language is familiar. ${a.support.includes('school') ? 'Your heritage or bilingual program is the backbone here — ask the teacher what to read at home.' : 'A weekend or heritage school, or a tutor who reads with your child, is worth looking into; literacy is hard to carry alone.'}`
    },
    culture: {
      label: 'cultural connection',
      input: (L) => `Let the culture carry the language: songs for holidays, the stories your family tells, recipes, celebrations, the names of things that have no good translation. Research on heritage contexts stresses that the relationship to the language is personal and communal — so make it about people and traditions, not grammar.`
    },
    school: {
      label: 'readiness for a bilingual or immersion program',
      input: (L) => `Prioritize understanding and a comfortable spoken base in ${L} over anything academic. Children who can follow instructions and chat with a friend in ${L} settle into immersion faster than children who have memorized the alphabet. Talk about the program with excitement; attitudes travel.`
    },
    options: {
      label: 'keeping options open',
      input: (L) => `A light but steady touch is the strategy: one protected daily routine in ${L}, songs and books, and relationships with people who speak it. Even passive familiarity makes later learning easier, and the door stays open for your child to choose more later.`
    }
  };

  function exposureNote(a, L) {
    const fluentAdults = (a.me === 'fluent' ? 1 : 0) + (a.partner === 'fluent' ? 1 : 0);
    const someAdults = (a.me === 'some' ? 1 : 0) + (a.partner === 'some' ? 1 : 0);
    const notes = [];
    if (fluentAdults === 0 && someAdults === 0) {
      notes.push(`Nobody in the household is yet comfortable in ${L}. That is a real constraint, not a disqualification: research links a child's skill in a language to how much of it they hear and from how many fluent speakers, so the plan below leans on relatives, community, and media while you rebuild your own ${L} alongside your child.`);
    } else if (fluentAdults === 0) {
      notes.push(`You (or your co-parent) can hold a conversation in ${L} but are not fully fluent. You can absolutely be a source of ${L} — especially for routines, songs, and warmth. Because children also benefit from input from fluent speakers and from a range of people, the plan asks you to widen the circle rather than carry it alone.`);
    } else if (fluentAdults === 1 && a.partner === 'none') {
      notes.push(`One fluent parent, one who does not speak ${L}. This is one of the most common setups and it can work — but it depends on the fluent parent keeping ${L} going even when the other parent is in the room, and on the non-speaking parent being genuinely okay with occasionally being left out. Talk about that explicitly; it prevents resentment later.`);
    } else if (fluentAdults === 2) {
      notes.push(`Both of you are fluent in ${L}. Research on nearly 1,900 bilingual families found that homes where both parents used the minority language, with at most one also using the community language, had the best odds of children actually speaking it. Consider making ${L} the default at home and letting the community supply ${esc(a.langCommunity)}.`);
    } else {
      notes.push(`You have one fluent speaker at home and a second adult with some ${L}. Let the fluent speaker anchor the daily routines and let the second adult join in at their level — participation matters more than perfection.`);
    }
    if (a.relatives === 'remote') notes.push(`Relatives who speak ${L} live far away: make video calls a <em>scheduled routine</em>, not an occasional event, and give them something to do together on the call.`);
    if (a.relatives === 'nearby') notes.push(`Relatives nearby are your biggest asset. Ask them, explicitly, to stay in ${L} with your child even when the child answers in ${esc(a.langCommunity)}.`);
    if (a.caregiver === 'yes') notes.push(`A caregiver who speaks ${L} adds a whole new voice. Ask them to use ${L} consistently; a different speaker is worth more than extra hours from the same one.`);
    if (a.support.includes('none')) notes.push(`You have no outside support yet. Pick <em>one</em> to find this month — a playgroup, a weekend class, a community event, or a family that speaks ${L}. One new voice changes the arithmetic.`);
    return notes;
  }

  function pickRoutines(a) {
    const order = ['bath', 'reading', 'meals', 'morning', 'car', 'calls', 'play', 'cooking', 'weekend'];
    const chosen = order.filter((k) => a.routine.includes(k));
    // Make calls routine more prominent when relatives are remote
    if (a.relatives === 'remote' && chosen.includes('calls')) { chosen.splice(chosen.indexOf('calls'), 1); chosen.unshift('calls'); }
    return chosen.slice(0, 3);
  }

  function renderPlan(a) {
    const L = esc(cap(a.langTarget));
    const C = esc(cap(a.langCommunity));
    const stage = STAGE[a.stage] || STAGE.baby;
    const goal = GOAL[a.goal] || GOAL.options;
    const whys = a.why.map((w) => WHY_TEXT[w]).filter(Boolean);
    const whySentence = whys.length
      ? `${L} matters to us ${whys.slice(0, 2).join(', and ')}${whys.length > 2 ? ', among other reasons' : ''}.`
      : `${L} matters to us.`;
    const routines = pickRoutines(a).map((k) => ROUTINES[k](L));
    const notes = exposureNote(a, L);
    const speakers = [];
    speakers.push(`You: ${{ fluent: 'fluent', some: 'conversational', learning: 'learning' }[a.me]}`);
    if (a.partner && a.partner !== 'na') speakers.push(`Co-parent: ${{ fluent: 'fluent', some: 'conversational', none: `does not speak ${L}` }[a.partner]}`);
    if (a.relatives !== 'none') speakers.push(`Relatives: ${a.relatives === 'nearby' ? 'nearby' : 'far away (calls)'}`);
    if (a.caregiver === 'yes') speakers.push('Caregiver: speaks it');
    const supportLabels = { school: 'heritage/bilingual program', playgroup: 'playgroup or families', faithcomm: 'religious/cultural community', books: 'books and music', media: 'shows, podcasts, apps', travel: 'visits', none: 'nothing yet' };
    const supports = a.support.map((s) => supportLabels[s]).filter(Boolean);

    const html = `
      <div class="plan-head">
        <div>
          <p class="eyebrow" style="margin-bottom:6px">Your starting plan</p>
          <h3>${L} in our family</h3>
          <p class="sub">A ${esc(stage.label)} plan focused on ${esc(goal.label)}. Cautious by design — it is a place to start, not a verdict.</p>
        </div>
        <div class="plan-actions">
          <button type="button" class="btn btn-accent" id="btn-print">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/></svg>
            Print or save as PDF</button>
          <button type="button" class="btn btn-secondary" id="btn-download">Download as text</button>
        </div>
      </div>

      <div class="plan-three">
        <div class="mini c-gold"><b>Our beliefs</b>${whySentence}</div>
        <div class="mini c-sage"><b>Our practices today</b>${speakers.map(esc).join(' · ')}${supports.length ? `<br><span style="color:var(--muted)">Support: ${supports.map(esc).join(', ')}</span>` : ''}</div>
        <div class="mini c-terra"><b>Our management</b>${routines.length} protected routine${routines.length === 1 ? '' : 's'}, one check-in date, one circle-widening move.</div>
      </div>

      <div class="plan-block">
        <h4><span class="badge" style="background:var(--gold-deep)">1</span> One realistic goal for the next few months</h4>
        <p style="margin:0">${stage.goal(L)}</p>
      </div>

      <div class="plan-block">
        <h4><span class="badge" style="background:var(--sage)">2</span> Routines to try this week</h4>
        <ul>${routines.map((r) => `<li>${r}</li>`).join('')}</ul>
      </div>

      <div class="plan-block">
        <h4><span class="badge" style="background:var(--terracotta)">3</span> Meaningful input and interaction</h4>
        <p>${goal.input(L, a)}</p>
        <ul>${notes.map((n) => `<li>${n}</li>`).join('')}</ul>
      </div>

      <div class="plan-block">
        <h4><span class="badge" style="background:var(--plum)">4</span> Something to remember</h4>
        <p style="margin-bottom:8px">${stage.note}</p>
        <p style="margin:0"><strong>Revisit, don't enshrine.</strong> ${stage.revisit} A plan is a draft of a family's habits, negotiated with the child as they grow — not a contract.</p>
      </div>

      <p class="plan-note">Based on the research summarized in the <a href="#sources">Sources</a> section (De Houwer, 2007, 2009, 2015; Hoff et al., 2012; Place &amp; Hoff, 2011; King et al., 2008; Byers-Heinlein, 2013; Ortega, 2013; Gass et al., 2020). This is an educational guide, not individualized advice. Nothing you entered has left this device.</p>
    `;
    output.innerHTML = html;

    $('#btn-print').addEventListener('click', () => printPlan({ L, C, stage, goal, whySentence, speakers, supports, routines, notes, a }));
    $('#btn-download').addEventListener('click', () => downloadPlan({ L, C, stage, goal, whySentence, speakers, supports, routines, notes, a }));
  }

  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  function printPlan(p) {
    const root = $('#print-root');
    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    root.innerHTML = `
      <div class="print-sheet">
        <h1>${p.L} in our family — a starting language plan</h1>
        <div class="pmeta">Created ${today} · Every Family Has a Language Plan · LING 2050 final project, Georgetown University</div>
        <div class="pgrid">
          <div class="pbox"><b>Our beliefs (why)</b>${p.whySentence}</div>
          <div class="pbox"><b>Our practices (who speaks what)</b>${p.speakers.map(esc).join(' · ')}${p.supports.length ? `<br>Support: ${p.supports.map(esc).join(', ')}` : ''}</div>
          <div class="pbox"><b>Our management (what we protect)</b>${p.routines.length} routine${p.routines.length === 1 ? '' : 's'} · one check-in date · one new voice</div>
        </div>
        <h2>1. One realistic goal</h2>
        <p>${p.stage.goal(p.L)}</p>
        <h2>2. Routines to try this week</h2>
        <ul>${p.routines.map((r) => `<li>${r}</li>`).join('')}</ul>
        <h2>3. Meaningful input and interaction</h2>
        <p>${p.goal.input(p.L, p.a)}</p>
        <ul>${p.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
        <h2>4. Our check-in</h2>
        <p>${p.stage.revisit}</p>
        <p>Date of our next language check-in: <span class="lines" style="display:inline-block;width:40%"></span></p>
        <p>What we noticed our child responds to: <span class="lines" style="display:inline-block;width:100%"></span></p>
        <div class="pfoot">Educational guide based on published research (De Houwer, 2007, 2009, 2015; Hoff et al., 2012; Place &amp; Hoff, 2011; King, Fogle &amp; Logan-Terry, 2008; Byers-Heinlein, 2013; Ortega, 2013; Gass, Behney &amp; Plonsky, 2020). Not individualized medical, speech-language, or developmental advice. Generated locally in your browser; nothing was stored or sent.</div>
      </div>`;
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('printing-plan');
    const cleanup = () => { document.body.classList.remove('printing-plan'); root.setAttribute('aria-hidden', 'true'); window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    window.print();
    // Safari may not fire afterprint reliably; clean up after a delay as a fallback
    setTimeout(cleanup, 1500);
  }

  function downloadPlan(p) {
    const lines = [];
    lines.push(`${strip(p.L)} IN OUR FAMILY — A STARTING LANGUAGE PLAN`);
    lines.push('Every Family Has a Language Plan · generated locally, nothing stored or sent');
    lines.push('');
    lines.push('OUR BELIEFS (WHY): ' + strip(p.whySentence));
    lines.push('OUR PRACTICES (WHO SPEAKS WHAT): ' + p.speakers.join(' · ') + (p.supports.length ? ` | Support: ${p.supports.join(', ')}` : ''));
    lines.push('');
    lines.push('1. ONE REALISTIC GOAL');
    lines.push('   ' + strip(p.stage.goal(p.L)));
    lines.push('');
    lines.push('2. ROUTINES TO TRY THIS WEEK');
    p.routines.forEach((r) => lines.push('   - ' + strip(r)));
    lines.push('');
    lines.push('3. MEANINGFUL INPUT AND INTERACTION');
    lines.push('   ' + strip(p.goal.input(p.L, p.a)));
    p.notes.forEach((n) => lines.push('   - ' + strip(n)));
    lines.push('');
    lines.push('4. REVISIT, DON\'T ENSHRINE');
    lines.push('   ' + strip(p.stage.revisit));
    lines.push('   Next check-in date: __________    What our child responds to: __________');
    lines.push('');
    lines.push('Sources: De Houwer (2007, 2009, 2015); Hoff et al. (2012); Place & Hoff (2011); King, Fogle & Logan-Terry (2008); Byers-Heinlein (2013); Ortega (2013); Gass, Behney & Plonsky (2020). Educational guide, not individualized advice.');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement('a');
    aEl.href = url;
    aEl.download = `${strip(p.L).toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-family-language-plan.txt`;
    document.body.appendChild(aEl);
    aEl.click();
    aEl.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Plan downloaded as a text file.');
  }

  showStep(1);
})();
