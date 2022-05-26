export default function executeQuery(axios, prefix, message) {

	const arg = message.content.slice(prefix.length + 6);
	if (goodQueryArgs(arg)) {
		const noGraves = arg.slice(3, arg.length - 3);
		const query = noGraves.slice(noGraves.indexOf("{"), noGraves.lastIndexOf("}") + 1);
		try {
			let queryObject = JSON.parse(query);
			axios.post("http://localhost:4321/query", queryObject)
				.then(response => {
					let responseString = JSON.stringify(response.data.result);
					if (responseString.length > 1999) {
						message.channel.send("Result must be less than 2000 characters long.");
					} else {
						message.channel.send(`\`\`\`\n${JSON.stringify(response.data.result)}\n\`\`\``);
					}
				})
				.catch(error => {
					message.channel.send("Error: " + error.response.data.error);
				});
		} catch (error) {
			message.channel.send("Error: " + error.message);
			return;
		}
	} else {
		let exampleQuery =
			"{\n" +
			"\t\"WHERE\": {\n" +
			"\t\t\"GT\": {\n" +
			"\t\t\t\"courses_avg\": 97\n" +
			"\t\t}\n" +
			"\t},\n" +
			"\t\"OPTIONS\": {\n" +
			"\t\t\"COLUMNS\": [\"courses_avg\"]\n" +
			"\t}\n" +
			"}";
		let messageString = "Query must be a JSON query contained in a multiline code block. " +
			"For example: \n" + "!query ```JSON\n" + exampleQuery + "\n```\n" +
			"To do this, put three grave accents (\\\`\\\`\\\`) at the beginning and end of your query.";
		message.channel.send(messageString);
		return;
	}

}

function goodQueryArgs(arg) {
	let startIndex = arg.indexOf("```");
	let endIndex = arg.lastIndexOf("```");
	if (startIndex === -1 || endIndex === -1) return false;
	let stringBeforeStart = arg.slice(0, startIndex);
	let stringAfterEnd = arg.slice(endIndex + 3, arg.length);
	let goodStart = stringBeforeStart.split("").every(str => (str === " ") || (str === "\n") || (str === "\t"));
	let goodEnd = stringAfterEnd.split("").every(str => (str === " ") || (str === "\n") || (str === "\t"));
	return goodStart && goodEnd;
}
