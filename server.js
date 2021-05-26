const express = require('express')
// taking express and running it
const app = express()
// package used to connect to the db
const MongoClient = require('mongodb').MongoClient
const PORT = 2030
require('dotenv').config()
// holds the connection to the db
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

// connects to the database
    MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
        .then(client => {
            console.log(`connected to the ${dbName} database`)
            db = client.db(dbName)
        })
        .catch(err => {
            console.log(err)
        })

        app.set('view engine', 'ejs')
        // sets up the server
        // anything in the public folder the server can serve up
        app.use(express.static('public'))
        // enables me to look at the application/ data and pull info from the form
        app.use(express.urlencoded({ extended: true }))
        app.use(express.json())

        // when the server hears the get request it handles it using this function
        // going to the db grabbing the objects, putting them in an array and zebra holds the data (can be used in the ejs)
        app.get('/', async (req,res) => {
            const todoItems = await db.collection('todos').find().toArray()   
            const itemsLeft = await db.collection('todos').countDocuments({completed: false}) 

            res.render('index.ejs', {zebra: todoItems, left: itemsLeft})       
        })
        // inset a document into the mongo database
        app.post('/createTodo', (req, res) => {
            console.log(req.body.todoItem)
            db.collection('todos').insertOne({todo: req.body.todoItem, completed: false})
            .then(result => {
                console.log('todo has been added')
                res.redirect('/')
            })
        })

        app.put('/markcomplete', (req, res) => {
            db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
                $set: {
                    completed: true
                }
            })
            .then(result => {
                console.log('marked complete')
                res.json('marked complete')
            })
        })

        app.put('/undo', (req, res) => {
            db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
                $set: {
                    completed: false
                }
            })
            .then(result => {
                console.log('marked complete')
                res.json('marked complete')
            })
        })

        app.delete('/deleteTodo', (req, res) => {
            db.collection('todos').deleteOne({todo: req.body.rainbowUnicorn})
            .then(result => {
                console.log('deleted todo')
                res.json('deleted it')
            })
        })
        
        app.listen(process.env.PORT || PORT, () => {
            console.log('server is running')
        })
