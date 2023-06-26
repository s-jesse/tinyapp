/////////////////////////////////////////////////////////////
//               GLOBAL CONST SECTION                      //
/////////////////////////////////////////////////////////////

const express = require("express");
const morgan = require("morgan");
const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers");
const {users, urlDatabase} = require("./databases");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");



/////////////////////////////////////////////////////////////
//                 APP.USE SECTION                         //
/////////////////////////////////////////////////////////////


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieSession({
  name: 'session',
  keys: ["123"],
    
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


/////////////////////////////////////////////////////////////
//                 "/"  GET                                //
/////////////////////////////////////////////////////////////

// MAIN PIGE THAT REDIRECTS TO LOGIN
app.get("/", (req, res) => {

  res.redirect("/urls");
});


/////////////////////////////////////////////////////////////
//                 "/REGISTER"  GET & POST                 //
/////////////////////////////////////////////////////////////

// MAIN REGISTER PAGE
app.get("/register", (req, res) => {
  const user = users[req.session.userid];
  const templateVars = { user, urls: urlDatabase };
  // IF REGISTRATION WORKS, REDIRECTS TO URLS PAGE
  if (user) {
    res.redirect('/urls');
  }
  res.render("register", templateVars);
});

//////////////////////////////////////////////////////////

app.post("/register", (req, res) => {
  const email = req.body.email; // CAPTURES EMAIL TYPED IN
  const password = req.body.password; // CAPTURES PASSWORD TYPED IN
  const hashedPassword = bcrypt.hashSync(password, 10); // HASHES PASSWORD

  const userFound = getUserByEmail(email, users); // USING GLOBAL FUNCTION TO FIND USER BY EMAIL

  // if email and/or password not provided
  if (!email || !password) {
    return res.status(400).send("please provide an email and password");
  }

  // IF EMAIL MATCHES
  if (userFound) {
    return res.status(400).send("that email is already registered");
  }

  // if we did not find a user we continue with registration

  const id = Math.random().toString(36).substring(2, 5); // implementing random id string

  const newUser = {
    id: id,
    email: email,
    password: hashedPassword
  };

  // update users object
  users[id] = newUser;

  res.redirect("/urls");

});

/////////////////////////////////////////////////////////////
//                 "/LOGIN"  GET & POST                    //
/////////////////////////////////////////////////////////////

app.get("/login", (req, res) => {
  const user = users[req.session.userid];
  const templateVars = { user, urls: urlDatabase };
  // if LOGIN WORKS CORRECTLY, REDIRECTS TO URLS PAGE
  if (user) {
    res.redirect('/urls');
  }
  res.render("login", templateVars);
});

/////////////////////////////////////////////////////

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = getUserByEmail(email, users);
  
  // if email and/or password not provided
  
  if (!email || !password) {
    return res.status(400).send("please provide an email and password");
  }
  
  // if email and password is correct it stores encrypted cookie
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    
    req.session.userid = userFound.id;
    
    res.redirect("/urls");
  } else {
    // otherwise if conditional is false it shows error message
    return res.status(400).send("email and/or password incorrect");
  }
});

/////////////////////////////////////////////////////////////
//                 "/URLS"  GET & POST                     //
/////////////////////////////////////////////////////////////

app.get("/urls", (req, res) => {
  const user = users[req.session.userid];
  const templateVars = { user, urls: urlsForUser(req.session.userid, urlDatabase) };

  // if not logged in error message
  if (!user) {
    return res.status(400).send("please visit /login or /register first");
  }
  res.render("urls_index", templateVars);
});

//////////////////////////////////////////////////////////////////////////////////////

app.post("/urls", (req, res) => {
  const user = users[req.session.userid];
  
  // if not logged in error message
  if (!user) {
    res.send('have to be registered and logged in to create short url');
  }
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  let longUrl = req.body.longURL;
  
  // add in created short url with entered longURL to urlDatabase object
  urlDatabase[shortURL] = {
    longURL: longUrl,
    userID: user.id
  };
  
  console.log("urlDatabase:", urlDatabase);
  res.redirect(`/urls/${shortURL}`); // redirect to created shorturl page
});

/////////////////////////////////////////////////////////////
//                 "/LOGOUT" POST                          //
/////////////////////////////////////////////////////////////

app.post("/logout", (req, res) => {
  delete req.session.userid;
  console.log("users: ", users);
  res.redirect("/login");
});

/////////////////////////////////////////////////////////////
//                 "/URLS/NEW"  GET                        //
/////////////////////////////////////////////////////////////

app.get("/urls/new", (req, res) => {
  const user = users[req.session.userid];
  const templateVars = { user, urls: urlDatabase };
  //must be logged in
  if (!user) {
    res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

/////////////////////////////////////////////////////////////
//                 "URLS/:ID" GET & POST                   //
/////////////////////////////////////////////////////////////

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.userid];
  // otherwise can just add in user: req.cookies...

  // if not logged in error message
  if (!user) {
    return res.status(403).send("must be logged in to access url");

  }
  // if cannot find shorturl in urlDatabase error message
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("id not found");
  }
  // if userID of specfic shortURL doesnt match cookie of user logged in, error message
  if (urlDatabase[req.params.id].userID !== user.id) {
    return res.status(403).send("incorrect user accessing url");
  }
  const templateVars = { user, id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});

/////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.userid];

  if (!user) {
    res.status(400).send("must login first!");
  }
  let longUrl = req.body.longURL;
  urlDatabase[req.params.id].longURL = longUrl;
  
  res.redirect(`/urls`);
});

/////////////////////////////////////////////////////////////
//                 "/:ID/DELETE""  GET & POST              //
/////////////////////////////////////////////////////////////

app.get("/urls/:id/delete", (req, res) => {
  const user = users[req.session.userid];

  // if not logged in cannot use /delete, error message
  if (!user) {
    return res.status(403).send("must be logged in to access delete option");
  }
  
  // if not shortUrl userID doesn't match user signed in, error message
  if (urlDatabase[req.params.id].userID !== user.id) {
    return res.status(400).send("incorrect user accessing url");
  }
  console.log(req.body);
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

/////////////////////////////////////////////////////////////////////////////////

app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.userid];

  if (!user) {
    return res.status(400).send("must be logged in to access delete option");
  }
  
  if (urlDatabase[req.params.id].userID !== user.id) {
    return res.status(403).send("incorrect user accessing url");
  }
  console.log(req.body); // Log the POST request body to the console

  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});



/////////////////////////////////////////////////////////////
//                 "/U/:ID"  GET                           //
/////////////////////////////////////////////////////////////

app.get("/u/:id", (req, res) => {
  
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("url doesn't exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.status(404).send("url doesn't exist");
  }
  res.redirect(longURL); // redirects shortUrl link to actual longUrl website

});

/////////////////////////////////////////////////////////////
//                 APP.LISTEN                              //
/////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});