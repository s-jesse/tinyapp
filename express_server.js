const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
//const password = "123"; // found in the req.body object
//const hashedPassword = bcrypt.hashSync(password, 10);

app.use(cookieParser())
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
  const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  for (let i = 0; i < length; i++) {
    let charIndex = Math.floor(Math.random() * char.length);
    randomStr.push(char.charAt(charIndex));

  }

  randomStr = randomStr.join("");
  return randomStr
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
  res.send("Hello!");
});



app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]]
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
  // if email and/or password not provided

  if (!email || !password) {
    return res.status(400).send("please provide an email and password")
  }

  let userFound;
// REMEMBER IF WE FIND A USERNAME IT MEANS IT ALREADY EXISTS WHICH WOULD INDICATE A DOUBLE!!
// should i be storing template as users or user
// why user not users??!!

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      userFound = user;
    }
  }
  // If we found user already registered
  if (userFound) {
    return res.status(400).send("that email is already registered")
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
  console.log("newUser:", newUser)
  console.log("users[id]:", users[id])

  res.redirect("/login");
  // id random generator 
  // add in all 3 as keys and add into users object - random id will also be this object key

});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]
  // before was just a cookie now reads users at cookies id. cookies are key values
  const templateVars = { user, urls: urlDatabase };
  //why did username["username"] work!!!???
  // go over last part with referencing users object and changing header partial
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user, urls: urlDatabase };
  if (user) {
    res.redirect('/urls');
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);


  // if email and/or password not provided

  if (!email || !password) {
    return res.status(400).send("please provide an email and password")
  }
  
  let userFound;

  for (const userId in users) {
    
    const user = users[userId];

    if (user.email === email && bcrypt.compareSync(password, hashedPassword) ) {
      userFound = user;
      res.cookie("user_id", user.id)
      res.redirect("/urls");
    } 
  }
   if (!userFound) {
    return res.status(400).send("email and/or password incorrect")
  } 
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id') // had to change if statement to just username???
  console.log("users: ", users);
  res.redirect("/urls");
});
//res.clearCookie('name', { path: '/admin' })

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]
  //const templateVars = { urls: urlDatabase };
  if (!user) {
    res.send('have to be registered and logged in to create short url');
  }
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  let longUrl = req.body.longURL;
  //urlDatabase[shortURL] = longURL;
  //console.log("urlDatabase:", urlDatabase)
  // const newId = {
  //   longURL: longUrl,
  //   userID: user.id, // why user.id - req.cookies with cookie name gives all key/value pairs?
  // };

  // // update users object
  // urlDatabase[shortURL] = newId;
  urlDatabase[shortURL] = {
    longURL: longUrl,
    userID: user.id
  };


  console.log("urlDatabase:", urlDatabase)

  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`)
  //res.render(templateVars);
});

app.post("/urls/:id", (req, res) => {
  //const urlDatabase = { urls: urlDatabase };

  console.log(req.body); // Log the POST request body to the console
  //let id = req.params.id
  //let longURL = urlDatabase[req.params.id]
  let longUrl = req.body.longURL;
  urlDatabase[req.params.id].longURL = longUrl; // review why this worked and if placeholder was correct!!!
  // how does the url update to changed longURL and redirects to actuall site!
  //urlDatabase[req.params.id].longURL = req.body.longURL;
  
  res.redirect(`/urls`) 
});

app.post("/urls/:id/delete", (req, res) => {
  //const urlDatabase = { urls: urlDatabase };
  console.log(req.body); // Log the POST request body to the console
  //const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  //if ?
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`) 
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user, urls: urlDatabase };
  if (!user) {
    res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]]
  // otherwise can just add in user: req.cookies...
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("id not found")
    }
  const templateVars = { user, id: req.params.id, longURL: urlDatabase[req.params.id].longURL,   /* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  // add falsey first otherwise it sends double http requests error
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("id not found")
    }

  const longURL = urlDatabase[req.params.id].longURL; // using same reference as above and then redirecting
  res.redirect(longURL);

});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});