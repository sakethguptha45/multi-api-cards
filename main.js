// ========= Quick Start =========
// 1) Install VS Code extension "Live Server".
// 2) Right-click index.html → "Open with Live Server".
// 3) Click "Load All". Toggle "Slow" and try "Cancel".

// ========= Utilities =========
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function retry(fn, { tries = 3, baseMs = 400 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (i < tries - 1) await sleep(baseMs * Math.pow(2, i));
    }
  }
  throw lastErr;
}

function withTimeout(promise, ms, controllerForAbort) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => {
      try { controllerForAbort?.abort(); } catch {}
      rej(new Error(`Timeout after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

async function fetchJSON(url, { signal, timeoutMs = 10000, slow = false } = {}) {
  // If caller didn’t pass a signal, create our own
  const internalController = signal ? null : new AbortController();
  const ctrl = { signal: signal ?? internalController.signal };

  const p = fetch(url, ctrl).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.json();
  });

  const maybeSlow = slow ? p.then(async x => (await sleep(600), x)) : p;
  return withTimeout(maybeSlow, timeoutMs, internalController);
}

// ========= DOM helpers =========
function setLoading(cardId, loading) {
  const el = document.getElementById(cardId);
  if (el) el.classList.toggle('loading', !!loading);
}
function setStatus(id, text, kind = 'muted') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `pill ${kind}`;
}

// ========= API calls =========
async function getUsers(signal, slow) {
  return fetchJSON('https://jsonplaceholder.typicode.com/users', { signal, slow });
}
async function getPhotos(signal, slow) {
  return fetchJSON('https://picsum.photos/v2/list?page=1&limit=8', { signal, slow });
}
async function getWeather(lat, lng, signal, slow) {
  // Works with Open-Meteo. We’ll handle both possible shapes in render.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
  return fetchJSON(url, { signal, slow });
}
async function getAdvice(signal, slow) {
  return retry(() => fetchJSON('https://api.adviceslip.com/advice', { signal, slow }), { tries: 2, baseMs: 300 });
}

// ========= Renderers =========
function renderUsers(data) {
  const body = document.getElementById('users-body');
  const names = data.slice(0, 5).map(u => u.name);
  body.innerHTML = `<div><strong>Top 5:</strong><br>${names.map(n => `• ${n}`).join('<br>')}</div>`;
}

function renderPhotos(list) {
  const body = document.getElementById('photos-body');
  const thumbs = list.map(p => `<img alt="photo ${p.id}" src="${p.download_url}" loading="lazy">`).join('');
  body.innerHTML = `<div class="thumbs">${thumbs}</div>`;
}

function renderWeather(obj) {
  const body = document.getElementById('weather-body');
  // Old shape: obj.current_weather.temperature; New shape (some endpoints): obj.current.temperature_2m
  const c = obj?.current_weather?.temperature ?? obj?.current?.temperature_2m;
  const w = obj?.current_weather?.windspeed ?? obj?.current?.wind_speed_10m;
  body.innerHTML = (c != null)
    ? `<div><strong>Now:</strong> ${c} °C${w != null ? `, wind ${w}` : ''}</div>`
    : `<div class="muted">No weather data.</div>`;
}

function renderAdvice(obj) {
  const body = document.getElementById('advice-body');
  const text = obj?.slip?.advice ?? 'No advice right now.';
  body.innerHTML = `<div>“${text}”</div>`;
}

// ========= Orchestration =========
let activeController = null;

async function loadAll() {
  const slow = document.getElementById('slow').checked;
  const lat = parseFloat(document.getElementById('lat').value) || 28.54;
  const lng = parseFloat(document.getElementById('lng').value) || -81.38;

  // Cancel any previous run
  if (activeController) { try { activeController.abort(); } catch {} }
  activeController = new AbortController();

  // UI → loading states
  setLoading('users-card', true);   setStatus('users-status', 'loading…');
  setLoading('photos-card', true);  setStatus('photos-status', 'loading…');
  setLoading('weather-card', true); setStatus('weather-status', 'loading…');
  setLoading('advice-card', true);  setStatus('advice-status', 'loading…');

  try {
    const results = await Promise.allSettled([
      getUsers(activeController.signal, slow),
      getPhotos(activeController.signal, slow),
      getWeather(lat, lng, activeController.signal, slow),
      getAdvice(activeController.signal, slow),
    ]);

    // Users
    {
      const res = results[0];
      if (res.status === 'fulfilled') { renderUsers(res.value); setStatus('users-status', 'ok', 'ok'); }
      else { document.getElementById('users-body').innerHTML = `<div class="err small">Error: ${res.reason.message || res.reason}</div>`; setStatus('users-status', 'error', 'err'); }
      setLoading('users-card', false);
    }

    // Photos
    {
      const res = results[1];
      if (res.status === 'fulfilled') { renderPhotos(res.value); setStatus('photos-status', 'ok', 'ok'); }
      else { document.getElementById('photos-body').innerHTML = `<div class="err small">Error: ${res.reason.message || res.reason}</div>`; setStatus('photos-status', 'error', 'err'); }
      setLoading('photos-card', false);
    }

    // Weather
    {
      const res = results[2];
      if (res.status === 'fulfilled') { renderWeather(res.value); setStatus('weather-status', 'ok', 'ok'); }
      else { document.getElementById('weather-body').innerHTML = `<div class="err small">Error: ${res.reason.message || res.reason}</div>`; setStatus('weather-status', 'error', 'err'); }
      setLoading('weather-card', false);
    }

    // Advice
    {
      const res = results[3];
      if (res.status === 'fulfilled') { renderAdvice(res.value); setStatus('advice-status', 'ok', 'ok'); }
      else { document.getElementById('advice-body').innerHTML = `<div class="err small">Error: ${res.reason.message || res.reason}</div>`; setStatus('advice-status', 'error', 'err'); }
      setLoading('advice-card', false);
    }
  } finally {
    // Keep controller reference so Cancel works until next Load
  }
}

// ========= Wiring =========
document.getElementById('btn-load').addEventListener('click', loadAll);
document.getElementById('btn-cancel').addEventListener('click', () => {
  if (activeController) { try { activeController.abort(); } catch {} }
});

// Auto-run on first open
loadAll();
