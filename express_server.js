const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

app.use(cookieParser())
app.use(morgan("dev"));

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  //why did username["username"] work!!!???
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username') // had to change if statement to just username???
  res.redirect("/urls");
});
//res.clearCookie('name', { path: '/admin' })

app.post("/urls", (req, res) => {
  //const urlDatabase = { urls: urlDatabase };
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  //res.render("urls_new", templateVars);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  //const urlDatabase = { urls: urlDatabase };

  console.log(req.body); // Log the POST request body to the console
  //let id = req.params.id
  //let longURL = urlDatabase[req.params.id]
  let longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL; // review why this worked and if placeholder was correct!!!
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
  const templateVars = { username: req.cookies["username"]};

  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req, res) => {
  const templateVars = { username: req.cookies["username"], id: req.params.id, longURL: urlDatabase[req.params.id],   /* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; // using same reference as above and then redirecting
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