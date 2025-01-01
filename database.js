let express = require("express");
let bodyParser = require("body-parser");
let morgan = require("morgan");
let pg = require("pg");
const PORT = 3000;

let pool = new pg.Pool({
  user: "postgres",
  database: "hickey_notes",
  password: "masterkickey8",
  host: "localhost",
  port: 5432,
  max: 10,
});

const result = pool.query("SELECT * FROM notes");

console.warn(result, "result");
