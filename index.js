const express = require("express");
const mongodb = require("mongodb");
const dotenv = require("dotenv");
const url = require("url");
const cors = require("cors");
const app = express();

app.use(cors());

dotenv.config();
const client = new mongodb.MongoClient(process.env.MONGO);

app.get("/shop", async (req, res) => {
  res.writeHead(200);
  res.end(JSON.stringify(await getShops()));
});

app.get("/shopitem", async (req, res) => {
  const link = url.parse(req.url, true);
  if (link.query["shop"] != null) {
    res.writeHead(200);
    res.end(JSON.stringify(await getShopItemsByShop(link.query["shop"] ?? "")));
    return;
  } else if (link.query["id"] != null) {
    res.writeHead(200);
    res.end(JSON.stringify(await getItemById(link.query["id"] ?? "")));
    return;
  }
  res.writeHead(400);
  res.end("");
});

app.post("/order", async (req, res) => {
  res.writeHead(200);
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", async function () {
    await createOrder(JSON.parse(body));
    res.end();
  });
});

app.listen(80, () => console.log("Server is running"));

async function getShops() {
  const database = client.db("eliftech");
  const collection = database.collection("shops");
  const shops = await collection.find().toArray();
  return shops;
}

async function getShopItemsByShop(shop) {
  const database = client.db("eliftech");
  const collection = database.collection("shop_items");
  const items = await collection.find({ shop: shop ?? "" }).toArray();
  return items;
}

async function getItemById(id) {
  const database = client.db("eliftech");
  const collection = database.collection("shop_items");
  const item = await collection.findOne({
    _id: mongodb.ObjectId(id) ?? "",
  });
  return item;
}

async function createOrder(json) {
  const database = client.db("eliftech");
  const collection = database.collection("orders");
  await collection.insertOne(json);
  return;
}
