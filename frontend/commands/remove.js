export default function executeRemove(axios, id, message) {

	if (id === undefined) {
		let messageString = "Must specify the dataset ID to remove.\n" +
			"Example: !query remove myCourses";
		message.channel.send(messageString);
		return;
	}

	axios.delete(`http://localhost:4321/dataset/${id}`)
		.then(response => {
			message.channel.send(`Dataset \"${response.data.result}\" sucessfully removed.`);
		})
		.catch(error => {
			message.channel.send("Error: " + error.response.data.error);
		})

}
