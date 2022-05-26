import {expect} from "chai";
import InsightFacade from "../../src/controller/InsightFacade";
import {InsightDatasetKind, InsightError} from "../../src/controller/IInsightFacade";

const fs = require("fs-extra");

// Code taken from https://piazza.com/class/ksp6ri5b6017ev?cid=142
function getFileContent(path: string): string {
	return fs.readFileSync(path).toString("base64");
}
/**
 * Wipes all state of InsightFacade
 * Meant to be used between tests
 */
function clearDatasets(): void {
	fs.removeSync("./data");
}

// relies on InsightFacade having public IDs, dataSets, insightDatasets, so it should be commented before pushing to master

describe("performQuery", function() {

	let facade: InsightFacade;

	let courses0: string;
	let courses1: string;
	let courses2: string;
	let courses3: string;

	before(function () {
		courses0 = getFileContent("test/resources/archives/courses_main.zip");
		courses1 = getFileContent("test/resources/archives/courses_smaller.zip");
		courses2 = getFileContent("test/resources/archives/courses_invalid_name.zip");
		courses3 = getFileContent("test/resources/archives/courses_invalid_name_2.zip");
	});

	describe("C1 tests", function() {

		describe("SYNTAX CHECKS", function() {

			describe("checkOptions", function() {

				beforeEach(function () {
					clearDatasets();
					facade = new InsightFacade();
					facade.IDs = ["CHANGEME", "CHANGEME2"];
					facade.dataSets["CHANGEME"] = [
						{
							CHANGEME_title: "teach adult",
							CHANGEME_id: "327",
							CHANGEME_instructor: "",
							CHANGEME_audit: 0,
							CHANGEME_year: "2008",
							CHANGEME_pass: 22,
							CHANGEME_fail: 0,
							CHANGEME_avg: 85.64,
							CHANGEME_dept: "adhe",
							CHANGEME_uuid: "8672"
						}
					];
					facade.dataSets["CHANGEME2"] = [
						{
							CHANGEME2_title: "asdf",
							CHANGEME2_id: "123",
							CHANGEME2_instructor: "awed",
							CHANGEME2_audit: 3,
							CHANGEME2_year: "1900",
							CHANGEME2_pass: 23,
							CHANGEME2_fail: 5,
							CHANGEME2_avg: 30,
							CHANGEME2_dept: "math",
							CHANGEME2_uuid: "12348"
						}
					];
					facade.insightDatasets = [
						{
							id: "CHANGEME",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						},
						{
							id: "CHANGEME2",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						}
					];
				});

				it("REJECT query w/o OPTIONS", async function() {
					try {
						await facade.performQuery({
							WHERE: {}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with bad COLUMNS key", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: ["balls"]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with bad COLUMNS key 2", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: ["CHANGEME_avg", "CHANGEME_dept", "poop"],
								ORDER: "CHANGEME_uuid"
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with columns != an array", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: {}
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with empty columns", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: []
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with order != string", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: ["CHANGEME_avg"],
								ORDER: []
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with bad ORDER key", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: ["CHANGEME_avg"],
								ORDER: "nuts"
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with unadded dataset in COLUMNS", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_avg",
									"awd_dept"],
								ORDER: "CHANGEME_avg"
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with unadded dataset in COLUMNS 2", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"awd_avg",
									"awd_dept"]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with unadded dataset in ORDER", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_avg",
									"CHANGEME_dept"],
								ORDER: "aaaaa_avg"
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with ORDER key not in COLUMNS", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: ["CHANGEME_avg"],
								ORDER: "CHANGEME_dept"
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query referencing multiple datasets in COLUMNS", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: ["CHANGEME_avg", "CHANGEME2_dept"],
								ORDER: "CHANGEME_avg"
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query referencing multiple datasets in COLUMNS, ORDER", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: ["CHANGEME_avg"],
								ORDER: "CHANGEME2_dept"
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("ACCEPT query with good ORDER key", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_avg",
									"CHANGEME_dept"],
								ORDER: "CHANGEME_avg"
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

			});

			describe("checkWhere", function() {

				beforeEach(function () {
					clearDatasets();
					facade = new InsightFacade();
					facade.IDs = ["CHANGEME", "CHANGEME2"];
					facade.dataSets["CHANGEME"] = [
						{
							CHANGEME_title: "teach adult",
							CHANGEME_id: "327",
							CHANGEME_instructor: "",
							CHANGEME_audit: 0,
							CHANGEME_year: "2008",
							CHANGEME_pass: 22,
							CHANGEME_fail: 0,
							CHANGEME_avg: 85.64,
							CHANGEME_dept: "adhe",
							CHANGEME_uuid: "8672"
						}
					];
					facade.dataSets["CHANGEME2"] = [
						{
							CHANGEME2_title: "asdf",
							CHANGEME2_id: "123",
							CHANGEME2_instructor: "awed",
							CHANGEME2_audit: 3,
							CHANGEME2_year: "1900",
							CHANGEME2_pass: 23,
							CHANGEME2_fail: 5,
							CHANGEME2_avg: 30,
							CHANGEME2_dept: "math",
							CHANGEME2_uuid: "12348"
						}
					];
					facade.insightDatasets = [
						{
							id: "CHANGEME",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						},
						{
							id: "CHANGEME2",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						}
					];
				});

				describe("WHERE", function() {

					it("REJECT query !== object", async function () {
						try {
							await facade.performQuery([1, 2]);
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with bad FILTER key", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									POOP: 0
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_dept"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with >1 FILTER key", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										CHANGEME_avg: 97
									},
									YEAH: "hi"
								},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_dept",
										"CHANGEME_id",
										"CHANGEME_avg"
									],
									ORDER: "CHANGEME_avg"
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with WHERE !== object", async function () {
						try {
							await facade.performQuery({
								WHERE: 123,
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_dept"
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with no WHERE", async function () {
						try {
							await facade.performQuery({
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_dept"
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});
				});

				describe("LOGICCOMPARISON", function() {

					it("REJECT query with LOGICCOMPARISON != array", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									AND: {
										hiiii: [0, 1]
									}
								}
								,
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with empty LOGICCOMPARISON", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									OR: []
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with invalid FILTER in LOGICCOMPARISON", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									AND: [
										{
											WEAAA: {
												CHANGEME_avg: 78
											}
										},
										{
											IS: {
												CHANGEME_dept: "cpsc"
											}
										}
									]
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("ACCEPT query with good LOGICCOMPARISON (AND)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									AND: [
										{
											GT: {
												CHANGEME_avg: 97
											}
										},
										{
											IS: {
												CHANGEME_dept: "math"
											}
										}
									]
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT query with good LOGICCOMPARISON (OR)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									OR: [
										{
											IS: {
												CHANGEME_uuid: "727"
											}
										},
										{
											IS: {
												CHANGEME_dept: "math"
											}
										}
									]
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT query with >2 objects in LOGICCOMPARISON", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									OR: [
										{
											GT: {
												CHANGEME_avg: 97
											}
										},
										{
											IS: {
												CHANGEME_dept: "math"
											}
										},
										{
											IS: {
												CHANGEME_uuid: "6"
											}
										}
									]
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

				});

				describe("MCOMPARISON", function() {

					it("REJECT query with empty MCOMPARISON", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with 2+ MCOMPARISON", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										CHANGEME_avg: 20,
										CHANGEME_pass: 34
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with bad MKEY (mfield)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										CHANGEME_waaaa: 97
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with bad MKEY (id)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										weeee_avg: 97
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with bad MKEY value (non-number)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										CHANGEME_pass: "90"
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("ACCEPT query with good MCOMPARISON (GT)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										CHANGEME_avg: 97
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT query with good MCOMPARISON (LT)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									LT: {
										CHANGEME_avg: 97
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT query with good MCOMPARISON (EQ)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									EQ: {
										CHANGEME_avg: 97
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});
				});

				describe("SCOMPARISON", function() {

					it("REJECT query with empty SCOMPARISON", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									IS: {}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with 2+ SCOMPARISON", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									IS: {
										CHANGEME_uuid: "3141345",
										CHANGEME_dept: "math"
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with bad SKEY (sfield)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									IS: {
										CHANGEME_avg: "97"
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with bad SKEY (id)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									IS: {
										ba_uuid: "9123"
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with bad SKEY value (non-string)", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									IS: {
										CHANGEME_title: 13
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("ACCEPT query with good SCOMPARISON", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									IS: {
										CHANGEME_dept: "math"
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});
				});

				describe("NEGATION", function() {

					it("REJECT query with empty NEGATION", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									NOT: {}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT query with 2+ NEGATION", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									NOT: {
										LT: {
											CHANGEME_avg: 20
										},
										IS: {
											CHANGEME_dept: "cpsc"
										}
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("ACCEPT query with good NEGATION (NOT{LT})", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									NOT: {
										LT: {
											CHANGEME_avg: 97
										}
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT query with good NEGATION (NOT{AND[EQ, IS]})", async function () {
						try {
							await facade.performQuery({
								WHERE: {
									NOT: {
										AND: [
											{
												EQ: {
													CHANGEME_avg: 72
												}
											},
											{
												IS: {
													CHANGEME_uuid: "0727"
												}
											}
										]
									}
								},
								OPTIONS: {
									COLUMNS: ["CHANGEME_avg"]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});
				});

			});

			describe("General / other queries", function() {

				beforeEach(function () {
					clearDatasets();
					facade = new InsightFacade();
					facade.IDs = ["CHANGEME", "CHANGEME2"];
					facade.dataSets["CHANGEME"] = [
						{
							CHANGEME_title: "teach adult",
							CHANGEME_id: "327",
							CHANGEME_instructor: "",
							CHANGEME_audit: 0,
							CHANGEME_year: "2008",
							CHANGEME_pass: 22,
							CHANGEME_fail: 0,
							CHANGEME_avg: 100,
							CHANGEME_dept: "adhe",
							CHANGEME_uuid: "8672"
						},
						{
							CHANGEME_title: "hello",
							CHANGEME_id: "327",
							CHANGEME_instructor: "HI MOM",
							CHANGEME_audit: 6,
							CHANGEME_year: "2008",
							CHANGEME_pass: 22,
							CHANGEME_fail: 1,
							CHANGEME_avg: 98,
							CHANGEME_dept: "math",
							CHANGEME_uuid: "12315"
						},
						{
							CHANGEME_title: "uwu",
							CHANGEME_id: "727",
							CHANGEME_instructor: "ack",
							CHANGEME_audit: 16,
							CHANGEME_year: "2004",
							CHANGEME_pass: 235,
							CHANGEME_fail: 7,
							CHANGEME_avg: 59,
							CHANGEME_dept: "cpsc",
							CHANGEME_uuid: "72727"
						},
						{
							CHANGEME_title: "how to survive cpsc 310",
							CHANGEME_id: "309",
							CHANGEME_instructor: "gregor",
							CHANGEME_audit: 1,
							CHANGEME_year: "2008",
							CHANGEME_pass: 0,
							CHANGEME_fail: 800,
							CHANGEME_avg: 85.64,
							CHANGEME_dept: "cpsc",
							CHANGEME_uuid: "98"
						}
					];
					facade.dataSets["CHANGEME2"] = [
						{
							CHANGEME2_title: "asdf",
							CHANGEME2_id: "123",
							CHANGEME2_instructor: "awed",
							CHANGEME2_audit: 5,
							CHANGEME2_year: "1900",
							CHANGEME2_pass: 23,
							CHANGEME2_fail: 5,
							CHANGEME2_avg: 30,
							CHANGEME2_dept: "math",
							CHANGEME2_uuid: "123145"
						},
						{
							CHANGEME2_title: "wdawdaawd",
							CHANGEME2_id: "321",
							CHANGEME2_instructor: "awd",
							CHANGEME2_audit: 3,
							CHANGEME2_year: "1999",
							CHANGEME2_pass: 23,
							CHANGEME2_fail: 5,
							CHANGEME2_avg: 30,
							CHANGEME2_dept: "abcz",
							CHANGEME2_uuid: "6"
						},
						{
							CHANGEME2_title: "AAAAA",
							CHANGEME2_id: "400",
							CHANGEME2_instructor: "IM GOING INSANE",
							CHANGEME2_audit: 12,
							CHANGEME2_year: "2021",
							CHANGEME2_pass: 23,
							CHANGEME2_fail: 5,
							CHANGEME2_avg: 30,
							CHANGEME2_dept: "acbz",
							CHANGEME2_uuid: "512423"
						}
					];
					facade.insightDatasets = [
						{
							id: "CHANGEME",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						},
						{
							id: "CHANGEME2",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						}
					];
				});

				it("REJECT query referencing multiple datasets (AND)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								AND: [
									{
										GT: {
											CHANGEME_avg: 97
										}
									},
									{
										IS: {
											CHANGEME2_dept: "math"
										}
									}
								]
							},
							OPTIONS:{
								COLUMNS:[
									"CHANGEME_avg"
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query referencing multiple datasets (OR)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								OR: [
									{
										GT: {
											CHANGEME_avg: 97
										}
									},
									{
										IS: {
											CHANGEME2_dept: "math"
										}
									}
								]
							},
							OPTIONS:{
								COLUMNS:[
									"CHANGEME_avg"
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query referencing multiple datasets (NOT LT + COLUMNS)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								NOT: {
									LT: {
										CHANGEME2_avg: 96
									}
								}
							},
							OPTIONS:{
								COLUMNS:[
									"CHANGEME_avg"
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query referencing multiple datasets (NOT GT + COLUMNS)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								NOT: {
									GT: {
										CHANGEME2_avg: 30
									}
								}
							},
							OPTIONS:{
								COLUMNS:[
									"CHANGEME_avg"
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query referencing multiple datasets (NOT EQ + COLUMNS)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								NOT: {
									EQ: {
										CHANGEME2_year: 2020
									}
								}
							},
							OPTIONS:{
								COLUMNS:[
									"CHANGEME_avg"
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query referencing multiple datasets (NOT IS + COLUMNS)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								NOT: {
									IS: {
										CHANGEME2_dept: "math"
									}
								}
							},
							OPTIONS:{
								COLUMNS:[
									"CHANGEME_avg"
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT query with asterisk in middle of inputstring", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								IS: {
									CHANGEME_title: "reject me***e*e**ee"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_avg"
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("ACCEPT valid query (simple spec example)", async function() {
					try {
						await facade.performQuery({
							WHERE:{
								GT:{
									CHANGEME_avg: 97
								}
							},
							OPTIONS:{
								COLUMNS:[
									"CHANGEME_dept",
									"CHANGEME_avg"
								],
								ORDER:"CHANGEME_avg"
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("ACCEPT valid query (complex spec example)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								OR: [
									{
										AND: [
											{
												GT: {
													CHANGEME2_avg: 90
												}
											},
											{
												IS: {
													CHANGEME2_dept: "adhe"
												}
											}
										]
									},
									{
										EQ: {
											CHANGEME2_avg: 95
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME2_dept",
									"CHANGEME2_id",
									"CHANGEME2_avg"
								],
								ORDER: "CHANGEME2_avg"
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("ACCEPT valid query (mcomparator gigaquery)", async function() {
					try {
						await facade.performQuery({
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
																	CHANGEME_year: 2000
																}
															},
															{
																NOT: {
																	EQ: {
																		CHANGEME_year: 2019
																	}
																}
															}
														]
													},
													{
														LT: {
															CHANGEME_audit: 2
														}
													}
												]
											},
											{
												GT: {
													CHANGEME_pass: 800
												}
											}
										]
									},
									{
										AND: [
											{
												GT: {
													CHANGEME_year: 2000
												}
											},
											{
												GT: {
													CHANGEME_avg: 99
												}
											}
										]
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_fail",
									"CHANGEME_dept",
									"CHANGEME_id",
									"CHANGEME_instructor",
									"CHANGEME_title",
									"CHANGEME_uuid"
								],
								ORDER: "CHANGEME_fail"
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("ACCEPT valid query (scomparator gigaquery)", async function() {
					try {
						await facade.performQuery({
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
																	CHANGEME_dept: "swed"
																}
															},
															{
																IS: {
																	CHANGEME_id: "127"
																}
															}
														]
													},
													{
														IS: {
															CHANGEME_instructor: "bohnet, adam"
														}
													}
												]
											},
											{
												IS: {
													CHANGEME_title: "clas poet tang"
												}
											}
										]
									},
									{
										IS: {
											CHANGEME_uuid: "23188"
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_dept",
									"CHANGEME_id",
									"CHANGEME_instructor",
									"CHANGEME_title",
									"CHANGEME_uuid"
								],
								ORDER: "CHANGEME_uuid"
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("ACCEPT query with asterisk at end of inpustring", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								IS: {
									CHANGEME_title: "software *"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_avg",
									"CHANGEME_pass",
									"CHANGEME_fail",
									"CHANGEME_audit",
									"CHANGEME_year",
									"CHANGEME_dept",
									"CHANGEME_id",
									"CHANGEME_instructor",
									"CHANGEME_title",
									"CHANGEME_uuid"
								],
								ORDER: "CHANGEME_avg"
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("ACCEPT query with 2 asterisks at start, end of inpustring", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								IS: {
									CHANGEME_title: "*mal physio*"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_title",
									"CHANGEME_uuid"
								],
								ORDER: "CHANGEME_uuid"
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("ACCEPT valid query (tree test)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								OR: [
									{
										AND: [
											{
												GT: {
													CHANGEME_avg: 97
												}
											},
											{
												IS: {
													CHANGEME_dept: "math"
												}
											}
										]
									},
									{
										EQ: {
											CHANGEME_year: 2019
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_avg"
								],
								ORDER: "CHANGEME_avg"
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

			});

		});

		describe("MOCK TESTS", function() {

			beforeEach(function () {
				clearDatasets();
				facade = new InsightFacade();
				facade.IDs = ["CHANGEME", "CHANGEME2"];
				facade.dataSets["CHANGEME"] = [
					{
						CHANGEME_title: "teach adult",
						CHANGEME_id: "327",
						CHANGEME_instructor: "",
						CHANGEME_audit: 0,
						CHANGEME_year: "2008",
						CHANGEME_pass: 22,
						CHANGEME_fail: 0,
						CHANGEME_avg: 100,
						CHANGEME_dept: "adhe",
						CHANGEME_uuid: "8672"
					},
					{
						CHANGEME_title: "hello",
						CHANGEME_id: "327",
						CHANGEME_instructor: "HI MOM",
						CHANGEME_audit: 6,
						CHANGEME_year: "2008",
						CHANGEME_pass: 22,
						CHANGEME_fail: 1,
						CHANGEME_avg: 98,
						CHANGEME_dept: "math",
						CHANGEME_uuid: "12315"
					},
					{
						CHANGEME_title: "uwu",
						CHANGEME_id: "727",
						CHANGEME_instructor: "ack",
						CHANGEME_audit: 16,
						CHANGEME_year: "2004",
						CHANGEME_pass: 235,
						CHANGEME_fail: 7,
						CHANGEME_avg: 59,
						CHANGEME_dept: "cpsc",
						CHANGEME_uuid: "72727"
					},
					{
						CHANGEME_title: "how to survive cpsc 310",
						CHANGEME_id: "309",
						CHANGEME_instructor: "gregor",
						CHANGEME_audit: 1,
						CHANGEME_year: "2008",
						CHANGEME_pass: 0,
						CHANGEME_fail: 800,
						CHANGEME_avg: 85.64,
						CHANGEME_dept: "cpsc",
						CHANGEME_uuid: "98"
					}
				];
				facade.dataSets["CHANGEME2"] = [
					{
						CHANGEME2_title: "asdf",
						CHANGEME2_id: "123",
						CHANGEME2_instructor: "awed",
						CHANGEME2_audit: 5,
						CHANGEME2_year: "1900",
						CHANGEME2_pass: 23,
						CHANGEME2_fail: 5,
						CHANGEME2_avg: 30,
						CHANGEME2_dept: "math",
						CHANGEME2_uuid: "123145"
					},
					{
						CHANGEME2_title: "wdawdaawd",
						CHANGEME2_id: "321",
						CHANGEME2_instructor: "awd",
						CHANGEME2_audit: 3,
						CHANGEME2_year: "1999",
						CHANGEME2_pass: 23,
						CHANGEME2_fail: 5,
						CHANGEME2_avg: 30,
						CHANGEME2_dept: "abcz",
						CHANGEME2_uuid: "6"
					},
					{
						CHANGEME2_title: "AAAAA",
						CHANGEME2_id: "400",
						CHANGEME2_instructor: "IM GOING INSANE",
						CHANGEME2_audit: 12,
						CHANGEME2_year: "2021",
						CHANGEME2_pass: 23,
						CHANGEME2_fail: 5,
						CHANGEME2_avg: 30,
						CHANGEME2_dept: "acbz",
						CHANGEME2_uuid: "512423"
					}
				];
				facade.insightDatasets = [
					{
						id: "CHANGEME",
						kind: InsightDatasetKind.Courses,
						numRows: 1
					},
					{
						id: "CHANGEME2",
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
										CHANGEME_avg: 85
									}
								},
								{
									IS: {
										CHANGEME_dept: "adhe"
									}
								}
							]
						},
						OPTIONS: {
							COLUMNS: [
								"CHANGEME_title",
								"CHANGEME_uuid",
								"CHANGEME_avg"
							],
							ORDER: "CHANGEME_avg"
						}
					});
					for (let course of result) {
						console.log(course);
					}
					expect(result.length).to.equal(3);
					expect(result).to.have.deep.members([
						{CHANGEME_title: "teach adult", CHANGEME_uuid: "8672", CHANGEME_avg: 100},
						{CHANGEME_title: "hello", CHANGEME_uuid: "12315", CHANGEME_avg: 98 },
						{CHANGEME_title: "how to survive cpsc 310", CHANGEME_uuid: "98", CHANGEME_avg: 85.64}
					]);
					expect(result[0]).to.deep.equal(
						{CHANGEME_title: "how to survive cpsc 310", CHANGEME_uuid: "98", CHANGEME_avg: 85.64});
					expect(result[1]).to.deep.equal(
						{CHANGEME_title: "hello", CHANGEME_uuid: "12315", CHANGEME_avg: 98 });
					expect(result[2]).to.deep.equal(
						{CHANGEME_title: "teach adult", CHANGEME_uuid: "8672", CHANGEME_avg: 100});
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
								"CHANGEME2_dept",
								"CHANGEME2_id",
								"CHANGEME2_audit"
							],
							ORDER: "CHANGEME2_dept"
						}
					});
					for (let course of result) {
						console.log(course);
					}
					expect(result.length).to.equal(3);
					expect(result).to.have.deep.members([
						{CHANGEME2_dept: "abcz", CHANGEME2_id: "321", CHANGEME2_audit: 3},
						{CHANGEME2_dept: "acbz", CHANGEME2_id: "400", CHANGEME2_audit: 12},
						{CHANGEME2_dept: "math", CHANGEME2_id: "123", CHANGEME2_audit: 5}
					]);
					expect(result[0]).to.deep.equal(
						{CHANGEME2_dept: "abcz", CHANGEME2_id: "321", CHANGEME2_audit: 3});
					expect(result[1]).to.deep.equal(
						{CHANGEME2_dept: "acbz", CHANGEME2_id: "400", CHANGEME2_audit: 12});
					expect(result[2]).to.deep.equal(
						{CHANGEME2_dept: "math", CHANGEME2_id: "123", CHANGEME2_audit: 5});
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
								"CHANGEME2_uuid"
							],
							ORDER: "CHANGEME2_uuid"
						}
					});
					for (let course of result) {
						console.log(course);
					}
					expect(result.length).to.equal(3);
					expect(result).to.have.deep.members([
						{CHANGEME2_uuid: "6"},
						{CHANGEME2_uuid: "123145"},
						{CHANGEME2_uuid: "512423"}
					]);
					expect(result[0]).to.deep.equal({CHANGEME2_uuid: "123145"});
					expect(result[1]).to.deep.equal({CHANGEME2_uuid: "512423"});
					expect(result[2]).to.deep.equal({CHANGEME2_uuid: "6"});
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
								"CHANGEME_uuid"
							]
						}
					});
					for (let course of result) {
						console.log(course);
					}
					expect(result.length).to.equal(4);
					expect(result).to.have.deep.members([
						{CHANGEME_uuid: "8672"},
						{CHANGEME_uuid: "12315"},
						{CHANGEME_uuid: "72727"},
						{CHANGEME_uuid: "98"},
					]);
				} catch (error) {
					console.log(error);
					expect.fail("should have accepted");
				}
			});

		});

	});

	describe("C2 tests", function() {

		describe("SYNTAX CHECKS", function() {

			describe("checkTransforms", function() {

				beforeEach(function () {
					clearDatasets();
					facade = new InsightFacade();
					facade.IDs = ["CHANGEME", "CHANGEME2"];
					facade.dataSets["CHANGEME"] = [
						{
							CHANGEME_title: "teach adult",
							CHANGEME_id: "327",
							CHANGEME_instructor: "",
							CHANGEME_audit: 0,
							CHANGEME_year: "2008",
							CHANGEME_pass: 22,
							CHANGEME_fail: 0,
							CHANGEME_avg: 85.64,
							CHANGEME_dept: "adhe",
							CHANGEME_uuid: "8672"
						}
					];
					facade.dataSets["CHANGEME2"] = [
						{
							CHANGEME2_title: "asdf",
							CHANGEME2_id: "123",
							CHANGEME2_instructor: "awed",
							CHANGEME2_audit: 3,
							CHANGEME2_year: "1900",
							CHANGEME2_pass: 23,
							CHANGEME2_fail: 5,
							CHANGEME2_avg: 30,
							CHANGEME2_dept: "math",
							CHANGEME2_uuid: "12348"
						}
					];
					facade.insightDatasets = [
						{
							id: "CHANGEME",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						},
						{
							id: "CHANGEME2",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						}
					];
				});

				describe("GROUP", function() {

					it("REJECT: missing GROUP", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									APPLY: []
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: empty GROUP", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [],
									APPLY: []
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: GROUP !== array", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: 3,
									APPLY: []
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid key in GROUP", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"awd"
									],
									APPLY: []
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: COLUMN keys not in GROUP", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_dept"
									],
									APPLY: []
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: COLUMN keys not in GROUP 2", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_id"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_dept",
										"CHANGEME_avg",
										"CHANGEME_uuid"
									],
									APPLY: [
										{
											weeha: {
												AVG: "courses_avg"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("ACCEPT: valid GROUP", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"CHANGEME_dept"
									],
									APPLY: []
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: COLUMN keys in GROUP", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_dept"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_dept",
										"CHANGEME_avg",
										"CHANGEME_uuid"
									],
									APPLY: [
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										}
									]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});
				});

				describe("APPLY", function() {

					it("REJECT: APPLY !== array", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: 3
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: non-APPLYRULE objects in APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												COUNT: "CHANGEME_title"
											}
										},
										3
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: empty object in APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid APPLYKEY in APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											reject_meeee: {
												COUNT: "CHANGEME_title"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: non-object APPLYKEY value in APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: 3
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid APPLYTOKEN in APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												ASDF: "CHANGEME_title"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid APPLYTOKEN value in APPLY (non-string)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												COUNT: []
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid APPLYTOKEN value in APPLY (COUNT, invalid key string)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												COUNT: "hiiiii"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid APPLYTOKEN value in APPLY (MIN, invalid key string)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												MIN: "hiiiii"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid APPLYTOKEN value in APPLY (MAX, skey)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												MAX: "CHANGEME_uuid"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid APPLYTOKEN value in APPLY (AVG, skey)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												MAX: "CHANGEME_avg"
											}
										},
										{
											asd: {
												AVG: "CHANGEME_title"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: COLUMN keys not in APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										courses_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_instructor",
										"CHANGEME_avg",
										"werha"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_instructor",
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												AVG: "courses_avg"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: COLUMN keys not in APPLY 2", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										courses_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_instructor",
										"CHANGEME_avg",
										"weeha",
										"asd"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_instructor",
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										},
										{
											hello: {
												SUM: "CHANGEME_pass"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: unadded dataset in GROUP", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										courses_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title",
										"weeha"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"awd_dept"
									],
									APPLY: [
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										},
										{
											hello: {
												SUM: "CHANGEME_pass"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: unadded dataset in APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										courses_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title",
										"weeha"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"CHANGEME_dept"
									],
									APPLY: [
										{
											weeha: {
												AVG: "awd_avg"
											}
										},
										{
											hello: {
												SUM: "CHANGEME_pass"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: unadded dataset in APPLY 2", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										courses_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title",
										"weeha"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"CHANGEME_dept"
									],
									APPLY: [
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										},
										{
											hello: {
												SUM: "WEEEeeeee_pass"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: non-unique APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										courses_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title",
										"weeha"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"CHANGEME_dept"
									],
									APPLY: [
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										},
										{
											weeha: {
												SUM: "CHANGEME_pass"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: non-unique APPLY 2", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										courses_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"CHANGEME_dept"
									],
									APPLY: [
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										},
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										}
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: APPLYKEY in COLUMNS but no TRANSFORMATIONS", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										courses_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title",
										"CHANGEME_avg",
										"cawdawdawd"
									]
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("ACCEPT: empty APPLY", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: []
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: valid APPLY (COUNT, skey)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												COUNT: "CHANGEME_title"
											}
										}
									]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: valid APPLY (COUNT, mkey)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												COUNT: "CHANGEME_pass"
											}
										}
									]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: valid APPLY (MIN, mkey)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												MIN: "CHANGEME_avg"
											}
										}
									]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: valid APPLY (SUM, mkey)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_avg"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_avg"
									],
									APPLY: [
										{
											weeha: {
												SUM: "CHANGEME_fail"
											}
										}
									]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: valid APPLY (basic)", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										CHANGEME_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title",
										"weeha"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"CHANGEME_dept"
									],
									APPLY: [
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										},
										{
											hello: {
												SUM: "CHANGEME_pass"
											}
										}
									]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: valid APPLY (same applyrule)", async function() {
						try {
							await facade.performQuery({
								WHERE: {
									GT: {
										CHANGEME_avg: 98
									}
								},
								OPTIONS:{
									COLUMNS:[
										"CHANGEME_title",
										"hello",
										"weeha"
									]
								},
								TRANSFORMATIONS: {
									GROUP: [
										"CHANGEME_title",
										"CHANGEME_dept"
									],
									APPLY: [
										{
											weeha: {
												AVG: "CHANGEME_avg"
											}
										},
										{
											hello: {
												AVG: "CHANGEME_avg"
											}
										}
									]
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

				});

			});

			describe("checkOptions", function() {

				beforeEach(function () {
					clearDatasets();
					facade = new InsightFacade();
					facade.IDs = ["CHANGEME", "CHANGEME2"];
					facade.dataSets["CHANGEME"] = [
						{
							CHANGEME_title: "teach adult",
							CHANGEME_id: "327",
							CHANGEME_instructor: "",
							CHANGEME_audit: 0,
							CHANGEME_year: "2008",
							CHANGEME_pass: 22,
							CHANGEME_fail: 0,
							CHANGEME_avg: 85.64,
							CHANGEME_dept: "adhe",
							CHANGEME_uuid: "8672"
						}
					];
					facade.dataSets["CHANGEME2"] = [
						{
							CHANGEME2_title: "asdf",
							CHANGEME2_id: "123",
							CHANGEME2_instructor: "awed",
							CHANGEME2_audit: 3,
							CHANGEME2_year: "1900",
							CHANGEME2_pass: 23,
							CHANGEME2_fail: 5,
							CHANGEME2_avg: 30,
							CHANGEME2_dept: "math",
							CHANGEME2_uuid: "12348"
						}
					];
					facade.insightDatasets = [
						{
							id: "CHANGEME",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						},
						{
							id: "CHANGEME2",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						}
					];
				});

				describe("ORDER", function() {

					it("REJECT: invalid ORDER key (number)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: 3
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: invalid ORDER key (bad solo keystring)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: "awd_3"
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: missing 'dir' key", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: {
										keys: [
											"CHANGEME_avg"
										]
									}
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: missing 'keys' key", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: {
										dir: "UP"
									}
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: dir !== string", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: {
										dir: [],
										keys: [
											"CHANGEME_avg"
										]
									}
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: ORDER keys !== array", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: {
										dir: "UP",
										keys: true
									}
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: empty keys in ORDER", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: {
										dir: "UP",
										keys: []
									}
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: ORDER keys not in COLUMNS", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: {
										dir: "UP",
										keys: [
											"CHANGEME_dept"
										]
									}
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("REJECT: ORDER keys not in COLUMNS 2", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg",
										"CHANGEME_dept",
										"CHANGEME_id"
									],
									ORDER: {
										dir: "UP",
										keys: [
											"CHANGEME_dept",
											"CHANGEME_avg",
											"CHANGEME_uuid"
										]
									}
								}
							});
							expect.fail("should have rejected");
						} catch (error: any) {
							console.log(error.message);
							expect(error).to.be.an.instanceof(InsightError);
						}
					});

					it("ACCEPT: valid ORDER (DOWN, 1 key)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: {
										dir: "DOWN",
										keys: [
											"CHANGEME_avg"
										]
									}
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: valid ORDER (UP, 2 keys)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg",
										"CHANGEME_dept",
										"CHANGEME_id"
									],
									ORDER: {
										dir: "UP",
										keys: [
											"CHANGEME_avg",
											"CHANGEME_id"
										]
									}
								}
							});
						} catch (error) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

					it("ACCEPT: valid ORDER (basic key)", async function() {
						try {
							await facade.performQuery({
								WHERE: {},
								OPTIONS: {
									COLUMNS: [
										"CHANGEME_avg"
									],
									ORDER: "CHANGEME_avg"
								}
							});
						} catch (error: any) {
							console.log(error);
							expect.fail("should have accepted");
						}
					});

				});

			});

			describe("rooms", function() {

				beforeEach(function () {
					clearDatasets();
					facade = new InsightFacade();
					facade.IDs = ["CHANGEMEr", "CHANGEMEc"];
					facade.dataSets["CHANGEMEr"] = [
						{
							CHANGEMEr_fullname: "Wooba Jooba",
							CHANGEMEr_shortname: "WBJB",
							CHANGEMEr_number: "123",
							CHANGEMEr_name: "WBJB_123",
							CHANGEMEr_address: "6256 Main Mall V6T 1F4",
							CHANGEMEr_lat: 3.1415926,
							CHANGEMEr_lon: 7.27,
							CHANGEMEr_seats: 36,
							CHANGEMEr_type: "Meeting",
							CHANGEMEr_furniture: "A single chair",
							CHANGEMEr_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/" +
								"room/DMP-201"
						}
					];
					facade.dataSets["CHANGEMEc"] = [
						{
							CHANGEMEc_title: "asdf",
							CHANGEMEc_id: "123",
							CHANGEMEc_instructor: "awed",
							CHANGEMEc_audit: 3,
							CHANGEMEc_year: "1900",
							CHANGEMEc_pass: 23,
							CHANGEMEc_fail: 5,
							CHANGEMEc_avg: 30,
							CHANGEMEc_dept: "math",
							CHANGEMEc_uuid: "12348"
						}
					];
					facade.insightDatasets = [
						{
							id: "CHANGEMEr",
							kind: InsightDatasetKind.Rooms,
							numRows: 1
						},
						{
							id: "CHANGEMEc",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						}
					];
				});

				it("REJECT: room keys from unadded dataset (single column, nothing else)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"hello_lat"
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: rooms datasets + course datasets", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								GT: {
									CHANGEMEc_avg: 97
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEr_fullname"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEMEr_fullname"
									]
								}
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: course key + rooms dataset (in WHERE)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								GT: {
									CHANGEMEr_avg: 3
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEr_lat",
									"hello"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEMEr_lat",
										"hello"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEMEr_lat"
								],
								APPLY: [
									{
										hello: {
											COUNT: "CHANGEMEr_seats"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: course key + rooms dataset (in COLUMNS+GROUP)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								GT: {
									CHANGEMEr_lat: 3
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEr_avg",
									"hello"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"hello"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEMEr_avg"
								],
								APPLY: [
									{
										hello: {
											COUNT: "CHANGEMEr_seats"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: course key + rooms dataset (in COLUMNS+APPLY)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								GT: {
									CHANGEMEr_seats: 3
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEr_shortname",
									"hello"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"hello"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEMEr_shortname"
								],
								APPLY: [
									{
										hello: {
											COUNT: "CHANGEMEr_uuid"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: course key + rooms dataset (in COLUMNS+ORDER)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								GT: {
									CHANGEMEr_lon: 3
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEr_dept",
									"hello"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEMEr_dept"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEMEr_shortname"
								],
								APPLY: [
									{
										hello: {
											COUNT: "CHANGEMEr_fullname"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: rooms key + course dataset (in WHERE)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								IS: {
									CHANGEMEc_href: "100"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEc_id"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEMEc_id"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEMEc_id"
								],
								APPLY: [
									{
										asdf: {
											SUM: "CHANGEMEc_pass"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: rooms key + course dataset (in COLUMNS+GROUP)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								IS: {
									CHANGEMEc_id: "100"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEc_lon"
								]
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEMEc_lon"
								],
								APPLY: [
									{
										asdf: {
											SUM: "CHANGEMEc_pass"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: rooms key + course dataset (in COLUMNS+APPLY)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								IS: {
									CHANGEMEc_id: "100"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEc_id",
									"asdf"
								]
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEMEc_id"
								],
								APPLY: [
									{
										asdf: {
											SUM: "CHANGEMEc_lat"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: rooms key + course dataset (in COLUMNS+ORDER)", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								IS: {
									CHANGEMEc_id: "100"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEc_furniture"
								],
								ORDER: {
									dir: "UP",
									keys: [
										"CHANGEMEc_furniture"
									]
								}
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("ACCEPT: everything + rooms keys/dataset", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {
								AND: [
									{
										IS: {
											CHANGEMEr_address: "123 Candy Cane Lane"
										}
									},
									{
										IS: {
											CHANGEMEr_type: "big room"
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEr_address",
									"CHANGEMEr_type",
									"helllooo"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEMEr_address",
										"helllooo"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEMEr_address",
									"CHANGEMEr_type"
								],
								APPLY: [
									{
										helllooo: {
											MAX: "CHANGEMEr_lat"
										}
									}
								]
							}
						});
					} catch (error: any) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("ACCEPT: single column, added dataset", async function() {
					try {
						const result = await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"CHANGEMEr_fullname"
								]
							}
						});
					} catch (error: any) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

			});

			describe("General / other queries", function() {

				beforeEach(function () {
					clearDatasets();
					facade = new InsightFacade();
					facade.IDs = ["CHANGEME", "CHANGEME2"];
					facade.dataSets["CHANGEME"] = [
						{
							CHANGEME_title: "teach adult",
							CHANGEME_id: "327",
							CHANGEME_instructor: "",
							CHANGEME_audit: 0,
							CHANGEME_year: "2008",
							CHANGEME_pass: 22,
							CHANGEME_fail: 0,
							CHANGEME_avg: 85.64,
							CHANGEME_dept: "adhe",
							CHANGEME_uuid: "8672"
						}
					];
					facade.dataSets["CHANGEME2"] = [
						{
							CHANGEME2_title: "asdf",
							CHANGEME2_id: "123",
							CHANGEME2_instructor: "awed",
							CHANGEME2_audit: 3,
							CHANGEME2_year: "1900",
							CHANGEME2_pass: 23,
							CHANGEME2_fail: 5,
							CHANGEME2_avg: 30,
							CHANGEME2_dept: "math",
							CHANGEME2_uuid: "12348"
						}
					];
					facade.insightDatasets = [
						{
							id: "CHANGEME",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						},
						{
							id: "CHANGEME2",
							kind: InsightDatasetKind.Courses,
							numRows: 1
						}
					];
				});

				it("REJECT: invalid query (homogenous nonexistent dataset w/ TRANSFORMS)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								OR: [
									{
										GT: {
											waa_avg: 97
										}
									},
									{
										IS: {
											waa_dept: "math"
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"waa_avg",
									"waa_dept",
									"waa_title",
									"weeha"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"waa_dept",
										"waa_title"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"waa_title"
								],
								APPLY: [
									{
										weeha: {
											AVG: "waa_avg"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: invalid query (homogenous nonexistent dataset w/o TRANSFORMS)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								GT: {
									hello_avg: 97
								}
							},
							OPTIONS: {
								COLUMNS: [
									"hello_dept",
									"hello_id"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"hello_dept"
									]
								}
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("REJECT: applykey as target key in APPLY", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								GT: {
									CHANGEME_avg: 97
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_dept"
								]
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_dept"
								],
								APPLY: [
									{
										weeha: {
											AVG: "CHANGEME_avg"
										}
									},
									{
										wahoo: {
											COUNT: "weeha"
										}
									}
								]
							}
						});
						expect.fail("should have rejected");
					} catch (error: any) {
						console.log(error.message);
						expect(error).to.be.an.instanceof(InsightError);
					}
				});

				it("ACCEPT: valid query (solo APPLYKEY in COLUMNS)", async function() {
					try {
						await facade.performQuery({
							WHERE: {},
							OPTIONS: {
								COLUMNS: [
									"weeha"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"weeha"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_title"
								],
								APPLY: [
									{
										weeha: {
											AVG: "CHANGEME_avg"
										}
									}
								]
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

				it("ACCEPT: valid query (tree test)", async function() {
					try {
						await facade.performQuery({
							WHERE: {
								OR: [
									{
										AND: [
											{
												GT: {
													CHANGEME_avg: 97
												}
											},
											{
												IS: {
													CHANGEME_dept: "math"
												}
											}
										]
									},
									{
										EQ: {
											CHANGEME_year: 2019
										}
									}
								]
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_avg",
									"CHANGEME_title",
									"woohoo"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEME_avg",
										"CHANGEME_title"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_avg",
									"CHANGEME_title",
									"CHANGEME_dept"
								],
								APPLY: [
									{
										weeha: {
											AVG: "CHANGEME_avg"
										}
									},
									{
										woohoo: {
											COUNT: "CHANGEME_dept"
										}
									}
								]
							}
						});
					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

			});

		});

		describe("MOCK TESTS", function() {

			describe("310/210 example", function() {

				beforeEach(function () {
					clearDatasets();
					facade = new InsightFacade();
					facade.IDs = ["CHANGEME"];
					facade.dataSets["CHANGEME"] = [
						{ CHANGEME_title: "310", CHANGEME_id: "0", CHANGEME_instructor: "Jean", CHANGEME_audit: 0,
							CHANGEME_year: "0", CHANGEME_pass: 0, CHANGEME_fail: 0, CHANGEME_avg: 90, CHANGEME_dept: "",
							CHANGEME_uuid: "1"},
						{ CHANGEME_title: "310", CHANGEME_id: "0", CHANGEME_instructor: "Jean", CHANGEME_audit: 0,
							CHANGEME_year: "0", CHANGEME_pass: 0, CHANGEME_fail: 0, CHANGEME_avg: 80, CHANGEME_dept: "",
							CHANGEME_uuid: "2"},
						{ CHANGEME_title: "310", CHANGEME_id: "0", CHANGEME_instructor: "Casey", CHANGEME_audit: 0,
							CHANGEME_year: "0", CHANGEME_pass: 0, CHANGEME_fail: 0, CHANGEME_avg: 95, CHANGEME_dept: "",
							CHANGEME_uuid: "3"},
						{ CHANGEME_title: "310", CHANGEME_id: "0", CHANGEME_instructor: "Casey", CHANGEME_audit: 0,
							CHANGEME_year: "0", CHANGEME_pass: 0, CHANGEME_fail: 0, CHANGEME_avg: 85, CHANGEME_dept: "",
							CHANGEME_uuid: "4"},
						{ CHANGEME_title: "210", CHANGEME_id: "0", CHANGEME_instructor: "Kelly", CHANGEME_audit: 0,
							CHANGEME_year: "0", CHANGEME_pass: 0, CHANGEME_fail: 0, CHANGEME_avg: 74, CHANGEME_dept: "",
							CHANGEME_uuid: "5"},
						{ CHANGEME_title: "210", CHANGEME_id: "0", CHANGEME_instructor: "Kelly", CHANGEME_audit: 0,
							CHANGEME_year: "0", CHANGEME_pass: 0, CHANGEME_fail: 0, CHANGEME_avg: 78, CHANGEME_dept: "",
							CHANGEME_uuid: "6"},
						{ CHANGEME_title: "210", CHANGEME_id: "0", CHANGEME_instructor: "Kelly", CHANGEME_audit: 0,
							CHANGEME_year: "0", CHANGEME_pass: 0, CHANGEME_fail: 0, CHANGEME_avg: 72, CHANGEME_dept: "",
							CHANGEME_uuid: "7"},
						{ CHANGEME_title: "210", CHANGEME_id: "0", CHANGEME_instructor: "Eli", CHANGEME_audit: 0,
							CHANGEME_year: "0", CHANGEME_pass: 0, CHANGEME_fail: 0, CHANGEME_avg: 85, CHANGEME_dept: "",
							CHANGEME_uuid: "8"}
					];
					facade.insightDatasets = [
						{
							id: "CHANGEME",
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
									"CHANGEME_title",
									"CHANGEME_instructor"
								]
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_title",
									"CHANGEME_instructor"
								],
								APPLY: []
							}
						});

						expect(result.length).to.equal(4);
						expect(result).to.have.deep.members([
							{CHANGEME_title: "310", CHANGEME_instructor: "Jean"},
							{CHANGEME_title: "310", CHANGEME_instructor: "Casey"},
							{CHANGEME_title: "210", CHANGEME_instructor: "Kelly"},
							{CHANGEME_title: "210", CHANGEME_instructor: "Eli"}
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
									"CHANGEME_title",
									"CHANGEME_instructor",
									"maxAvg",
									"minAvg",
									"avgAvg",
									"countAvg",
									"sumAvg"
								]
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_title",
									"CHANGEME_instructor"
								],
								APPLY: [
									{
										maxAvg: {
											MAX: "CHANGEME_avg"
										}
									},
									{
										minAvg: {
											MIN: "CHANGEME_avg"
										}
									},
									{
										avgAvg: {
											AVG: "CHANGEME_avg"
										}
									},
									{
										countAvg: {
											COUNT: "CHANGEME_avg"
										}
									},
									{
										sumAvg: {
											SUM: "CHANGEME_avg"
										}
									}
								]
							}
						});

						expect(result.length).to.equal(4);
						expect(result).to.have.deep.members([
							{CHANGEME_title: "310", CHANGEME_instructor: "Jean",
								maxAvg: 90, minAvg: 80, avgAvg: 85, countAvg: 2, sumAvg: 170},
							{CHANGEME_title: "310", CHANGEME_instructor: "Casey",
								maxAvg: 95, minAvg: 85, avgAvg: 90, countAvg: 2, sumAvg: 180},
							{CHANGEME_title: "210", CHANGEME_instructor: "Kelly",
								maxAvg: 78, minAvg: 72, avgAvg: 74.67, countAvg: 3, sumAvg: 224},
							{CHANGEME_title: "210", CHANGEME_instructor: "Eli",
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
									"CHANGEME_avg"
								]
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_avg"
								],
								APPLY: []
							}
						});

						expect(result.length).to.equal(7);
						expect(result).to.have.deep.members([
							{CHANGEME_avg: 90},
							{CHANGEME_avg: 80},
							{CHANGEME_avg: 95},
							{CHANGEME_avg: 85},
							{CHANGEME_avg: 74},
							{CHANGEME_avg: 78},
							{CHANGEME_avg: 72}
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
									"CHANGEME_title",
									"weeha"
								]
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_title"
								],
								APPLY: [
									{
										weeha: {
											AVG: "CHANGEME_avg"
										}
									}
								]
							}
						});

						expect(result.length).to.equal(2);
						expect(result).to.have.deep.members([
							{CHANGEME_title: "310", weeha: 87.5},
							{CHANGEME_title: "210", weeha: 77.25}
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
									"CHANGEME_title",
									"CHANGEME_instructor",
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
									"CHANGEME_title",
									"CHANGEME_instructor"
								],
								APPLY: [
									{
										overallAvg: {
											AVG: "CHANGEME_avg"
										}
									}
								]
							}
						});

						expect(result.length).to.equal(4);
						expect(result).to.have.deep.members([
							{CHANGEME_title: "310", CHANGEME_instructor: "Jean", overallAvg: 85},
							{CHANGEME_title: "310", CHANGEME_instructor: "Casey", overallAvg: 90},
							{CHANGEME_title: "210", CHANGEME_instructor: "Kelly", overallAvg: 74.67},
							{CHANGEME_title: "210", CHANGEME_instructor: "Eli", overallAvg: 85},
						]);
						expect(result[0]).to.deep.equal(
							{CHANGEME_title: "210", CHANGEME_instructor: "Kelly", overallAvg: 74.67});
						expect(result[3]).to.deep.equal(
							{CHANGEME_title: "310", CHANGEME_instructor: "Casey", overallAvg: 90});

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
									"CHANGEME_uuid",
									"CHANGEME_avg"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEME_avg"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_uuid",
									"CHANGEME_avg"
								],
								APPLY: []
							}
						});

						expect(result.length).to.equal(8);
						expect(result).to.have.deep.members([
							{CHANGEME_uuid: "1", CHANGEME_avg: 90},
							{CHANGEME_uuid: "2", CHANGEME_avg: 80},
							{CHANGEME_uuid: "3", CHANGEME_avg: 95},
							{CHANGEME_uuid: "4", CHANGEME_avg: 85},
							{CHANGEME_uuid: "5", CHANGEME_avg: 74},
							{CHANGEME_uuid: "6", CHANGEME_avg: 78},
							{CHANGEME_uuid: "7", CHANGEME_avg: 72},
							{CHANGEME_uuid: "8", CHANGEME_avg: 85},
						]);
						expect(result[0]).to.deep.equal(
							{CHANGEME_uuid: "3", CHANGEME_avg: 95});
						expect(result[1]).to.deep.equal(
							{CHANGEME_uuid: "1", CHANGEME_avg: 90});
						expect(result[4]).to.deep.equal(
							{CHANGEME_uuid: "2", CHANGEME_avg: 80});
						expect(result[5]).to.deep.equal(
							{CHANGEME_uuid: "6", CHANGEME_avg: 78});
						expect(result[6]).to.deep.equal(
							{CHANGEME_uuid: "5", CHANGEME_avg: 74});
						expect(result[7]).to.deep.equal(
							{CHANGEME_uuid: "7", CHANGEME_avg: 72});

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
									"CHANGEME_uuid",
									"CHANGEME_title",
									"CHANGEME_avg"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEME_title",
										"CHANGEME_avg"
									]
								}
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_uuid",
									"CHANGEME_title",
									"CHANGEME_avg"
								],
								APPLY: []
							}
						});

						expect(result.length).to.equal(8);
						expect(result).to.have.deep.members([
							{CHANGEME_uuid: "3", CHANGEME_title: "310", CHANGEME_avg: 95},
							{CHANGEME_uuid: "1", CHANGEME_title: "310", CHANGEME_avg: 90},
							{CHANGEME_uuid: "4", CHANGEME_title: "310", CHANGEME_avg: 85},
							{CHANGEME_uuid: "2", CHANGEME_title: "310", CHANGEME_avg: 80},
							{CHANGEME_uuid: "8", CHANGEME_title: "210", CHANGEME_avg: 85},
							{CHANGEME_uuid: "6", CHANGEME_title: "210", CHANGEME_avg: 78},
							{CHANGEME_uuid: "5", CHANGEME_title: "210", CHANGEME_avg: 74},
							{CHANGEME_uuid: "7", CHANGEME_title: "210", CHANGEME_avg: 72}
						]);
						expect(result[0]).to.deep.equal(
							{CHANGEME_uuid: "3", CHANGEME_title: "310", CHANGEME_avg: 95});
						expect(result[1]).to.deep.equal(
							{CHANGEME_uuid: "1", CHANGEME_title: "310", CHANGEME_avg: 90});
						expect(result[2]).to.deep.equal(
							{CHANGEME_uuid: "4", CHANGEME_title: "310", CHANGEME_avg: 85});
						expect(result[3]).to.deep.equal(
							{CHANGEME_uuid: "2", CHANGEME_title: "310", CHANGEME_avg: 80});
						expect(result[4]).to.deep.equal(
							{CHANGEME_uuid: "8", CHANGEME_title: "210", CHANGEME_avg: 85});
						expect(result[5]).to.deep.equal(
							{CHANGEME_uuid: "6", CHANGEME_title: "210", CHANGEME_avg: 78});
						expect(result[6]).to.deep.equal(
							{CHANGEME_uuid: "5", CHANGEME_title: "210", CHANGEME_avg: 74});
						expect(result[7]).to.deep.equal(
							{CHANGEME_uuid: "7", CHANGEME_title: "210", CHANGEME_avg: 72});

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
									"CHANGEME_uuid",
									"CHANGEME_avg",
									"sumAvg"
								],
								ORDER: "sumAvg"
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_uuid",
									"CHANGEME_avg"
								],
								APPLY: [
									{
										sumAvg: {
											SUM: "CHANGEME_avg"
										}
									}
								]
							}
						});

						expect(result.length).to.equal(8);
						expect(result).to.have.deep.members([
							{CHANGEME_uuid: "1", CHANGEME_avg: 90, sumAvg: 90},
							{CHANGEME_uuid: "2", CHANGEME_avg: 80, sumAvg: 80},
							{CHANGEME_uuid: "3", CHANGEME_avg: 95, sumAvg: 95},
							{CHANGEME_uuid: "4", CHANGEME_avg: 85, sumAvg: 85},
							{CHANGEME_uuid: "5", CHANGEME_avg: 74, sumAvg: 74},
							{CHANGEME_uuid: "6", CHANGEME_avg: 78, sumAvg: 78},
							{CHANGEME_uuid: "7", CHANGEME_avg: 72, sumAvg: 72},
							{CHANGEME_uuid: "8", CHANGEME_avg: 85, sumAvg: 85},
						]);
						expect(result[0]).to.deep.equal(
							{CHANGEME_uuid: "7", CHANGEME_avg: 72, sumAvg: 72});
						expect(result[1]).to.deep.equal(
							{CHANGEME_uuid: "5", CHANGEME_avg: 74, sumAvg: 74});
						expect(result[2]).to.deep.equal(
							{CHANGEME_uuid: "6", CHANGEME_avg: 78, sumAvg: 78});
						expect(result[3]).to.deep.equal(
							{CHANGEME_uuid: "2", CHANGEME_avg: 80, sumAvg: 80});
						expect(result[6]).to.deep.equal(
							{CHANGEME_uuid: "1", CHANGEME_avg: 90, sumAvg: 90});
						expect(result[7]).to.deep.equal(
							{CHANGEME_uuid: "3", CHANGEME_avg: 95, sumAvg: 95});

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
									"CHANGEME_title",
									"CHANGEME_avg"
								],
								ORDER: {
									dir: "DOWN",
									keys: [
										"CHANGEME_title",
										"CHANGEME_avg"
									]
								}
							}
						});

						expect(result.length).to.equal(8);
						expect(result).to.have.deep.members([
							{CHANGEME_title: "310", CHANGEME_avg: 90},
							{CHANGEME_title: "310", CHANGEME_avg: 80},
							{CHANGEME_title: "310", CHANGEME_avg: 95},
							{CHANGEME_title: "310", CHANGEME_avg: 85},
							{CHANGEME_title: "210", CHANGEME_avg: 74},
							{CHANGEME_title: "210", CHANGEME_avg: 78},
							{CHANGEME_title: "210", CHANGEME_avg: 72},
							{CHANGEME_title: "210", CHANGEME_avg: 85}
						]);
						expect(result[0]).to.deep.equal(
							{CHANGEME_title: "310", CHANGEME_avg: 95});
						expect(result[1]).to.deep.equal(
							{CHANGEME_title: "310", CHANGEME_avg: 90});
						expect(result[2]).to.deep.equal(
							{CHANGEME_title: "310", CHANGEME_avg: 85});
						expect(result[3]).to.deep.equal(
							{CHANGEME_title: "310", CHANGEME_avg: 80});
						expect(result[4]).to.deep.equal(
							{CHANGEME_title: "210", CHANGEME_avg: 85});
						expect(result[5]).to.deep.equal(
							{CHANGEME_title: "210", CHANGEME_avg: 78});
						expect(result[6]).to.deep.equal(
							{CHANGEME_title: "210", CHANGEME_avg: 74});
						expect(result[7]).to.deep.equal(
							{CHANGEME_title: "210", CHANGEME_avg: 72});

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
									CHANGEME_title: "310"
								}
							},
							OPTIONS: {
								COLUMNS: [
									"CHANGEME_instructor",
									"countUuid"
								]
							},
							TRANSFORMATIONS: {
								GROUP: [
									"CHANGEME_instructor"
								],
								APPLY: [
									{
										countUuid: {
											COUNT: "CHANGEME_uuid"
										}
									}
								]
							}
						});

						expect(result.length).to.equal(2);
						expect(result).to.have.deep.members([
							{CHANGEME_instructor: "Jean", countUuid: 2},
							{CHANGEME_instructor: "Casey", countUuid: 2}
						]);

					} catch (error) {
						console.log(error);
						expect.fail("should have accepted");
					}
				});

			});

		});

	});

	describe("fixes", function() {

		describe("LOGICCOMPARISON fix (syntax)", function() {

			beforeEach(function () {
				clearDatasets();
				facade = new InsightFacade();
				facade.IDs = ["CHANGEME", "CHANGEME2"];
				facade.dataSets["CHANGEME"] = [
					{
						CHANGEME_title: "teach adult",
						CHANGEME_id: "327",
						CHANGEME_instructor: "",
						CHANGEME_audit: 0,
						CHANGEME_year: "2008",
						CHANGEME_pass: 22,
						CHANGEME_fail: 0,
						CHANGEME_avg: 85.64,
						CHANGEME_dept: "adhe",
						CHANGEME_uuid: "8672"
					}
				];
				facade.dataSets["CHANGEME2"] = [
					{
						CHANGEME2_title: "asdf",
						CHANGEME2_id: "123",
						CHANGEME2_instructor: "awed",
						CHANGEME2_audit: 3,
						CHANGEME2_year: "1900",
						CHANGEME2_pass: 23,
						CHANGEME2_fail: 5,
						CHANGEME2_avg: 30,
						CHANGEME2_dept: "math",
						CHANGEME2_uuid: "12348"
					}
				];
				facade.insightDatasets = [
					{
						id: "CHANGEME",
						kind: InsightDatasetKind.Courses,
						numRows: 1
					},
					{
						id: "CHANGEME2",
						kind: InsightDatasetKind.Courses,
						numRows: 1
					}
				];
			});

			it("REJECT: empty", async function() {
				try {
					await facade.performQuery({
						WHERE: {
							OR: []
						},
						OPTIONS:{
							COLUMNS:[
								"CHANGEME_avg"
							]
						}
					});
					expect.fail("should have rejected");
				} catch (error: any) {
					console.log(error.message);
					expect(error).to.be.an.instanceof(InsightError);
				}
			});

			it("ACCEPT: OR 1 thing", async function() {
				try {
					await facade.performQuery({
						WHERE: {
							OR: [
								{
									GT: {
										CHANGEME_avg: 97
									}
								}
							]
						},
						OPTIONS:{
							COLUMNS:[
								"CHANGEME_avg"
							]
						}
					});
				} catch (error: any) {
					console.log(error);
					expect.fail("should have accepted");
				}
			});

			it("ACCEPT: AND 1 thing", async function() {
				try {
					await facade.performQuery({
						WHERE: {
							OR: [
								{
									IS: {
										CHANGEME_uuid: "7"
									}
								}
							]
						},
						OPTIONS:{
							COLUMNS:[
								"CHANGEME_avg"
							]
						}
					});
				} catch (error: any) {
					console.log(error);
					expect.fail("should have accepted");
				}
			});

			it("ACCEPT: OR 3 things with AND 4 thingsinside", async function() {
				try {
					await facade.performQuery({
						WHERE: {
							OR: [
								{
									GT: {
										CHANGEME_avg: 97
									}
								},
								{
									IS: {
										CHANGEME_dept: "math"
									}
								},
								{
									AND: [
										{
											NOT: {
												EQ: {
													CHANGEME_pass: 3
												}
											}
										},
										{
											IS: {
												CHANGEME_dept: "adhe"
											}
										},
										{
											IS: {
												CHANGEME_dept: "adhe"
											}
										},
										{
											LT: {
												CHANGEME_avg: 3
											}
										}
									]
								}
							]
						},
						OPTIONS:{
							COLUMNS:[
								"CHANGEME_avg"
							]
						}
					});
				} catch (error: any) {
					console.log(error);
					expect.fail("should have accepted");
				}
			});

		});

		describe("LOGICCOMPARISON fix (mock)", function() {

			beforeEach(function () {
				clearDatasets();
				facade = new InsightFacade();
				facade.IDs = ["CHANGEME", "CHANGEME2"];
				facade.dataSets["CHANGEME"] = [
					{
						CHANGEME_title: "teach adult",
						CHANGEME_id: "327",
						CHANGEME_instructor: "",
						CHANGEME_audit: 0,
						CHANGEME_year: "2008",
						CHANGEME_pass: 23,
						CHANGEME_fail: 0,
						CHANGEME_avg: 100,
						CHANGEME_dept: "adhe",
						CHANGEME_uuid: "8672"
					},
					{
						CHANGEME_title: "hello",
						CHANGEME_id: "327",
						CHANGEME_instructor: "HI MOM",
						CHANGEME_audit: 6,
						CHANGEME_year: "2008",
						CHANGEME_pass: 22,
						CHANGEME_fail: 1,
						CHANGEME_avg: 98,
						CHANGEME_dept: "math",
						CHANGEME_uuid: "12315"
					},
					{
						CHANGEME_title: "uwu",
						CHANGEME_id: "727",
						CHANGEME_instructor: "ack",
						CHANGEME_audit: 16,
						CHANGEME_year: "2004",
						CHANGEME_pass: 235,
						CHANGEME_fail: 7,
						CHANGEME_avg: 59,
						CHANGEME_dept: "cpsc",
						CHANGEME_uuid: "72727"
					},
					{
						CHANGEME_title: "how to survive cpsc 310",
						CHANGEME_id: "309",
						CHANGEME_instructor: "gregor",
						CHANGEME_audit: 1,
						CHANGEME_year: "2008",
						CHANGEME_pass: 0,
						CHANGEME_fail: 800,
						CHANGEME_avg: 85.64,
						CHANGEME_dept: "cpsc",
						CHANGEME_uuid: "98"
					}
				];
				facade.dataSets["CHANGEME2"] = [
					{
						CHANGEME2_title: "asdf",
						CHANGEME2_id: "123",
						CHANGEME2_instructor: "awed",
						CHANGEME2_audit: 5,
						CHANGEME2_year: "1900",
						CHANGEME2_pass: 23,
						CHANGEME2_fail: 5,
						CHANGEME2_avg: 30,
						CHANGEME2_dept: "math",
						CHANGEME2_uuid: "123145"
					},
					{
						CHANGEME2_title: "wdawdaawd",
						CHANGEME2_id: "321",
						CHANGEME2_instructor: "awd",
						CHANGEME2_audit: 3,
						CHANGEME2_year: "1999",
						CHANGEME2_pass: 23,
						CHANGEME2_fail: 5,
						CHANGEME2_avg: 30,
						CHANGEME2_dept: "abcz",
						CHANGEME2_uuid: "6"
					},
					{
						CHANGEME2_title: "AAAAA",
						CHANGEME2_id: "400",
						CHANGEME2_instructor: "IM GOING INSANE",
						CHANGEME2_audit: 12,
						CHANGEME2_year: "2021",
						CHANGEME2_pass: 23,
						CHANGEME2_fail: 5,
						CHANGEME2_avg: 30,
						CHANGEME2_dept: "acbz",
						CHANGEME2_uuid: "512423"
					}
				];
				facade.insightDatasets = [
					{
						id: "CHANGEME",
						kind: InsightDatasetKind.Courses,
						numRows: 1
					},
					{
						id: "CHANGEME2",
						kind: InsightDatasetKind.Courses,
						numRows: 1
					}
				];
			});

			it("OR{GT, IS, EQ} + sort by avg", async function() {
				try {
					const result = await facade.performQuery({
						WHERE: {
							OR: [
								{
									GT: {
										CHANGEME_fail: 799
									}
								},
								{
									IS: {
										CHANGEME_uuid: "72727"
									}
								},
								{
									EQ: {
										CHANGEME_pass: 22
									}
								}
							]
						},
						OPTIONS: {
							COLUMNS: [
								"CHANGEME_fail",
								"CHANGEME_uuid",
								"CHANGEME_pass"
							],
							ORDER: "CHANGEME_fail"
						}
					});
					for (let course of result) {
						console.log(course);
					}
					expect(result.length).to.equal(3);
					expect(result).to.have.deep.members([
						{CHANGEME_fail: 800, CHANGEME_uuid: "98", CHANGEME_pass: 0},
						{CHANGEME_fail: 7, CHANGEME_uuid: "72727", CHANGEME_pass: 235},
						{CHANGEME_fail: 1, CHANGEME_uuid: "12315", CHANGEME_pass: 22}
					]);
					expect(result[0]).to.deep.equal(
						{CHANGEME_fail: 1, CHANGEME_uuid: "12315", CHANGEME_pass: 22});
					expect(result[1]).to.deep.equal(
						{CHANGEME_fail: 7, CHANGEME_uuid: "72727", CHANGEME_pass: 235});
					expect(result[2]).to.deep.equal(
						{CHANGEME_fail: 800, CHANGEME_uuid: "98", CHANGEME_pass: 0});
				} catch (error) {
					console.log(error);
					expect.fail("should have accepted");
				}
			});

		});

	});


});

// TODO: merge referencedDatasets and whereKeys
// TODO: check for any TODOs and console.logs floating around...
// TODO: REQUIRES, MODIFIES, EFFECTS on everything
// TODO: define AST properly (must be WHERE or any of WHERE'S possible children)
