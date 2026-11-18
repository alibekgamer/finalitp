'use strict';
// DinoWorld Final Project — Askar Alibek. Client-side demonstration only.
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_USER = 'dinoworld-demo-user-v1';
  const STORAGE_SESSION = 'dinoworld-demo-session-v1';
  const emailValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const phoneValid = value => /^\+?[\d\s()-]+$/.test(value) && /^\d{10,15}$/.test(value.replace(/\D/g, ''));
  const passwordValid = value => value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
  const getUser = () => { try { return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null'); } catch { return null; } };
  const getSession = () => { try { return sessionStorage.getItem(STORAGE_SESSION); } catch { return null; } };
  const showErrors = (form, errors) => {
    form.querySelectorAll('[data-error]').forEach(el => { el.textContent = errors[el.dataset.error] || ''; });
    form.querySelectorAll('input').forEach(input => input.setAttribute('aria-invalid', String(Boolean(errors[input.name]))));
    return Object.keys(errors).length === 0;
  };
  const status = (form, message, success) => {
    const el = form.querySelector('.final-status');
    if (el) { el.textContent = message; el.className = `final-status ${success ? 'a4-success' : 'a4-error'}`; }
  };
  const signup = document.getElementById('final-signup');
  signup?.addEventListener('submit', event => {
    event.preventDefault();
    const f = new FormData(signup);
    const name = String(f.get('name') || '').trim();
    const email = String(f.get('email') || '').trim().toLowerCase();
    const phone = String(f.get('phone') || '').trim();
    const password = String(f.get('password') || '');
    const confirm = String(f.get('confirm') || '');
    const errors = {};
    if (name.length < 2) errors.name = 'Enter your full name (at least 2 characters).';
    if (!emailValid(email)) errors.email = 'Enter a valid email address.';
    if (!phoneValid(phone)) errors.phone = 'Enter a valid phone number (10–15 digits).';
    if (!passwordValid(password)) errors.password = 'Use 8+ characters, uppercase, lowercase, number and symbol.';
    if (confirm !== password || !confirm) errors.confirm = 'Passwords must match.';
    if (!showErrors(signup, errors)) return status(signup, 'Please correct the highlighted fields.', false);
    try {
      localStorage.setItem(STORAGE_USER, JSON.stringify({ name, email, phone, password }));
      sessionStorage.setItem(STORAGE_SESSION, email);
      status(signup, 'Account created. Opening your profile...', true);
      window.location.assign('profile.html');
    } catch { status(signup, 'Browser storage is unavailable. Enable storage and try again.', false); }
  });
  const login = document.getElementById('final-login');
  login?.addEventListener('submit', event => {
    event.preventDefault();
    const f = new FormData(login);
    const email = String(f.get('email') || '').trim().toLowerCase();
    const password = String(f.get('password') || '');
    const errors = {};
    if (!emailValid(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Enter your password.';
    if (!showErrors(login, errors)) return status(login, 'Please correct the highlighted fields.', false);
    const user = getUser();
    if (!user || user.email !== email || user.password !== password) return status(login, 'Email or password is incorrect. Create an account first.', false);
    try { sessionStorage.setItem(STORAGE_SESSION, email); window.location.assign('profile.html'); }
    catch { status(login, 'Session storage is unavailable.', false); }
  });
  const profile = document.getElementById('final-profile');
  if (profile) {
    const user = getUser();
    if (!user || getSession() !== user.email) {
      profile.innerHTML = '<h2>Sign in to continue</h2><p>Your profile is available after logging in.</p><a class="btn btn-success dino-btn" href="account.html">Log In / Sign Up →</a>';
    } else {
      const heading = document.createElement('h2'); heading.textContent = `Welcome, ${user.name}!`;
      const email = document.createElement('p'); email.textContent = `Email: ${user.email}`;
      const phone = document.createElement('p'); phone.textContent = `Phone: ${user.phone}`;
      const note = document.createElement('p'); note.textContent = 'Your details are stored only in this browser for this coursework demonstration.';
      const logout = document.createElement('button'); logout.type = 'button'; logout.className = 'btn btn-success dino-btn'; logout.textContent = 'Log out';
      logout.addEventListener('click', () => { sessionStorage.removeItem(STORAGE_SESSION); window.location.assign('account.html'); });
      const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'btn btn-outline-danger ms-2'; clear.textContent = 'Delete demo account';
      clear.addEventListener('click', () => { localStorage.removeItem(STORAGE_USER); sessionStorage.removeItem(STORAGE_SESSION); window.location.assign('account.html'); });
      profile.replaceChildren(heading, email, phone, note, logout, clear);
    }
  }
  // GBIF is an external public biodiversity API, distinct from the offline mini-game.
  const apiForm = document.getElementById('final-api-form');
  apiForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const result = document.getElementById('final-api-result');
    const button = apiForm.querySelector('button');
    const species = apiForm.elements.namedItem('species').value;
    result.textContent = `Loading live data for ${species}...`;
    button.disabled = true;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      let response;
      try { response = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(species)}&kingdom=Animalia`, { signal: controller.signal }); }
      finally { clearTimeout(timeout); }
      if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
      const data = await response.json();
      result.replaceChildren();
      if (!data || data.matchType === 'NONE' || !data.scientificName) {
        result.textContent = `GBIF has no confident taxonomy match for ${species}. Try another species.`;
      } else {
        const heading = document.createElement('h3'); heading.textContent = data.canonicalName || data.scientificName;
        const info = document.createElement('p'); info.textContent = `Rank: ${data.rank || 'unknown'} · Status: ${data.status || 'unknown'} · Match: ${data.matchType || 'unknown'} · Confidence: ${data.confidence ?? 'n/a'}%`;
        const detail = document.createElement('p'); detail.textContent = `Scientific name: ${data.scientificName}`;
        result.append(heading, info, detail);
        if (data.usageKey) { const link = document.createElement('a'); link.href = `https://www.gbif.org/species/${encodeURIComponent(data.usageKey)}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'View source record on GBIF'; result.append(link); }
      }
    } catch (error) {
      result.textContent = `Could not load GBIF data (${error.name === 'AbortError' ? 'request timed out' : 'network or API error'}). Check your internet connection and try again.`;
    } finally { button.disabled = false; }
  });
  // The 3D exhibition and external GBIF lookup share one live data flow.
  // The event also fires at initial exhibit load, after this script has registered.
  window.addEventListener('dinoworld:fossil-selected', event => {
    if (!apiForm) return;
    const speciesSelect=apiForm.elements.namedItem('species');
    const requested=event.detail?.species;
    const match=Array.from(speciesSelect.options).find(option => option.value===requested || option.textContent.trim()===requested);
    if (match) speciesSelect.value=match.value;
    else { const option=new Option(requested,requested);speciesSelect.add(option);speciesSelect.value=requested; }
    const live=document.getElementById('fossil-live-data');
    if(live) live.textContent=`Fetching live GBIF classification for ${requested}…`;
    apiForm.requestSubmit();
  });
  // Mirror the live result into the 3D museum without inventing scientific facts.
  const apiResult=document.getElementById('final-api-result');
  if(apiResult){const observer=new MutationObserver(()=>{
    const live=document.getElementById('fossil-live-data');
    if(live){live.replaceChildren();live.append(apiResult.cloneNode(true));}
  });observer.observe(apiResult,{childList:true,subtree:true,characterData:true});}
  // Original lightweight runner: no borrowed Google game assets or code.
  const game = document.getElementById('final-game');
  if (game) {
    const runner = document.getElementById('final-runner');
    const rock = document.getElementById('final-obstacle');
    const msg = document.getElementById('final-game-message');
    const scoreEl = document.getElementById('final-score');
    let playing = false, jumping = false, score = 0, obstacleX = 0, jumpUntil = 0, previous = 0, frame = 0;
    function stop() { playing = false; cancelAnimationFrame(frame); msg.textContent = `Game over! Score: ${score}. Press Restart.`; msg.hidden = false; }
    function jump() {
      if (!playing || jumping) return;
      jumping = true; jumpUntil = performance.now() + 650;
      runner.classList.add('final-jumping');
    }
    function tick(now) {
      if (!playing) return;
      const dt = Math.min((now - previous) / 1000, 0.05); previous = now;
      if (jumping && now >= jumpUntil) { jumping = false; runner.classList.remove('final-jumping'); }
      obstacleX -= dt * (230 + Math.min(score * 3, 180));
      if (obstacleX < -42) { obstacleX = game.clientWidth + 50; score++; scoreEl.textContent = `Score: ${score}`; }
      rock.style.left = `${obstacleX}px`;
      if (obstacleX > 42 && obstacleX < 91 && !jumping) { stop(); return; }
      frame = requestAnimationFrame(tick);
    }
    document.getElementById('final-game-start').addEventListener('click', () => {
      cancelAnimationFrame(frame); score = 0; scoreEl.textContent = 'Score: 0'; obstacleX = game.clientWidth + 30;
      jumping = false; runner.classList.remove('final-jumping'); playing = true; msg.hidden = true;
      previous = performance.now(); game.focus(); frame = requestAnimationFrame(tick);
    });
    document.getElementById('final-game-jump').addEventListener('click', jump);
    document.addEventListener('keydown', event => {
      if (!playing || (event.code !== 'Space' && event.code !== 'ArrowUp')) return;
      if (['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName)) return;
      event.preventDefault(); jump();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });
  }
});
