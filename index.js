import { createServer } from "http";
import { MongoClient, ObjectId } from "mongodb";
import url from "url";
import dotenv from "dotenv";

dotenv.config();
const client = new MongoClient(process.env.MONGO);

const host = "localhost";
const port = 8000;

const requestListener = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  let link = url.parse(req.url, true);
  switch (link.pathname) {
    case "/shops":
      res.writeHead(200);
      res.end(JSON.stringify(await getShops()));
      break;
    case "/shopitem":
      res.writeHead(200);
      if (link.query["shop"] != null) {
        res.end(
          JSON.stringify(await getShopItemsByShop(link.query["shop"] ?? ""))
        );
        break;
      }
      res.end(JSON.stringify(await getItemById(link.query["id"] ?? "")));
      break;
    case "/order":
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async function () {
          await createOrder(JSON.parse(body));
          res.end();
        });
        break;
      }
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
      break;
  }
};

const server = createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

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
    _id: ObjectId(id) ?? "",
  });
  return item;
}

async function createOrder(json) {
  const database = client.db("eliftech");
  const collection = database.collection("orders");
  await collection.insertOne(json);
  return;
}
