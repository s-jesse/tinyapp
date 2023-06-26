const {urlDatabase} = require("./databases")

const getUserByEmail = function(email, database) {
  let userFound;
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      userFound = user;
    }
  }
  return userFound;
};

// RANDOM STRING ID GENERATOR FUNCTION
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

// FILTERING URLDATABSE BASE ON SPECIFIC USER ID & URLS CONNECTED WITH SAID USER
const urlsForUser = function(id, urls) {
  let usersUrls = {};
  for (let userUrlId in urls) {
    if (id === urlDatabase[userUrlId].userID) {
      usersUrls[userUrlId] = urlDatabase[userUrlId];
    }
  }
  return usersUrls;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser};