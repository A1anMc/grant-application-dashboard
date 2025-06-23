const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/grants', require('./api/grants'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Serve static HTML frontend
app.use(express.static(__dirname));
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ SGE Grant Portal running at http://localhost:${PORT}`);
}); 