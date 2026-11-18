"use strict";
// Assignment 4 — Askar Alibek. Pure JavaScript (no jQuery).
document.addEventListener('DOMContentLoaded', () => {
  // Task 5: live date and time using the Date object.
  const clock = document.getElementById('a4-clock');
  function updateClock() {
    if (clock) clock.textContent = new Date().toLocaleString('en-US', {
      year:'numeric', month:'long', day:'numeric', hour:'numeric', minute:'2-digit', second:'2-digit'
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Task 4: cycle background colors using JavaScript.
  const backgrounds = ['', 'a4-bg-1', 'a4-bg-2', 'a4-bg-3'];
  let backgroundIndex = 0;
  document.getElementById('a4-color-button')?.addEventListener('click', () => {
    document.body.classList.remove(...backgrounds.filter(Boolean));
    backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
    if (backgrounds[backgroundIndex]) document.body.classList.add(backgrounds[backgroundIndex]);
  });

  // Task 2: accordion with hidden answers, keyboard-accessible buttons.
  document.querySelectorAll('.a4-faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      answer.classList.toggle('is-open', !open);
      answer.setAttribute('aria-hidden', String(open));
    });
  });

  // Task 3: popup opens by button and closes via X, backdrop, or Escape.
  const overlay = document.getElementById('a4-overlay');
  const openPopup = document.getElementById('a4-open-popup');
  const closePopup = document.getElementById('a4-close-popup');
  let previousFocus = null;
  function closeDialog() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    previousFocus?.focus();
  }
  openPopup?.addEventListener('click', () => {
    previousFocus = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closePopup.focus();
  });
  closePopup?.addEventListener('click', closeDialog);
  overlay?.addEventListener('click', event => { if (event.target === overlay) closeDialog(); });
  document.addEventListener('keydown', event => {
    if (!overlay || overlay.hidden) return;
    if (event.key === 'Escape') closeDialog();
    if (event.key === 'Tab') {
      const focusable = [...overlay.querySelectorAll('button:not([disabled]),input:not([disabled])')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  // Task 1: reusable JavaScript validation, error messages and success status.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function validate(form, rules) {
    let valid = true;
    for (const [name, rule] of Object.entries(rules)) {
      const input = form.elements.namedItem(name);
      const error = form.querySelector(`[data-error-for="${name}"]`);
      if (!input) continue;
      const value = input.value.trim();
      const message = rule(value, form);
      input.classList.toggle('a4-invalid', Boolean(message));
      input.setAttribute('aria-invalid', String(Boolean(message)));
      if (error) error.textContent = message;
      if (message) valid = false;
    }
    return valid;
  }
  const required = label => value => value ? '' : `${label} is required.`;
  const emailRule = value => !value ? 'Email is required.' : !emailPattern.test(value) ? 'Enter a valid email address.' : '';
  const contactForm = document.getElementById('a4-contact-form');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    const ok = validate(contactForm, {
      name: required('Name'), email: emailRule, phone: value => /^\+?[\d\s()-]+$/.test(value) && /^\d{10,15}$/.test(value.replace(/\D/g, '')) ? '' : 'Enter a valid phone number (10–15 digits).', message: required('Message')
    });
    const status = document.getElementById('a4-contact-status');
    status.textContent = ok ? 'Your message passed validation! This is a demo; no message was sent.' : 'Please correct the highlighted fields.';
    status.className = ok ? 'a4-success' : 'a4-error';
    if (ok) contactForm.reset();
  });
  const signupForm = document.getElementById('a4-signup-form');
  signupForm?.addEventListener('submit', event => {
    event.preventDefault();
    const ok = validate(signupForm, {
      fullname: required('Name'),
      email: emailRule,
      password: value => !value ? 'Password is required.' : value.length < 8 ? 'Password must have at least 8 characters.' : '',
      confirmPassword: (value, form) => !value ? 'Please confirm your password.' : value !== form.elements.namedItem('password').value ? 'Passwords do not match.' : ''
    });
    const status = document.getElementById('a4-signup-status');
    status.textContent = ok ? 'Validation successful! Demo only: no account was created.' : 'Please fix the form errors.';
    status.className = ok ? 'a4-success' : 'a4-error';
    if (ok) signupForm.reset();
  });
  const subscribeForm = document.getElementById('a4-subscribe-form');
  subscribeForm?.addEventListener('submit', event => {
    event.preventDefault();
    const ok = validate(subscribeForm, { email: emailRule });
    const status = document.getElementById('a4-subscribe-status');
    status.textContent = ok ? 'Thanks! Demo only: no email was subscribed.' : 'Please enter a valid email.';
    status.className = ok ? 'a4-success' : 'a4-error';
    if (ok) subscribeForm.reset();
  });
});


// Assignment 5 — Askar Alibek. Advanced JavaScript, DOM and event handling.
document.addEventListener('DOMContentLoaded', () => {
  // Objects with methods, arrays, loops and higher-order functions.
  const species = Array.from(document.querySelectorAll('.dinosaur-cards article.card')).map(card => ({
    element: card,
    name: card.querySelector('h3').textContent.trim(),
    diet: card.dataset.diet,
    searchText: card.dataset.search,
    matches(query, diet) { return this.searchText.includes(query) && (diet === 'all' || this.diet === diet); }
  }));

  // Theme persists across all six pages; localStorage is optional in restricted browsers.
  const themeButton = document.querySelector('.a5-theme-button');
  const readTheme = () => { try { return localStorage.getItem('dinoworld-theme'); } catch { return null; } };
  const saveTheme = value => { try { localStorage.setItem('dinoworld-theme', value); } catch { /* unavailable */ } };
  function applyTheme(isDark) {
    document.body.classList.toggle('a5-dark', isDark);
    if (themeButton) {
      themeButton.textContent = isDark ? '☀️ Day mode' : '🌙 Night mode';
      themeButton.setAttribute('aria-pressed', String(isDark));
    }
    saveTheme(isDark ? 'dark' : 'light');
  }
  applyTheme(readTheme() === 'dark');
  // Small UI click sound for the Day/Night button (Web Audio API).
  // It is separate from the dinosaur WAV sound, which remains unchanged.
  let clickAudioContext;
  function playThemeClick() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      clickAudioContext ||= new AudioContextClass();
      if (clickAudioContext.state === 'suspended') clickAudioContext.resume();
      const oscillator = clickAudioContext.createOscillator();
      const gain = clickAudioContext.createGain();
      const start = clickAudioContext.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(650, start);
      oscillator.frequency.exponentialRampToValueAtTime(420, start + 0.085);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
      oscillator.connect(gain);
      gain.connect(clickAudioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.12);
    } catch (error) {
      console.warn('Theme click sound unavailable:', error);
    }
  }
  themeButton?.addEventListener('click', () => {
    playThemeClick();
    applyTheme(!document.body.classList.contains('a5-dark'));
  });

  // Keyboard navigation: focus next/previous navigation link using arrow keys.
  const nav = document.querySelector('.navbar-nav');
  nav?.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const links = Array.from(nav.querySelectorAll('a.nav-link'));
    const current = links.indexOf(document.activeElement);
    if (current === -1) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    links[(current + direction + links.length) % links.length].focus();
  });

  // Filter logic uses switch, filter, and forEach.
  const search = document.getElementById('a5-search');
  const filterButtons = Array.from(document.querySelectorAll('.a5-filter'));
  let currentDiet = 'all';
  function normalizeDiet(value) {
    switch (value) {
      case 'carnivore': return 'carnivore';
      case 'herbivore': return 'herbivore';
      default: return 'all';
    }
  }
  function updateSpecies() {
    const query = (search?.value || '').trim().toLowerCase();
    const matching = species.filter(item => item.matches(query, currentDiet));
    species.forEach(item => { item.element.hidden = !matching.includes(item); });
    const count = document.getElementById('a5-result-count');
    if (count) count.textContent = `Showing ${matching.length} of ${species.length} species`;
    const empty = document.getElementById('a5-no-results');
    if (empty) empty.hidden = matching.length > 0;
  }
  search?.addEventListener('input', updateSpecies);
  filterButtons.forEach(button => button.addEventListener('click', () => {
    currentDiet = normalizeDiet(button.dataset.filter);
    filterButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    updateSpecies();
  }));
  updateSpecies();

  // Read More manipulates the hidden attribute and textContent.
  document.querySelectorAll('.a5-read-more').forEach(button => button.addEventListener('click', () => {
    const extra = button.parentElement.querySelector('.a5-extra');
    extra.hidden = !extra.hidden;
    button.textContent = extra.hidden ? 'Read more +' : 'Read less −';
    button.setAttribute('aria-expanded', String(!extra.hidden));
    const card = button.closest('.card');
    card.classList.remove('a5-card-pop');
    void card.offsetWidth; // restart the animation
    card.classList.add('a5-card-pop');
  }));

  // Local WAV sound: a short fictional museum effect, not a real dinosaur recording.
  const audio = new Audio('sounds/dino-chirp.wav');
  audio.preload = 'auto';
  audio.volume = 1;
  document.querySelectorAll('.a5-sound').forEach(button => button.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(error => { console.error('Dinosaur sound playback failed:', error); button.textContent = 'Sound unavailable'; });
    button.closest('.card')?.classList.add('a5-card-pop');
  }));

  // Multi-step form: callbacks are passed to addEventListener; fields retain state.
  const wizard = document.getElementById('a5-wizard-form');
  if (wizard) {
    const steps = Array.from(wizard.querySelectorAll('.a5-step'));
    const next = document.getElementById('a5-next');
    const back = document.getElementById('a5-back');
    const status = document.getElementById('a5-wizard-status');
    let index = 0;
    function showStep(nextIndex) {
      index = nextIndex;
      steps.forEach((step, i) => { step.hidden = i !== index; });
      back.hidden = index === 0;
      next.textContent = index === steps.length - 1 ? 'Finish ✓' : 'Next →';
      if (index === 2) {
        const name = document.getElementById('a5-visitor').value.trim();
        const interest = document.getElementById('a5-interest').value;
        document.getElementById('a5-summary').textContent = `${name}, your interest is ${interest}. This is a demo visit plan.`;
      }
    }
    next.addEventListener('click', () => {
      if (index === steps.length - 1) {
        status.textContent = 'Your demo visit plan is complete. No information was submitted.';
        return;
      }
      const field = steps[index].querySelector('input,select');
      const error = steps[index].querySelector('.a5-step-error');
      if (!field.value.trim()) { error.textContent = 'Please complete this field before continuing.'; field.focus(); return; }
      error.textContent = '';
      status.textContent = '';
      showStep(index + 1);
    });
    back.addEventListener('click', () => { status.textContent = ''; showStep(Math.max(0, index - 1)); });
    showStep(0);
  }
});
