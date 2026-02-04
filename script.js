(function() {
    const SALT = "【今これを読んでいるお前も死ねばいい】"; 
    const HASHED_PASSWORD = "c48476ef83f5ec26852d1fc7ed482dc572731adee4c24cace2881003f0eecda1"; 

    let dictionaryData = [];

    window.onload = () => {
        const auth = sessionStorage.getItem('dictionary_auth');
        if (auth === "true") {
            document.getElementById('authModal').style.display = 'none';
            loadDictionary();
        } else {
            document.getElementById('authModal').style.display = 'flex';
        }
    };

    async function digestMessage(message) {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    window.checkPassword = async function() {
        const password = document.getElementById('passwordInput').value;
        const inputWithSalt = password + SALT;
        const inputHash = await digestMessage(inputWithSalt);

        if (inputHash === HASHED_PASSWORD) {
            sessionStorage.setItem('dictionary_auth', "true");
            document.getElementById('authModal').style.display = 'none';
            loadDictionary();
        } else {
            handleAuthFailure();
        }
    };

    function handleAuthFailure() {
        const messageArea = document.getElementById('authMessage');
        const formArea = document.getElementById('authForm');
        const redirectArea = document.getElementById('redirectArea');

        messageArea.innerHTML = "<p style='color:#ff0000; font-weight:bold;'>パスワードを知らないやつは......<br><span style='font-size:24px; color: #9f8cf4;'>【帰れ】</span></p>";
        formArea.style.display = "none";
        redirectArea.style.display = "block";
    }

    window.goToOfficial = function() {
        window.location.href = "https://manosaba.com/";
    };

    function loadDictionary() {
        fetch('dictionary.json')
            .then(response => response.json())
            .then(data => {
                dictionaryData = data;
                displayInitialTables();
                setupSearch();
            })
            .catch(error => console.error("Loading error:", error));
    }

    function displayInitialTables() {
        const normalBody = document.getElementById('normalTableBody');
        const othersBody = document.getElementById('othersTableBody');
        
        dictionaryData.forEach(item => {
            const row = createRow(item);
            if (item.category === 'normal') {
                normalBody.appendChild(row);
            } else {
                othersBody.appendChild(row);
            }
        });
    }

    function createRow(item) {
        const tr = document.createElement('tr');
        const trans = Array.isArray(item.translation) ? item.translation.join('、') : item.translation;
        tr.innerHTML = `
            <td>${item.spell}</td>
            <td>${item.reading}</td>
            <td>${item.type}</td>
            <td>${trans}</td>
            <td>${item.note || '-'}</td>
        `;
        return tr;
    }

    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            const normalSection = document.getElementById('normalSection');
            const othersSection = document.getElementById('othersSection');
            const searchResultSection = document.getElementById('searchResultSection');

            if (query === "") {
                normalSection.style.display = 'block';
                othersSection.style.display = 'block';
                searchResultSection.style.display = 'none';
            } else {
                normalSection.style.display = 'none';
                othersSection.style.display = 'none';
                searchResultSection.style.display = 'block';
                search(query);
            }
        });
    }

    function search(query) {
        const q = toKata(query).toLowerCase();
        const results = dictionaryData.filter(item => {
            const spellLower = (item.spell || "").toLowerCase();
            const spellClean = spellLower.replace(/'|-|~| |･/g, "");
            const readingClean = (item.reading || "").replace(/'|-|~|　/g, "");
            const transJoined = (Array.isArray(item.translation) ? item.translation.join(' ') : (item.translation || "")) + ' ' + (item.keywords || '');
            const transKata = toKata(transJoined);
            const transClean = transKata.replace(/'|-|~/g, "");

            return spellLower.includes(q) || 
                   spellClean.includes(q) || 
                   item.reading.includes(q) || 
                   readingClean.includes(q) || 
                   transKata.includes(q) || 
                   transClean.includes(q);
        });
        renderSearchResults(results);
    }

    function toKata(str) {
        return str.replace(/[ぁ-ん]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60));
    }

    function renderSearchResults(results) {
        const resultBody = document.getElementById('searchResultTableBody');
        resultBody.innerHTML = '';
        if (results.length === 0) {
            resultBody.innerHTML = `<tr><td colspan="5">見つかりませんでした</td></tr>`;
        } else {
            results.forEach(item => {
                resultBody.appendChild(createRow(item));
            });
        }
    }

})();
