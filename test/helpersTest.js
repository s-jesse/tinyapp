const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const testUsers = {
  "abc": {
    id: "abc", 
    email: "a@a.com", 
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "b@b.com", 
    password: "456"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("a@a.com", testUsers)
    const expectedUserID = "abc";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  })
  });

  describe('getUserByEmail', function() {
    it('should return undefined', function() {
      const user = getUserByEmail("c@a.com", testUsers)
      const expectedUserID = undefined;
      // Write your assert statement here
      assert.equal(user, expectedUserID);
    });
    });