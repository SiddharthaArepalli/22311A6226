const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const WINDOW_SIZE = 10;
let windowState = [];

const VALID_IDS = ['p', 'f', 'e', 'r'];
const THIRD_PARTY_URLS = {
  p: 'http://localhost:5000/test/primes',
  f: 'http://localhost:5000/test/fibo',
  e: 'http://localhost:5000/test/even',
  r: 'http://localhost:5000/test/rand'
};

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  if (!VALID_IDS.includes(numberid)) {
    return res.status(400).json({ error: 'Invalid numberid' });
  }

  const prevState = [...windowState];
  let numbers = [];

  try {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => source.cancel(), 500);

    const response = await axios.get(THIRD_PARTY_URLS[numberid], {
      timeout: 500,
      cancelToken: source.token
    });
    clearTimeout(timeout);

    numbers = Array.isArray(response.data.numbers) ? response.data.numbers : [];
  } catch (err) {

    numbers = [];
  }
  const merged = [...windowState, ...numbers];
  const unique = Array.from(new Set(merged));

  windowState = unique.slice(-WINDOW_SIZE);

  const avg =
    windowState.length > 0
      ? (
          windowState.reduce((sum, n) => sum + Number(n), 0) / windowState.length
        ).toFixed(2)
      : 0.0;

  res.json({
    windowPrevState: prevState,
    windowCurrState: windowState,
    numbers,
    avg: Number(avg)
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

