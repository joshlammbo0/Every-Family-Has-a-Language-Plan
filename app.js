/* Every Family Has a Language Plan — app logic
   Vanilla JS. Nothing here sends or stores data: the plan builder keeps
   its state in memory only, and the worksheet is generated client-side. */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth');
  const after = (fn) => setTimeout(fn, reduceMotion.matches ? 0 : 350);
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  /* Focus an element without scrolling it under the sticky header */
  function focusEl(el, { scroll = false } = {}) {
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: !scroll });
  }

  /* ------------------------------------------------------------------ */
  /* Header, menu, sticky offset                                         */
  /* ------------------------------------------------------------------ */
  const navToggle = $('.nav-toggle');
  const nav = $('#site-nav');
  const header = $('.site-header');
  const headerH = () => (header ? header.offsetHeight : 64);
  const setHeaderVar = () => document.documentElement.style.setProperty('--header-h', headerH() + 'px');
  setHeaderVar();
  window.addEventListener('resize', setHeaderVar);

  function setMenu(open, { focusFirst = false, returnFocus = false } = {}) {
    if (!navToggle || !nav) return;
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open && focusFirst) { const first = nav.querySelector('a'); if (first) first.focus(); }
    if (!open && returnFocus) navToggle.focus();
  }
  if (navToggle && nav) {
    navToggle.setAttribute('aria-label', 'Open menu');
    navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open'), { focusFirst: true }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false, { returnFocus: true });
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !e.target.closest('.site-header')) setMenu(false);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1040 && nav.classList.contains('open')) setMenu(false); });
    nav.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
      const links = $$('a', nav); const last = links[links.length - 1];
      if (!e.shiftKey && document.activeElement === last) setMenu(false);
      if (e.shiftKey && document.activeElement === links[0]) { e.preventDefault(); navToggle.focus(); }
    });
  }

  /* In-page links: one deliberate scroll, then focus the destination heading */
  function goToSection(hash, { push = true } = {}) {
    const target = hash && hash.length > 1 && $(hash);
    if (!target) return false;
    if (push) history.pushState(null, '', hash);
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    const heading = target.matches('section') ? $('h2', target) : target;
    after(() => focusEl(heading));
    return true;
  }
  $$('a[href^="#"]').forEach((a) => {
    const hash = a.getAttribute('href');
    if (a.classList.contains('cite') || a.classList.contains('skip-link') || a.dataset.open) return;
    a.addEventListener('click', (e) => {
      if (hash === '#' || !$(hash)) return;
      e.preventDefault();
      setMenu(false);
      goToSection(hash);
    });
  });

  /* Highlight the current section in the nav (none while on the hero) */
  const navLinks = $$('.site-nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const hero = $('#top');
  let navTimer = null;
  function updateActiveNav() {
    navTimer = null;
    const probe = window.scrollY + headerH() + 24;
    let current = null;
    const pastHero = !hero || probe >= hero.offsetTop + hero.offsetHeight;
    if (pastHero) sections.forEach((sec) => { if (sec.offsetTop <= probe) current = sec; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    navLinks.forEach((a) => {
      if (current && a.getAttribute('href') === '#' + current.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  const onScroll = () => { if (navTimer === null) navTimer = setTimeout(updateActiveNav, 60); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', updateActiveNav);
  updateActiveNav();

  /* ------------------------------------------------------------------ */
  /* FLP three-card explainer                                            */
  /* ------------------------------------------------------------------ */
  const flpCards = $$('.flp-card');
  function openFlp(detailId, { focus = false } = {}) {
    const card = flpCards.find((c) => c.dataset.detail === detailId);
    const target = document.getElementById(detailId);
    if (!card || !target) return;
    flpCards.forEach((c) => c.setAttribute('aria-expanded', 'false'));
    $$('.flp-detail').forEach((d) => { d.hidden = true; });
    card.setAttribute('aria-expanded', 'true');
    target.hidden = false;
    if (focus) focusEl($('h3', target) || target);
  }
  flpCards.forEach((card) => {
    card.addEventListener('click', () => {
      const detail = document.getElementById(card.dataset.detail);
      if (card.getAttribute('aria-expanded') === 'true') {
        card.setAttribute('aria-expanded', 'false');
        detail.hidden = true;
        return;
      }
      openFlp(card.dataset.detail);
      if (window.innerWidth < 900) {
        detail.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
        after(() => focusEl($('h3', detail)));
      }
    });
  });
  /* Links straight to a framework card (hero strands, quick guide) */
  $$('[data-open]').forEach((lab) => {
    lab.addEventListener('click', (e) => {
      e.preventDefault();
      const id = lab.dataset.open;
      const detail = document.getElementById(id);
      if (!detail) return;
      history.pushState(null, '', '#' + id);
      openFlp(id);
      detail.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      after(() => focusEl($('h3', detail)));
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
    tab.addEventListener('click', () => { activateTab(tab); history.replaceState(null, '', '#' + tab.getAttribute('aria-controls')); });
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activateTab(next); next.focus(); }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Deep links: open whatever disclosure the hash points at             */
  /* ------------------------------------------------------------------ */
  function openFromHash({ focus }) {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    if (el.classList.contains('flp-detail')) { openFlp(id, { focus }); return; }
    const details = el.closest('details');
    if (details && !details.open) details.open = true;
    if (el.getAttribute('role') === 'tabpanel') {
      const tab = tabs.find((t) => t.getAttribute('aria-controls') === id);
      if (tab) activateTab(tab);
    }
    if (focus) focusEl(el.matches('section') ? $('h2', el) : (details ? $('summary', details) : el));
    else {
      /* On load, make sure the browser actually lands on the target (smooth scrolling can be skipped before first paint) */
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.6) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }
  window.addEventListener('hashchange', () => openFromHash({ focus: true }));
  openFromHash({ focus: false });

  /* ------------------------------------------------------------------ */
  /* Citations: tooltip, jump, and a way back                            */
  /* ------------------------------------------------------------------ */
  const SHORT_REFS = {
    ortega2013: 'Ortega, L. (2013). Introduction. In <em>Understanding second language acquisition</em> (2nd ed.). Routledge. <strong>Course reading.</strong>',
    pavlenko2015: 'Pavlenko, A. (2015). The dark side of the recent polyglot hype. <em>Psychology Today</em>. <strong>Course reading.</strong>',
    gass2020: 'Gass, Behney &amp; Plonsky (2020). <em>Second language acquisition: An introductory course</em> (4th ed.), Ch. 4. <strong>Course reading.</strong>',
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
  let tip = null, tipOwner = null, tipHide = null;
  function hideTip() {
    if (tip) { tip.remove(); tip = null; }
    if (tipOwner) { tipOwner.removeAttribute('aria-describedby'); tipOwner = null; }
  }
  function hideTipSoon() { clearTimeout(tipHide); tipHide = setTimeout(hideTip, 180); }
  function showTip(el) {
    const key = el.dataset.cite;
    if (!key || !SHORT_REFS[key]) return;
    hideTip();
    tip = document.createElement('div');
    tip.className = 'cite-tip';
    tip.id = 'cite-tip';
    tip.setAttribute('role', 'tooltip');
    tip.innerHTML = SHORT_REFS[key] + '<br><span class="tip-hint">Select to open the full reference.</span>';
    tip.addEventListener('mouseenter', () => clearTimeout(tipHide));
    tip.addEventListener('mouseleave', hideTipSoon);
    document.body.appendChild(tip);
    el.setAttribute('aria-describedby', 'cite-tip');
    tipOwner = el;
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = r.left + window.scrollX + r.width / 2 - tw / 2;
    left = Math.max(12 + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - tw - 12));
    let top = r.top + window.scrollY - th - 8;
    if (r.top - th - 8 < headerH() + 6) top = r.bottom + window.scrollY + 8;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  $$('.cite').forEach((c) => {
    c.setAttribute('aria-label', c.textContent.trim() + ', open reference');
    c.addEventListener('mouseenter', () => { clearTimeout(tipHide); showTip(c); });
    c.addEventListener('mouseleave', hideTipSoon);
    c.addEventListener('focus', () => showTip(c));
    c.addEventListener('blur', hideTip);
    c.addEventListener('click', (e) => {
      const target = $(c.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      hideTip();
      history.pushState(null, '', c.getAttribute('href'));
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
      target.classList.remove('flash');
      void target.offsetWidth;
      target.classList.add('flash');
      let back = $('.ref-back', target);
      if (!back) {
        back = document.createElement('button');
        back.type = 'button';
        back.className = 'ref-back';
        target.appendChild(back);
      }
      back.textContent = '↩ Back to where you were reading';
      back.onclick = () => {
        history.back();
        c.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
        after(() => c.focus({ preventScroll: true }));
      };
      after(() => focusEl(target));
    });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tip) hideTip(); });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* ------------------------------------------------------------------ */
  /* Video cards: a clean thumbnail with a play button. Nothing autoplays; */
  /* without JavaScript the native controls are simply shown.             */
  /* ------------------------------------------------------------------ */
  $$('[data-video-card]').forEach((card) => {
    const video = $('video', card);
    const btn = $('.video-play', card);
    if (!video || !btn) return;
    video.controls = false;
    btn.hidden = false;
    const markPlaying = () => {
      video.controls = true;
      card.classList.add('playing');
      const wrap = card.closest('.howto');
      if (wrap) wrap.classList.add('is-playing');
      btn.hidden = true;
    };
    btn.addEventListener('click', () => {
      markPlaying();
      const started = video.play();
      if (started && started.catch) started.catch(function () {});
      video.focus({ preventScroll: true });
    });
    video.addEventListener('play', markPlaying);
    video.addEventListener('ended', () => {
      btn.hidden = false;
      btn.setAttribute('aria-label', 'Play again');
    });
  });

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
  const announcer = $('#form-announcer');
  const progressBar = $('#progress-bar');
  const progressBox = $('.progress[role="progressbar"]', form);
  const stepCount = $('#step-count');
  const output = $('#plan-output');
  const TOTAL = 7;
  const QUESTIONS = 6;
  let current = 1;
  let furthest = 1;        // highest step reached, so completed steps can be revisited
  let planModel = null;
  const routineOrder = []; // routines in the order the reader chose them

  function getAnswers() {
    const fd = new FormData(form);
    const all = (name) => fd.getAll(name);
    const stage = fd.get('stage');
    const chosen = stage === 'future' ? all('routineFuture') : all('routine');
    return {
      langTarget: (fd.get('langTarget') || '').trim(),
      langCommunity: (fd.get('langCommunity') || '').trim(),
      why: all('why'),
      me: fd.get('speakerMe'),
      partner: fd.get('speakerPartner'),
      relatives: fd.get('speakerRelatives'),
      caregiver: fd.get('speakerCaregiver'),
      stage,
      support: all('support'),
      routine: routineOrder.filter((k) => chosen.includes(k)).concat(chosen.filter((k) => !routineOrder.includes(k))),
      goal: fd.get('goal')
    };
  }
  const hasAnyAnswer = () => {
    const a = getAnswers();
    return Boolean(a.langTarget || a.langCommunity || a.why.length || a.me || a.partner || a.relatives || a.caregiver || a.stage || a.support.length || a.routine.length || a.goal);
  };

  /* ---- Validation: inline, beside the group, kept until that group changes ---- */
  const first = (sel) => $(sel, form);
  function validate(step) {
    const a = getAnswers();
    switch (step) {
      case 1:
        if (!a.langTarget) return { msg: 'Enter the language you want to grow or protect.', el: first('#lang-target') };
        if (!a.why.length) return { msg: 'Choose at least one reason. It becomes the "why" on your plan.', el: first('input[name="why"]') };
        return null;
      case 2:
        if (!a.me) return { msg: 'Choose your own level in the language.', el: first('input[name="speakerMe"]') };
        if (!a.partner) return { msg: 'Choose an option for a co-parent, or "No co-parent".', el: first('input[name="speakerPartner"]') };
        if (!a.relatives) return { msg: 'Choose an option for grandparents or relatives.', el: first('input[name="speakerRelatives"]') };
        if (!a.caregiver) return { msg: 'Choose an option for other caregivers, or "Not applicable".', el: first('input[name="speakerCaregiver"]') };
        return null;
      case 3: return a.stage ? null : { msg: 'Choose the stage closest to your family.', el: first('input[name="stage"]') };
      case 4: return a.support.length ? null : { msg: 'Choose at least one option. "Nothing yet" is a fine answer.', el: first('input[name="support"]') };
      case 5: {
        if (a.routine.length) return null;
        return { msg: 'Choose one to three.', el: first(a.stage === 'future' ? 'input[name="routineFuture"]' : 'input[name="routine"]') };
      }
      case 6: return a.goal ? null : { msg: 'Choose the goal that matters most right now.', el: first('input[name="goal"]') };
      default: return null;
    }
  }
  const groupOf = (el) => el.closest('.speaker-row') || el.closest('fieldset') || el.closest('.field') || el;
  function clearError(group) {
    const err = group.previousElementSibling;
    if (err && err.classList.contains('step-error')) err.remove();
    group.classList.remove('is-invalid');
    $$('[aria-invalid="true"]', group).forEach((e) => { e.removeAttribute('aria-invalid'); e.removeAttribute('aria-describedby'); });
  }
  function clearAllErrors() { $$('.is-invalid', form).forEach(clearError); $$('.step-error', form).forEach((e) => e.remove()); }
  let errSeq = 0;
  function showError(step, { msg, el }) {
    const group = groupOf(el);
    clearError(group);
    const err = document.createElement('p');
    err.className = 'step-error';
    err.id = 'err-' + (++errSeq);
    err.innerHTML = '<span class="visually-hidden">Error: </span>' + esc(msg);
    group.before(err);
    group.classList.add('is-invalid');
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', err.id);
    el.focus();
    if (document.activeElement !== el && announcer) announcer.textContent = msg;
  }
  form.addEventListener('change', (e) => { const g = e.target.closest('.is-invalid'); if (g) clearError(g); });
  form.addEventListener('input', (e) => { if (e.target.matches('input[type="text"]')) { const g = e.target.closest('.is-invalid'); if (g) clearError(g); } });

  /* ---- "Nothing yet" is exclusive; routines are 1–3, in the order chosen ---- */
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'support') {
      const boxes = $$('input[name="support"]', form);
      if (t.value === 'none' && t.checked) boxes.forEach((b) => { if (b.value !== 'none') b.checked = false; });
      else if (t.value !== 'none' && t.checked) { const none = boxes.find((b) => b.value === 'none'); if (none) none.checked = false; }
    }
    if (t.name === 'routine' || t.name === 'routineFuture') {
      const i = routineOrder.indexOf(t.value);
      if (t.checked) {
        if ($$(`input[name="${t.name}"]:checked`, form).length > 3) {
          t.checked = false;
          toast('Three is the limit. Untick one to swap it.');
          updateRoutineCount();
          return;
        }
        if (i === -1) routineOrder.push(t.value);
      } else if (i !== -1) routineOrder.splice(i, 1);
      updateRoutineCount();
    }
    if (t.name === 'stage') syncRoutineSets();
    btnReset.hidden = !hasAnyAnswer();
  });
  form.addEventListener('input', () => { btnReset.hidden = !hasAnyAnswer(); });

  function updateRoutineCount() {
    const name = getAnswers().stage === 'future' ? 'routineFuture' : 'routine';
    const n = $$(`input[name="${name}"]:checked`, form).length;
    const el = $('#routine-count');
    if (el) el.textContent = n === 0 ? 'None chosen yet. Choose one to three.' : `${n} of 3 chosen${n === 1 ? '. One is a fine start.' : '.'}`;
  }
  function syncRoutineSets() {
    const future = getAnswers().stage === 'future';
    const child = $('#routines-child'), fut = $('#routines-future');
    if (child) child.hidden = future;
    if (fut) fut.hidden = !future;
    const h = $('#routine-heading');
    if (h) h.textContent = future ? 'What could you start now, before the child arrives?' : 'Where could the language fit into your week?';
    const help = $('#routine-help');
    if (help) help.textContent = future
      ? 'Choose one to three. The plan builds on them, in the order you choose.'
      : 'Choose one to three moments that already happen most days. The plan anchors the language to them, in the order you choose.';
    updateRoutineCount();
  }

  /* ---- Steps ---- */
  function showStep(n, { silent = false } = {}) {
    current = n;
    furthest = Math.max(furthest, n);
    steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === n));
    stepItems.forEach((li) => {
      const k = Number(li.dataset.step);
      li.classList.toggle('active', k === n);
      li.classList.toggle('done', k < n || (planModel && k < TOTAL));
      if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      const b = $('button', li);
      if (b) b.disabled = k === n || !(k <= furthest || (planModel && k <= TOTAL)) || (k === TOTAL && !planModel);
    });
    progressBar.style.width = Math.round(((n - 1) / QUESTIONS) * 100) + '%';
    if (progressBox) progressBox.setAttribute('aria-valuenow', String(n - 1));
    if (stepCount) stepCount.textContent = n === TOTAL ? 'Your plan' : `Step ${n} of ${QUESTIONS}`;
    btnBack.disabled = n === 1;
    btnBack.textContent = n === TOTAL ? 'Edit answers' : 'Back';
    btnNext.hidden = n === TOTAL;
    btnNext.textContent = n === QUESTIONS ? 'Create my plan' : 'Next';
    btnReset.hidden = !hasAnyAnswer();
    btnReset.textContent = planModel ? 'Start a new plan' : 'Start over';
    if (n === 5) syncRoutineSets();
    if (silent) return;
    const heading = n === TOTAL ? $('#plan-output h3') : $('h3', steps[n - 1]);
    const panelTop = form.getBoundingClientRect().top + window.scrollY - headerH() - 12;
    if (Math.abs(window.scrollY - panelTop) > 40) window.scrollTo({ top: panelTop, behavior: scrollBehavior() });
    after(() => focusEl(heading));
  }

  btnNext.addEventListener('click', () => {
    const problem = validate(current);
    if (problem) { showError(current, problem); return; }
    if (current === QUESTIONS) {
      planModel = buildModel(getAnswers());
      renderPlan(planModel);
      if (announcer) announcer.textContent = 'Your plan is ready.';
    }
    showStep(current + 1);
  });
  btnBack.addEventListener('click', () => { if (current > 1) showStep(current === TOTAL ? 1 : current - 1); });
  $$('#step-list button').forEach((b) => b.addEventListener('click', () => showStep(Number(b.closest('li').dataset.step))));
  btnReset.addEventListener('click', () => {
    if (!window.confirm(planModel ? 'Start a new plan? This clears your answers and the current plan.' : 'Clear all your answers?')) return;
    form.reset();
    routineOrder.length = 0;
    planModel = null;
    furthest = 1;
    output.innerHTML = '';
    clearAllErrors();
    showStep(1);
    toast('Cleared. Nothing was saved.');
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input[type="text"]') && !e.isComposing) { e.preventDefault(); btnNext.click(); }
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
  const WHY_SHORT = { relatives: 'Talking with relatives', identity: 'Identity and belonging', faith: 'Faith and community', future: 'Future opportunities', home: 'Our home language', love: 'Love of the language' };

  /* Who in the household can carry a routine, and at what level */
  function speakers(a) {
    const level = (v) => (v === 'fluent' ? 2 : v === 'some' ? 1 : 0);
    const you = level(a.me);
    const co = a.partner === 'na' ? -1 : level(a.partner);
    const best = Math.max(you, co);
    let who = 'you';
    if (you >= 1 && co >= 1) who = 'whichever of you is there';
    else if (co > you) who = 'your co-parent';
    return {
      you, co, best, who,
      household: best >= 1,
      learner: best < 1 && (a.me === 'learning' || a.partner === 'learning'),
      relativesNear: a.relatives === 'nearby', relativesFar: a.relatives === 'remote',
      caregiver: a.caregiver === 'yes', noCoParent: a.partner === 'na'
    };
  }

  /* Routines for families with a child. Each adapts to who can actually carry it. */
  const ROUTINES = {
    morning: {
      full: (L, s) => s.household
        ? `<strong>Mornings in ${L}, led by ${s.who}.</strong> From wake-up to shoes-on, narrate what is happening in ${L}: "socks, then shoes," "it's raining, we need the coat." The same words every day is the point.`
        : `<strong>Mornings with a ${L} soundtrack.</strong> Nobody at home is fluent yet, so let a ${L} playlist or children's radio run while you get ready, and use the handful of ${L} phrases you do have for the same moments every day ("shoes on," "let's go").`,
      short: (L, s) => s.household ? `Mornings in ${L}, led by ${s.who}` : `Mornings with a ${L} playlist and your few set phrases`
    },
    meals: {
      full: (L, s) => s.household
        ? `<strong>One meal a day in ${L}, with ${s.who}.</strong> Pick the meal that person is most likely to be at. Talk about the food, the day, the plan: real conversation, not vocabulary drills.`
        : `<strong>One meal a day with ${L} at the table.</strong> Name the foods in ${L}, use the phrases you know, and once a week put a relative on speaker or video for the meal so your child hears a fluent speaker talk about ordinary things.`,
      short: (L, s) => s.household ? `One meal a day in ${L}, with ${s.who}` : `One meal a day with ${L} words, plus a relative on the call weekly`
    },
    car: {
      full: (L, s) => s.household
        ? `<strong>The car or stroller is ${L} territory, with ${s.who}.</strong> No screens, one playlist of ${L} songs, and a running commentary on what you pass. Captive audience, zero prep.`
        : `<strong>The car or stroller is ${L} listening time.</strong> One playlist of ${L} songs and stories, and you join in on the choruses you know. Hearing the language regularly is the goal; perfect pronunciation from you is not.`,
      short: (L, s) => s.household ? `Car and stroller time in ${L}, with ${s.who}` : `Car and stroller time with ${L} songs and stories`
    },
    play: {
      full: (L, s) => s.household
        ? `<strong>Fifteen minutes of ${L} play with ${s.who}.</strong> Get on the floor and let your child lead; you supply the ${L} words for what they are already doing. Follow their interest, not a lesson plan.`
        : `<strong>Fifteen minutes of ${L} play.</strong> Pick one game or set of toys that lives in ${L}: you use the ${L} words you have for it, and nothing else. A small, repeated vocabulary beats a large, abandoned one.`,
      short: (L, s) => s.household ? `Fifteen minutes of ${L} play with ${s.who}` : `Fifteen minutes of play with one set of toys that lives in ${L}`
    },
    reading: {
      full: (L, s) => s.household
        ? `<strong>Bedtime books in ${L}, read by ${s.who}.</strong> Two books a night, the same favorites on repeat. Picture books with few words are perfect; describe the pictures together.`
        : `<strong>Bedtime books in ${L}.</strong> Picture books with few words, read at your level, or a recording of a relative reading that you play while you turn the pages together. Describing the pictures in the ${L} you have counts.`,
      short: (L, s) => s.household ? `Two ${L} books at bedtime, read by ${s.who}` : `Two ${L} picture books at bedtime, read or played`
    },
    bath: {
      full: (L, s) => s.household
        ? `<strong>Bath and bedtime belong to ${L}, with ${s.who}.</strong> Songs, body parts, "warm or cold?", the goodnight ritual. It is the calmest, most affectionate slot of the day: exactly where a language sticks.`
        : `<strong>Bath and bedtime songs in ${L}.</strong> Two songs and the goodnight phrase, every night, from you. You do not need fluency for a lullaby, and the warmth is what makes the words stick.`,
      short: (L, s) => s.household ? `Bath and bedtime in ${L}, with ${s.who}` : `Two ${L} songs and the goodnight phrase, every night`
    },
    cooking: {
      full: (L, s) => s.household
        ? `<strong>Cook one dish a week in ${L}, with ${s.who}.</strong> Ingredients, verbs, tasting, mess. Even better with a grandparent on a video call giving the instructions.`
        : `<strong>Cook one dish a week with a relative on video, in ${L}.</strong> Let the relative give the instructions; you and your child follow, repeat the words, and make the mess. Everyone learns something.`,
      short: (L, s) => s.household ? `Cook one dish a week in ${L}` : `Cook one dish a week with a relative on video, in ${L}`
    },
    calls: {
      full: (L, s) => `<strong>A standing ${L} video call${s.relativesFar ? ' with the relatives far away' : ''}.</strong> Same day, same time, with something to do together (a book to show, a toy to demonstrate, a song to sing) so it is not just "say hi."`,
      short: (L) => `A standing weekly ${L} video call, with something to do together`
    },
    weekend: {
      full: (L, s) => s.household
        ? `<strong>A weekend outing in ${L}.</strong> The market, the park, the library: ${s.who === 'your co-parent' ? 'your co-parent takes' : 'you take'} the child solo and stay in ${L} the whole time.`
        : (s.relativesNear
          ? `<strong>A weekend outing in ${L} with a relative.</strong> Grandparents or relatives take the child out, in ${L}, and you stay home. A regular solo outing with a fluent speaker is worth more than any app.`
          : `<strong>A weekend ${L} event.</strong> A community gathering, a story time, a playgroup, a service: somewhere your child hears ${L} from several people, with you alongside.`),
      short: (L, s) => s.household ? `A weekend outing in ${L}` : (s.relativesNear ? `A weekend outing in ${L} with a relative` : `A weekend ${L} event in the community`)
    },
    songs: {
      full: (L) => `<strong>Ten minutes of ${L} songs or stories a day, together.</strong> Sitting with your child while it plays, pointing and repeating, turns listening into interaction, and interaction with people is how young children learn language.`,
      short: (L) => `Ten minutes of ${L} songs or stories a day, together`
    }
  };

  /* Routines for people planning ahead: things to start before a child arrives */
  const ROUTINES_FUTURE = {
    self: { full: (L) => `<strong>Use ${L} yourself, weekly.</strong> A standing call with a relative, a conversation group, or a class. Comfort returns with use, and the habit will be there when the baby is.`, short: (L) => `Use ${L} yourself at least once a week` },
    phrases: { full: (L) => `<strong>Learn the twenty everyday phrases.</strong> Good morning, I love you, time to eat, let's go, all done, gently. Write them on the fridge in ${L}. These are the sentences a baby hears most.`, short: (L) => `Learn the twenty everyday ${L} phrases` },
    books: { full: (L) => `<strong>Start the ${L} shelf now.</strong> Board books, lullabies, a playlist. Ask relatives for the songs they sang. By the time the baby arrives, the materials exist and you know them.`, short: (L) => `Start a shelf of ${L} books and songs` },
    relatives: { full: (L) => `<strong>Ask the relatives, explicitly, for a role.</strong> "Will you be the ${L}-only grandparents?" is a real request, and roles are easier to agree on before the baby arrives than in the exhausted months after.`, short: (L) => `Ask relatives to take a ${L} role` },
    decide: { full: (L, s) => `<strong>Decide who speaks what, and when.</strong> ${s.noCoParent ? 'Write down' : 'With whoever will share the parenting, write down'} which language goes with which moments of the day, and what "being left out" of ${L} moments will feel like. Agree in advance; renegotiate later.`, short: (L) => `Write down who will speak ${L}, and when` },
    community: { full: (L) => `<strong>Find one ${L} community now.</strong> A playgroup, a heritage school, a congregation, a parents' group. Visit once before the baby, so it is a known place rather than a new project in the exhausted months.`, short: (L) => `Find one ${L} community before the baby comes` },
    media: { full: (L) => `<strong>Make ${L} part of your own media diet.</strong> A podcast, a show, music in the kitchen. Your child's first exposure to ${L} will be overhearing it from you.`, short: (L) => `Put ${L} into your own media diet` }
  };

  const STAGE = {
    future: {
      label: 'planning ahead',
      goal: (L) => `Before the child arrives, make ${L} a comfortable, everyday part of your own life again, and line up the people who will speak it to your child.`,
      revisit: 'Revisit when the baby arrives, and again at six months. Exhaustion rewrites every plan, and that is fine.',
      note: 'The most powerful thing you can do now is decide, out loud, what role each language will play and who will be its people. Parents who believe their own choices matter tend to act on them.'
    },
    baby: {
      label: 'with a baby or toddler',
      goal: (L) => `Make ${L} the language of warmth and routine: your child hears it every single day, from someone who loves them, in whole sentences.`,
      revisit: 'Revisit around the second birthday and before any childcare change, when the balance of languages usually shifts.',
      note: 'At this age, how much of a language a child hears is the strongest predictor of how many words they will know in it. You are building a foundation, so protect daily exposure over anything fancy.'
    },
    preschool: {
      label: 'with a preschooler',
      goal: (L) => `Keep ${L} alive as the community language takes off: protected daily routines, plus at least one new ${L} speaker in your child's week.`,
      revisit: 'Revisit at the start of each preschool or school year. Expect dips in output when the community language surges, and respond with more exposure rather than pressure.',
      note: 'Preschoolers often start answering in the community language. That is a normal two-language pattern (researchers call it "dilingual"), not failure; the child understands and is making a social choice. Repeat it back warmly in the language and keep going.'
    },
    school: {
      label: 'with a school-age child',
      goal: (L) => `Give ${L} a real job in your child's life, a relationship, a skill, or a community, so it competes with school and friends on purpose rather than by default.`,
      revisit: 'Revisit each term and after big social changes (a new school, a new best friend). Ask your child what they want; they are a stakeholder now.',
      note: 'School-age children can learn a great deal quickly. Reading in the language, a weekend program, or a meaningful role (translating for a grandparent, texting a cousin) often matters more than parent-led drills.'
    },
    teen: {
      label: 'with a tween or teen',
      goal: (L) => `Shift from "making" your teen use ${L} to giving them reasons to want it: identity, people, media, and travel they actually care about.`,
      revisit: 'Revisit together, as partners, a couple of times a year. Their reasons for wanting (or not wanting) the language will change fast; let the plan change with them.',
      note: 'Teens negotiate family language policy openly, and that is appropriate. Media in the language, friendships, a trip, or a heritage class with peers can do what parental insistence cannot. It is not too late; many people deepen a heritage language in adolescence and adulthood.'
    },
    mixed: {
      label: 'with children of different ages',
      goal: (L) => `Protect a few shared ${L} moments that include every child, then give each child one thing in ${L} that is theirs alone (a bedtime book, a call, a class, a show).`,
      revisit: 'Revisit each term. Older children often drift toward the community language first and pull younger siblings with them, so watch what the children speak to each other.',
      note: 'Watch what the children speak to each other, because that quickly becomes the house default. Shared routines in the language, and an older child given a real role (reading to the little one, leading the call with grandparents), do more than separate rules for each child.'
    }
  };

  const GOAL = {
    conversation: {
      label: 'conversation with relatives',
      input: (L, a) => a.relatives === 'none'
        ? `Your goal is conversation, but relatives who speak ${L} are not really in the picture. Find a substitute "relative": a community elder, a family friend, a regular babysitter, someone who will talk <em>with</em> your child in ${L}, not just at them.`
        : `Give the relatives a job. Instead of "say hi to Grandma," set up a shared activity for calls or visits (a book they both hold, a game, cooking instructions) so the conversation has something to be about. Fluent speakers add something to a child's skill that a parent with limited fluency cannot, so let them lead.`
    },
    understanding: {
      label: 'understanding first',
      input: (L, a) => `Understanding grows from hearing a lot of ${L} in whole, meaningful sentences. Narrate, read aloud, sing, and do not require answers in ${L}. If your child replies in ${a.langCommunity ? esc(cap(a.langCommunity)) : 'the community language'}, repeat it back once in ${L} and carry on; the comprehension is real even when the speaking lags.`
    },
    literacy: {
      label: 'reading and writing',
      input: (L, a) => `Build a shelf of ${L} books and a reading ritual in ${L} first; print and letters make sense once the spoken language is familiar. ${a.support.includes('school') ? 'Your heritage or bilingual program is the backbone here; ask the teacher what to read at home.' : 'A weekend or heritage school, or someone who reads with your child, is worth looking into; literacy is hard to carry alone.'}`
    },
    culture: {
      label: 'cultural connection',
      input: () => `Let the culture carry the language: songs for holidays, the stories your family tells, recipes, celebrations, the names of things that have no good translation. Make it about people and traditions, not grammar.`
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
  /* Interaction ideas for people planning ahead, by goal */
  const FUTURE_INTERACTION = {
    conversation: (L) => `Start the relationship before the child: have the relatives who speak ${L} tell you the songs, the nicknames, and the phrases they want to use with the baby. Those become the first words your child hears from them.`,
    understanding: (L) => `Make ${L} something the baby will overhear from day one: your own calls, your music, your conversations with whoever speaks it. Understanding grows from hearing a lot of it, in whole sentences, from people who matter.`,
    literacy: (L) => `Collect the books now, and practice reading them aloud. Reading in ${L} will be easier for you with twenty board books you know by heart than with a shelf you have never opened.`,
    culture: (L) => `Write down the traditions you want to carry: the holiday songs, the dishes, the stories your family tells. Decide which ones will happen in ${L} no matter what. Culture gives a language a reason.`,
    school: (L) => `Find out what programs exist where you live and what they expect at entry. Then work backwards: comfortable spoken ${L} at home matters more than letters.`,
    options: (L) => `Keep it light: ${L} in your own life, a few people who speak it, a shelf of books. You are keeping a door open, not building a curriculum.`
  };

  function pickWiden(a, s, L, C, usedCalls) {
    const C2 = C || 'the community language';
    const options = [];
    if (s.relativesFar && !usedCalls) options.push({ short: 'The relatives far away, on a scheduled call', full: `Make video calls with the relatives who speak ${L} a <em>scheduled routine</em>, not an occasional event, and give them something to do together on the call: a book to hold up, a song, cooking instructions. A new voice adds something that extra hours from the same voice do not.` });
    if (s.relativesNear) options.push({ short: `The relatives nearby, asked to stay in ${L}`, full: `Ask the relatives nearby, explicitly, to stay in ${L} with your child even when the child answers in ${C2}. A regular solo outing with a grandparent is worth more than any app.` });
    if (s.caregiver) options.push({ short: `The caregiver, asked to use ${L} consistently`, full: `Ask the caregiver who speaks ${L} to use it with your child consistently. A different speaker is worth more than extra hours from the same one.` });
    if (a.support.includes('playgroup')) options.push({ short: `One other family that speaks ${L}, as a standing date`, full: `Turn the families who speak ${L} into a standing date: same park, same day, every other week. Hearing ${L} from other children is a different kind of input than hearing it from you.` });
    if (a.support.includes('school')) options.push({ short: `One classmate's family from the ${L} program`, full: `Ask the heritage or bilingual program how to reinforce at home, and invite one classmate's family over. Ties between home and program make both stronger.` });
    if (a.support.includes('faithcomm')) options.push({ short: `One recurring ${L} event in your community`, full: `Pick one recurring event in your religious or cultural community and make it your child's ${L} event: same faces, same time, real conversation.` });
    if (s.relativesFar && usedCalls) options.push({ short: `A second ${L} voice, beyond the weekly call`, full: `The weekly call is already in your routines, so the next person should be someone local: a babysitter who speaks ${L}, a playgroup, or a family friend. Children's skill in a language tracks how many different people they hear it from, not only how often.` });
    options.push({ short: `One new ${L} voice this month`, full: `Find <em>one</em> new voice this month: a playgroup, a babysitter, a weekend class, a family that speaks ${L}, or a relative on a weekly call. Children's skill in a language tracks how much of it they hear and from how many people.` });
    return options[0];
  }

  function householdNote(a, s, L, C) {
    const C2 = C || 'the community language';
    if (s.noCoParent) {
      if (s.best >= 2) return `You are doing this without a co-parent, and you are fluent in ${L}. That is a strong position: your routines carry the language, and the people you add (relatives, a caregiver, a community) carry the rest. Protect your own rest too; one tired adult cannot be every voice.`;
      if (s.best === 1) return `You are doing this without a co-parent, with conversational ${L}. You can carry routines, songs, and warmth. Because children also benefit from fluent speakers and from a range of people, the plan asks you to bring others in rather than carry it alone.`;
      return `You are doing this without a co-parent and you are ${a.me === 'learning' ? 'still learning' : 'not yet speaking'} ${L}. That is a real constraint, not a disqualification: the plan leans on relatives, community, and recordings while you learn alongside your child. Songs, counting, and set phrases are a fine place to start.`;
    }
    if (!s.household && !s.learner) return `Nobody at home speaks ${L} yet. That is a real constraint, not a disqualification: the plan leans on relatives, community, and recordings while you both learn alongside your child, and every routine above is written for a household without a fluent speaker.`;
    if (!s.household && s.learner) return `Nobody at home is conversational in ${L} yet, but one of you is learning. You can be a source of ${L} for routines, songs, and warmth at your level. Because children also benefit from fluent speakers and from a range of people, the plan brings others in rather than asking you to carry it alone.`;
    if (s.you === 2 && s.co === 2) return `Both of you are fluent in ${L}. Research on nearly 1,900 bilingual families found that homes where both parents used the heritage (minority) language, with at most one also using the community language, had the best odds of children actually speaking it. Consider making ${L} the default at home and letting the community supply ${C2}.`;
    if (s.best === 2 && Math.min(s.you, s.co) === 0) {
      const other = s.you === 0 ? a.me : a.partner;
      return `One fluent parent, one who ${other === 'learning' ? 'is learning' : 'does not speak it'}: one of the most common setups, and it works when the fluent parent keeps ${L} going even with the other parent in the room, and the other parent is genuinely okay with occasionally being left out. Talk about that explicitly; it prevents resentment later.`;
    }
    return `One stronger speaker at home and a second adult with some ${L}: let the stronger speaker anchor the daily routines and let the second adult join in at their level. Participation matters more than perfection.`;
  }

  function checkin(stage) {
    const weeks = stage === 'future' ? 12 : 8;
    const d = new Date(); d.setDate(d.getDate() + weeks * 7);
    return { weeks, text: d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) };
  }

  function buildModel(a) {
    const L = esc(cap(a.langTarget));
    const C = a.langCommunity ? esc(cap(a.langCommunity)) : '';
    const s = speakers(a);
    const stage = STAGE[a.stage] || STAGE.baby;
    const goal = GOAL[a.goal] || GOAL.options;
    const future = a.stage === 'future';
    const lib = future ? ROUTINES_FUTURE : ROUTINES;
    const whys = a.why.map((w) => WHY_TEXT[w]).filter(Boolean);
    const whySentence = whys.length
      ? `${L} matters to us ${whys.slice(0, 2).join(', and ')}${whys.length > 2 ? ', among other reasons' : ''}.`
      : `${L} matters to us.`;
    const routines = a.routine.filter((k) => lib[k]).slice(0, 3).map((k) => ({ key: k, full: lib[k].full(L, s), short: lib[k].short(L, s) }));
    const usedCalls = routines.some((r) => r.key === 'calls');
    const levelWord = { fluent: 'fluent', some: 'conversational', learning: 'learning', none: 'not yet' };
    const speakerBits = [`You: ${levelWord[a.me] || ''}`];
    if (a.partner && a.partner !== 'na') speakerBits.push(`Co-parent: ${a.partner === 'none' ? `does not speak ${L}` : levelWord[a.partner]}`);
    if (a.partner === 'na') speakerBits.push('No co-parent');
    if (a.relatives !== 'none') speakerBits.push(`Relatives: ${a.relatives === 'nearby' ? 'nearby' : 'far away (calls)'}`);
    if (a.caregiver === 'yes') speakerBits.push('Caregiver: speaks it');
    const supportLabels = { school: 'heritage/bilingual program', playgroup: 'playgroup or families', faithcomm: 'religious/cultural community', books: 'books and music', media: 'shows, podcasts, apps', travel: 'visits', none: 'nothing yet' };
    const supports = a.support.map((k) => supportLabels[k]).filter(Boolean);
    return {
      a, s, L, C, stage, goal, future, whySentence, routines,
      whyShort: a.why.map((w) => WHY_SHORT[w]).filter(Boolean),
      speakers: speakerBits, supports,
      interaction: future ? FUTURE_INTERACTION[a.goal || 'options'](L) : goal.input(L, a),
      household: householdNote(a, s, L, C),
      widen: pickWiden(a, s, L, C, usedCalls),
      date: checkin(a.stage)
    };
  }

  function renderPlan(m) {
    const n = m.routines.length;
    const openFull = window.innerWidth >= 960 ? ' open' : '';
    output.innerHTML = `
      <div class="plan-head">
        <p class="eyebrow">Your starting plan</p>
        <h3>${m.L} in our family</h3>
        <p class="sub">For a family ${esc(m.stage.label)}, focused on ${esc(m.goal.label)}. A place to start, not a verdict.</p>
      </div>

      <div class="plan-summary" aria-label="Plan summary">
        <div class="ps"><b>Our reason</b><p>${m.whySentence}</p></div>
        <div class="ps"><b>${m.future ? 'First thing to start' : 'First routine'}</b><p>${m.routines[0] ? m.routines[0].short : ''}.</p></div>
        <div class="ps"><b>Next person to involve</b><p>${m.widen.short}.</p></div>
        <div class="ps"><b>Check-in</b><p><span class="date">${esc(m.date.text)}</span><br><span class="muted">about ${m.date.weeks} weeks from today</span></p></div>
      </div>

      <div class="plan-actions">
        <button type="button" class="btn btn-accent" id="btn-print">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/></svg>
          Print / save PDF</button>
        <button type="button" class="btn btn-secondary" id="btn-download">Download as text</button>
        <button type="button" class="btn btn-ghost" id="btn-edit">Edit answers</button>
      </div>

      <details class="plan-full"${openFull}>
        <summary>The full plan</summary>
        <ol class="plan-blocks">
          <li class="plan-block">
            <h4><span class="badge" style="background:var(--gold-deep)">1</span> One realistic goal for the next few months</h4>
            <p>${m.stage.goal(m.L)}</p>
          </li>
          <li class="plan-block">
            <h4><span class="badge" style="background:var(--sage)">2</span> ${n === 1 ? (m.future ? 'One thing to start' : 'One protected routine') : n + (m.future ? ' things to start' : ' protected routines')}</h4>
            <ul>${m.routines.map((r) => `<li>${r.full}</li>`).join('')}</ul>
            ${n === 1 ? '<p class="muted">One is a fine start. Add a second only when the first feels automatic.</p>' : ''}
          </li>
          <li class="plan-block">
            <h4><span class="badge" style="background:var(--terracotta-text)">3</span> One meaningful-interaction idea</h4>
            <p>${m.interaction}</p>
            <p class="good"><strong>About your setup:</strong> ${m.household}</p>
          </li>
          <li class="plan-block">
            <h4><span class="badge" style="background:var(--plum)">4</span> Next person to involve</h4>
            <p>${m.widen.full}</p>
          </li>
          <li class="plan-block plan-date">
            <h4><span class="badge" style="background:var(--gold-deep)">5</span> Our next check-in</h4>
            <p><span class="date">${esc(m.date.text)}</span><br><span class="muted">About ${m.date.weeks} weeks from today.</span> ${m.stage.revisit}</p>
          </li>
          <li class="plan-block">
            <h4><span class="badge" style="background:var(--sage)">6</span> This is a plan, not a test</h4>
            <p>${m.stage.note}</p>
            <p>Children help write the policy too. When something stops working, that is information, not failure: adjust the plan and carry on without guilt.</p>
          </li>
        </ol>
        <div class="plan-three" aria-label="Your plan in the three parts of a family language policy">
          <div class="mini c-gold"><b>What you value</b>${m.whyShort.map(esc).join(' · ') || 'Why this language matters to us'}</div>
          <div class="mini c-sage"><b>What you do today</b>${m.speakers.map(esc).join(' · ')}${m.supports.length ? `<br><span class="muted">Support: ${m.supports.map(esc).join(', ')}</span>` : ''}</div>
          <div class="mini c-terra"><b>What you set up</b>${n} ${m.future ? 'starting point' : 'routine'}${n === 1 ? '' : 's'}, one person to involve, one check-in date.</div>
        </div>
        <p class="plan-note">Based on the research under <a href="#sources">Research &amp; References</a> (De Houwer, 2007, 2009, 2015; Hoff et al., 2012; Place &amp; Hoff, 2011; King et al., 2008; Byers-Heinlein, 2013; Ortega, 2013; Gass et al., 2020). Educational guidance, not individualized advice. Your answers stay in this tab.</p>
      </details>
    `;
    $('#btn-print').addEventListener('click', () => printPlan(m));
    $('#btn-download').addEventListener('click', () => downloadPlan(m));
    $('#btn-edit').addEventListener('click', () => showStep(1));
    $('#plan-output h3').setAttribute('tabindex', '-1');
    $$('a[href^="#"]', output).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goToSection(a.getAttribute('href')); }));
  }

  const strip = (html) => String(html).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  function printPlan(m) {
    const root = $('#print-root');
    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    root.innerHTML = `
      <div class="print-sheet">
        <h1>${m.L} in our family: a starting language plan</h1>
        <div class="pmeta">Created ${today} · Every Family Has a Language Plan · a LING 2050 project, Georgetown University</div>
        <div class="pgrid">
          <div class="pbox"><b>Our reason</b>${m.whySentence}</div>
          <div class="pbox"><b>${m.future ? 'First thing to start' : 'First routine'}</b>${m.routines[0] ? m.routines[0].short : ''}.</div>
          <div class="pbox"><b>Next person to involve</b>${m.widen.short}.</div>
          <div class="pbox"><b>Check-in</b>${esc(m.date.text)}</div>
        </div>
        <h2>${m.future ? 'What we will start' : 'Our routines'}</h2>
        <ul>${m.routines.map((r) => `<li>${r.full}</li>`).join('')}</ul>
        <h2>Keeping it meaningful</h2><p>${m.interaction}</p>
        <h2>Next person to involve</h2><p>${m.widen.full}</p>
        <h2>At our check-in, ${esc(m.date.text)}</h2>
        <p class="pline">What we noticed our child responds to: <span class="lines"></span></p>
        <p class="pline">One thing we will change: <span class="lines"></span></p>
        <div class="pfoot">A plan, not a test. Based on published research (De Houwer, 2007, 2009, 2015; Hoff et al., 2012; Place &amp; Hoff, 2011; King, Fogle &amp; Logan-Terry, 2008; Byers-Heinlein, 2013; Ortega, 2013; Gass, Behney &amp; Plonsky, 2020); not individualized medical, speech-language, or developmental advice. Generated in your browser; nothing was stored or sent.</div>
      </div>`;
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('printing-plan');
    let cleaned = false;
    const mq = window.matchMedia('print');
    const cleanup = () => {
      if (cleaned) return; cleaned = true;
      document.body.classList.remove('printing-plan');
      root.setAttribute('aria-hidden', 'true');
      window.removeEventListener('afterprint', cleanup);
      mq.removeEventListener('change', onMq);
    };
    const onMq = (ev) => { if (!ev.matches) cleanup(); };
    window.addEventListener('afterprint', cleanup);
    mq.addEventListener('change', onMq);
    window.print();
    setTimeout(cleanup, 4000); // last-resort fallback for browsers that fire neither event
  }

  function downloadPlan(m) {
    const lines = [];
    lines.push(`${strip(m.L)} in our family: a starting language plan`);
    lines.push('Every Family Has a Language Plan · generated in your browser, nothing stored or sent');
    lines.push('');
    lines.push('OUR REASON: ' + strip(m.whySentence));
    lines.push((m.future ? 'FIRST THING TO START: ' : 'FIRST ROUTINE: ') + strip(m.routines[0] ? m.routines[0].short : '') + '.');
    lines.push('NEXT PERSON TO INVOLVE: ' + strip(m.widen.short) + '.');
    lines.push(`CHECK-IN: ${m.date.text} (about ${m.date.weeks} weeks from today)`);
    lines.push('');
    lines.push(m.future ? 'WHAT WE WILL START' : 'OUR ROUTINES'); m.routines.forEach((r) => lines.push('  - ' + strip(r.full))); lines.push('');
    lines.push('KEEPING IT MEANINGFUL'); lines.push('  ' + strip(m.interaction)); lines.push('  About our setup: ' + strip(m.household)); lines.push('');
    lines.push('NEXT PERSON TO INVOLVE'); lines.push('  ' + strip(m.widen.full)); lines.push('');
    lines.push('OUR GOAL FOR THE NEXT FEW MONTHS'); lines.push('  ' + strip(m.stage.goal(m.L))); lines.push('');
    lines.push('AT THE CHECK-IN'); lines.push('  ' + strip(m.stage.revisit)); lines.push('  What we noticed our child responds to: __________'); lines.push('  One thing we will change: __________'); lines.push('');
    lines.push('A plan, not a test. ' + strip(m.stage.note)); lines.push('');
    lines.push('Sources: De Houwer (2007, 2009, 2015); Hoff et al. (2012); Place & Hoff (2011); King, Fogle & Logan-Terry (2008); Byers-Heinlein (2013); Ortega (2013); Gass, Behney & Plonsky (2020). Educational guidance, not individualized advice.');
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement('a');
    aEl.href = url;
    const safe = strip(m.L).replace(/[\\/:*?"<>|]+/g, '').trim();
    aEl.download = `${safe || 'Family'} language plan.txt`;
    document.body.appendChild(aEl);
    aEl.click();
    aEl.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Plan downloaded as a text file.');
  }

  /* Initialize without moving the page: scrolling and focus are reserved for deliberate builder navigation */
  showStep(1, { silent: true });
})();
