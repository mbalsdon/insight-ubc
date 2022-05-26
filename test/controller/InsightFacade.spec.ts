import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import * as fsx from "fs-extra";
import InsightFacade from "../../src/controller/InsightFacade";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";

chai.use(chaiAsPromised);

describe("InsightFacade", function() {
	let insightFacade: IInsightFacade;
	let data: {[key: string]: string} = {};

	// All zip file locations
	const directory: string = "test/resources/archives/";
	const dataSets: {[key: string]: string} = {
		courses: directory + "courses.zip",
		courses2: directory + "courses2.zip",
		courses3: directory + "courses3.zip", // very small
		courses4: directory + "courses4.zip",
		courses5: directory + "courses.zip",
		noCourses: directory + "noCourses.zip",
		noCoursesFolder: directory + "noCoursesFolder.zip",
		noValidCourses: directory + "noValidCourses.zip",
		notAZip: directory + "notAZip.txt",
		small: directory + "small.zip",
		rooms: directory + "rooms.zip",
		weeha: directory + "weeha.zip",
		threeha: directory + "rooms2.zip",
		fourha: directory + "rooms.zip",
		fiveha: directory + "rooms3.zip"
	};

	// contents of all the zip files
	before(function () {
		insightFacade = new InsightFacade();
		for (const key of Object.keys(dataSets)) {
			data[key] = fsx.readFileSync(dataSets[key]).toString("base64");
		}
		fsx.removeSync("data");
		fsx.mkdirSync("./data");
	});

	// from TA
	afterEach(function () {
		fsx.removeSync("data");
		insightFacade = new InsightFacade();
		fsx.mkdirSync("./data");
	});

	describe("addDataset", function() {

		describe("C0 addDataset tests", function() {
			// Should successfully add a single zip of courses
			it("Should add the valid dataset 'courses'", function () {
				const id: string = "courses";
				const expectedResult = [id];
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then((result: string[]) => {
						expect(result).to.be.an.instanceOf(Array);
						expect(result).to.have.length(1);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			// Should successfully add two zips of courses
			it("Should add the second valid dataset 'courses2'", function () {
				const id1: string = "courses", id2: string = "courses2";
				const expectedResult: string[] = [id1, id2];

				return insightFacade.addDataset(id1, data[id1], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses);
					})
					.then((result) => {
						expect(result).to.be.an.instanceOf(Array);
						expect(result).to.have.length(2);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			// An id is invalid if it contains an underscore
			it("Should throw an InsightError for containing an '_'", function () {
				const id: string = "courses_";

				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => { // This .then was worked through with a TA and then used all over the place
						expect.fail("Should have been rejected");
					})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});

			// An id is invalid if it is only whitespace characters.
			it("Should throw an Insighterror for just being whitespace", function () {
				const id: string = " ";

				return insightFacade.addDataset(id, data["courses"], InsightDatasetKind.Courses)
					.then(() => {
						expect.fail("Should have been rejected");
					})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});

			// An id is invalid for not specifying the id
			it("Should throw an Insighterror for being empty", function () {
				const id: string = "";

				return insightFacade.addDataset(id, data["courses"], InsightDatasetKind.Courses)
					.then(() => {
						expect.fail("Should have been rejected");
					})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});

			// If ID is the same as the ID of an already added dataset, the dataset should be rejected and not saved
			it("Should throw an InsightError for having duplicate IDs", function () {
				const id: string = "courses";

				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses);
					})
					.then(() => {
						expect.fail("Should have been rejected");
					})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});

			// Specified zip file does not have a 'courses' file inside
			it("Should throw an Insighterror for the file not existing", function () {
				const id: string = "noCoursesFolder";

				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses).then((result) => {
					expect.fail("Should have been rejected");
				})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});

			// Specified name file is not a zip file
			it("Should throw an Insighterror for the file not being a zip file", function () {
				const id: string = "notAZip";

				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses).then((result) => {
					expect.fail("Should have been rejected");
				})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});
		});

		describe("C2 addDataset tests", function() {

			it("Add a valid ROOMS dataset", function() {
				const id: string = "rooms";
				const expectedResult = [id];
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
					.then((result: string[]) => {
						expect(result).to.be.an.instanceOf(Array);
						expect(result).to.have.length(1);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			it("Add a valid ROOMS dataset with a different ID", function() {
				const id: string = "weeha";
				const expectedResult = [id];
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
					.then((result: string[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(1);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			it("Sanity check", function() {
				expect(data["rooms"]).to.deep.equal(data["weeha"]);
			});

			it("Add a valid ROOMS dataset with ID =/= zip name =/= rooms.zip", function() {
				const id: string = "threeha";
				const expectedResult = [id];
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
					.then((result: string[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(1);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			it("Add a valid ROOMS dataset with ID =/= zip name", function() {
				const id: string = "fourha";
				const expectedResult = [id];
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
					.then((result: string[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(1);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			it("Add ANOTHER valid ROOMS dataset with ID =/= zip name =/= rooms.zip", function() {
				const id: string = "fiveha";
				const expectedResult = [id];
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
					.then((result: string[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(1);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			it("Add two valid ROOMS datasets", function() {
				const id1: string = "rooms";
				const id2: string = "fiveha";
				const expectedResult: string[] = [id1, id2];
				return insightFacade.addDataset(id1, data[id1], InsightDatasetKind.Rooms)
					.then(() => {
						return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Rooms);
					})
					.then((result: string[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(2);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			it("Add a valid ROOMS and COURSES dataset", function() {
				const id1: string = "courses5";
				const id2: string = "rooms";
				const expectedResult: string[] = [id1, id2];
				return insightFacade.addDataset(id1, data[id1], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Rooms);
					})
					.then((result: string[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(2);
						expect(result).to.deep.equal(expectedResult);
					});
			}); // TODO

			it("Add a valid COURSES dataset with id =/= zip name", function() {
				const id: string = "courses5";
				const expectedResult = [id];
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then((result: string[]) => {
						expect(result).to.be.an.instanceOf(Array);
						expect(result).to.have.length(1);
						expect(result).to.deep.equal(expectedResult);
					});
			});

		});

	});

	describe("removeDataset", function() {

		describe("C0 removeDataset tests", function () {
			// Should successfully add and remove the dataset getting the id back as a string
			it("Should remove the one added dataset", function () {
				const id: string = "courses";

				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => insightFacade.removeDataset(id))
					.then((result) => {
						// expect(result).to.be.an.instanceOf(String);
						expect(result).to.deep.equal(id);
					});
			});

			// Should throw an error while attempting to remove a dataset that was never added
			it("Should throw a NotFoundError for ID not being added", function () {
				const id: string = "error";

				return insightFacade.removeDataset(id)
					.then(() => {
						expect.fail("Should have been rejected");
					})
					.catch((err: any) => {
						expect(err instanceof NotFoundError).to.deep.equal(true);
					});
			});

			// Should throw an error while attempting to remove a dataset that has an invalid passed id
			it("Should throw an InsightError for ID containing an '_'", function () {
				const id: string = "courses_";
				return insightFacade.removeDataset(id)
					.then(() => {
						expect.fail("Should have been rejected");
					})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});

			// Should throw an error while attempting to remove a dataset that has an invalid passed id
			it("Should throw an InsightError for ID being ' '", function () {
				const id: string = " ";
				return insightFacade.removeDataset(id)
					.then(() => {
						expect.fail("Should have been rejected");
					})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});

			// Should throw an error while attempting to remove a dataset that has an invalid passed id
			it("Should throw an InsightError for ID being ''", function () {
				const id: string = "";
				return insightFacade.removeDataset(id)
					.then(() => {
						expect.fail("Should have been rejected");
					})
					.catch((err: any) => {
						expect(err instanceof InsightError).to.deep.equal(true);
					});
			});
		});

		describe("C2 removeDataset tests", function() {

			it("Remove ROOMS dataset", function() {
				const id: string = "rooms";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
					.then(() => insightFacade.removeDataset(id))
					.then((result: string) => {
						expect(result).to.deep.equal(id);
					});
			});

			it("Remove 2 ROOMS datasets", function() {
				const id1: string = "rooms";
				const id2: string = "fiveha";
				return insightFacade.addDataset(id1, data[id1], InsightDatasetKind.Rooms)
					.then(() => insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Rooms))
					.then(() => insightFacade.removeDataset(id1))
					.then((result: string) => {
						expect(result).to.deep.equal(id1);
					})
					.then(() => insightFacade.removeDataset(id2))
					.then((result: string) => {
						expect(result).to.deep.equal(id2);
					});
			});

			it("Remove a ROOMS and COURSES dataset with IDs =/= zip names", function() {
				const id1: string = "courses5";
				const id2: string = "fiveha";
				return insightFacade.addDataset(id1, data[id1], InsightDatasetKind.Courses)
					.then(() => insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Rooms))
					.then(() => insightFacade.removeDataset(id1))
					.then((result: string) => {
						expect(result).to.deep.equal(id1);
					})
					.then(() => insightFacade.removeDataset(id2))
					.then((result: string) => {
						expect(result).to.deep.equal(id2);
					});
			});
		});

	});

	describe("listDataset", function() {

		describe("C0 listDataset tests", function (){
			// Should grab the empty set of datasets *from ta video with some changes*
			it("Should list no Datasets", function (){
				const expectedResult: InsightDataset[] = [];

				return insightFacade.listDatasets()
					.then((result: InsightDataset[]) => {
						expect(result).to.be.an.instanceOf(Array);
						expect(result).to.have.length(0);
						expect(result).to.deep.equal(expectedResult);
					});
			});

			// Should grab the set of datasets containing only the one "courses" set *from ta video*
			it("Should list one added Dataset", function (){
				const id: string = "courses";

				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => insightFacade.listDatasets())
					.then((result: InsightDataset[]) => {
						expect(result).to.be.an.instanceOf(Array);
						expect(result).to.have.length(1);
						expect(result[0]).to.deep.equal({
							id: id,
							kind: InsightDatasetKind.Courses,
							numRows: 64612
						});
					});
			});

			// Should grab the set of datasets containing the two "courses" and "courses2" sets *from ta video*
			it("Should list multiple Datasets", function (){
				const id1: string = "courses", id2: string = "courses2";

				return insightFacade.addDataset(id1, data[id1], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses);
					})
					.then(() => {
						return insightFacade.listDatasets();
					})
					.then((result: InsightDataset[]) => {
						expect(result).to.be.an.instanceOf(Array);
						expect(result).to.have.length(2);

						const Dataset1 = result.find((dataset1: InsightDataset) => dataset1.id === id1);
						expect(Dataset1).to.exist;
						expect(Dataset1).to.deep.equal({
							id: id1,
							kind: InsightDatasetKind.Courses,
							numRows: 64612
						});

						const Dataset2 = result.find((dataset2: InsightDataset) => dataset2.id === id1);
						expect(Dataset2).to.exist;
						expect(Dataset2).to.deep.equal({
							id: id1,
							kind: InsightDatasetKind.Courses,
							numRows: 64612
						});
					});
			});
		});

		describe("C2 listDataset tests", function() {

			it("List an added ROOMS dataset", function() {
				const id: string = "rooms";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
					.then(() => insightFacade.listDatasets())
					.then((result: InsightDataset[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(1);
						expect(result[0]).to.deep.equal({
							id: id,
							kind: InsightDatasetKind.Rooms,
							numRows: 364
						});
					});
			});

			it("List 2 added ROOMS datasets", function() {
				const id1: string = "threeha";
				const id2: string = "fiveha";
				return insightFacade.addDataset(id1, data[id1], InsightDatasetKind.Rooms)
					.then(() => insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Rooms))
					.then(() => insightFacade.listDatasets())
					.then((result: InsightDataset[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(2);
						expect(result).to.have.deep.members([{
							id: id1,
							kind: InsightDatasetKind.Rooms,
							numRows: 89
						},
						{
							id: id2,
							kind: InsightDatasetKind.Rooms,
							numRows: 107
						}]);
					});
			});

			it("List an added ROOMS and COURSES dataset", function() {
				const id1: string = "courses";
				const id2: string = "rooms";
				return insightFacade.addDataset(id1, data[id1], InsightDatasetKind.Courses)
					.then(() => insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Rooms))
					.then(() => insightFacade.listDatasets())
					.then((result: InsightDataset[]) => {
						expect(result).to.be.an.instanceof(Array);
						expect(result).to.have.length(2);
						expect(result).to.have.deep.members([{
							id: id1,
							kind: InsightDatasetKind.Courses,
							numRows: 64612
						},
						{
							id: id2,
							kind: InsightDatasetKind.Rooms,
							numRows: 364
						}]);
					});
			});

		});

	});

	describe("performQuery", function() {

		describe("C0 performQuery tests", function() {

			it("REJECT: null input", function() {
				const id: string = "courses3";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery(null)
							.then(() => {
								expect.fail("should have rejected");
							})
							.catch((error: any) => {
								console.log(error.message);
								expect(error).to.be.an.instanceof(InsightError);
							});
					});
			});

			it("REJECT: references multiple datasets in COLUMNS", function() {
				const id: string = "courses3";
				const id2: string = "courses4";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {
										GT: {
											courses3_avg: 99
										}
									},
									OPTIONS: {
										COLUMNS: [
											"courses3_dept",
											"courses4_avg"
										],
										ORDER: "courses3_avg"
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});
			});

			it("REJECT: number in SKEY value instead of string", function() {
				const id: string = "courses3";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								IS: {
									courses3_id: 100
								}
							},
							OPTIONS: {
								COLUMNS: [
									"courses3_avg"
								]
							}
						})
							.then(() => {
								expect.fail("should have rejected");
							})
							.catch((error: any) => {
								console.log(error.message);
								expect(error).to.be.an.instanceof(InsightError);
							});
					});
			});

			it("REJECT: string in MKEY value instead of number", function() {
				const id: string = "courses3";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								GT: {
									courses3_avg: "math"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"courses3_avg"
								]
							}
						})
							.then(() => {
								expect.fail("should have rejected");
							})
							.catch((error: any) => {
								console.log(error.message);
								expect(error).to.be.an.instanceof(InsightError);
							});
					});
			});

			it("REJECT: asterisk in IS inputstring", function() {
				const id: string = "courses3";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								IS: {
									courses3_title: "reject me***e*e**ee"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"courses3_avg"
								]
							}
						})
							.then(() => {
								expect.fail("should have rejected");
							})
							.catch((error: any) => {
								console.log(error.message);
								expect(error).to.be.an.instanceof(InsightError);
							});
					});
			});

			it("REJECT: 5000+ results (non-empty WHERE)", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								GT: {
									courses_avg: 0
								}
							},
							OPTIONS: {
								COLUMNS: [
									"courses_dept"
								]
							}
						})
							.then(() => {
								expect.fail("should have rejected");
							})
							.catch((error: any) => {
								console.log(error.message);
								expect(error).to.be.an.instanceof(ResultTooLargeError);
							});
					});
			});

			it("REJECT: 5000+ results (empty WHERE)", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"courses_dept"
								]
							}
						})
							.then(() => {
								expect.fail("should have rejected");
							})
							.catch((error: any) => {
								console.log(error.message);
								expect(error).to.be.an.instanceof(ResultTooLargeError);
							});
					});
			});

			it("ACCEPT: \"simple example\" from C1 spec", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE:{
								GT:{
									courses_avg:97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"courses_dept",
									"courses_avg"
								],
								ORDER:"courses_avg"
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{ courses_dept: "epse", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.09 },
							{ courses_dept: "epse", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.25 },
							{ courses_dept: "math", courses_avg: 97.25 },
							{ courses_dept: "epse", courses_avg: 97.29 },
							{ courses_dept: "epse", courses_avg: 97.29 },
							{ courses_dept: "nurs", courses_avg: 97.33 },
							{ courses_dept: "nurs", courses_avg: 97.33 },
							{ courses_dept: "epse", courses_avg: 97.41 },
							{ courses_dept: "epse", courses_avg: 97.41 },
							{ courses_dept: "cnps", courses_avg: 97.47 },
							{ courses_dept: "cnps", courses_avg: 97.47 },
							{ courses_dept: "math", courses_avg: 97.48 },
							{ courses_dept: "math", courses_avg: 97.48 },
							{ courses_dept: "educ", courses_avg: 97.5 },
							{ courses_dept: "nurs", courses_avg: 97.53 },
							{ courses_dept: "nurs", courses_avg: 97.53 },
							{ courses_dept: "epse", courses_avg: 97.67 },
							{ courses_dept: "epse", courses_avg: 97.69 },
							{ courses_dept: "epse", courses_avg: 97.78 },
							{ courses_dept: "crwr", courses_avg: 98 },
							{ courses_dept: "crwr", courses_avg: 98 },
							{ courses_dept: "epse", courses_avg: 98.08 },
							{ courses_dept: "nurs", courses_avg: 98.21 },
							{ courses_dept: "nurs", courses_avg: 98.21 },
							{ courses_dept: "epse", courses_avg: 98.36 },
							{ courses_dept: "epse", courses_avg: 98.45 },
							{ courses_dept: "epse", courses_avg: 98.45 },
							{ courses_dept: "nurs", courses_avg: 98.5 },
							{ courses_dept: "nurs", courses_avg: 98.5 },
							{ courses_dept: "epse", courses_avg: 98.58 },
							{ courses_dept: "nurs", courses_avg: 98.58 },
							{ courses_dept: "nurs", courses_avg: 98.58 },
							{ courses_dept: "epse", courses_avg: 98.58 },
							{ courses_dept: "epse", courses_avg: 98.7 },
							{ courses_dept: "nurs", courses_avg: 98.71 },
							{ courses_dept: "nurs", courses_avg: 98.71 },
							{ courses_dept: "eece", courses_avg: 98.75 },
							{ courses_dept: "eece", courses_avg: 98.75 },
							{ courses_dept: "epse", courses_avg: 98.76 },
							{ courses_dept: "epse", courses_avg: 98.76 },
							{ courses_dept: "epse", courses_avg: 98.8 },
							{ courses_dept: "spph", courses_avg: 98.98 },
							{ courses_dept: "spph", courses_avg: 98.98 },
							{ courses_dept: "cnps", courses_avg: 99.19 },
							{ courses_dept: "math", courses_avg: 99.78 },
							{ courses_dept: "math", courses_avg: 99.78 }
						]);
					});
			});

			it("ACCEPT: \"complex example\" from C1 spec)", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								OR: [
									{
										AND: [
											{
												GT: {
													courses_avg: 90
												}
											},
											{
												IS: {
													courses_dept: "adhe"
												}
											}
										]
									},
									{
										EQ: {
											courses_avg: 95
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"courses_dept",
									"courses_id",
									"courses_avg"
								],
								ORDER: "courses_avg"
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{
								courses_dept: "adhe",
								courses_id: "329",
								courses_avg: 90.02
							},
							{
								courses_dept: "adhe",
								courses_id: "412",
								courses_avg: 90.16
							},
							{
								courses_dept: "adhe",
								courses_id: "330",
								courses_avg: 90.17
							},
							{
								courses_dept: "adhe",
								courses_id: "412",
								courses_avg: 90.18
							},
							{
								courses_dept: "adhe",
								courses_id: "330",
								courses_avg: 90.5
							},
							{
								courses_dept: "adhe",
								courses_id: "330",
								courses_avg: 90.72
							},
							{
								courses_dept: "adhe",
								courses_id: "329",
								courses_avg: 90.82
							},
							{
								courses_dept: "adhe",
								courses_id: "330",
								courses_avg: 90.85
							},
							{
								courses_dept: "adhe",
								courses_id: "330",
								courses_avg: 91.29
							},
							{
								courses_dept: "adhe",
								courses_id: "330",
								courses_avg: 91.33
							},
							{
								courses_dept: "adhe",
								courses_id: "330",
								courses_avg: 91.33
							},
							{
								courses_dept: "adhe",
								courses_id: "330",
								courses_avg: 91.48
							},
							{
								courses_dept: "adhe",
								courses_id: "329",
								courses_avg: 92.54
							},
							{
								courses_dept: "adhe",
								courses_id: "329",
								courses_avg: 93.33
							},
							{
								courses_dept: "sowk",
								courses_id: "570",
								courses_avg: 95
							},
							{
								courses_dept: "rhsc",
								courses_id: "501",
								courses_avg: 95
							},
							{
								courses_dept: "psyc",
								courses_id: "501",
								courses_avg: 95
							},
							{
								courses_dept: "psyc",
								courses_id: "501",
								courses_avg: 95
							},
							{
								courses_dept: "obst",
								courses_id: "549",
								courses_avg: 95
							},
							{
								courses_dept: "nurs",
								courses_id: "424",
								courses_avg: 95
							},
							{
								courses_dept: "nurs",
								courses_id: "424",
								courses_avg: 95
							},
							{
								courses_dept: "musc",
								courses_id: "553",
								courses_avg: 95
							},
							{
								courses_dept: "musc",
								courses_id: "553",
								courses_avg: 95
							},
							{
								courses_dept: "musc",
								courses_id: "553",
								courses_avg: 95
							},
							{
								courses_dept: "musc",
								courses_id: "553",
								courses_avg: 95
							},
							{
								courses_dept: "musc",
								courses_id: "553",
								courses_avg: 95
							},
							{
								courses_dept: "musc",
								courses_id: "553",
								courses_avg: 95
							},
							{
								courses_dept: "mtrl",
								courses_id: "599",
								courses_avg: 95
							},
							{
								courses_dept: "mtrl",
								courses_id: "564",
								courses_avg: 95
							},
							{
								courses_dept: "mtrl",
								courses_id: "564",
								courses_avg: 95
							},
							{
								courses_dept: "math",
								courses_id: "532",
								courses_avg: 95
							},
							{
								courses_dept: "math",
								courses_id: "532",
								courses_avg: 95
							},
							{
								courses_dept: "kin",
								courses_id: "500",
								courses_avg: 95
							},
							{
								courses_dept: "kin",
								courses_id: "500",
								courses_avg: 95
							},
							{
								courses_dept: "kin",
								courses_id: "499",
								courses_avg: 95
							},
							{
								courses_dept: "epse",
								courses_id: "682",
								courses_avg: 95
							},
							{
								courses_dept: "epse",
								courses_id: "682",
								courses_avg: 95
							},
							{
								courses_dept: "epse",
								courses_id: "606",
								courses_avg: 95
							},
							{
								courses_dept: "edcp",
								courses_id: "473",
								courses_avg: 95
							},
							{
								courses_dept: "edcp",
								courses_id: "473",
								courses_avg: 95
							},
							{
								courses_dept: "econ",
								courses_id: "516",
								courses_avg: 95
							},
							{
								courses_dept: "econ",
								courses_id: "516",
								courses_avg: 95
							},
							{
								courses_dept: "crwr",
								courses_id: "599",
								courses_avg: 95
							},
							{
								courses_dept: "crwr",
								courses_id: "599",
								courses_avg: 95
							},
							{
								courses_dept: "crwr",
								courses_id: "599",
								courses_avg: 95
							},
							{
								courses_dept: "crwr",
								courses_id: "599",
								courses_avg: 95
							},
							{
								courses_dept: "crwr",
								courses_id: "599",
								courses_avg: 95
							},
							{
								courses_dept: "crwr",
								courses_id: "599",
								courses_avg: 95
							},
							{
								courses_dept: "crwr",
								courses_id: "599",
								courses_avg: 95
							},
							{
								courses_dept: "cpsc",
								courses_id: "589",
								courses_avg: 95
							},
							{
								courses_dept: "cpsc",
								courses_id: "589",
								courses_avg: 95
							},
							{
								courses_dept: "cnps",
								courses_id: "535",
								courses_avg: 95
							},
							{
								courses_dept: "cnps",
								courses_id: "535",
								courses_avg: 95
							},
							{
								courses_dept: "bmeg",
								courses_id: "597",
								courses_avg: 95
							},
							{
								courses_dept: "bmeg",
								courses_id: "597",
								courses_avg: 95
							},
							{
								courses_dept: "adhe",
								courses_id: "329",
								courses_avg: 96.11
							}
						]);
					});
			});

			it("ACCEPT: MCOMPARATOR gigaquery", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								OR: [
									{
										AND: [
											{
												AND: [
													{
														AND: [
															{
																GT: {
																	courses_year: 2000
																}
															},
															{
																NOT: {
																	EQ: {
																		courses_year: 2019
																	}
																}
															}
														]
													},
													{
														LT: {
															courses_audit: 2
														}
													}
												]
											},
											{
												GT: {
													courses_pass: 800
												}
											}
										]
									},
									{
										AND: [
											{
												GT: {
													courses_year: 2000
												}
											},
											{
												GT: {
													courses_avg: 99
												}
											}
										]
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"courses_fail",
									"courses_dept",
									"courses_id",
									"courses_instructor",
									"courses_title",
									"courses_uuid"
								],
								ORDER: "courses_fail"
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{
								courses_fail: 0,
								courses_dept: "math",
								courses_id: "527",
								courses_instructor: "gomez, jose",
								courses_title: "algb topology i",
								courses_uuid: "5373"
							},
							{
								courses_fail: 0,
								courses_dept: "cnps",
								courses_id: "574",
								courses_instructor: "cox, daniel",
								courses_title: "career planning",
								courses_uuid: "26777"
							},
							{
								courses_fail: 2,
								courses_dept: "biol",
								courses_id: "140",
								courses_instructor: "couch, brett;germano, bernardita;kalas, pamela;kopp, " +
									"christopher;moussavi, maryam;nomme, kathy margaret;norman, lynn;sun, chin",
								courses_title: "lab inv life sc",
								courses_uuid: "55059"
							},
							{
								courses_fail: 8,
								courses_dept: "biol",
								courses_id: "140",
								courses_instructor: "pollock, carol;sun, chin",
								courses_title: "lab inv life sc",
								courses_uuid: "20544"
							},
							{
								courses_fail: 14,
								courses_dept: "biol",
								courses_id: "140",
								courses_instructor: "nomme, kathy margaret;pollock, carol;sun, chin",
								courses_title: "lab inv life sc",
								courses_uuid: "72059"
							},
							{
								courses_fail: 24,
								courses_dept: "biol",
								courses_id: "200",
								courses_instructor: "mazari-andersen, alicia",
								courses_title: "fund cell bio",
								courses_uuid: "54044"
							},
							{
								courses_fail: 74,
								courses_dept: "biol",
								courses_id: "200",
								courses_instructor: "young, robin",
								courses_title: "fund cell bio",
								courses_uuid: "72065"
							},
							{
								courses_fail: 95,
								courses_dept: "biol",
								courses_id: "200",
								courses_instructor: "young, robin",
								courses_title: "fund cell bio",
								courses_uuid: "55065"
							},
							{
								courses_fail: 106,
								courses_dept: "biol",
								courses_id: "200",
								courses_instructor: "rosenberg, ellen",
								courses_title: "cell biology 1",
								courses_uuid: "88960"
							},
							{
								courses_fail: 122,
								courses_dept: "biol",
								courses_id: "200",
								courses_instructor: "chen, liane",
								courses_title: "fund cell bio",
								courses_uuid: "20550"
							},
							{
								courses_fail: 128,
								courses_dept: "biol",
								courses_id: "200",
								courses_instructor: "",
								courses_title: "cell biology 1",
								courses_uuid: "34303"
							},
							{
								courses_fail: 196,
								courses_dept: "biol",
								courses_id: "200",
								courses_instructor: "rosenberg, ellen",
								courses_title: "cell biology 1",
								courses_uuid: "18071"
							}
						]);
					});
			});

			it("ACCEPT: SCOMPARATOR gigaquery", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								OR: [
									{
										OR: [
											{
												OR: [
													{
														OR: [
															{
																IS: {
																	courses_dept: "swed"
																}
															},
															{
																IS: {
																	courses_id: "127"
																}
															}
														]
													},
													{
														IS: {
															courses_instructor: "bohnet, adam"
														}
													}
												]
											},
											{
												IS: {
													courses_title: "clas poet tang"
												}
											}
										]
									},
									{
										IS: {
											courses_uuid: "23188"
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"courses_dept",
									"courses_id",
									"courses_instructor",
									"courses_title",
									"courses_uuid"
								],
								ORDER: "courses_uuid"
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "liu, xue shun",
								courses_title: "clas poet tang",
								courses_uuid: "15998"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "liu, xue shun",
								courses_title: "clas poet tang",
								courses_uuid: "15999"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "liu, xue shun",
								courses_title: "clas poet tang",
								courses_uuid: "16000"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "16001"
							},
							{
								courses_dept: "chin",
								courses_id: "101",
								courses_instructor: "wang, qian",
								courses_title: "basic chin i 1",
								courses_uuid: "23188"
							},
							{
								courses_dept: "chin",
								courses_id: "463",
								courses_instructor: "mou, huai-chuan",
								courses_title: "clas poet tang",
								courses_uuid: "23296"
							},
							{
								courses_dept: "chin",
								courses_id: "463",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "23297"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "schmidt, jerry dean",
								courses_title: "clas poet tang",
								courses_uuid: "23298"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "liu, xue shun",
								courses_title: "clas poet tang",
								courses_uuid: "23299"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "23300"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "schmidt, jerry dean",
								courses_title: "clas poet tang",
								courses_uuid: "30815"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "30816"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 1",
								courses_uuid: "30831"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 1",
								courses_uuid: "30832"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "",
								courses_title: "elem swedish 1",
								courses_uuid: "30833"
							},
							{
								courses_dept: "swed",
								courses_id: "110",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 2",
								courses_uuid: "30834"
							},
							{
								courses_dept: "swed",
								courses_id: "110",
								courses_instructor: "",
								courses_title: "elem swedish 2",
								courses_uuid: "30835"
							},
							{
								courses_dept: "swed",
								courses_id: "200",
								courses_instructor: "karlstrom, lena",
								courses_title: "int swedish 1",
								courses_uuid: "30836"
							},
							{
								courses_dept: "swed",
								courses_id: "200",
								courses_instructor: "",
								courses_title: "int swedish 1",
								courses_uuid: "30837"
							},
							{
								courses_dept: "swed",
								courses_id: "210",
								courses_instructor: "karlstrom, lena",
								courses_title: "int swedish 2",
								courses_uuid: "30838"
							},
							{
								courses_dept: "swed",
								courses_id: "210",
								courses_instructor: "",
								courses_title: "int swedish 2",
								courses_uuid: "30839"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 1",
								courses_uuid: "33329"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 1",
								courses_uuid: "33330"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "",
								courses_title: "elem swedish 1",
								courses_uuid: "33331"
							},
							{
								courses_dept: "swed",
								courses_id: "110",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 2",
								courses_uuid: "33332"
							},
							{
								courses_dept: "swed",
								courses_id: "110",
								courses_instructor: "",
								courses_title: "elem swedish 2",
								courses_uuid: "33333"
							},
							{
								courses_dept: "swed",
								courses_id: "200",
								courses_instructor: "karlstrom, lena",
								courses_title: "int swedish 1",
								courses_uuid: "33334"
							},
							{
								courses_dept: "swed",
								courses_id: "200",
								courses_instructor: "",
								courses_title: "int swedish 1",
								courses_uuid: "33335"
							},
							{
								courses_dept: "swed",
								courses_id: "210",
								courses_instructor: "karlstrom, lena",
								courses_title: "int swedish 2",
								courses_uuid: "33336"
							},
							{
								courses_dept: "swed",
								courses_id: "210",
								courses_instructor: "",
								courses_title: "int swedish 2",
								courses_uuid: "33337"
							},
							{
								courses_dept: "cons",
								courses_id: "127",
								courses_instructor: "coops, nicholas charles",
								courses_title: "observing earth",
								courses_uuid: "42697"
							},
							{
								courses_dept: "cons",
								courses_id: "127",
								courses_instructor: "",
								courses_title: "observing earth",
								courses_uuid: "42698"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 1",
								courses_uuid: "46641"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 1",
								courses_uuid: "46642"
							},
							{
								courses_dept: "swed",
								courses_id: "100",
								courses_instructor: "",
								courses_title: "elem swedish 1",
								courses_uuid: "46643"
							},
							{
								courses_dept: "swed",
								courses_id: "110",
								courses_instructor: "karlstrom, lena",
								courses_title: "elem swedish 2",
								courses_uuid: "46644"
							},
							{
								courses_dept: "swed",
								courses_id: "110",
								courses_instructor: "",
								courses_title: "elem swedish 2",
								courses_uuid: "46645"
							},
							{
								courses_dept: "swed",
								courses_id: "200",
								courses_instructor: "karlstrom, lena",
								courses_title: "int swedish 1",
								courses_uuid: "46646"
							},
							{
								courses_dept: "swed",
								courses_id: "200",
								courses_instructor: "",
								courses_title: "int swedish 1",
								courses_uuid: "46647"
							},
							{
								courses_dept: "swed",
								courses_id: "210",
								courses_instructor: "karlstrom, lena",
								courses_title: "int swedish 2",
								courses_uuid: "46648"
							},
							{
								courses_dept: "swed",
								courses_id: "210",
								courses_instructor: "",
								courses_title: "int swedish 2",
								courses_uuid: "46649"
							},
							{
								courses_dept: "chin",
								courses_id: "463",
								courses_instructor: "mou, huai-chuan",
								courses_title: "clas poet tang",
								courses_uuid: "66368"
							},
							{
								courses_dept: "chin",
								courses_id: "463",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "66369"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "schmidt, jerry dean",
								courses_title: "clas poet tang",
								courses_uuid: "66370"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "liu, xue shun",
								courses_title: "clas poet tang",
								courses_uuid: "66371"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "66372"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "schmidt, jerry dean",
								courses_title: "clas poet tang",
								courses_uuid: "73437"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "73438"
							},
							{
								courses_dept: "asia",
								courses_id: "337",
								courses_instructor: "bohnet, adam",
								courses_title: "korn ppl mod tms",
								courses_uuid: "74580"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "schmidt, jerry dean",
								courses_title: "clas poet tang",
								courses_uuid: "83240"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "liu, xue shun",
								courses_title: "clas poet tang",
								courses_uuid: "83241"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "83242"
							},
							{
								courses_dept: "asia",
								courses_id: "200",
								courses_instructor: "bohnet, adam",
								courses_title: "cult fndt e asia",
								courses_uuid: "94574"
							},
							{
								courses_dept: "asia",
								courses_id: "317",
								courses_instructor: "bohnet, adam",
								courses_title: "rise korean civl",
								courses_uuid: "94592"
							},
							{
								courses_dept: "asia",
								courses_id: "410",
								courses_instructor: "bohnet, adam",
								courses_title: "int rl prmd e as",
								courses_uuid: "94633"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "schmidt, jerry dean",
								courses_title: "clas poet tang",
								courses_uuid: "9503"
							},
							{
								courses_dept: "chin",
								courses_id: "471",
								courses_instructor: "",
								courses_title: "clas poet tang",
								courses_uuid: "9504"
							}
						]);
					});
			});

			it("ACCEPT: nonsense SKEY", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								IS: {
									courses_title: "1234567890qwertyuiopasdfghjklzxcvbnm!@#$%^&()-=_+`~[]{};':,./<>?"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"courses_avg"
								]
							}
						});
					})
					.then((result: any[]) => {
						expect(result.length).to.equal(0);
					});
			});

			it("ACCEPT: asterisk in SKEY / COLUMNS: everything / ORDER: avg", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								IS: {
									courses_title: "software *"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"courses_avg",
									"courses_pass",
									"courses_fail",
									"courses_audit",
									"courses_year",
									"courses_dept",
									"courses_id",
									"courses_instructor",
									"courses_title",
									"courses_uuid"
								],
								ORDER: "courses_avg"
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{
								courses_avg: 80.87,
								courses_pass: 114,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 2015,
								courses_dept: "cpen",
								courses_id: "321",
								courses_instructor: "beznosov, konstantin",
								courses_title: "software enginrn",
								courses_uuid: "81218"
							},
							{
								courses_avg: 80.87,
								courses_pass: 114,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 1900,
								courses_dept: "cpen",
								courses_id: "321",
								courses_instructor: "",
								courses_title: "software enginrn",
								courses_uuid: "81219"
							},
							{
								courses_avg: 82.5,
								courses_pass: 6,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 2008,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "",
								courses_title: "software eng",
								courses_uuid: "52080"
							},
							{
								courses_avg: 82.5,
								courses_pass: 6,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 1900,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "",
								courses_title: "software eng",
								courses_uuid: "52081"
							},
							{
								courses_avg: 84.75,
								courses_pass: 16,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 2010,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "wohlstadter, eric",
								courses_title: "software eng",
								courses_uuid: "72438"
							},
							{
								courses_avg: 84.75,
								courses_pass: 16,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 1900,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "",
								courses_title: "software eng",
								courses_uuid: "72439"
							},
							{
								courses_avg: 85.92,
								courses_pass: 37,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 2015,
								courses_dept: "cpen",
								courses_id: "492",
								courses_instructor: "arefifar, seyed ali;botman, pieter;fels, s sidney;grecu, " +
									"cristian sorin;kruchten, philippe;lee, terry;lusina, paul;madden, " +
									"john;najarian, siamak;tang, shuo",
								courses_title: "software eng prj",
								courses_uuid: "81246"
							},
							{
								courses_avg: 85.92,
								courses_pass: 37,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 1900,
								courses_dept: "cpen",
								courses_id: "492",
								courses_instructor: "",
								courses_title: "software eng prj",
								courses_uuid: "81247"
							},
							{
								courses_avg: 89,
								courses_pass: 7,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 2015,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "holmes, reid",
								courses_title: "software eng",
								courses_uuid: "62458"
							},
							{
								courses_avg: 89,
								courses_pass: 7,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 1900,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "",
								courses_title: "software eng",
								courses_uuid: "62459"
							},
							{
								courses_avg: 89.17,
								courses_pass: 12,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 2011,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "wohlstadter, eric",
								courses_title: "software eng",
								courses_uuid: "61200"
							},
							{
								courses_avg: 89.17,
								courses_pass: 12,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 1900,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "",
								courses_title: "software eng",
								courses_uuid: "61201"
							},
							{
								courses_avg: 91.79,
								courses_pass: 19,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 2013,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "wohlstadter, eric",
								courses_title: "software eng",
								courses_uuid: "49966"
							},
							{
								courses_avg: 91.79,
								courses_pass: 19,
								courses_fail: 0,
								courses_audit: 0,
								courses_year: 1900,
								courses_dept: "cpsc",
								courses_id: "507",
								courses_instructor: "",
								courses_title: "software eng",
								courses_uuid: "49967"
							}
						]);
					});
			});

			it("ACCEPT: 2 asterisks (start+end) in SKEY / COLUMNS: title/uuid / ORDER: uuid", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								IS: {
									courses_title: "*mal physio*"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"courses_title",
									"courses_uuid"
								],
								ORDER: "courses_uuid"
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{
								courses_title: "animal physiol",
								courses_uuid: "18171"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "18172"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "19705"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "19706"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "20651"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "20652"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "28209"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "28210"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "34397"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "34398"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "42229"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "42230"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "48240"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "48241"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "54135"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "54136"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "55164"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "55165"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "72165"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "72166"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "86142"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "86143"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "87172"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "87173"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "87843"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "87844"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "89056"
							},
							{
								courses_title: "animal physiol",
								courses_uuid: "89057"
							}
						]);
					});
			});

			it("ACCEPT: emptystring SKEY", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE: {
								AND: [
									{
										IS: {
											courses_title: ""
										}
									},
									{
										GT: {
											courses_avg: 95
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"courses_dept",
									"courses_uuid"
								]
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{
								courses_dept: "cnps",
								courses_uuid: "70475"
							}
						]);
					});
			});

		});

		describe("C1 performQuery tests", function() {

			describe("SYNTAX CHECKS", function() {

				describe("checkOptions", function() {

					it("REJECT: no OPTIONS", function() {
						const id: string = "courses";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: invalid COLUMNS key", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: ["balls"]
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: invalid COLUMNS key among valid ones", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: ["courses3_avg", "courses3_dept", "poop"],
										ORDER: "courses3_uuid"
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: COLUMNS !== array", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: {}
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: empty COLUMNS", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: []
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: ORDER !== string", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: ["courses3_avg"],
										ORDER: []
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: invalid ORDER key", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: ["courses3_avg"],
										ORDER: "nuts"
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: unadded dataset in COLUMNS with an added one", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: [
											"courses3_avg",
											"awd_dept"],
										ORDER: "courses3_avg"
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: unadded datasets in COLUMNS (all)", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: [
											"awd_avg",
											"awd_dept"]
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: unadded dataset in ORDER", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: [
											"courses3_avg",
											"courses3_dept"],
										ORDER: "aaaaa_avg"
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: ORDER key not in COLUMNS", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: ["courses3_avg"],
										ORDER: "courses3_dept"
									}
								})
									.then(() => {
										expect.fail("should have rejected");
									})
									.catch((error: any) => {
										console.log(error.message);
										expect(error).to.be.an.instanceof(InsightError);
									});
							});
					});

					it("REJECT: references multiple added datasets in COLUMNS", function() {
						const id: string = "courses3";
						const id2: string = "courses4";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses)
									.then(() => {
										return insightFacade.performQuery({
											WHERE: {},
											OPTIONS: {
												COLUMNS: ["courses3_avg", "courses4_dept"],
												ORDER: "courses3_avg"
											}
										})
											.then(() => {
												expect.fail("should have rejected");
											})
											.catch((error: any) => {
												console.log(error.message);
												expect(error).to.be.an.instanceof(InsightError);
											});
									});
							});
					});

					it("REJECT: references multiple added datasets in COLUMNS", function() {
						const id: string = "courses3";
						const id2: string = "courses4";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses)
									.then(() => {
										return insightFacade.performQuery({
											WHERE: {},
											OPTIONS: {
												COLUMNS: ["courses3_avg"],
												ORDER: "courses4_dept"
											}
										})
											.then(() => {
												expect.fail("should have rejected");
											})
											.catch((error: any) => {
												console.log(error.message);
												expect(error).to.be.an.instanceof(InsightError);
											});
									});
							});
					});

					it("ACCEPT: ORDER key in COLUMNS", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {},
									OPTIONS: {
										COLUMNS: [
											"courses3_avg",
											"courses3_dept"],
										ORDER: "courses3_avg"
									}
								});
							});
					});

				});

				describe("checkWhere", function() {

					describe("WHERE", function() {

						it("REJECT: query !== object", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery([1, 2])
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid FILTER key", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											POOP: 0
										},
										OPTIONS: {
											COLUMNS: ["courses3_dept"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: >1 FILTER key", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses3_avg: 97
											},
											YEAH: "hi"
										},
										OPTIONS: {
											COLUMNS: [
												"courses3_dept",
												"courses3_id",
												"courses3_avg"
											],
											ORDER: "courses3_avg"
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: WHERE !== object", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: 123,
										OPTIONS: {
											COLUMNS: [
												"courses3_dept"
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: missing WHERE", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										OPTIONS: {
											COLUMNS: [
												"courses3_dept"
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

					});

					describe("LOGICCOMPARISON", function() {

						it("REJECT: LOGGICCOMPARISON !== array", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											AND: {
												hiiii: [0, 1]
											}
										}
										,
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: empty LOGICCOMPARISON", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											OR: []
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid FILTER in LOGICCOMPARISON", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											AND: [
												{
													WEAAA: {
														courses3_avg: 78
													}
												},
												{
													IS: {
														courses3_dept: "cpsc"
													}
												}
											]
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("ACCEPT: valid AND", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											AND: [
												{
													GT: {
														courses3_avg: 97
													}
												},
												{
													IS: {
														courses3_dept: "math"
													}
												}
											]
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									});
								});
						});

						it("ACCEPT: valid OR", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											OR: [
												{
													IS: {
														courses3_uuid: "727"
													}
												},
												{
													IS: {
														courses3_dept: "math"
													}
												}
											]
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									});
								});
						});

					});

					describe("MCOMPARISON", function() {

						it("REJECT: empty MCOMPARISON", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: 2+ MCOMPARISONs", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses3_avg: 20,
												courses3_pass: 34
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid MKEY (bad mfield)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses3_waaaa: 97
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid MKEY (bad id)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												weeee_avg: 97
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid MKEY value (non-number)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses3_pass: "90"
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("ACCEPT: valid GT", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses3_avg: 97
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									});
								});
						});

						it("ACCEPT: valid LT", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											LT: {
												courses3_avg: 97
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									});
								});
						});

						it("ACCEPT: valid EQ", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											EQ: {
												courses3_avg: 97
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									});
								});
						});

					});

					describe("SCOMPARISON", function() {

						it("REJECT: empty SCOMPARISON", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											IS: {}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: 2+ SCOMPARISON", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											IS: {
												courses3_uuid: "3141345",
												courses3_dept: "math"
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid SKEY (bad sfield)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											IS: {
												courses3_avg: "97"
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid SKEY (bad id)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											IS: {
												ba_uuid: "9123"
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid SKEY (non-string)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											IS: {
												courses3_title: 13
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("ACCEPT: valid SCOMPARISON", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											IS: {
												courses3_dept: "math"
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									});
								})
								.then((result: any[]) => {
									expect(result).to.have.deep.members([]);
								});
						});

					});

					describe("NEGATION", function() {

						it("REJECT: empty NEGATION", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											NOT: {}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: 2+ NEGATION", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											NOT: {
												LT: {
													courses3_avg: 20
												},
												IS: {
													courses3_dept: "cpsc"
												}
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("ACCEPT: valid NEGATION (NOT{LT})", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											NOT: {
												LT: {
													courses3_avg: 97
												}
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									});
								});
						});

						it("ACCEPT: valid NEGATION (NOT{AND[EQ, IS]})", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											NOT: {
												AND: [
													{
														EQ: {
															courses3_avg: 72
														}
													},
													{
														IS: {
															courses3_uuid: "0727"
														}
													}
												]
											}
										},
										OPTIONS: {
											COLUMNS: ["courses3_avg"]
										}
									});
								});
						});

					});

				});

				describe("General / other queries", function() {

					it("REJECT: references multiple datasets (AND)", function() {
						const id: string = "courses3";
						const id2: string = "courses4";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses)
									.then(() => {
										return insightFacade.performQuery({
											WHERE: {
												AND: [
													{
														GT: {
															courses3_avg: 97
														}
													},
													{
														IS: {
															courses4_dept: "math"
														}
													}
												]
											},
											OPTIONS:{
												COLUMNS:[
													"courses3_avg"
												]
											}
										})
											.then(() => {
												expect.fail("Should have rejected");
											})
											.catch((error: any) => {
												console.log(error.message);
												expect(error).to.be.an.instanceof(InsightError);
											});
									});
							});
					});

					it("REJECT: references multiple datasets (OR)", function() {
						const id: string = "courses3";
						const id2: string = "courses4";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses)
									.then(() => {
										return insightFacade.performQuery({
											WHERE: {
												OR: [
													{
														GT: {
															courses3_avg: 97
														}
													},
													{
														IS: {
															courses4_dept: "math"
														}
													}
												]
											},
											OPTIONS:{
												COLUMNS:[
													"courses3_avg"
												]
											}
										})
											.then(() => {
												expect.fail("Should have rejected");
											})
											.catch((error: any) => {
												console.log(error.message);
												expect(error).to.be.an.instanceof(InsightError);
											});
									});
							});
					});

					it("REJECT: references multiple datasets (NOT LT + COLUMNS)", function() {
						const id: string = "courses3";
						const id2: string = "courses4";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses)
									.then(() => {
										return insightFacade.performQuery({
											WHERE: {
												NOT: {
													LT: {
														courses4_avg: 96
													}
												}
											},
											OPTIONS:{
												COLUMNS:[
													"courses3_avg"
												]
											}
										})
											.then(() => {
												expect.fail("Should have rejected");
											})
											.catch((error: any) => {
												console.log(error.message);
												expect(error).to.be.an.instanceof(InsightError);
											});
									});
							});
					});

					it("REJECT: references multiple datasets (NOT GT + COLUMNS)", function() {
						const id: string = "courses3";
						const id2: string = "courses4";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses)
									.then(() => {
										return insightFacade.performQuery({
											WHERE: {
												NOT: {
													GT: {
														courses4_avg: 96
													}
												}
											},
											OPTIONS:{
												COLUMNS:[
													"courses3_avg"
												]
											}
										})
											.then(() => {
												expect.fail("Should have rejected");
											})
											.catch((error: any) => {
												console.log(error.message);
												expect(error).to.be.an.instanceof(InsightError);
											});
									});
							});
					});

					it("REJECT: references multiple datasets (NOT EQ + COLUMNS)", function() {
						const id: string = "courses3";
						const id2: string = "courses4";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.addDataset(id2, data[id2], InsightDatasetKind.Courses)
									.then(() => {
										return insightFacade.performQuery({
											WHERE: {
												NOT: {
													EQ: {
														courses4_avg: 96
													}
												}
											},
											OPTIONS:{
												COLUMNS:[
													"courses3_avg"
												]
											}
										})
											.then(() => {
												expect.fail("Should have rejected");
											})
											.catch((error: any) => {
												console.log(error.message);
												expect(error).to.be.an.instanceof(InsightError);
											});
									});
							});
					});

					it("ACCEPT: valid query (tree test)", function() {
						const id: string = "courses3";
						return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
							.then(() => {
								return insightFacade.performQuery({
									WHERE: {
										OR: [
											{
												AND: [
													{
														GT: {
															courses3_avg: 97
														}
													},
													{
														IS: {
															courses3_dept: "math"
														}
													}
												]
											},
											{
												EQ: {
													courses3_year: 2019
												}
											}
										]
									},
									OPTIONS: {
										COLUMNS: [
											"courses3_avg"
										],
										ORDER: "courses3_avg"
									}
								});
							});
					});

				});

			});

			// Doesn't work when InsightFacade fields are private, so they should be commented out before pushing to master
			describe("MOCK TESTS", function() {

				let facade: InsightFacade;

				beforeEach(function () {
					facade = new InsightFacade();
					facade.IDs = ["mockCourses", "mockCourses2"];
					facade.dataSets["mockCourses"] = [
						{
							mockCourses_title: "teach adult",
							mockCourses_id: "327",
							mockCourses_instructor: "",
							mockCourses_audit: 0,
							mockCourses_year: "2008",
							mockCourses_pass: 22,
							mockCourses_fail: 0,
							mockCourses_avg: 100,
							mockCourses_dept: "adhe",
							mockCourses_uuid: "8672"
						},
						{
							mockCourses_title: "hello",
							mockCourses_id: "327",
							mockCourses_instructor: "HI MOM",
							mockCourses_audit: 6,
							mockCourses_year: "2008",
							mockCourses_pass: 22,
							mockCourses_fail: 1,
							mockCourses_avg: 98,
							mockCourses_dept: "math",
							mockCourses_uuid: "12315"
						},
						{
							mockCourses_title: "uwu",
							mockCourses_id: "727",
							mockCourses_instructor: "ack",
							mockCourses_audit: 16,
							mockCourses_year: "2004",
							mockCourses_pass: 235,
							mockCourses_fail: 7,
							mockCourses_avg: 59,
							mockCourses_dept: "cpsc",
							mockCourses_uuid: "72727"
						},
						{
							mockCourses_title: "how to survive cpsc 310",
							mockCourses_id: "309",
							mockCourses_instructor: "gregor",
							mockCourses_audit: 1,
							mockCourses_year: "2008",
							mockCourses_pass: 0,
							mockCourses_fail: 800,
							mockCourses_avg: 85.64,
							mockCourses_dept: "cpsc",
							mockCourses_uuid: "98"
						}
					];
					facade.dataSets["mockCourses2"] = [
						{
							mockCourses2_title: "asdf",
							mockCourses2_id: "123",
							mockCourses2_instructor: "awed",
							mockCourses2_audit: 5,
							mockCourses2_year: "1900",
							mockCourses2_pass: 23,
							mockCourses2_fail: 5,
							mockCourses2_avg: 30,
							mockCourses2_dept: "math",
							mockCourses2_uuid: "123145"
						},
						{
							mockCourses2_title: "wdawdaawd",
							mockCourses2_id: "321",
							mockCourses2_instructor: "awd",
							mockCourses2_audit: 3,
							mockCourses2_year: "1999",
							mockCourses2_pass: 23,
							mockCourses2_fail: 5,
							mockCourses2_avg: 30,
							mockCourses2_dept: "abcz",
							mockCourses2_uuid: "6"
						},
						{
							mockCourses2_title: "AAAAA",
							mockCourses2_id: "400",
							mockCourses2_instructor: "IM GOING INSANE",
							mockCourses2_audit: 12,
							mockCourses2_year: "2021",
							mockCourses2_pass: 23,
							mockCourses2_fail: 5,
							mockCourses2_avg: 30,
							mockCourses2_dept: "acbz",
							mockCourses2_uuid: "512423"
						}
					];
					facade.insightDatasets = [
						{
							id: "mockCourses",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						},
						{
							id: "mockCourses2",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						}
					];
				});

				it("OR{GT, IS} + sort by avg", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								OR: [
									{
										GT: {
											mockCourses_avg: 85
										}
									},
									{
										IS: {
											mockCourses_dept: "adhe"
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"mockCourses_title",
									"mockCourses_uuid",
									"mockCourses_avg"
								],
								ORDER: "mockCourses_avg"
							}
						});
						expect(result.length).to.equal(3);
						expect(result).to.have.deep.members([
							{mockCourses_title: "teach adult", mockCourses_uuid: "8672", mockCourses_avg: 100},
							{mockCourses_title: "hello", mockCourses_uuid: "12315", mockCourses_avg: 98 },
							{mockCourses_title: "how to survive cpsc 310", mockCourses_uuid: "98",
								mockCourses_avg: 85.64}]);
						expect(result[0]).to.deep.equal(
							{mockCourses_title: "how to survive cpsc 310", mockCourses_uuid: "98",
								mockCourses_avg: 85.64});
						expect(result[1]).to.deep.equal(
							{mockCourses_title: "hello", mockCourses_uuid: "12315", mockCourses_avg: 98 });
						expect(result[2]).to.deep.equal(
							{mockCourses_title: "teach adult", mockCourses_uuid: "8672", mockCourses_avg: 100});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("empty WHERE + sort by dept", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"mockCourses2_dept",
									"mockCourses2_id",
									"mockCourses2_audit"
								],
								ORDER: "mockCourses2_dept"
							}
						});
						expect(result.length).to.equal(3);
						expect(result).to.have.deep.members([
							{mockCourses2_dept: "abcz", mockCourses2_id: "321", mockCourses2_audit: 3},
							{mockCourses2_dept: "acbz", mockCourses2_id: "400", mockCourses2_audit: 12},
							{mockCourses2_dept: "math", mockCourses2_id: "123", mockCourses2_audit: 5}
						]);
						expect(result[0]).to.deep.equal(
							{mockCourses2_dept: "abcz", mockCourses2_id: "321", mockCourses2_audit: 3});
						expect(result[1]).to.deep.equal(
							{mockCourses2_dept: "acbz", mockCourses2_id: "400", mockCourses2_audit: 12});
						expect(result[2]).to.deep.equal(
							{mockCourses2_dept: "math", mockCourses2_id: "123", mockCourses2_audit: 5});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("empty WHERE + sort by uuid", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"mockCourses2_uuid"
								],
								ORDER: "mockCourses2_uuid"
							}
						});
						expect(result.length).to.equal(3);
						expect(result).to.have.deep.members([
							{mockCourses2_uuid: "6"},
							{mockCourses2_uuid: "123145"},
							{mockCourses2_uuid: "512423"}
						]);
						expect(result[0]).to.deep.equal({mockCourses2_uuid: "123145"});
						expect(result[1]).to.deep.equal({mockCourses2_uuid: "512423"});
						expect(result[2]).to.deep.equal({mockCourses2_uuid: "6"});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("empty WHERE + empty ORDER", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"mockCourses_uuid"
								]
							}
						});
						expect(result.length).to.equal(4);
						expect(result).to.have.deep.members([
							{mockCourses_uuid: "8672"},
							{mockCourses_uuid: "12315"},
							{mockCourses_uuid: "72727"},
							{mockCourses_uuid: "98"},
						]);
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

			});

		});

		describe("C2 performQuery tests", function() {

			describe("SYNTAX CHECKS", function() {

				describe("checkTransforms", function() {

					describe("GROUP", function() {

						it("REJECT: missing GROUP", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											APPLY: []
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: empty GROUP", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [],
											APPLY: []
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: GROUP !== array", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: 3,
											APPLY: []
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid key in GROUP", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_title"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"awd"
											],
											APPLY: []
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: COLUMN keys not in GROUP", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_title"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_dept"
											],
											APPLY: []
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: COLUMN keys not in GROUP 2", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_id"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_dept",
												"courses3_avg",
												"courses3_uuid"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses_avg"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("ACCEPT: valid GROUP", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_title"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"courses3_dept"
											],
											APPLY: []
										}
									});
								});
						});

						it("ACCEPT: COLUMN keys in GROUP", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_dept"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_dept",
												"courses3_avg",
												"courses3_uuid"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses3_avg"
													}
												}
											]
										}
									});
								});
						});

					});

					describe("APPLY", function() {

						it("REJECT: APPLY !== array", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: 3
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: non-APPLYRULE objects in APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														COUNT: "courses3_title"
													}
												},
												3
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: empty object in APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid APPLYKEY in APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													reject_meeee: {
														COUNT: "courses3_title"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: non-object APPLYKEY value in APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: 3
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid APPLYTOKEN in APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														ASDF: "courses3_title"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid APPLYTOKEN value in APPLY (non-string)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														COUNT: []
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid APPLYTOKEN value in APPLY (COUNT, invalid key string)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														COUNT: "hiiiii"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid APPLYTOKEN value in APPLY (MIN, invalid key string)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														MIN: "hiiiii"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid APPLYTOKEN value in APPLY (MAX, skey)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														MAX: "courses3_uuid"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid APPLYTOKEN value in APPLY (AVG, skey)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														MAX: "courses3_avg"
													}
												},
												{
													asd: {
														AVG: "courses3_title"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: COLUMN keys not in APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_instructor",
												"courses3_avg",
												"werha"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_instructor",
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses_avg"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: COLUMN keys not in APPLY 2", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_instructor",
												"courses3_avg",
												"weeha",
												"asd"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_instructor",
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses3_avg"
													}
												},
												{
													hello: {
														SUM: "courses3_pass"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: unadded dataset in GROUP", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_title",
												"weeha"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"awd_dept"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses3_avg"
													}
												},
												{
													hello: {
														SUM: "courses3_pass"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: unadded dataset in APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_title",
												"weeha"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"courses3_dept"
											],
											APPLY: [
												{
													weeha: {
														AVG: "awd_avg"
													}
												},
												{
													hello: {
														SUM: "courses3_pass"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: unadded dataset in APPLY 2", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_title",
												"weeha"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"courses3_dept"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses3_avg"
													}
												},
												{
													hello: {
														SUM: "WEEEeeeee_pass"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: non-unique APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_title",
												"weeha"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"courses3_dept"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses3_avg"
													}
												},
												{
													weeha: {
														SUM: "courses3_pass"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: non-unique APPLY 2", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_title"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"courses3_dept"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses3_avg"
													}
												},
												{
													weeha: {
														AVG: "courses3_avg"
													}
												}
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: APPLYKEY in COLUMNS but no TRANSFORMATIONS", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_title",
												"courses3_avg",
												"cawdawdawd"
											]
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("ACCEPT: empty APPLY", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: []
										}
									});
								});
						});

						it("ACCEPT: valid APPLY (COUNT, skey)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														COUNT: "courses3_title"
													}
												}
											]
										}
									});
								});
						});

						it("ACCEPT: valid APPLY (COUNT, mkey)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														COUNT: "courses3_pass"
													}
												}
											]
										}
									});
								});
						});

						it("ACCEPT: valid APPLY (MIN, mkey)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														MIN: "courses3_avg"
													}
												}
											]
										}
									});
								});
						});

						it("ACCEPT: valid APPLY (SUM, mkey)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS:{
											COLUMNS:[
												"courses3_avg"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_avg"
											],
											APPLY: [
												{
													weeha: {
														SUM: "courses3_fail"
													}
												}
											]
										}
									});
								});
						});

						it("ACCEPT: valid APPLY (basic)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses3_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_title",
												"weeha"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"courses3_dept"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses3_avg"
													}
												},
												{
													hello: {
														SUM: "courses3_pass"
													}
												}
											]
										}
									});
								});
						});

						it("ACCEPT: valid APPLY (same applyrule)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {
											GT: {
												courses3_avg: 98
											}
										},
										OPTIONS:{
											COLUMNS:[
												"courses3_title",
												"hello",
												"weeha"
											]
										},
										TRANSFORMATIONS: {
											GROUP: [
												"courses3_title",
												"courses3_dept"
											],
											APPLY: [
												{
													weeha: {
														AVG: "courses3_avg"
													}
												},
												{
													hello: {
														AVG: "courses3_avg"
													}
												}
											]
										}
									});
								});
						});

					});

				});

				describe("checkOptions", function() {

					describe("ORDER", function() {

						it("REJECT: invalid ORDER key (number)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: 3
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: invalid ORDER key (bad solo keystring)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: "awd_3"
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: missing 'dir' key", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: {
												keys: [
													"courses3_avg"
												]
											}
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: missing 'keys' key", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: {
												dir: "UP"
											}
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: dir !== string", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: {
												dir: [],
												keys: [
													"courses3_avg"
												]
											}
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: ORDER keys !== array", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: {
												dir: "UP",
												keys: true
											}
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: empty keys in ORDER", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: {
												dir: "UP",
												keys: []
											}
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: ORDER keys not in COLUMNS", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: {
												dir: "UP",
												keys: [
													"courses3_dept"
												]
											}
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("REJECT: ORDER keys not in COLUMNS 2", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg",
												"courses3_dept",
												"courses3_id"
											],
											ORDER: {
												dir: "UP",
												keys: [
													"courses3_dept",
													"courses3_avg",
													"courses3_uuid"
												]
											}
										}
									})
										.then(() => {
											expect.fail("should have rejected");
										})
										.catch((error: any) => {
											console.log(error.message);
											expect(error).to.be.an.instanceof(InsightError);
										});
								});
						});

						it("ACCEPT: valid ORDER (DOWN, 1 key)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: {
												dir: "DOWN",
												keys: [
													"courses3_avg"
												]
											}
										}
									});
								});
						});

						it("ACCEPT: valid ORDER (UP, 2 keys)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg",
												"courses3_dept",
												"courses3_id"
											],
											ORDER: {
												dir: "UP",
												keys: [
													"courses3_avg",
													"courses3_id"
												]
											}
										}
									});
								});
						});

						it("ACCEPT: valid ORDER (basic key)", function() {
							const id: string = "courses3";
							return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
								.then(() => {
									return insightFacade.performQuery({
										WHERE: {},
										OPTIONS: {
											COLUMNS: [
												"courses3_avg"
											],
											ORDER: "courses3_avg"
										}
									});
								});
						});

					});

				});

			});

			describe("ROOMS", function() {

				it("GROUP: seats", function() {
					const id: string = "rooms";
					return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
						.then(() => {
							return insightFacade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"rooms_seats"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"rooms_seats"
									],
									APPLY: []
								}
							});
						})
						.then((result: any[]) => {
							expect(result).to.have.deep.members([
								{
									rooms_seats: 6
								},
								{
									rooms_seats: 7
								},
								{
									rooms_seats: 8
								},
								{
									rooms_seats: 10
								},
								{
									rooms_seats: 12
								},
								{
									rooms_seats: 14
								},
								{
									rooms_seats: 16
								},
								{
									rooms_seats: 18
								},
								{
									rooms_seats: 20
								},
								{
									rooms_seats: 21
								},
								{
									rooms_seats: 22
								},
								{
									rooms_seats: 24
								},
								{
									rooms_seats: 25
								},
								{
									rooms_seats: 26
								},
								{
									rooms_seats: 27
								},
								{
									rooms_seats: 28
								},
								{
									rooms_seats: 29
								},
								{
									rooms_seats: 30
								},
								{
									rooms_seats: 31
								},
								{
									rooms_seats: 32
								},
								{
									rooms_seats: 33
								},
								{
									rooms_seats: 34
								},
								{
									rooms_seats: 35
								},
								{
									rooms_seats: 36
								},
								{
									rooms_seats: 37
								},
								{
									rooms_seats: 38
								},
								{
									rooms_seats: 39
								},
								{
									rooms_seats: 40
								},
								{
									rooms_seats: 41
								},
								{
									rooms_seats: 42
								},
								{
									rooms_seats: 43
								},
								{
									rooms_seats: 44
								},
								{
									rooms_seats: 45
								},
								{
									rooms_seats: 47
								},
								{
									rooms_seats: 48
								},
								{
									rooms_seats: 50
								},
								{
									rooms_seats: 51
								},
								{
									rooms_seats: 53
								},
								{
									rooms_seats: 54
								},
								{
									rooms_seats: 55
								},
								{
									rooms_seats: 56
								},
								{
									rooms_seats: 58
								},
								{
									rooms_seats: 60
								},
								{
									rooms_seats: 62
								},
								{
									rooms_seats: 63
								},
								{
									rooms_seats: 65
								},
								{
									rooms_seats: 66
								},
								{
									rooms_seats: 68
								},
								{
									rooms_seats: 70
								},
								{
									rooms_seats: 72
								},
								{
									rooms_seats: 74
								},
								{
									rooms_seats: 75
								},
								{
									rooms_seats: 76
								},
								{
									rooms_seats: 78
								},
								{
									rooms_seats: 80
								},
								{
									rooms_seats: 84
								},
								{
									rooms_seats: 88
								},
								{
									rooms_seats: 90
								},
								{
									rooms_seats: 94
								},
								{
									rooms_seats: 99
								},
								{
									rooms_seats: 100
								},
								{
									rooms_seats: 102
								},
								{
									rooms_seats: 106
								},
								{
									rooms_seats: 108
								},
								{
									rooms_seats: 112
								},
								{
									rooms_seats: 114
								},
								{
									rooms_seats: 120
								},
								{
									rooms_seats: 123
								},
								{
									rooms_seats: 125
								},
								{
									rooms_seats: 131
								},
								{
									rooms_seats: 136
								},
								{
									rooms_seats: 144
								},
								{
									rooms_seats: 150
								},
								{
									rooms_seats: 154
								},
								{
									rooms_seats: 155
								},
								{
									rooms_seats: 160
								},
								{
									rooms_seats: 167
								},
								{
									rooms_seats: 181
								},
								{
									rooms_seats: 183
								},
								{
									rooms_seats: 187
								},
								{
									rooms_seats: 188
								},
								{
									rooms_seats: 190
								},
								{
									rooms_seats: 200
								},
								{
									rooms_seats: 205
								},
								{
									rooms_seats: 224
								},
								{
									rooms_seats: 225
								},
								{
									rooms_seats: 228
								},
								{
									rooms_seats: 236
								},
								{
									rooms_seats: 240
								},
								{
									rooms_seats: 250
								},
								{
									rooms_seats: 257
								},
								{
									rooms_seats: 260
								},
								{
									rooms_seats: 265
								},
								{
									rooms_seats: 275
								},
								{
									rooms_seats: 280
								},
								{
									rooms_seats: 299
								},
								{
									rooms_seats: 325
								},
								{
									rooms_seats: 350
								},
								{
									rooms_seats: 375
								},
								{
									rooms_seats: 426
								},
								{
									rooms_seats: 442
								},
								{
									rooms_seats: 503
								}
							]);
						});
				});

				it("WHERE: GT / ORDER: shortname", function() {
					const id: string = "rooms";
					return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
						.then(() => {
							return insightFacade.performQuery({
								WHERE: {
									GT: {
										rooms_lat: 49.269
									}
								},
								OPTIONS: {
									COLUMNS: [
										"rooms_fullname",
										"rooms_shortname",
										"rooms_number",
										"rooms_name",
										"rooms_address",
										"rooms_lat",
										"rooms_lon",
										"rooms_seats",
										"rooms_type",
										"rooms_furniture",
										"rooms_href"
									],
									ORDER: "rooms_shortname"
								}
							});
						})
						.then((result: any[]) => {
							expect(result).to.have.deep.members([
								{
									rooms_fullname: "Allard Hall (LAW)",
									rooms_shortname: "ALRD",
									rooms_number: "105",
									rooms_name: "ALRD_105",
									rooms_address: "1822 East Mall",
									rooms_lat: 49.2699,
									rooms_lon: -123.25318,
									rooms_seats: 94,
									rooms_type: "Case Style",
									rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ALRD-105"
								},
								{
									rooms_fullname: "Allard Hall (LAW)",
									rooms_shortname: "ALRD",
									rooms_number: "112",
									rooms_name: "ALRD_112",
									rooms_address: "1822 East Mall",
									rooms_lat: 49.2699,
									rooms_lon: -123.25318,
									rooms_seats: 20,
									rooms_type: "Open Design General Purpose",
									rooms_furniture: "Classroom-Movable Tables & Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ALRD-112"
								},
								{
									rooms_fullname: "Allard Hall (LAW)",
									rooms_shortname: "ALRD",
									rooms_number: "113",
									rooms_name: "ALRD_113",
									rooms_address: "1822 East Mall",
									rooms_lat: 49.2699,
									rooms_lon: -123.25318,
									rooms_seats: 20,
									rooms_type: "Open Design General Purpose",
									rooms_furniture: "Classroom-Movable Tables & Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ALRD-113"
								},
								{
									rooms_fullname: "Allard Hall (LAW)",
									rooms_shortname: "ALRD",
									rooms_number: "121",
									rooms_name: "ALRD_121",
									rooms_address: "1822 East Mall",
									rooms_lat: 49.2699,
									rooms_lon: -123.25318,
									rooms_seats: 50,
									rooms_type: "Case Style",
									rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ALRD-121"
								},
								{
									rooms_fullname: "Allard Hall (LAW)",
									rooms_shortname: "ALRD",
									rooms_number: "B101",
									rooms_name: "ALRD_B101",
									rooms_address: "1822 East Mall",
									rooms_lat: 49.2699,
									rooms_lon: -123.25318,
									rooms_seats: 44,
									rooms_type: "Open Design General Purpose",
									rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ALRD-B101"
								},
								{
									rooms_fullname: "Anthropology and Sociology",
									rooms_shortname: "ANSO",
									rooms_number: "202",
									rooms_name: "ANSO_202",
									rooms_address: "6303 North West Marine Drive",
									rooms_lat: 49.26958,
									rooms_lon: -123.25741,
									rooms_seats: 26,
									rooms_type: "Small Group",
									rooms_furniture: "Classroom-Movable Tables & Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ANSO-202"
								},
								{
									rooms_fullname: "Anthropology and Sociology",
									rooms_shortname: "ANSO",
									rooms_number: "203",
									rooms_name: "ANSO_203",
									rooms_address: "6303 North West Marine Drive",
									rooms_lat: 49.26958,
									rooms_lon: -123.25741,
									rooms_seats: 33,
									rooms_type: "Small Group",
									rooms_furniture: "Classroom-Moveable Tables & Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ANSO-203"
								},
								{
									rooms_fullname: "Anthropology and Sociology",
									rooms_shortname: "ANSO",
									rooms_number: "205",
									rooms_name: "ANSO_205",
									rooms_address: "6303 North West Marine Drive",
									rooms_lat: 49.26958,
									rooms_lon: -123.25741,
									rooms_seats: 37,
									rooms_type: "Small Group",
									rooms_furniture: "Classroom-Moveable Tables & Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ANSO-205"
								},
								{
									rooms_fullname: "Anthropology and Sociology",
									rooms_shortname: "ANSO",
									rooms_number: "207",
									rooms_name: "ANSO_207",
									rooms_address: "6303 North West Marine Drive",
									rooms_lat: 49.26958,
									rooms_lon: -123.25741,
									rooms_seats: 90,
									rooms_type: "Open Design General Purpose",
									rooms_furniture: "Classroom-Moveable Tablets",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/ANSO-207"
								},
								{
									rooms_fullname: "Iona Building",
									rooms_shortname: "IONA",
									rooms_number: "301",
									rooms_name: "IONA_301",
									rooms_address: "6000 Iona Drive",
									rooms_lat: 49.27106,
									rooms_lon: -123.25042,
									rooms_seats: 100,
									rooms_type: "Case Style",
									rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/IONA-301"
								},
								{
									rooms_fullname: "Iona Building",
									rooms_shortname: "IONA",
									rooms_number: "633",
									rooms_name: "IONA_633",
									rooms_address: "6000 Iona Drive",
									rooms_lat: 49.27106,
									rooms_lon: -123.25042,
									rooms_seats: 50,
									rooms_type: "Open Design General Purpose",
									rooms_furniture: "Classroom-Movable Tables & Chairs",
									rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
										"room/IONA-633"
								}
							]);
							expect(result[0]).to.deep.equal({
								rooms_fullname: "Allard Hall (LAW)",
								rooms_shortname: "ALRD",
								rooms_number: "105",
								rooms_name: "ALRD_105",
								rooms_address: "1822 East Mall",
								rooms_lat: 49.2699,
								rooms_lon: -123.25318,
								rooms_seats: 94,
								rooms_type: "Case Style",
								rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
								rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
									"room/ALRD-105"
							});
							expect(result[6]).to.deep.equal({
								rooms_fullname: "Anthropology and Sociology",
								rooms_shortname: "ANSO",
								rooms_number: "203",
								rooms_name: "ANSO_203",
								rooms_address: "6303 North West Marine Drive",
								rooms_lat: 49.26958,
								rooms_lon: -123.25741,
								rooms_seats: 33,
								rooms_type: "Small Group",
								rooms_furniture: "Classroom-Moveable Tables & Chairs",
								rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
									"room/ANSO-203"
							});
							expect(result[10]).to.deep.equal({
								rooms_fullname: "Iona Building",
								rooms_shortname: "IONA",
								rooms_number: "633",
								rooms_name: "IONA_633",
								rooms_address: "6000 Iona Drive",
								rooms_lat: 49.27106,
								rooms_lon: -123.25042,
								rooms_seats: 50,
								rooms_type: "Open Design General Purpose",
								rooms_furniture: "Classroom-Movable Tables & Chairs",
								rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
									"room/IONA-633"
							});
						});
				});

				it("WHERE: GT / ORDER: dir=up, keys=[number, addr] / GROUP: number+name+address / " +
					"APPLY: some LAT, LON, SEATS", function() {

					const id: string = "rooms";
					return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
						.then(() => {
							return insightFacade.performQuery({
								WHERE: {
									GT: {
										rooms_lat: 49.269
									}
								},
								OPTIONS: {
									COLUMNS: [
										"rooms_number",
										"rooms_name",
										"rooms_address",
										"maxLon",
										"minLat",
										"avgSeats",
										"countLon",
										"sumLat"
									],
									ORDER: {
										dir: "UP",
										keys: [
											"rooms_number",
											"rooms_address"
										]
									}
								},
								TRANSFORMATIONS: {
									GROUP: [
										"rooms_number",
										"rooms_name",
										"rooms_address"
									],
									APPLY: [
										{
											maxLon: {
												MAX: "rooms_lon"
											}
										},
										{
											minLat: {
												MIN: "rooms_lat"
											}
										},
										{
											avgSeats: {
												AVG: "rooms_seats"
											}
										},
										{
											countLon: {
												COUNT: "rooms_lon"
											}
										},
										{
											sumLat: {
												SUM: "rooms_lat"
											}
										}
									]
								}
							});
						})
						.then((result: any[]) => {
							expect(result).to.have.deep.members([
								{
									rooms_number: "105",
									rooms_name: "ALRD_105",
									rooms_address: "1822 East Mall",
									maxLon: -123.25318,
									minLat: 49.2699,
									avgSeats: 94,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "112",
									rooms_name: "ALRD_112",
									rooms_address: "1822 East Mall",
									maxLon: -123.25318,
									minLat: 49.2699,
									avgSeats: 20,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "113",
									rooms_name: "ALRD_113",
									rooms_address: "1822 East Mall",
									maxLon: -123.25318,
									minLat: 49.2699,
									avgSeats: 20,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "121",
									rooms_name: "ALRD_121",
									rooms_address: "1822 East Mall",
									maxLon: -123.25318,
									minLat: 49.2699,
									avgSeats: 50,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "202",
									rooms_name: "ANSO_202",
									rooms_address: "6303 North West Marine Drive",
									maxLon: -123.25741,
									minLat: 49.26958,
									avgSeats: 26,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "203",
									rooms_name: "ANSO_203",
									rooms_address: "6303 North West Marine Drive",
									maxLon: -123.25741,
									minLat: 49.26958,
									avgSeats: 33,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "205",
									rooms_name: "ANSO_205",
									rooms_address: "6303 North West Marine Drive",
									maxLon: -123.25741,
									minLat: 49.26958,
									avgSeats: 37,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "207",
									rooms_name: "ANSO_207",
									rooms_address: "6303 North West Marine Drive",
									maxLon: -123.25741,
									minLat: 49.26958,
									avgSeats: 90,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "301",
									rooms_name: "IONA_301",
									rooms_address: "6000 Iona Drive",
									maxLon: -123.25042,
									minLat: 49.27106,
									avgSeats: 100,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "633",
									rooms_name: "IONA_633",
									rooms_address: "6000 Iona Drive",
									maxLon: -123.25042,
									minLat: 49.27106,
									avgSeats: 50,
									countLon: 1,
									sumLat: 49.27
								},
								{
									rooms_number: "B101",
									rooms_name: "ALRD_B101",
									rooms_address: "1822 East Mall",
									maxLon: -123.25318,
									minLat: 49.2699,
									avgSeats: 44,
									countLon: 1,
									sumLat: 49.27
								}
							]);
							expect(result[0]).to.deep.equal({
								rooms_number: "105",
								rooms_name: "ALRD_105",
								rooms_address: "1822 East Mall",
								maxLon: -123.25318,
								minLat: 49.2699,
								avgSeats: 94,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[1]).to.deep.equal({
								rooms_number: "112",
								rooms_name: "ALRD_112",
								rooms_address: "1822 East Mall",
								maxLon: -123.25318,
								minLat: 49.2699,
								avgSeats: 20,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[2]).to.deep.equal({
								rooms_number: "113",
								rooms_name: "ALRD_113",
								rooms_address: "1822 East Mall",
								maxLon: -123.25318,
								minLat: 49.2699,
								avgSeats: 20,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[3]).to.deep.equal({
								rooms_number: "121",
								rooms_name: "ALRD_121",
								rooms_address: "1822 East Mall",
								maxLon: -123.25318,
								minLat: 49.2699,
								avgSeats: 50,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[4]).to.deep.equal({
								rooms_number: "202",
								rooms_name: "ANSO_202",
								rooms_address: "6303 North West Marine Drive",
								maxLon: -123.25741,
								minLat: 49.26958,
								avgSeats: 26,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[5]).to.deep.equal({
								rooms_number: "203",
								rooms_name: "ANSO_203",
								rooms_address: "6303 North West Marine Drive",
								maxLon: -123.25741,
								minLat: 49.26958,
								avgSeats: 33,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[6]).to.deep.equal({
								rooms_number: "205",
								rooms_name: "ANSO_205",
								rooms_address: "6303 North West Marine Drive",
								maxLon: -123.25741,
								minLat: 49.26958,
								avgSeats: 37,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[7]).to.deep.equal({
								rooms_number: "207",
								rooms_name: "ANSO_207",
								rooms_address: "6303 North West Marine Drive",
								maxLon: -123.25741,
								minLat: 49.26958,
								avgSeats: 90,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[8]).to.deep.equal({
								rooms_number: "301",
								rooms_name: "IONA_301",
								rooms_address: "6000 Iona Drive",
								maxLon: -123.25042,
								minLat: 49.27106,
								avgSeats: 100,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[9]).to.deep.equal({
								rooms_number: "633",
								rooms_name: "IONA_633",
								rooms_address: "6000 Iona Drive",
								maxLon: -123.25042,
								minLat: 49.27106,
								avgSeats: 50,
								countLon: 1,
								sumLat: 49.27
							});
							expect(result[10]).to.deep.equal({
								rooms_number: "B101",
								rooms_name: "ALRD_B101",
								rooms_address: "1822 East Mall",
								maxLon: -123.25318,
								minLat: 49.2699,
								avgSeats: 44,
								countLon: 1,
								sumLat: 49.27
							});
						});
				});

				it("C2 spec example", function() {
					const id: string = "rooms";
					return insightFacade.addDataset(id, data[id], InsightDatasetKind.Rooms)
						.then(() => {
							return insightFacade.performQuery({
								WHERE: {
									AND: [{
										IS: {
											rooms_furniture: "*Tables*"
										}
									}, {
										GT: {
											rooms_seats: 300
										}
									}]
								},
								OPTIONS: {
									COLUMNS: [
										"rooms_shortname",
										"maxSeats"
									],
									ORDER: {
										dir: "DOWN",
										keys: ["maxSeats"]
									}
								},
								TRANSFORMATIONS: {
									GROUP: ["rooms_shortname"],
									APPLY: [{
										maxSeats: {
											MAX: "rooms_seats"
										}
									}]
								}
							});
						})
						.then((result: any[]) => {
							console.log(result);
							expect(result).to.have.deep.members([
								{
									rooms_shortname: "OSBO",
									maxSeats: 442
								},
								{
									rooms_shortname: "HEBB",
									maxSeats: 375
								},
								{
									rooms_shortname: "LSC",
									maxSeats: 350
								}
							]);
							expect(result[0]).to.deep.equal({
								rooms_shortname: "OSBO",
								maxSeats: 442
							});
							expect(result[1]).to.deep.equal({
								rooms_shortname: "HEBB",
								maxSeats: 375
							});
							expect(result[2]).to.deep.equal({
								rooms_shortname: "LSC",
								maxSeats: 350
							});
						});
				});

			});

			// Doesn't work when InsightFacade fields are private, so they should be commented out before pushing to master
			describe("MOCK TESTS", function() {

				describe("310/210 example from C2 spec", function() {

					let facade: InsightFacade;

					beforeEach(function() {
						facade = new InsightFacade();
						facade.IDs = ["mockers"];
						facade.dataSets["mockers"] = [
							{ mockers_title: "310", mockers_id: "0", mockers_instructor: "Jean", mockers_audit: 0,
								mockers_year: "0", mockers_pass: 0, mockers_fail: 0, mockers_avg: 90, mockers_dept: "",
								mockers_uuid: "1"},
							{ mockers_title: "310", mockers_id: "0", mockers_instructor: "Jean", mockers_audit: 0,
								mockers_year: "0", mockers_pass: 0, mockers_fail: 0, mockers_avg: 80, mockers_dept: "",
								mockers_uuid: "2"},
							{ mockers_title: "310", mockers_id: "0", mockers_instructor: "Casey", mockers_audit: 0,
								mockers_year: "0", mockers_pass: 0, mockers_fail: 0, mockers_avg: 95, mockers_dept: "",
								mockers_uuid: "3"},
							{ mockers_title: "310", mockers_id: "0", mockers_instructor: "Casey", mockers_audit: 0,
								mockers_year: "0", mockers_pass: 0, mockers_fail: 0, mockers_avg: 85, mockers_dept: "",
								mockers_uuid: "4"},
							{ mockers_title: "210", mockers_id: "0", mockers_instructor: "Kelly", mockers_audit: 0,
								mockers_year: "0", mockers_pass: 0, mockers_fail: 0, mockers_avg: 74, mockers_dept: "",
								mockers_uuid: "5"},
							{ mockers_title: "210", mockers_id: "0", mockers_instructor: "Kelly", mockers_audit: 0,
								mockers_year: "0", mockers_pass: 0, mockers_fail: 0, mockers_avg: 78, mockers_dept: "",
								mockers_uuid: "6"},
							{ mockers_title: "210", mockers_id: "0", mockers_instructor: "Kelly", mockers_audit: 0,
								mockers_year: "0", mockers_pass: 0, mockers_fail: 0, mockers_avg: 72, mockers_dept: "",
								mockers_uuid: "7"},
							{ mockers_title: "210", mockers_id: "0", mockers_instructor: "Eli", mockers_audit: 0,
								mockers_year: "0", mockers_pass: 0, mockers_fail: 0, mockers_avg: 85, mockers_dept: "",
								mockers_uuid: "8"}
						];
						facade.insightDatasets = [
							{
								id: "mockers",
								kind: InsightDatasetKind.Courses,
								numRows: 1
							}
						];
					});

					it("GROUP: title+instructor / APPLY: empty", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_title",
										"mockers_instructor"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_title",
										"mockers_instructor"
									],
									APPLY: []
								}
							});
							expect(result.length).to.equal(4);
							expect(result).to.have.deep.members([
								{mockers_title: "310", mockers_instructor: "Jean"},
								{mockers_title: "310", mockers_instructor: "Casey"},
								{mockers_title: "210", mockers_instructor: "Kelly"},
								{mockers_title: "210", mockers_instructor: "Eli"}
							]);
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("GROUP: title+instructor / APPLY: everything AVG", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_title",
										"mockers_instructor",
										"maxAvg",
										"minAvg",
										"avgAvg",
										"countAvg",
										"sumAvg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_title",
										"mockers_instructor"
									],
									APPLY: [
										{
											maxAvg: {
												MAX: "mockers_avg"
											}
										},
										{
											minAvg: {
												MIN: "mockers_avg"
											}
										},
										{
											avgAvg: {
												AVG: "mockers_avg"
											}
										},
										{
											countAvg: {
												COUNT: "mockers_avg"
											}
										},
										{
											sumAvg: {
												SUM: "mockers_avg"
											}
										}
									]
								}
							});
							expect(result.length).to.equal(4);
							expect(result).to.have.deep.members([
								{mockers_title: "310", mockers_instructor: "Jean",
									maxAvg: 90, minAvg: 80, avgAvg: 85, countAvg: 2, sumAvg: 170},
								{mockers_title: "310", mockers_instructor: "Casey",
									maxAvg: 95, minAvg: 85, avgAvg: 90, countAvg: 2, sumAvg: 180},
								{mockers_title: "210", mockers_instructor: "Kelly",
									maxAvg: 78, minAvg: 72, avgAvg: 74.67, countAvg: 3, sumAvg: 224},
								{mockers_title: "210", mockers_instructor: "Eli",
									maxAvg: 85, minAvg: 85, avgAvg: 85, countAvg: 1, sumAvg: 85},
							]);
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("GROUP: avg / APPLY: empty", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_avg"
									],
									APPLY: []
								}
							});

							expect(result.length).to.equal(7);
							expect(result).to.have.deep.members([
								{mockers_avg: 90},
								{mockers_avg: 80},
								{mockers_avg: 95},
								{mockers_avg: 85},
								{mockers_avg: 74},
								{mockers_avg: 78},
								{mockers_avg: 72}
							]);

						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("GROUP: title / APPLY: weeha/AVG/avg", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_title",
										"weeha"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_title"
									],
									APPLY: [
										{
											weeha: {
												AVG: "mockers_avg"
											}
										}
									]
								}
							});

							expect(result.length).to.equal(2);
							expect(result).to.have.deep.members([
								{mockers_title: "310", weeha: 87.5},
								{mockers_title: "210", weeha: 77.25}
							]);

						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ORDER: UP+overallAvg / GROUP: title+instructor / APPLY: overallAvg", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_title",
										"mockers_instructor",
										"overallAvg"
									],
									ORDER: {
										dir: "UP",
										keys: [
											"overallAvg"
										]
									}
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_title",
										"mockers_instructor"
									],
									APPLY: [
										{
											overallAvg: {
												AVG: "mockers_avg"
											}
										}
									]
								}
							});

							expect(result.length).to.equal(4);
							expect(result).to.have.deep.members([
								{mockers_title: "310", mockers_instructor: "Jean", overallAvg: 85},
								{mockers_title: "310", mockers_instructor: "Casey", overallAvg: 90},
								{mockers_title: "210", mockers_instructor: "Kelly", overallAvg: 74.67},
								{mockers_title: "210", mockers_instructor: "Eli", overallAvg: 85},
							]);
							expect(result[0]).to.deep.equal(
								{mockers_title: "210", mockers_instructor: "Kelly", overallAvg: 74.67});
							expect(result[3]).to.deep.equal(
								{mockers_title: "310", mockers_instructor: "Casey", overallAvg: 90});

						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ORDER: DOWN+avg / GROUP: uuid+avg / APPLY: none", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_uuid",
										"mockers_avg"
									],
									ORDER: {
										dir: "DOWN",
										keys: [
											"mockers_avg"
										]
									}
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_uuid",
										"mockers_avg"
									],
									APPLY: []
								}
							});

							expect(result.length).to.equal(8);
							expect(result).to.have.deep.members([
								{mockers_uuid: "1", mockers_avg: 90},
								{mockers_uuid: "2", mockers_avg: 80},
								{mockers_uuid: "3", mockers_avg: 95},
								{mockers_uuid: "4", mockers_avg: 85},
								{mockers_uuid: "5", mockers_avg: 74},
								{mockers_uuid: "6", mockers_avg: 78},
								{mockers_uuid: "7", mockers_avg: 72},
								{mockers_uuid: "8", mockers_avg: 85},
							]);
							expect(result[0]).to.deep.equal(
								{mockers_uuid: "3", mockers_avg: 95});
							expect(result[1]).to.deep.equal(
								{mockers_uuid: "1", mockers_avg: 90});
							expect(result[4]).to.deep.equal(
								{mockers_uuid: "2", mockers_avg: 80});
							expect(result[5]).to.deep.equal(
								{mockers_uuid: "6", mockers_avg: 78});
							expect(result[6]).to.deep.equal(
								{mockers_uuid: "5", mockers_avg: 74});
							expect(result[7]).to.deep.equal(
								{mockers_uuid: "7", mockers_avg: 72});

						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ORDER: DOWN+title,avg / GROUP: uuid+avg / APPLY: none", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_uuid",
										"mockers_title",
										"mockers_avg"
									],
									ORDER: {
										dir: "DOWN",
										keys: [
											"mockers_title",
											"mockers_avg"
										]
									}
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_uuid",
										"mockers_title",
										"mockers_avg"
									],
									APPLY: []
								}
							});

							expect(result.length).to.equal(8);
							expect(result).to.have.deep.members([
								{mockers_uuid: "3", mockers_title: "310", mockers_avg: 95},
								{mockers_uuid: "1", mockers_title: "310", mockers_avg: 90},
								{mockers_uuid: "4", mockers_title: "310", mockers_avg: 85},
								{mockers_uuid: "2", mockers_title: "310", mockers_avg: 80},
								{mockers_uuid: "8", mockers_title: "210", mockers_avg: 85},
								{mockers_uuid: "6", mockers_title: "210", mockers_avg: 78},
								{mockers_uuid: "5", mockers_title: "210", mockers_avg: 74},
								{mockers_uuid: "7", mockers_title: "210", mockers_avg: 72}
							]);
							expect(result[0]).to.deep.equal(
								{mockers_uuid: "3", mockers_title: "310", mockers_avg: 95});
							expect(result[1]).to.deep.equal(
								{mockers_uuid: "1", mockers_title: "310", mockers_avg: 90});
							expect(result[2]).to.deep.equal(
								{mockers_uuid: "4", mockers_title: "310", mockers_avg: 85});
							expect(result[3]).to.deep.equal(
								{mockers_uuid: "2", mockers_title: "310", mockers_avg: 80});
							expect(result[4]).to.deep.equal(
								{mockers_uuid: "8", mockers_title: "210", mockers_avg: 85});
							expect(result[5]).to.deep.equal(
								{mockers_uuid: "6", mockers_title: "210", mockers_avg: 78});
							expect(result[6]).to.deep.equal(
								{mockers_uuid: "5", mockers_title: "210", mockers_avg: 74});
							expect(result[7]).to.deep.equal(
								{mockers_uuid: "7", mockers_title: "210", mockers_avg: 72});

						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ORDER: sumAvg / GROUP: uuid+avg / APPLY: sumAvg", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_uuid",
										"mockers_avg",
										"sumAvg"
									],
									ORDER: "sumAvg"
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_uuid",
										"mockers_avg"
									],
									APPLY: [
										{
											sumAvg: {
												SUM: "mockers_avg"
											}
										}
									]
								}
							});

							expect(result.length).to.equal(8);
							expect(result).to.have.deep.members([
								{mockers_uuid: "1", mockers_avg: 90, sumAvg: 90},
								{mockers_uuid: "2", mockers_avg: 80, sumAvg: 80},
								{mockers_uuid: "3", mockers_avg: 95, sumAvg: 95},
								{mockers_uuid: "4", mockers_avg: 85, sumAvg: 85},
								{mockers_uuid: "5", mockers_avg: 74, sumAvg: 74},
								{mockers_uuid: "6", mockers_avg: 78, sumAvg: 78},
								{mockers_uuid: "7", mockers_avg: 72, sumAvg: 72},
								{mockers_uuid: "8", mockers_avg: 85, sumAvg: 85},
							]);
							expect(result[0]).to.deep.equal(
								{mockers_uuid: "7", mockers_avg: 72, sumAvg: 72});
							expect(result[1]).to.deep.equal(
								{mockers_uuid: "5", mockers_avg: 74, sumAvg: 74});
							expect(result[2]).to.deep.equal(
								{mockers_uuid: "6", mockers_avg: 78, sumAvg: 78});
							expect(result[3]).to.deep.equal(
								{mockers_uuid: "2", mockers_avg: 80, sumAvg: 80});
							expect(result[6]).to.deep.equal(
								{mockers_uuid: "1", mockers_avg: 90, sumAvg: 90});
							expect(result[7]).to.deep.equal(
								{mockers_uuid: "3", mockers_avg: 95, sumAvg: 95});

						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ORDER: DOWN+title,avg / no TRANSFORMS", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"mockers_title",
										"mockers_avg"
									],
									ORDER: {
										dir: "DOWN",
										keys: [
											"mockers_title",
											"mockers_avg"
										]
									}
								}
							});

							expect(result.length).to.equal(8);
							expect(result).to.have.deep.members([
								{mockers_title: "310", mockers_avg: 90},
								{mockers_title: "310", mockers_avg: 80},
								{mockers_title: "310", mockers_avg: 95},
								{mockers_title: "310", mockers_avg: 85},
								{mockers_title: "210", mockers_avg: 74},
								{mockers_title: "210", mockers_avg: 78},
								{mockers_title: "210", mockers_avg: 72},
								{mockers_title: "210", mockers_avg: 85}
							]);
							expect(result[0]).to.deep.equal(
								{mockers_title: "310", mockers_avg: 95});
							expect(result[1]).to.deep.equal(
								{mockers_title: "310", mockers_avg: 90});
							expect(result[2]).to.deep.equal(
								{mockers_title: "310", mockers_avg: 85});
							expect(result[3]).to.deep.equal(
								{mockers_title: "310", mockers_avg: 80});
							expect(result[4]).to.deep.equal(
								{mockers_title: "210", mockers_avg: 85});
							expect(result[5]).to.deep.equal(
								{mockers_title: "210", mockers_avg: 78});
							expect(result[6]).to.deep.equal(
								{mockers_title: "210", mockers_avg: 74});
							expect(result[7]).to.deep.equal(
								{mockers_title: "210", mockers_avg: 72});

						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("WHERE: IS{title='310'} / GROUP: instructor / APPLY: countUuid", async function() {
						try {
							const result = await facade.performQuery({
								WHERE: {
									IS: {
										mockers_title: "310"
									}
								},
								OPTIONS: {
									COLUMNS: [
										"mockers_instructor",
										"countUuid"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"mockers_instructor"
									],
									APPLY: [
										{
											countUuid: {
												COUNT: "mockers_uuid"
											}
										}
									]
								}
							});

							expect(result.length).to.equal(2);
							expect(result).to.have.deep.members([
								{mockers_instructor: "Jean", countUuid: 2},
								{mockers_instructor: "Casey", countUuid: 2}
							]);

						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

				});

			});

		});

		describe("other performQuery tests", function() {

			it("calling performQuery twice", function() {
				const id: string = "courses";
				return insightFacade.addDataset(id, data[id], InsightDatasetKind.Courses)
					.then(() => {
						return insightFacade.performQuery({
							WHERE:{
								GT:{
									courses_avg:97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"courses_dept",
									"courses_avg"
								],
								ORDER:"courses_avg"
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{ courses_dept: "epse", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.09 },
							{ courses_dept: "epse", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.25 },
							{ courses_dept: "math", courses_avg: 97.25 },
							{ courses_dept: "epse", courses_avg: 97.29 },
							{ courses_dept: "epse", courses_avg: 97.29 },
							{ courses_dept: "nurs", courses_avg: 97.33 },
							{ courses_dept: "nurs", courses_avg: 97.33 },
							{ courses_dept: "epse", courses_avg: 97.41 },
							{ courses_dept: "epse", courses_avg: 97.41 },
							{ courses_dept: "cnps", courses_avg: 97.47 },
							{ courses_dept: "cnps", courses_avg: 97.47 },
							{ courses_dept: "math", courses_avg: 97.48 },
							{ courses_dept: "math", courses_avg: 97.48 },
							{ courses_dept: "educ", courses_avg: 97.5 },
							{ courses_dept: "nurs", courses_avg: 97.53 },
							{ courses_dept: "nurs", courses_avg: 97.53 },
							{ courses_dept: "epse", courses_avg: 97.67 },
							{ courses_dept: "epse", courses_avg: 97.69 },
							{ courses_dept: "epse", courses_avg: 97.78 },
							{ courses_dept: "crwr", courses_avg: 98 },
							{ courses_dept: "crwr", courses_avg: 98 },
							{ courses_dept: "epse", courses_avg: 98.08 },
							{ courses_dept: "nurs", courses_avg: 98.21 },
							{ courses_dept: "nurs", courses_avg: 98.21 },
							{ courses_dept: "epse", courses_avg: 98.36 },
							{ courses_dept: "epse", courses_avg: 98.45 },
							{ courses_dept: "epse", courses_avg: 98.45 },
							{ courses_dept: "nurs", courses_avg: 98.5 },
							{ courses_dept: "nurs", courses_avg: 98.5 },
							{ courses_dept: "epse", courses_avg: 98.58 },
							{ courses_dept: "nurs", courses_avg: 98.58 },
							{ courses_dept: "nurs", courses_avg: 98.58 },
							{ courses_dept: "epse", courses_avg: 98.58 },
							{ courses_dept: "epse", courses_avg: 98.7 },
							{ courses_dept: "nurs", courses_avg: 98.71 },
							{ courses_dept: "nurs", courses_avg: 98.71 },
							{ courses_dept: "eece", courses_avg: 98.75 },
							{ courses_dept: "eece", courses_avg: 98.75 },
							{ courses_dept: "epse", courses_avg: 98.76 },
							{ courses_dept: "epse", courses_avg: 98.76 },
							{ courses_dept: "epse", courses_avg: 98.8 },
							{ courses_dept: "spph", courses_avg: 98.98 },
							{ courses_dept: "spph", courses_avg: 98.98 },
							{ courses_dept: "cnps", courses_avg: 99.19 },
							{ courses_dept: "math", courses_avg: 99.78 },
							{ courses_dept: "math", courses_avg: 99.78 }
						]);
					})
					.then(() => {
						return insightFacade.performQuery({
							WHERE:{
								GT:{
									courses_avg:97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"courses_dept",
									"courses_avg"
								],
								ORDER:"courses_avg"
							}
						});
					})
					.then((result: any[]) => {
						expect(result).to.have.deep.members([
							{ courses_dept: "epse", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.09 },
							{ courses_dept: "epse", courses_avg: 97.09 },
							{ courses_dept: "math", courses_avg: 97.25 },
							{ courses_dept: "math", courses_avg: 97.25 },
							{ courses_dept: "epse", courses_avg: 97.29 },
							{ courses_dept: "epse", courses_avg: 97.29 },
							{ courses_dept: "nurs", courses_avg: 97.33 },
							{ courses_dept: "nurs", courses_avg: 97.33 },
							{ courses_dept: "epse", courses_avg: 97.41 },
							{ courses_dept: "epse", courses_avg: 97.41 },
							{ courses_dept: "cnps", courses_avg: 97.47 },
							{ courses_dept: "cnps", courses_avg: 97.47 },
							{ courses_dept: "math", courses_avg: 97.48 },
							{ courses_dept: "math", courses_avg: 97.48 },
							{ courses_dept: "educ", courses_avg: 97.5 },
							{ courses_dept: "nurs", courses_avg: 97.53 },
							{ courses_dept: "nurs", courses_avg: 97.53 },
							{ courses_dept: "epse", courses_avg: 97.67 },
							{ courses_dept: "epse", courses_avg: 97.69 },
							{ courses_dept: "epse", courses_avg: 97.78 },
							{ courses_dept: "crwr", courses_avg: 98 },
							{ courses_dept: "crwr", courses_avg: 98 },
							{ courses_dept: "epse", courses_avg: 98.08 },
							{ courses_dept: "nurs", courses_avg: 98.21 },
							{ courses_dept: "nurs", courses_avg: 98.21 },
							{ courses_dept: "epse", courses_avg: 98.36 },
							{ courses_dept: "epse", courses_avg: 98.45 },
							{ courses_dept: "epse", courses_avg: 98.45 },
							{ courses_dept: "nurs", courses_avg: 98.5 },
							{ courses_dept: "nurs", courses_avg: 98.5 },
							{ courses_dept: "epse", courses_avg: 98.58 },
							{ courses_dept: "nurs", courses_avg: 98.58 },
							{ courses_dept: "nurs", courses_avg: 98.58 },
							{ courses_dept: "epse", courses_avg: 98.58 },
							{ courses_dept: "epse", courses_avg: 98.7 },
							{ courses_dept: "nurs", courses_avg: 98.71 },
							{ courses_dept: "nurs", courses_avg: 98.71 },
							{ courses_dept: "eece", courses_avg: 98.75 },
							{ courses_dept: "eece", courses_avg: 98.75 },
							{ courses_dept: "epse", courses_avg: 98.76 },
							{ courses_dept: "epse", courses_avg: 98.76 },
							{ courses_dept: "epse", courses_avg: 98.8 },
							{ courses_dept: "spph", courses_avg: 98.98 },
							{ courses_dept: "spph", courses_avg: 98.98 },
							{ courses_dept: "cnps", courses_avg: 99.19 },
							{ courses_dept: "math", courses_avg: 99.78 },
							{ courses_dept: "math", courses_avg: 99.78 }
						]);
					});
			});

		});

	});

});
