const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/public/views'));


app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', (req, res) => {
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    

    res.redirect('/cadastro-sucesso');
});

app.get('/cadastro-sucesso', (req, res) => {
    res.render('cadastro-sucesso');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/dashboard', (req, res) => {
    res.render('login');
});

app.listen(3000, () => {
    console.log('Servidor rodando online em http://localhost:3000/');
});
