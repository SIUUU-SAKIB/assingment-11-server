const express = require("express");
const cors = require("cors");
const app = express();
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
// app.use(cookieParser());

// const verifyToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(401).send({ message: "unauthrized access" });
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
//     if (err) {
//       return res.status(401).message({ message: "Unacuthorized access" });
//     }
//     req.user = decoded;
//     next();
//   });
// };

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y1e7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const carCollections = client.db(`Rent-car`).collection(`cars`);
    const addedCarsCollection = client.db(`Rent-car`).collection(`added-car`);

    // JWT
    // app.post("/jwt", async (req, res) => {
    //   const user = req.body;

    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
    //     expiresIn: "5hr",
    //   });
    //   res
    //     .cookie(`token`, token, {
    //       httpOnly: true,
    //       secure: false,
    //     })
    //     .send({ success: true });
    // });

    // app.post("/logout", (req, res) => {
    //   res
    //     .clearCookie("token", {
    //       httpOnly: true,
    //       secure: false,
    //     })
    //     .send({ success: true });
    // });
    // JWT///

    app.put("/add-cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("ID:", id);

        const filter = { _id: new ObjectId(id) };
        const opt = { upsert: true };
        const updateCar = req.body;

        console.log(filter);

        const car = {
          $set: {
            model: updateCar.model,
            price: updateCar.price,
            status: updateCar.status,
            features: updateCar.features,
            registration: updateCar.registration,
            description: updateCar.description,
            count: updateCar.count,
            url: updateCar.url,
            loc: updateCar.loc,
          },
        };

        const result = await addedCarsCollection.updateOne(filter, car, opt);

        res.send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Server error", error: error.message });
      }
    });

    app.delete("/add-cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await addedCarsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.post("/add-cars", async (req, res) => {
      const newCar = req.body;
      const result = await addedCarsCollection.insertOne(newCar);
      res.send(result);
    });
    app.get("/add-cars", async (req, res) => {
      try {
        const result = await addedCarsCollection.find().toArray();
        res.status(200).json(result); // Send the cars as a JSON response
      } catch (error) {
        res.status(500).send("Error retrieving cars: " + error.message);
      }
    });

    app.get("/cars", async (req, res) => {
      try {
        const result = await carCollections.find().toArray();
        res.status(200).json(result); // Send the cars as a JSON response
      } catch (error) {
        res.status(500).send("Error retrieving cars: " + error.message);
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Car is ready");
});

app.listen(port, () => {
  console.log(`car is available: ${port}`);
});
