import dotenv from "dotenv";
import {Client, Intents} from "discord.js";
import axios from "axios";
import executeAdd from "./commands/add.js";
import executeRemove from "./commands/remove.js";
import executeList from "./commands/list.js";
import executeQuery from "./commands/query.js";

dotenv.config();
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const prefix = "!insight ";

client.once("ready", () => {
	console.log("InsightUBC is online!");
});

client.on("messageCreate", message => {
	// Do nothing if message doesn't start with prefix (or the bot was the messager itself)
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(" ");
	const command = args.shift().toLowerCase();

	// Check if server is up
	axios.get("http://localhost:4321/echo/ping")
		.then(() => {
			handleCommand(message, command, args);
		})
		.catch(() => {
			message.channel.send("InsightAPI server not responding...");
		});

});

function handleCommand(message, command, args) {
	if(command === "ping") {
		message.channel.send("pong!");
	} else if (command === "add") {
		executeAdd(axios, args[0], args[1], message);
	} else if (command === "remove") {
		executeRemove(axios, args[0], message);
	} else if (command === "list") {
		executeList(axios, message);
	} else if (command === "query") {
		executeQuery(axios, prefix, message);
	}
}

client.login(process.env.BOT_TOKEN); // must be the last line

// TODO: make bot messages prettier, add -help arg + response when just "!insight" or "!insight --some garbage--"
// TODO: clean up code (especially in query)

// TODO: query .txt file if 2000 chars+
// TODO: even tighter query args (!query ```asdfasfd{"hi": 3}sdfasfd``` works, and probably shouldnt)

// TODO: source ~/.nvm/nvm.sh
