const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Car Doctor Server is Running')
})

//mongoDB

// mongoDB connection user/password
const user = process.env.DB_USER;
const password = process.env.DB_PASS;

const uri = `mongodb+srv://${user}:${password}@cluster0.throxid.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        //database
        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingsCollection = client.db('carDoctor').collection('bookings');

        // send data with GET API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //send data id wise
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            // specific data পাওয়ার জন্য option use করা হয়।
            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                //projection এর system হলো যদি কোনো id এর নির্দিষ্ট property পেতে চাই তাহলে property name: দিয়ে 1 (title:1)
                // আর যদি _id না চাই তাহলে _id:0 দিতে হবে।
                //_id না দিলেও এটা default পেয়ে যাবে।
                projection: { title: 1, service_id: 1, price: 1 },

            };

            const service = await serviceCollection.findOne(query, options)
            res.send(service)
        })
        //booking
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Doctor server is running port on ${port}`)
})