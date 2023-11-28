const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const legoData = require('./modules/legoSets');
const port = 3000;

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Middleware to initialize data before handling requests
app.use((req, res, next) => {
  legoData.Initialize()
    .then(() => next())
    .catch((err) => {
      console.error('Error initializing data:', err);
      res.status(500).render('500', { page: '', message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'views', 'home.ejs');
  res.render(filePath, { page: '/' });
});

app.get('/about', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'views', 'about.ejs');
  res.render(filePath, { page: '/about' });
});

app.get('/lego/sets', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'views', 'sets.ejs');
  const filePath404 = path.join(__dirname, 'public', 'views', '404.ejs');

  const obj_len = Object.keys(req.query).length;
  if (obj_len === 0) {
    legoData.getAllSets().then((data) => {
      res.render(filePath, { page: '/lego/sets', sets: data });
    });
  } else {
    legoData
      .getSetsByTheme(req.query.theme)
      .then((data) => res.render(filePath, { page: '/lego/sets', sets: data }))
      .catch((error) => res.render(filePath404, { page: '', msg: 'Unable to find requested theme sets.' }));
  }
});

app.get('/lego/sets/:numdemo', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'views', 'set.ejs');
  const filePath404 = path.join(__dirname, 'public', 'views', '404.ejs');

  const numdemo = req.params.numdemo;
  legoData
    .getSetByNum(numdemo)
    .then((data) => res.render(filePath, { page: '', set: data }))
    .catch((error) => res.render(filePath404, { page: '', msg: 'Unable to find requested set.' }));
});

app.get('/lego/addSet', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'views', 'addSet.ejs');
  legoData.getAllThemes().then((themes) => {
    res.render(filePath, { page: '/lego/addSet', themes: themes });
  });
});

app.post('/lego/addSet', (req, res) => {
  const setData = req.body; // Assuming form fields match Set model properties
  legoData
    .addSetToDB(setData)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      console.error('Error adding set:', err);
      res.status(500).render('500', { page: '', message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/editSet/:num', (req, res) => {
  const setNum = req.params.num;
  const filePath = path.join(__dirname, 'public', 'views', 'editSet.ejs');
  const filePath404 = path.join(__dirname, 'public', 'views', '404.ejs');

  Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()])
      .then(([set, themes]) => {
          res.render(filePath, { themes, set });
      })
      .catch((err) => {
          res.status(404).render(filePath404, { page: '', msg: err });
      });
});

app.post('/lego/editSet', (req, res) => {
  const setNum = req.body.set_num;
  const setData = {
      name: req.body.name,
      // other fields...
  };

  legoData.editSet(setNum, setData)
      .then(() => {
          res.redirect('/lego/sets');
      })
      .catch((err) => {
          res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
      });
});

app.get('/lego/deleteSet/:num', (req, res) => {
  const setNum = req.params.num;

  legoData.deleteSet(setNum)
    .then(() => res.redirect('/lego/sets'))
    .catch((err) => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

app.use((req, res) => {
  const filePath404 = path.join(__dirname, 'public', 'views', '404.ejs');
  res.status(404).render(filePath404, { page: '', msg: "I'm sorry, we're unable to find what you're looking for." });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
