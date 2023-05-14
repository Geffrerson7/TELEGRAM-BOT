const express = require("express");
const bodyParser = require("body-parser");
const { bot } = require("./telegramBot");
const { db } = require("./telegramBot");
const { ignore } = require("./telegramBot");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = require("http").Server(app);
const port = process.env.PORT || 9876;
let pokemon = JSON.parse(fs.readFileSync("./src/pokemon.json", "utf8"));

function startServer() {
  server.listen(port, () => {
    console.log(`http://localhost:${port}/`);
  });

  app.post("/", function (req, res) {
    let id = req.body.message.pokemon_id;
    let time = (req.body.message.time_until_hidden_ms / 1000).toFixed(0);
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;
    let url =
      "http://www.google.com/maps/place/" +
      req.body.message.latitude +
      "," +
      req.body.message.longitude;
    var text =
      pokemon[id].rarity +
      ": " +
      pokemon[id].name +
      " " +
      minutes +
      ":" +
      seconds +
      " seconds left. Find @ " +
      url;

    console.log(text);

    db.find({}, function (err, docs) {
      _.each(docs, function (data) {
        var array = [];

        ignore.find(
          {
            id: data.id,
          },
          function (err, ig) {
            _.each(ig, function (items) {
              array.push(items.ignore);
            });

            if (
              pokemon[id].rarity === "Rare" ||
              pokemon[id].rarity === "Ultra Rare" ||
              pokemon[id].rarity === "Very Rare"
            ) {
              if (array.indexOf(pokemon[id].name) < 0) {
                bot.telegram.sendMessage(data.id, text);

                bot.telegram.sendLocation(
                  data.id,
                  req.body.message.latitude,
                  req.body.message.longitude
                );
              }
            }
          }
        );
      });
    });
  });
}

module.exports = { startServer };
