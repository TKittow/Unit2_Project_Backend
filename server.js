import 'dotenv/config'
import express from 'express'

const app = express()
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})




app.get("/", (req, res) => {
    res.json({
        message: "Welcome to MEVN"
    })
})