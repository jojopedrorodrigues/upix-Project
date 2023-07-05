const http = require('http')
const express = require('express')
const mysql = require('mysql')
const path = require('path')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/public/views'));

app.get('/', (req, res) => {
    res.render('index')
});
app.get('/cadastro', (req, res) => {
    res.render('cadastro')
})
app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/dashboard', (req, res) => {
    res.render('login')
})
app.listen(3000, () => {
    console.log('Servidor rodando online em http://localhost:3000/');
});