const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const methodOverride = require('method-override');
const expressSesion = require('express-session');
const flash = require('flash');
const cookieParser = require('cookie-parser');
const { body, validationResult, check } = require('express-validator');

// Setup EJS
app.set('view engine', 'ejs');
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Setup Mongose
require('./utils/db');
const Barang = require('./model/dataBarang');
const User = require('./model/user');
const { title } = require('process');
// Set Up Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});
// Setup Method Override
app.use(methodOverride('_method'));

// cookie-parser
app.use(cookieParser('secret'));

// express Sesion
app.use(
  expressSesion({
    secret: 'secret',
    cookie: { maxAge: 6000 },
    resave: true,
    saveUninitialized: true,
  })
);

//Flash
app.use(flash());

// Router
app.get('/', (req, res) => {
  res.render('homepage', {
    layout: 'layouts/main-layout-login',
    title: 'HomePage',
  });
});

app.get('/register', (req, res) => {
  res.render('register', {
    layout: 'layouts/main-layout-login',
    title: 'Register',
  });
});

app.get('/login', (req, res) => {
  res.render('login', {
    layout: 'layouts/main-layout-login',
    title: 'validasi Login',
  });
});

app.post('/newuser', async (req, res) => {
  User.insertMany(req.body, (err, result) => {
    if (err) res.redirect('/register');
    res.redirect('/welcome');
  });
});

app.get('/welcome', (req, res) => {
  res.render('welcome', {
    title: 'Welcome',
    layout: 'layouts/main-layout-login',
  });
});

app.post('/home', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username, password }, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (!user) {
      res.redirect('/login');
      console.log('Not User');
    }
    if (user) {
      return res.redirect('/home');
    }
  });
});

app.get('/home', (req, res) => {
  res.render('index', {
    layout: 'layouts/main-layout',
    title: 'Home',
  });
});

app.get('/barang', async (req, res) => {
  const barangs = await Barang.find();
  res.render('barang', {
    title: 'Data Barang',
    layout: 'layouts/main-layout',
    barangs,
    msg: req.flash('msg'),
  });
});

app.get('/barang/add', (req, res) => {
  res.render('add-barang', {
    title: 'Tambah Data Barang',
    layout: 'layouts/main-layout',
  });
});

app.post('/barang', upload.single('image'), async (req, res) => {
  console.log(req.file);
  let barang = new Barang({
    namaBarang: req.body.namaBarang,
    hargaBarang: req.body.hargaBarang,
    qty: req.body.qty,
    berat: req.body.berat,
    img: req.file.filename,
  });

  try {
    barang = await barang.save();
    res.redirect('/barang');
  } catch (err) {
    console.log(err);
  }
});

app.delete('/barang', (req, res) => {
  Barang.deleteOne({ namaBarang: req.body.namaBarang })
    .then(() => {
      console.log('Data Delete Succes');
      res.redirect('/barang');
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/barang/edit/:namaBarang', async (req, res) => {
  const barang = await Barang.findOne({ namaBarang: req.params.namaBarang });

  res.render('edit-barang', {
    title: 'Update Barang',
    layout: 'layouts/main-layout',
    barang,
    msg: req.flash('msg'),
  });
});

app.put('/barang', (req, res) => {
  Barang.updateOne(
    { _id: req.body._id },
    {
      $set: {
        namaBarang: req.body.namaBarang,
        hargaBarang: req.body.hargaBarang,
        qty: req.body.qty,
        berat: req.body.berat,
        img: req.body.img,
      },
    }
  ).then((result) => {
    res.redirect('/barang');
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    layout: 'layouts/main-layout',
    title: 'Contact Me',
  });
});

app.get('/barang/:namaBarang', async (req, res) => {
  const barang = await Barang.findOne({ namaBarang: req.params.namaBarang });
  res.render('detail', {
    layout: 'layouts/main-layout',
    title: 'Detail Barang',
    barang,
  });
});

app.listen(port, () => {
  console.log(`app run in http://localhost:${port}/`);
});
