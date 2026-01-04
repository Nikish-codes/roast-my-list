const CLIENT_ID = '4e33afc606f522cac2e1f6cface82438';

// DEV: Toggle to use a public CORS proxy for quick testing when the API blocks direct browser requests.
// Set USE_CORS_PROXY = false to call the MAL API directly (will fail in the browser due to CORS).
const USE_CORS_PROXY = true;
// Example public proxies (may require enabling or may be rate-limited):
// 'https://cors-anywhere.herokuapp.com/'  or 'https://thingproxy.freeboard.io/fetch/'
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

const outputElement = document.getElementById('output');


    async function fetchAllAnime(username) {
    let url = `https://api.myanimelist.net/v2/users/${encodeURIComponent(username)}/animelist?limit=100`;
    const headers = {
        'X-MAL-CLIENT-ID': CLIENT_ID,
        // 'Authorization': `Bearer ${ACCESS_TOKEN}`, // OR this if using OAuth
    };

    const all = [];
    while (url) {
        const fetchUrl = (USE_CORS_PROXY && PROXY_URL) ? (PROXY_URL + url) : url;
        if (USE_CORS_PROXY) console.debug('Using CORS proxy for request:', fetchUrl);
        const res = await fetch(fetchUrl, { headers });
        if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
        all.push(...json.data);
        }
        url = json.paging && json.paging.next ? json.paging.next : null;
    }
    return all;
    }

    function saveAnimelistToLocal(username, data) {
    const key = `animelist_${username}`;
    localStorage.setItem(key, JSON.stringify(data));
    }

    function loadAnimelistFromLocal(username) {
    const key = `animelist_${username}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
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

const myForm = document.getElementById('LinkForm');
const downloadBtn = document.getElementById('downloadBtn');

myForm.addEventListener('submit', async function (event) {
    // Prevent the default form submission behavior (which reloads the page)
    event.preventDefault();

    const username = document.getElementById('username').value.trim();

    console.log('Form submitted!');
    console.log('Username:', username);

      if (!username) {
        outputElement.textContent = 'Enter a username';
        return;
    }

    const submitBtn = myForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
        outputElement.textContent = 'Loading…';
        const list = await fetchAllAnime(username);
        saveAnimelistToLocal(username, list);         // save for later
        // downloadJson(`${username}_animelist.json`, list); // optional: force a JSON download
        outputElement.innerHTML = `<p>Saved ${list.length} entries for <b>${username}</b>.</p>`;
        if (downloadBtn) downloadBtn.disabled = false;
    } catch (err) {
        outputElement.textContent = `Error: ${err.message}`;
        console.error(err);
    } finally {
        submitBtn.disabled = false;
    }

});

if (downloadBtn) {
  downloadBtn.addEventListener('click', function () {
    const username = document.getElementById('username').value.trim();
    const data = loadAnimelistFromLocal(username);
    if (!data) {
      outputElement.textContent = 'No saved data for that username.';
      return;
    }
    downloadJson(`${username}_animelist.json`, data);
  });
}
