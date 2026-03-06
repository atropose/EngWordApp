const tbody = document.querySelector('#rows tbody');
const readRows = () => [...tbody.querySelectorAll('tr')].map((tr) => {
  const tds = tr.querySelectorAll('td');
  return { word: tds[0].innerText.trim(), pos: tds[1].innerText.trim(), meaning: tds[2].innerText.trim() };
}).filter((r) => r.word && r.pos && r.meaning);

document.getElementById('add').onclick = () => {
  const tr = document.createElement('tr');
  tr.innerHTML = '<td contenteditable="true"></td><td contenteditable="true">n.</td><td contenteditable="true"></td><td><button class="remove">x</button></td>';
  tbody.appendChild(tr);
};

tbody.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove')) {
    e.preventDefault();
    e.target.closest('tr').remove();
  }
});

document.getElementById('normalize').onclick = async () => {
  const res = await fetch(`/weeks/${window.__WEEK_ID__}/validate/normalize-pos`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows: readRows() })
  });
  const data = await res.json();
  tbody.innerHTML = data.rows.map((r) => `<tr><td contenteditable="true">${r.word}</td><td contenteditable="true">${r.pos}</td><td contenteditable="true">${r.meaning}</td><td><button class="remove">x</button></td></tr>`).join('');
};

document.getElementById('save').onclick = async () => {
  const rows = readRows();
  if (!rows.length) return alert('Rows cannot be empty');
  const res = await fetch(`/weeks/${window.__WEEK_ID__}/validate/save`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows })
  });
  const data = await res.json();
  alert(`Saved ${data.count} rows`);
};
