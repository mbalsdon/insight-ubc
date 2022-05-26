export default function executeAdd(axios, id, kind, message) {

	if (id === undefined || kind === undefined) {
		let messageString = "Must specify the dataset ID and kind.\n" +
			"ID: the name of the dataset to be used in queries\n" +
			"Kind: one of \"courses\" or \"rooms\"\n" +
			"Example: !query add myCourses courses";
		message.channel.send(messageString);
		return;
	}
	if (kind !== "courses" && kind !== "rooms") {
		message.channel.send("Kind must be one of \"courses\" or \"rooms\"");
		return;
	}

	const attachments = message.attachments;
	if (attachments.size === 0) {
		message.channel.send("Must attach a valid course .zip file.");
		return;
	} else if (attachments.size > 1) {
		message.channel.send("Only one dataset can be added at a time.");
		return;
	}
	let attachmentObject = attachments.get(Array.from(attachments.keys())[0]);
	if (attachmentObject.contentType !== "application/zip") {
		message.channel.send("Attachment must be a .zip file.");
		return;
	}
	let getConfig =
	{
		method: "get",
		url: attachmentObject.url,
		responseType: "stream"
	}
	axios(getConfig)
		.then(response => {

			axios.put(`http://localhost:4321/dataset/${id}/${kind}`, response.data)
				.then(response => {
					let messageString = "";
					for (let ID of response.data.result) {
						messageString += `${ID}, `
					}
					messageString = messageString.slice(0, messageString.length - 2);
					if (messageString === "") {
						message.channel.send("No datasets added yet...");
					} else {
						message.channel.send("Dataset successfully added. Currently added datasets:\n" +
							messageString)
					}
				})
				.catch(error => {
					message.channel.send("Error: " + error.response.data.error);
				})

		})
		.catch(error => {
			console.log(error);
		});
}
