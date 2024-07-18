const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite Cloud database
const db = new sqlite3.Database('sqlitecloud://nljinxzxsk.sqlite.cloud:8860?apikey=mPQpPwL82a9j4LnKdalaJ0VAVRSAoS8Zpx4sXGMgA6g', (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the SQLite Cloud database.');
  }
});

// Set PRAGMA journal_mode
db.run("PRAGMA journal_mode=WAL;");

// Create orders table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT,
    name TEXT,
    phoneNumber TEXT,
    roomNumber TEXT,
    time TEXT,
    date TEXT,
    totalAmount TEXT,
    numberOfItems INTEGER
  )
`);

// Create order_items table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT,
    itemName TEXT,
    amount INTEGER,
    price REAL
  )
`);

// Endpoint to save order
app.post('/orders', (req, res) => {
  const { orderId, name, phoneNumber, roomNumber, time, date, totalAmount, numberOfItems, items } = req.body;

  const query = `
    INSERT INTO orders (orderId, name, phoneNumber, roomNumber, time, date, totalAmount, numberOfItems)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [orderId, name, phoneNumber, roomNumber, time, date, totalAmount, numberOfItems], function (err) {
    if (err) {
      console.error('Failed to save order:', err.message);
      res.status(500).send('Failed to save order');
    } else {
      res.status(200).send('Order saved successfully');
    }
  });

  const query1 = `
    INSERT INTO order_items (orderId, itemName, amount, price)
    VALUES (?, ?, ?, ?)
  `;

  console.log("Totals ordered items: ", items.length);
  for (let i = 0 < items.length; i++) {
    const item = items[i];
    db.run(query1, [orderId, item.name, item.amount, item.price], function (err) {
      if (err) {
        console.error('Failed to save order items:', err.message);
        res.status(500).send('Failed to save order items');
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

