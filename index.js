const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;

// middle ware:
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zyyhzcl.mongodb.net/?retryWrites=true&w=majority`;

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

    // toys collection
    const toysCollections = client.db("toyCarsDB").collection("toys");

    const result = await toysCollections.createIndex({ toyName: 1 });
    console.log(result);


    // adding toy
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toysCollections.insertOne(toy);
      res.send(result);
    });

    // geting all toy
    app.get("/toys", async (req, res) => {
      const toys = await toysCollections.find().toArray();
      res.send(toys);
    });

    // geting toys info by using query(toys based on user)
    app.get("/specificToys", async (req, res) => {

      let query = {};

      if (req.query?.email) {
        query = { sellerEmail: req.query.email }
      }
      const result = await toysCollections.find(query).toArray();
      res.send(result);

    });

    // getting single toy 
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.findOne(query);
      res.send(result);
    });

    // geting search value;
    app.get("/toySearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toysCollections.find({ toyName: { $regex: text, $options: "i" } }).toArray();
      res.send(result);
    })

    // deleting single toy
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.deleteOne(query);
      res.send(result);
    })

    // updating single toy
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const filter = { _id: new ObjectId(id) };

      const updatedToy = {
        $set: {
          price: toy.price,
          rating: toy.rating,
          availableQuantity: toy.availableQuantity,
          description: toy.description,
        }
      }

      const result = await toysCollections.updateOne(filter, updatedToy);
      res.send(result);

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



app.get("/", (req, res) => {
  res.send("car-toys-master is running...");
})


app.listen(port, (req, res) => {
  console.log(`simple crud API is running on port: ${port}`);
})
