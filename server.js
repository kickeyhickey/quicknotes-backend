let express = require("express");
let bodyParser = require("body-parser");
let morgan = require("morgan");
let pg = require("pg");
const PORT = 3001;

let pool = new pg.Pool({
  user: "postgres",
  database: "hickey_notes",
  password: "masterkickey8",
  host: "localhost",
  port: 5432,
  max: 10,
});

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

  response.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (request.method === "OPTIONS") {
    return response.sendStatus(200);
  }

  next();
});

app.get("/", (req, res) => {
  res.send("successful response");
});

app.get("/notes", function (request, response) {
  pool.connect(function (err, db, done) {
    if (err) {
      console.warn(err);
      response.status(500).send({ error: err });
    } else {
      db.query("SELECT * FROM notes", function (err, table) {
        done();
        if (err) {
          console.warn(err);
          return response.status(400).send({ error: err });
        } else {
          console.log("successful", table.rows);
          return response.status(200).send(table.rows);
        }
      });
    }
  });
});

app.get("/notes/:id", function (request, response) {
  pool.connect(function (err, db, done) {
    if (err) {
      console.error(err);
      response.status(500).send({ error: err });
    } else {
      const id = request.params.id;
      db.query(`SELECT * FROM notes WHERE id = ${id}`, function (err, table) {
        done();
        if (err) {
          return response.status(400).send({ error: err });
        } else {
          return response.status(200).send(table.rows);
        }
      });
    }
  });
});

// app.delete("/notes/:id", function (request, response) {
//   pool.connect(function (err, db, done) {
//     if (err) {
//       console.error(err);
//       response.status(500).send({ error: err });
//     } else {
//       const id = request.params.id;
//       console.warn("id", id);
//       db.query(`DELETE FROM notes WHERE id = ${id}`, function (err, table) {
//         res.json({ result, message: "User deleted successfully" });
//         done();
//         if (err) {
//           return response.status(400).send({ error: err });
//         } else {
//           return response.status(200).send(table.rows);
//         }
//       });
//     }
//   });
// });

app.delete("/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = "DELETE FROM notes WHERE id = $1";
    const result = await pool.query(query, [id]);
    res.json({ result, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.put("/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, note } = req.body;

    const query = "UPDATE notes SET title = $1, note = $2 WHERE id = $3";
    const result = await pool.query(query, [title, note, id]);
    res.json({ result, message: "User updated sucessfully!!!!!" });

    console.log("result", result);
  } catch (err) {
    console.error("delete ERROR", err);
    res.status(500).json({ error: "An error occured" });
  }
});

app.post("/notes", function (request, response) {
  let title = request.body.title;
  let note = request.body.note;
  let values = [title, note];
  console.warn("values", values);

  pool.connect((err, db, done) => {
    if (err) {
      return console.warn(err);
    } else {
      db.query(
        "INSERT INTO notes (title, note) values($1, $2)",
        [...values],
        (err, table) => {
          done();
          if (err) {
            return response.status(400).send(err);
          } else {
            console.log(table.rows);
            db.end();
            response.status(201).send({ message: "Data inserted!" });
          }
        }
      );
    }
  });
});

app.listen(PORT, () => console.warn("Listening on port " + PORT));
module.exports = app;
