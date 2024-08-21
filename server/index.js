require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const CORS_ORIGIN = process.env.CORS_ORIGIN;
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const app = express();
app.use(cors({ credentials: true, origin: CORS_ORIGIN }));
app.use(express.json());
app.use(cookieParser());

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL - Heroku'))
  .catch(err => console.error('Connection error', err.stack));


app.post("/problem", async (req, res) => {
  try {

    const { difficulty } = req.body;
    const sql = 'SELECT * FROM problems WHERE difficulty = $1 ORDER BY RANDOM() LIMIT 1';
    client.query(sql, [difficulty], (err, results) => {
      if (err) {
        console.error('Error fetching problems:', err.message);
        return res.status(500).json({ error: 'Error fetching problems' });
      }
      res.status(200).json(results.rows);
    });
  }
  catch (e) {
    console.error("error", e.message);
    return res.status(500).json({ error: "Internal Error" });
  }
});

app.post("/compile", async (req, res) => {

  const code = req.body.code;
  var lang = req.body.lang;

  (lang === "JavaScript") ? lang = "nodejs" : lang = lang;

  (lang === "C++") ? lang = "cpp" : lang = lang;

  (lang === "C#") ? lang = "csharp" : lang = lang;


  const output = await fetch('https://api.jdoodle.com/v1/execute', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      script: code,
      language: lang,
      versionIndex: "4"
    })
  });

  outputData = await output.json();
  res.json(outputData);
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const insertSql = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)';
    client.query(insertSql, [username, password, email], (err, insertResult) => {
      if (err) {
        console.error('Insertion error:', err.message);
        return res.status(500).json({ error: 'Email Already Exists!' });
      }
      res.status(200).json({ message: 'User registered successfully!' });
    });
  }
  catch (e) {
    console.error("error", e.message);
    return res.status(500).json({ error: "Internal Error" });
  }

});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = $1';
    client.query(sql, [email], (err, results) => {
      if (err) {
        console.err("Cannot Find", err.message);
        return res.status(500).json({ message: "Cannot Find Email" });
      }
      if (results.rowCount === 0) {
        return res.status(500).json({ message: "cannot find email" });
      }

      const user = results.rows[0];

      if (user.password === password) {
        jwt.sign({ email, username: user.username }, JWT_SECRET, {}, (err, token) => {
          if (err) {
            console.log(err);
            return res.status(500).json("Token Error");
          }
          return res.status(200).cookie("token", token).json({ username: user.username, email: email })
        })
      }
      else {
        return res.status(400).json({ message: "Wrong Password" });
      }
    })
  }
  catch (e) {
    console.error("error", e.message);
    return res.status(500).json({ message: "Internal Error" });
  }
})

app.get("/verify", (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.json(null);
  }
  jwt.verify(token, JWT_SECRET, {}, (err, info) => {
    if (err) {
      res.json({ message: "Auth Failure" });
    }
    else {
      res.json(info);
    }
  })
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

