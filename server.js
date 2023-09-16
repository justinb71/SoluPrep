const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(express.static('css'));
app.use(express.static('js'));


app.get('/', (req, res) => {
  res.render('\LandingPage');
});

app.get('/dashboard', (req, res) => {
  res.render('index');
});

app.get('/pricing', (req, res) => {
  res.render('\Pricing');
});

app.get('/register', (req, res) => {
  res.render('\Register');
});

app.get('/about', (req, res) => {
  res.render('\About');
});

app.get('/login', (req, res) => {
  res.render('\Login');
});

app.get('/dashboard/Exam%20Paper%20Generator', (req, res) => {
    res.render('\Exam Paper Generator');
  });
  app.get('/dashboard/multiplechoice', (req, res) => {
    res.render('\MultipleChoice');
  });

app.get('/dashboard/Ai%20Question%20Generator', (req, res) => {
res.render('\AI Question Generator');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
