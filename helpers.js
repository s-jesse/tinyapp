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

module.exports = getUserByEmail;