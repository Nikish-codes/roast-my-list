const CLIENT_ID = '4e33afc606f522cac2e1f6cface82438';
const outputElement = document.getElementById

const myForm = document.getElementById('LinkForm');

myForm.addEventListener('submit', function (event) {
    // Prevent the default form submission behavior (which reloads the page)
    event.preventDefault();

    const Link = document.getElementById('username').value;

    console.log('Form submitted!');
    console.log('Username:', username);

    async function fetchAllAnime(username) {
    let url = `https://api.myanimelist.net/v2/users/${encodeURIComponent(username)}/animelist?limit=100`;
    const headers = {
        'X-MAL-CLIENT-ID': CLIENT_ID,
        // 'Authorization': `Bearer ${ACCESS_TOKEN}`, // OR this if using OAuth
    };

    const all = [];
    while (url) {
        const res = await fetch(url, { headers });
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

});






// Replace with your credential style (client id or bearer token)
       // safer for client-key style
// const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // if using OAuth2 bearer token



