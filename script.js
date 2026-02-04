(function() {
    const SALT = "【今これを読んでいるお前も死ねばいい】"; 
    const HASHED_PASSWORD = "c48476ef83f5ec26852d1fc7ed482dc572731adee4c24cace2881003f0eecda1"; 

    let linesData = [];

    window.onload = () => {
        const auth = sessionStorage.getItem('lines_auth');
        if (auth === "true") {
            document.getElementById('authModal').style.display = 'none';
            loadLines();
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
            sessionStorage.setItem('lines_auth', "true");
            document.getElementById('authModal').style.display = 'none';
            loadLines();
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

    function loadLines() {
        fetch('lines.json')
            .then(response => response.json())
            .then(data => {
                linesData = data;
                displayInitialTables();
                setupSearch();
            })
            .catch(error => console.error("Loading error:", error));
    }

    function displayInitialTables() {
        const normalBody = document.getElementById('normalTableBody');
        const othersBody = document.getElementById('othersTableBody');
        
        linesData.forEach(item => {
            let row;
            if (item.category === 'normal') {
                row = createRow(item);
                normalBody.appendChild(row);
            } else {
                row = createOthersRow(item);
                othersBody.appendChild(row);
            }
        });
    }

    function createRow(item) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.line}</td>
            <td>${item.character}</td>
            <td>${item.act || '-'}</td>
            <td>${item.chapter || '-'}</td>
            <td>${item.note || '-'}</td>
        `;
        return tr;
    }

    function createOthersRow(item) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.line}</td>
            <td>${item.character}</td>
            <td>${item.note || '-'}</td>
        `;
        return tr;
    }

    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        let timer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                window.search();
            },500);
        });
    }

    window.search = function() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const charFilter = document.getElementById('characterFilter').value;
        const chapFilter = document.getElementById('chapterFilter').value;
        const actFilter = document.getElementById('actFilter').value;

        const normalSection = document.getElementById('linesSection');
        const othersSection = document.getElementById('othersSection');
        const searchResultSection = document.getElementById('searchResultSection');

        const isFiltering = query !== "" || charFilter !== "" || chapFilter !== "" || actFilter !== "";

        if (!isFiltering) {
            linesSection.style.display = 'block';
            othersSection.style.display = 'block';
            searchResultSection.style.display = 'none';
            return;
        } else {
            linesSection.style.display = 'none';
            othersSection.style.display = 'none';
            searchResultSection.style.display = 'block';
        }

        const results = linesData.filter(item => {
            const matchesQuery = !query || [item.character, item.line, item.note].some(text => 
                text && text.toLowerCase().includes(query)
            );
            const matchesChar = !charFilter || item.character === charFilter;
            const matchesChap = !chapFilter || String(item.chapter) === chapFilter;
            const matchesAct = !actFilter || String(item.act) === actFilter;

            return matchesQuery && matchesChar && matchesChap && matchesAct;
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
