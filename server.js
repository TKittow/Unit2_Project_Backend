import 'dotenv/config'
import cors from "cors"
import bodyParser from 'body-parser'
import express from 'express'
import mongoose from 'mongoose'

const app = express()
const port = process.env.PORT || 4000
app.use(cors())
app.use(bodyParser.json())

app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})

mongoose.connect(process.env.DATABASE_URL)

const reviewSchema = new mongoose.Schema({
    location: String,
    googleMapsLink: String,
    rating: Number,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewBody: String,
})

const userSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    googleName: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        required: true
    }
})

const Review = mongoose.model('Review', reviewSchema)
const User = mongoose.model('User', userSchema)

app.get('/review', async (req,res) => {
    const books = await Review.find({})
    res.json(books)
})

app.get('/user', async (req,res) => {
    const users = await User.find({})
    res.json(users)
})

app.get('/review/:id', async (req,res) => {
    const singleReview = await Review.findById(req.params.id).populate('author')
    res.json(singleReview)
})

app.put('/review/:id', (req, res) => {
    Review.updateOne({"_id": req.params.id}, 
    {location: req.body.location, googleMapsLink: req.body.googleMapsLink, rating: req.body.rating, reviewBody: req.body.reviewBody})
    .then(() => {
        res.sendStatus(200)
    })
    .catch((error) => {
        res.sendStatus(500) 
    })
})

app.delete('/review/:id', (req,res) => {
    Review.findByIdAndDelete(req.params.id)
    .then(() => {
       return Book.deleteMany({"author": req.params.id})
    })
    .then(() => {
        res.sendStatus(200)
    })
    .catch( err => {
        res.sendStatus(500)
    })
})

app.post('/review/add', async (req, res) => {
    const review = req.body
    const author = await User.findOne({'userEmail': review.author })
    const newReview = new Review({
        location: review.location,
        googleMapsLink: review.googleMapsLink,
        rating: parseInt(review.rating),
        author: author,
        reviewBody: review.reviewBody
    })

    newReview.save()
    .then(() => {
        console.log(`New review written by ${author} on ${review.location} was added to the database`)
    res.sendStatus(200)
    })
    .catch(error => console.error(error))
})

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to MEVN"
    })
})

app.post('/user/login', async (req, res) => {
    const now = new Date()

    if ( await User.countDocuments({"userEmail": req.body.userEmail}) === 0){
        const newUser = new User({
            userEmail: req.body.userEmail,
            googleName: req.body.googleName,
            lastLogin: now
        })
        newUser.save()
        .then(()=>{
            res.sendStatus(200)
        })
        .catch(err=> {
            res.sendStatus(500)
        })
    } else {
        await User.findOneAndUpdate({"userEmail": req.body.userEmail}, {lastLogin: now})
        res.sendStatus(200)
    }
})