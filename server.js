const express = require('express');
const fs = require('fs');
const path = require('path');
const games = require('./sites/games');
const env = require("./.env")

const app = express();
const PORT = env.PORT | 6969;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/results', async (req, res) => {
  const query = req.query.q;
  const type = req.query.type || 'game'; // "game" o "movie"

  if (!query) return res.send('Inserisci un termine di ricerca');

  let results = [];
  try {
    if (type === 'game') {
      results = await games.searchAll(query);
    } else if (type === 'movie') {
      // results = await films.searchAll(query);
    }
  } catch (err) {
    console.error(err);
    return res.send('Errore nella ricerca');
  }

  // Genera HTML dei risultati
  const resultsHtml = results.map(item => {
    const links = item.links.map(link => `<div class="links"><a href="${link}" target="_blank">${link}</a></div>`).join('');
    return `<div class="result"><div class="title">${item.title}</div>${links}</div>`;
  }).join('');

  const template = fs.readFileSync(path.join(__dirname, './views/results.html'), 'utf8');
  const html = template.replace('{{query}}', query).replace('{{results}}', resultsHtml);

  res.send(html);
});



app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
