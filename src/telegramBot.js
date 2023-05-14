const { Telegraf } = require("telegraf");
const _ = require("underscore");
const Datastore = require("nedb");
require("dotenv").config();

const db = new Datastore({ filename: "pokemon.users", autoload: true });
const ignore = new Datastore({ filename: "pokemon.ignore", autoload: true });

const bot = new Telegraf(process.env.API_KEY);
let welcomeSent = false;

bot.start((ctx) => {
  if (!welcomeSent) {
    ctx.reply(
      "Hola, ¡bienvenido! Puedes usar los siguientes comandos:\n\n/start - Iniciar las notificaciones\n/stop - Detener las notificaciones\n/ignore [Pokémon] - Ignorar un Pokémon\n/unignore [Pokémon] - Dejar de ignorar un Pokémon\n/list - Mostrar la lista de Pokémon ignorados\n/clearlist - Borrar la lista de Pokémon ignorados\n/help - Mostrar la ayuda"
    );
    welcomeSent = true;
  }

  db.remove(ctx.message.chat);
  db.insert(ctx.message.chat);
});

bot.command("stop", (ctx) => {
  console.log(ctx.message.text, ctx.message.chat.username);
  ctx.reply("notifications stopped");
  db.remove(ctx.message.chat);
});

bot.command("ignore", (ctx) => {
  console.log(ctx.message.text, ctx.message.chat.username);
  const pokemon = ctx.message.text.split(" ")[1];
  ctx.reply("ignored " + pokemon);
  ignore.insert({
    id: ctx.message.chat.id,
    ignore: pokemon,
  });
});

bot.command("unignore", (ctx) => {
  console.log(ctx.message.text, ctx.message.chat.username);
  const pokemon = ctx.message.text.split(" ")[1];
  ctx.reply("unignored " + pokemon);
  ignore.remove({
    id: ctx.message.chat.id,
    ignore: pokemon,
  });
});

bot.command("list", (ctx) => {
  console.log(ctx.message.text, ctx.message.chat.username);

  ignore.find(
    {
      id: ctx.message.chat.id,
    },
    function (err, ig) {
      var tosend = "";

      _.each(ig, function (items) {
        tosend = tosend + " " + items.ignore;
      });

      ctx.reply("ignore list: " + tosend);
    }
  );
});

bot.command("clearlist", (ctx) => {
  console.log(ctx.message.text, ctx.message.chat.username);
  ctx.reply("ignore list cleared");
  ignore.remove(
    {
      id: ctx.message.chat.id,
    },
    {
      multi: true,
    }
  );
});

bot.command("help", (ctx) => {
  console.log(ctx.message.text, ctx.message.chat.username);
  ctx.reply(
    "commands: \n /start (start notifications) \n /stop (stop notifications) \n /ignore Pidgey (ignore a pokemon) \n /unignore Pidgey (remove pokemon from ignore list) \n /list (list all pokemons ignored) \n /clearlist (clear ignore list) \n /help"
  );
});

bot.launch();

module.exports = { bot, db, ignore };
