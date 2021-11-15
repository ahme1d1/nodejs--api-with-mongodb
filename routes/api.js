const express = require('express')
const router = express.Router()
const validator = require('validator')

// jwt
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/user')
const Events = require('../models/events')

// Intiate Mongose
const mongoose = require('mongoose')
const db = "mongodb+srv://ahmedGabal:AhmeD01092829213@cluster0.fbicz.mongodb.net/eventsdb?retryWrites=true&w=majority"
// const db = "mongodb://localhost:27017/test"


mongoose.connect(db, err => {
    if (err) {
        console.log(`Error!${err}`)
    } else {
        console.log('Connected successfully to mongoose')
    }
})

//Verfify Token
const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token, 'secretKey')
    if (!payload) {
        return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
}

// User Register
router.post('/register', (req, res) => {
    let userDate = req.body
    let user = new User(userDate)
    user.save((err, registeredUser) => {
        if (err) {
            console.log(err)
        } else {
            const payload = { subject: registeredUser._id}
            const token = jwt.sign(payload, 'secretKey')
            res.status(200).send({token})
        }
    })
})

// User Login
router.post('/login', (req, res) => {
    let userDate = req.body;
    User.findOne({email: userDate.email}, (error, user) => {
        if (error) {
            console.log(error)
        } else {
            if (!user) {
                res.status(401).send('Invalid Email!')
            } else if(user.password !== userDate.password) {
                res.status(401).send('Invalid Password!')
            } else {
                const payload = { subject: userDate._id}
                const token = jwt.sign(payload, 'secretKey')
                res.status(200).send({token})
            }
        }
    })
})

// Find All Events
router.get('/events', (req, res) => {
    try {
        Events.find({}, (err, events) => {
            if (err) {
                res.status(400).json({error: "Invalid Request, Something went wrong"})
            }
            if (!events) {
                res.status(401).json({error: "Unauthorized action!"})
            }
            // Every Thing Is ok ?
            res.json({suceess: true ,events})
        })
    } catch(e) {
        res.status(401).json({error: "Unauthorized action!"})
    }
})

// Find Special Events
router.get('/specialEvents', verifyToken,(req, res) => {
    try {
        Events.find({special: true}, (err, specailEvents) => {
            if (err) {
                res.status(400).json({error: "Invalid Request, Something went wrong"})
            }
            if (!specailEvents) {
                res.status(401).json({error: "Unauthorized action!"})
            }
            // Specail Events Is Ok ?
            res.json({suceess: true ,specailEvents})
        })
    } catch(e) {
        res.status(401).json({error: "Unauthorized action!"})
    }
 })

// Find Event By Id 
router.get('/findEvent/:id', (req, res) => {
    try {
        let _id = req.params.id 
        if (!_id || validator.isEmpty(_id)) {
            res.status(400).json({success: false, error: "Invalid id has been sent!"})
        }
        // Converting ID to OID through mongoose
		_id = mongoose.Types.ObjectId(_id);

        Events.find({_id}, (err, event) => {
            if (err) {
                res.status(400).json({error: "Invalid Request, Something went wrong"})
            }
            if (!event) {
                res.status(401).json({error: "Unauthorized action!"})
            }           
            // Every Thing Is ok ?
            res.json({suceess: true ,event})
        })

    } catch(e) {
        res.status(401).json({ error: "Unauthorized action!" });
    }
})


// Create Event
router.post('/createEvent', (req, res) => {
    let { name, date, description, special } = req.body;
    let _id = mongoose.Types.ObjectId();

    Events.create({ _id, name, date, description, special }, (err, event) => {
        if (err) {
            res.status(400).json({error: "Invalid request, something went wrong!", err})
        } else {
            res.status(201).json({ success: true, event})
        }
    })
})

// Update Event
router.put('/updateEvent/:id', (req, res) => {
    let { name, date, description, special } = req.body;
    let _id = req.params.id || null
    try {
        if (_id) {
            Events.findByIdAndUpdate(
                _id,
                {$set: {name, date, description, special}},
                {new: true},
                (err, event) => {
                    if (err) {
                        res.status(400).json({success: false, error: "Cant update event!"})
                    } 
                    res.json({success: true, event})
                }
            )
        } else {
            res.status(400).json({error: "Id required to perform this action!" })
        }
    } catch(e) {
        res.status(401).json({ error: "Unauthorized action!" });
    }
})

// Delete Event
router.delete('/deleteEvent/:id', (req, res) => {
    const _id = req.params.id || null
    try {
        if (_id) {
            Events.deleteOne({_id}, (err) => {
                if (err) {
                    res.status(400).json({success: false, error: "Cant remove this event!"})
                }
                res.json({success: true})
            })
        } else {
            res.status(400).json({error: "Id required to perform this action!" })
        }
    } catch(e) {
        res.status(401).json({ error: "Unauthorized action!" });
    }
})

module.exports = router