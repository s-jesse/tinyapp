const express = require("express");
const morgan = require("morgan");
const getUserByEmail = require("./helpers");
//const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
//const password = "123"; // found in the req.body object
//const hashedPassword = bcrypt.hashSync(password, 10);

//app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ["123"],/* secret keys */

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


app.use(morgan("dev"));

const users = {
  abc: {
    id: "abc",
    email: "a@a.com",
    password: "123",
  },
  def: {
    id: "def",
    email: "b@b.com",
    password: "456",
  },
};

const generateRandomString = function(length = 6) {
  let randomStr = [];
  const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < length; i++) {
    let charIndex = Math.floor(Math.random() * char.length);
    randomStr.push(char.charAt(charIndex));

  }

  randomStr = randomStr.join("");
  return randomStr;
};

const urlsForUser = function(id, urls) {
  let usersUrls = {};
  for (let userUrlId in urls) {
    if (id === urlDatabase[userUrlId].userID) {
      usersUrls[userUrlId] = urlDatabase[userUrlId];
    }
  }
  return usersUrls;
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/", (req, res) => {

  res.redirect("/login");
});



app.get("/register", (req, res) => {
  const user = users[req.session.userid];
  const templateVars = { user, urls: urlDatabase };
  if (user) {
    res.redirect('/urls');
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const userFound = getUserByEmail(email, users);

  // if email and/or password not provided
  if (!email || !password) {
    return res.status(400).send("please provide an email and password");
  }


  if (userFound) {
    return res.status(400).send("that email is already registered");
  }
  // if we did not find a user

  const id = Math.random().toString(36).substring(2, 5);

  const newUser = {
    id: id,
    email: email,
    password: hashedPassword
  };

  // update users object
  users[id] = newUser;


  //res.cookie("user_id", id)

  console.log("users:", users);
  console.log("newUser:", newUser);
  console.log("users[id]:", users[id]);

  res.redirect("/login");

});

app.get("/urls", (req, res) => {
  const user = users[req.session.userid];
  //const usersURLS = urlsForUser(user.id, urlDatabase);
  const templateVars = { user, urls: urlsForUser(req.session.userid, urlDatabase) };
  if (!user) {
    return res.status(400).send("please visit /login or /register first");
  }
  // before was just a cookie now reads users at cookies id. cookies are key values

  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.userid];
  const templateVars = { user, urls: urlDatabase };
  if (user) {
    res.redirect('/urls');
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = getUserByEmail(email, users);

  // if email and/or password not provided

  if (!email || !password) {
    return res.status(403).send("please provide an email and password");
  }
  
  if (userFound && bcrypt.compareSync(password, userFound.password)) {

    req.session.userid = userFound.id;

    res.redirect("/urls");
  } else {
    return res.status(403).send("email and/or password incorrect");
  }
});

app.post("/logout", (req, res) => {
  req.session.userid = null;
  console.log("users: ", users);
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const user = users[req.session.userid];

  if (!user) {
    res.send('have to be registered and logged in to create short url');
  }
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  let longUrl = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longUrl,
    userID: user.id
  };


  console.log("urlDatabase:", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {

  console.log(req.body); // Log the POST request body to the console

  let longUrl = req.body.longURL;
  urlDatabase[req.params.id].longURL = longUrl;
  res.redirect(`/urls`);
});

app.get("/urls/:id/delete", (req, res) => {
  const user = users[req.session.userid];

  if (!user) {
    return res.status(404).send("must be logged in to access delete option");
  }
  
  if (urlDatabase[req.params.id].userID !== user.id) {
    return res.status(404).send("incorrect user accessing url");
  }
  console.log(req.body);
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.userid];

  if (!user) {
    return res.status(404).send("must be logged in to access delete option");
  }
  
  if (urlDatabase[req.params.id].userID !== user.id) {
    return res.status(404).send("incorrect user accessing url");
  }
  console.log(req.body); // Log the POST request body to the console

  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.userid];
  const templateVars = { user, urls: urlDatabase };
  if (!user) {
    res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req, res) => {
  const user = users[req.session.userid];
  // otherwise can just add in user: req.cookies...
  if (!user) {
    return res.status(404).send("must be logged in to access url");

  }
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("id not found");
  }
  if (urlDatabase[req.params.id].userID !== user.id) {
    return res.status(404).send("incorrect user accessing url");
  }
  const templateVars = { user, id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL; // using same reference as above and then redirecting
  res.redirect(longURL);

});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });

//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});