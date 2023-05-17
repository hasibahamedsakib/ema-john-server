const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// port
const PORT = process.env.PORT || 3001;
app.get("/", (req, res) => {
  res.send("This is home page.");
});

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const DB = client.db("NEW_EMA_JOHN");
    const productCollection = DB.collection("products");
    // get all products
    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page * limit;

      const result = await productCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      res.status(200).send(result);
    });
    // get total products
    app.get("/allProducts", async (req, res) => {
      const totalProducts = await productCollection.estimatedDocumentCount();
      res.send({ totalProducts });
    });

    // get products by post method
    app.post("/productsId", async (req, res) => {
      const id = req.body;
      const objectID = id.map((id) => new ObjectId(id));
      const query = { _id: { $in: objectID } };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
