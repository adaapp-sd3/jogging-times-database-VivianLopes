var db = require('../database')

// get the queries ready - note the ? placeholders
var insertJog = db.prepare('INSERT INTO jog (user_id, date, distance, duration) VALUES (?, ?, ?, ?)')
var selectJogById = db.prepare('SELECT * FROM jog WHERE id = ?')
var selectJogByUser = db.prepare('SELECT * FROM jog WHERE user_id = ?')
var updateJogById = db.prepare('UPDATE jog SET date = ?, distance = ?, duration = ?  WHERE id = ?')
var deleteTimeById = db.prepare ('DELETE FROM jog WHERE id = ?')

class Jog {
    static insert(user_id, date, distance, duration) {
        // run the insert query
        var info = insertJog.run(user_id, date, distance, duration)
        // check what the newly inserted row id is
        var jogId = info.lastInsertRowid
        return jogId
    }

    static updateJogById(date, distance ,duration, id){
        updateJogById.run(date, distance, duration, id)
    }


    static deleteTimeById(id){
        deleteTimeById.run(id)
    }



    static findById(id) {
        var row = selectJogById.get(id)

        if (row) {
            return new Jog(row)
        } else {
            return null
        }
    }

    static findByUser(id) {
        var row = selectJogByUser.get(id)

        if (row) {
            return new Jog(row)
        } else {
            return null
        }
    }

    static findAllFromUser(id){
        var allJogs = selectJogByUser.all(id)
        return allJogs

    }

    constructor(databaseRow) {
        this.user_id = databaseRow.user_id
        this.date = databaseRow.date
        this.distance = databaseRow.distance
        this.duration = databaseRow.duration


    }
}

module.exports = Jog
