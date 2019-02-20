var express = require('express')
var bcrypt = require('bcryptjs')

var User = require('./models/User')
var Jog = require('./models/Jog')
var Following = require('./models/Following')

var routes = new express.Router()

var saltRounds = 10

function formatDateForHTML(date) {
    return new Date(date).toISOString().slice(0, -8)
}

// main page
routes.get('/', function(req, res) {
    if (req.cookies.userId) {
        // if we've got a user id, assume we're logged in and redirect to the app:
        res.redirect('/times')
    } else {
        // otherwise, redirect to login
        res.redirect('/sign-in')
    }
})


// show the create account page
routes.get('/create-account', function(req, res) {
    res.render('create-account.html')
})

// handle create account forms:
routes.post('/create-account', function(req, res) {
    var form = req.body

    console.log('create user', form)

    // hash the password - we dont want to store it directly
    var passwordHash = bcrypt.hashSync(form.password, saltRounds)

    // create the user
    var userId = User.insert(form.name, form.email, passwordHash)

    // set the userId as a cookie
    res.cookie('userId', userId)

    // redirect to the logged in page
    res.redirect('/times')
})

// show the sign-in page
routes.get('/sign-in', function(req, res) {
    res.render('sign-in.html')
})

routes.post('/sign-in', function(req, res) {
    var form = req.body

    // find the user that's trying to log in
    var user = User.findByEmail(form.email)

    // if the user exists...
    if (user) {
        console.log({ form, user })
        if (bcrypt.compareSync(form.password, user.password_hash)) {
            // the hashes match! set the log in cookie
            res.cookie('userId', user.id)
            // redirect to main app:
            res.redirect('/times')
        } else {
            // if the username and password don't match, say so
            res.render('sign-in.html', {
                errorMessage: 'Email address and password do not match'
            })
        }
    } else {
        // if the user doesnt exist, say so
        res.render('sign-in.html', {
            errorMessage: 'No user with that email exists'
        })
    }
})

// handle signing out
routes.get('/sign-out', function(req, res) {
    // clear the user id cookie
    res.clearCookie('userId')

    // redirect to the login screen
    res.redirect('/sign-in')
})

//handle deleting account
routes.get('/delete-account', function(req, res){
    var accountId = req.cookies.userId
    console.log('delete user', accountId)
    User.deleteAccountById(accountId)
    res.redirect('/sign-in')
})

// list all jog times
routes.get('/times', function(req, res) {
    var loggedInUser = User.findById(req.cookies.userId)

    const addAll = (accumulator, currentValue) => accumulator + currentValue;

    // fake stats - TODO: get real stats from the database->DONE(?)
    var totalDistance = (Jog.findAllFromUser(req.cookies.userId)).map(jog => {
        return jog.distance
    })
        .reduce(addAll, 0)

    var totalTime = (Jog.findAllFromUser(req.cookies.userId)).map(jog => {
        return jog.duration
    })
        .reduce(addAll, 0)

    var avgSpeed = 0
    if (totalDistance > 0 && totalTime > 0 ){
        avgSpeed = totalDistance / totalTime
    }


    var allJogs = Jog.findAllFromUser(req.cookies.userId)

    allJogs.map(obj => {
        obj.avgSpeed = obj.distance/obj.duration;
        return obj;
    })

    res.render('list-times.html', {
        user: loggedInUser,
        stats: {
            totalDistance: totalDistance.toFixed(2),
            totalTime: totalTime.toFixed(2),
            avgSpeed: avgSpeed.toFixed(2)
        },

        // fake times: TODO: get the real jog times from the db->DONE(?)

        times: allJogs

    })
})


// show the create time form
routes.get('/times/new', function(req, res) {
    // this is hugely insecure. why?
    var loggedInUser = User.findById(req.cookies.userId)

    res.render('create-time.html', {
        user: loggedInUser
    })
})

// handle the create time form
routes.post('/times/new', function(req, res) {
    var form = req.body

    console.log('create time', form)

    // TODO: save the new time ->DONE(?)

    var newJog = Jog.insert(req.cookies.userId, form.startTime, form.distance, form.duration)


    res.redirect('/times')
})


//show start following page
routes.get('/start-following', function(req, res){
    var loggedInUser = User.findById(req.cookies.userId)
    var allFollowers = User.getFollowing(req.cookies.userId)
    var allFollowees = Following.findAllFromUser(req.cookies.userId)


    res.render('start-following.html', {
        user: loggedInUser,
        following: allFollowees,
        follower: allFollowers
    })
})

//handle start following form
routes.post('/start-following/new', function(req, res){
    var form = req.body
    console.log('start following', form)

    var id = User.selectUserByName(form.user).id


    var newFollowing = Following.insert(id, req.cookies.userId)


    res.redirect('/start-following')
})


// show the edit time form for a specific time
routes.get('/times/:id', function(req, res) {
    var timeId = req.params.id
    console.log('get time', timeId)

    // TODO: get the real time for this id from the db ->DONE(?)
    var jogs = Jog.findById(timeId)
    var loggedInUser = User.findById(req.cookies.userId)
    var jogTime = {
        id: timeId,
        startTime: jogs.date,
        duration: jogs.duration,
        distance: jogs.distance
    }

    res.render('edit-time.html', {
        time: jogTime,
        user: loggedInUser
    })
})

// handle the edit time form
routes.post('/times/:id', function(req, res) {
    var timeId = req.params.id
    var form = req.body

    console.log('edit time', {
        timeId: timeId,
        form: form
    })

    // TODO: edit the time in the db ->DONE(?)

    Jog.updateJogById(form.startTime, form.distance, form.duration, timeId)

    res.redirect('/times')
})

// handle deleteing the time
routes.get('/times/:id/delete', function(req, res) {
    var timeId = req.params.id
    console.log('delete time', timeId)

    // TODO: delete the time ->DONE(?)

    Jog.deleteTimeById(timeId)

    res.redirect('/times')
})

module.exports = routes
