export default function executeList(axios, message) {

	axios.get("http://localhost:4321/datasets")
		.then(response => {
			let messageString = "";
			for (let insightDataset of response.data.result) {
				messageString += `ID = ${insightDataset.id}, KIND = ${insightDataset.kind}, ` +
					`NUMROWS = ${insightDataset.numRows}\n`;
			}
			if (messageString === "") {
				message.channel.send("No datasets added yet...");
			} else {
				message.channel.send(messageString);
			}
		});

}
