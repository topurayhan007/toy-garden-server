const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//test
const demoData = require("./data/test.json");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kon9irj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect();

    const toysCollection = client.db("toyGarden").collection("toys");

    //API CODES HERE
    app.get("/demo", async (req, res) => {
      res.send(demoData);
    });

    // for subcategory routings
    // get all toys
    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    // get toy with id
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // get users toys
    app.get("/my-toys/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { sellerEmail: userEmail };

      // const result = toysCollection.aggregate([{ $match: query }]);
      // const resultArray = await result.toArray();
      const resultArray = await toysCollection.find(query).toArray();

      res.send(resultArray);
    });

    // add new toy
    app.post("/toy", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    // Update toy info
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;
      // console.log(id, updatedToy);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const toy = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };

      const result = await toysCollection.updateOne(filter, toy, options);

      res.send(result);
    });

    // Delete selected toy
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy Garden is running");
});

app.listen(port, () => {
  console.log(`Toy Garden Server is running on port ${port}`);
});
