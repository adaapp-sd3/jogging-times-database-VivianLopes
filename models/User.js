var db = require('../database')

// get the queries ready - note the ? placeholders
var insertUser = db.prepare('INSERT INTO user (name, email, password_hash) VALUES (?, ?, ?)')
var selectUserById = db.prepare('SELECT * FROM user WHERE id = ?')
var selectUserByEmail = db.prepare('SELECT * FROM user WHERE email = ?')
var deleteAccountById = db.prepare('DELETE FROM user WHERE id = ?')
var selectUserByName = db.prepare('SELECT name, id FROM user WHERE name = ?')
var getFollowing = db.prepare('SELECT * FROM user INNER JOIN following ON user.id = following.follower_id WHERE followee_id = ?')

class User {
  static insert(name, email, password_hash) {
    // run the insert query
    var info = insertUser.run(name, email, password_hash)

    // check what the newly inserted row id is
    var userId = info.lastInsertRowid

    return userId
  }

  static deleteAccountById(id){
    deleteAccountById.run(id)
  }

  static selectUserByName(name){
    return selectUserByName.get(name)
  }

  static findById(id) {
    var row = selectUserById.get(id)

    if (row) {
      return new User(row)
    } else {
      return null
    }
  }

  static findByEmail(email) {
    var row = selectUserByEmail.get(email)

    if (row) {
      return new User(row)
    } else {
      return null
    }
  }

  static getFollowing(origin) {
      return getFollowing.all(origin)
  }


        constructor(databaseRow) {
    this.id = databaseRow.id
    this.name = databaseRow.name
    this.email = databaseRow.email
    this.password_hash = databaseRow.password_hash
  }
}

module.exports = User
