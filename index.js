const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mercadopago = require('mercadopago');



mercadopago.configure({
  access_token: 'TEST-5032668400645798-CODEEEJLABS'
});

const app = express();
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

const conexao = mysql.createConnection({
  host: 'endereçohost.server.com',
  user: 'userqualquer',
  password: 'senhaqualquer',
  database: 'nomedatabase',
  port: 3306,
  connectTimeout: 30000
});

conexao.connect((erro) => {
  if (erro) {
    console.error('Erro ao conectar ao banco de dados:', erro);
    return;
  }
  console.log('Conexão estabelecida com sucesso.');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/public/views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/error', (req, res) => {
  res.render('error');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  login(conexao, email, password, req, res);
});

app.post('/cadastro', (req, res) => {
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  
  cadastroUsuario(email, phone, password, res, conexao);
  
});

app.get('/cadastro-sucesso', (req, res) => {
  res.render('cadastro-sucesso');
});

app.get('/dashboard', (req, res) => {
  const email = req.session.email;
  
  if (email) {
    res.render('dashboard', { email });
  } else {
    res.redirect('/error');
  }
});
app.post('/process_payment', (req, res) => {
  const payment_data = {
    transaction_amount: Number(req.body.transaction_amount),
    token: req.body.token,
    description: req.body.description,
    installments: Number(req.body.installments),
    payment_method_id: req.body.payment_method_id,
    issuer_id: req.body.issuer_id,
    payer: {
      email: req.body.payer.email,
      identification: {
        type: req.body.payer.identification.type,
        number: req.body.payer.identification.number
      }
    }
  };

  mercadopago.payment.save(payment_data)
    .then(response => {
      res.status(response.status).json({
        status: response.body.status,
        status_detail: response.body.status_detail,
        id: response.body.id
      });
    })
    .catch(error => {
      res.status(response.error.status).send(error.message);
    });
});


app.listen(3000, () => {
  console.log('Servidor rodando online em http://localhost:3000/');
});

function cadastroUsuario(email, phone, password, res, conexao) {
  conexao.query(
    'SELECT * FROM usuarios WHERE email = ? OR telefone = ?',
    [email, phone],
    (erro, resultados) => {
      if (erro) {
        console.log(erro +' tem erro ai');
        
       
      }

      if (resultados && resultados.length > 0) {
        console.log(resultados +' JA TEM USUARIO CADASTRADO');
        res.render('error');
        return;
      }
      
      conexao.query(
        'CREATE TABLE IF NOT EXISTS usuarios (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255) NULL, endereco VARCHAR(255) NULL, cpf VARCHAR(255) NULL, email VARCHAR(255) NOT NULL, telefone VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)',
        (erro) => {
          if (erro) {
            console.error('Erro ao criar tabela usuarios:', erro);
            res.render('error');
            return;
          }
          
          bcrypt.hash(password, 10, (erro, hash) => {
            if (erro) {
              console.error('Erro ao criptografar a senha:', erro);
              res.status(500).send('Erro ao criar a senha criptografada.');
              return;
            }
            
            conexao.query(
              'INSERT INTO usuarios (email, telefone, password) VALUES (?, ?, ?)',
              [email, phone, hash],
              (erro) => {
                if (erro) {
                  console.error('Erro ao inserir dados na tabela usuarios:', erro);
                  res.status(500).send('Erro tabela usuarios.');
                  return;
                }
                novaTab(conexao);
                res.render('cadastro-sucesso');
              }
            );
          });
        }
      );
    }
  );
}

function login(conexao, email, password, req, res) {
  conexao.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    (erro, resultados) => {
      if (erro) {
        console.error('Erro ao consultar banco de dados:', erro);
        res.render('error');
        return;
      }

      if (resultados.length === 0) {
        res.render('error');
        return;
      }

      const usuario = resultados[0];
      
      bcrypt.compare(password, usuario.password, (erro, resultado) => {
        if (erro) {
          console.error('Erro ao comparar as senhas:', erro);
          res.render('error');
          return;
        }
        
        if (resultado) {
          req.session.email = email;
          res.redirect('/dashboard');
        } else {
          res.render('error');
        }
      });
    }
  );
}

function novaTab(conexao) {
  conexao.query(
    'CREATE TABLE IF NOT EXISTS transacoes (id INT AUTO_INCREMENT PRIMARY KEY, valor VARCHAR(255) NULL, email VARCHAR(255) NOT NULL, chavepix VARCHAR(255) NOT NULL, data VARCHAR(255) NOT NULL)',
    (error) => {
      if (error) {
        console.error('Tabela já existe');
      } else {
        console.log('Tabela transacoes criada');
      }
    }
  )
}
