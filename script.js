// Roast My List
// Static, deterministic roast using public user data from Jikan v4.

const API_BASE = 'https://api.jikan.moe/v4';

const form = document.getElementById('roastForm');
const usernameInput = document.getElementById('username');
const submitBtn = document.getElementById('submitBtn');
const downloadBtn = document.getElementById('downloadBtn');

const resultGrid = document.getElementById('resultGrid');
const roastText = document.getElementById('roastText');
const roastMeta = document.getElementById('roastMeta');
const statsList = document.getElementById('statsList');
const errorBox = document.getElementById('errorBox');

let lastPayload = null;

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  resultGrid.hidden = true;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Roasting…' : 'Roast me';
  usernameInput.disabled = isLoading;
  downloadBtn.disabled = !lastPayload;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  // Jikan returns JSON errors with status/type/message
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = json?.message || `${res.status} ${res.statusText}`;
    const hint =
      res.status === 429
        ? 'Rate limited. Wait a bit and try again.'
        : res.status === 404
          ? 'User not found (or profile is private).' 
          : '';
    throw new Error(`${msg}${hint ? ` — ${hint}` : ''}`);
  }

  return json;
}

function fmtNumber(n) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat().format(n);
}

function fmtFloat(n, digits = 2) {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(digits);
}

function pick(arr, seed) {
  if (!arr.length) return '';
  const idx = Math.abs(seed) % arr.length;
  return arr[idx];
}

function hashString(str) {
  // Simple deterministic hash (not cryptographic)
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h;
}

function buildStatsCards(stats) {
  statsList.innerHTML = '';

  const anime = stats?.anime || {};
  const manga = stats?.manga || {};

  const items = [
    { label: 'Anime completed', value: fmtNumber(anime.completed) },
    { label: 'Mean score', value: fmtFloat(anime.mean_score, 2) },
    { label: 'Episodes watched', value: fmtNumber(anime.episodes_watched) },
    { label: 'Plan to watch', value: fmtNumber(anime.plan_to_watch) },
    { label: 'Manga completed', value: fmtNumber(manga.completed) },
    { label: 'Days watched', value: fmtFloat(anime.days_watched, 1) },
  ];

  for (const it of items) {
    const li = document.createElement('li');
    li.className = 'stat';

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = it.label;

    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = it.value;

    li.appendChild(label);
    li.appendChild(value);
    statsList.appendChild(li);
  }
}

function roastFromData(username, user, stats, favorites) {
  const seed = hashString(username.toLowerCase());

  const anime = stats?.anime || {};
  const completed = Number(anime.completed || 0);
  const ptw = Number(anime.plan_to_watch || 0);
  const mean = Number(anime.mean_score || 0);
  const days = Number(anime.days_watched || 0);

  const favAnime = (favorites?.anime || []).slice(0, 3).map((a) => a.title);
  const favLine = favAnime.length ? `Favorites: ${favAnime.join(', ')}.` : '';

  const openers = [
    `Alright ${username}…`,
    `${username}, we need to talk.`,
    `Okay ${username}. I looked at the evidence.`,
    `${username}: your list is loud, actually.`,
  ];

  const closers = [
    'Respectfully.',
    'I say this with love.',
    'No hate, just facts.',
    'Anyway. Carry on.',
  ];

  const lines = [];

  // Intensity based on completed count
  if (completed >= 800) {
    lines.push('You have seen more anime than some people have seen sunlight this year.');
  } else if (completed >= 400) {
    lines.push("That's a lot of completed anime. At this point it's not a hobby, it's a lifestyle choice.");
  } else if (completed >= 150) {
    lines.push('Decent grind. Enough to have opinions, not enough to be fully beyond saving.');
  } else if (completed >= 50) {
    lines.push('You’re still in the “I’m figuring out my taste” phase. Dangerous time.');
  } else {
    lines.push('Your completed count is low… which means your takes are still forming. Stay humble.');
  }

  // Plan-to-watch ratio roast
  if (ptw >= 500) {
    lines.push('Your Plan-To-Watch is basically a graveyard of "one day" lies.');
  } else if (ptw >= 200) {
    lines.push('That Plan-To-Watch list is longer than your attention span.');
  } else if (ptw >= 80) {
    lines.push('Solid PTW stash. You collect shows like you’ll live forever.');
  }

  // Mean score roast
  if (mean >= 8.5) {
    lines.push('You rate like you’re running a fanclub. Give a 6 sometimes, it won’t kill you.');
  } else if (mean >= 7.5) {
    lines.push('Your mean score says: “I enjoy things, but I pretend I’m picky.”');
  } else if (mean >= 6.5) {
    lines.push('Your mean score is… honest. You’ve been through some mid and survived.');
  } else if (mean > 0) {
    lines.push("Your mean score is low. Either you're a critic, or you keep watching stuff you hate.");
  }

  // Days watched
  if (days >= 365) {
    lines.push('A full year of watch time. You could’ve learned a language. You chose this.');
  } else if (days >= 120) {
    lines.push('That watch time is commitment. Or avoidance. Hard to tell.');
  }

  // Favorites roast (light)
  if (favAnime.length) {
    lines.push(`Your favorites are loud: ${favAnime.join(', ')}.`);
  } else {
    lines.push('No favorites listed. Either you’re mysterious or emotionally unavailable.');
  }

  // Small personalization
  if (user?.joined) {
    lines.push(`You’ve been on MAL since ${new Date(user.joined).getFullYear()}. The grind is real.`);
  }

  // Final assembly
  const opener = pick(openers, seed);
  const closer = pick(closers, seed + 1337);

  const roast = `${opener} ${lines.join(' ')} ${closer}`.replace(/\s+/g, ' ').trim();

  return {
    roast,
    meta: favLine,
  };
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function run(username) {
  clearError();
  resultGrid.hidden = true;
  lastPayload = null;
  setLoading(true);

  try {
    const userJson = await fetchJson(`${API_BASE}/users/${encodeURIComponent(username)}`);
    const statsJson = await fetchJson(`${API_BASE}/users/${encodeURIComponent(username)}/statistics`);
    const favJson = await fetchJson(`${API_BASE}/users/${encodeURIComponent(username)}/favorites`);

    const user = userJson.data;
    const stats = statsJson.data;
    const favorites = favJson.data;

    const payload = { username, user, stats, favorites };
    lastPayload = payload;

    const { roast, meta } = roastFromData(username, user, stats, favorites);

    roastText.textContent = roast;
    roastMeta.textContent = meta;

    buildStatsCards(stats);

    resultGrid.hidden = false;
    downloadBtn.disabled = false;
  } catch (err) {
    showError(err?.message || 'Something went wrong.');
    lastPayload = null;
    downloadBtn.disabled = true;
  } finally {
    setLoading(false);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = (usernameInput.value || '').trim();
  if (!username) {
    showError('Enter a username.');
    return;
  }

  await run(username);
});

downloadBtn.addEventListener('click', () => {
  const username = (usernameInput.value || '').trim() || 'user';
  if (!lastPayload) return;
  downloadJson(`${username}_roast.json`, lastPayload);
});
