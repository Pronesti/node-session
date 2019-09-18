const express = require('express');
const session = require('express-session');

const {
  PORT = 3000,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET = 'palabrasecreta',
  SESS_LIFETIME = 1000 * 60 * 60 * 2
} = process.env;

const IN_PROD = NODE_ENV === 'production';

const users = [
  { id: 1, name: 'Diego', email: 'dieh.diego@gmail.com', password: '123456' },
  { id: 2, name: 'Matias', email: 'matias@gmail.com', password: '123456' },
  { id: 3, name: 'Ger', email: 'ger@gmail.com', password: '123456' }
];

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: SESS_LIFETIME,
      sameSite: true,
      secure: IN_PROD
    }
  })
);

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
};

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/home');
  } else {
    next();
  }
};

app.use((req, res, next) => {console.log(req.session.userId); next();}); // debugger

app.get('/', (req, res) => {
  res.send(`<h1>Welcome</h1>
 <a href='/login'> Login </a>
 <a href='/register'> Register </a>
 <a href='/home'> Home </a>
 <form method='post' action='/logaout'>
 <button> Logout </button>
 </form>
 `);
});

app.get('/home', redirectLogin, (req, res) => {
const user = users.find(user => user.id === req.session.userId);

  res.send(`<h1> Home </h1>
    <a href='/'> Main </a>
    <ul>
    <li> Name: ${user.name} </li>
    <li> Email: ${user.email} </li>
    </ul>`);
});

app.get('/login', redirectHome, (req, res) => {
  res.send(`<h1> Login </h1>
<form method='post' action='/login'>
<input type='email' name='email' placeholder='Email' require />
<input type='password' name='password' placeholder='Password' require />
<input type='submit' />
</form>
<a href='/register'> Register </a>
`);
});

app.post('/login', redirectHome, (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    const user = users.find(
      user => user.email === email && user.password === password
    );
    if (user) {
      req.session.userId = user.id;
      return res.redirect('/home');
    }
  }
  res.redirect('/login');
});

app.get('/register', redirectHome, (req, res) => {
  res.send(`<h1> Register </h1>
<form method='post' action='/register'>
<input  name='name' placeholder='Name' require />
<input type='email' name='email' placeholder='Email' require />
<input type='password' name='password' placeholder='Password' require />
<input type='submit' />
</form>
<a href='/login'> Login </a>
`);
});
app.post('/register', redirectHome, (req, res) => {
    const { name, email, password } = req.body;
    if (name && email && password) {
        const exists = users.some(
            user => user.email === email
        );

    if (!exists){
    const user = {
            id: users.length + 1,
            name,
            email,
            password,
        };
        users.push(user);
        req.session.userId = user.id;
        return res.redirect('/home');
    }
    }

    res.redirect('/register');

});

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/home')
        }
        res.clearCookie(SESS_NAME);
        res.redirect('/login');
    })
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
