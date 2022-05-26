import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind, InsightError,
	ResultTooLargeError
} from "./IInsightFacade";
import SyntaxChecker from "./SyntaxChecker";
import {QueryLogic} from "./QueryLogic";
import Group from "./Group";
import ASTNode from "./ASTNode";
import DataHandler from "./DataHandler";
import AddDatasetHandler from "./AddDatasetHandler";
import RemoveDatasetHandler from "./RemoveDatasetHandler";
import ListDatasetHandler from "./ListDatasetHandler";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 */
export default class InsightFacade implements IInsightFacade {

	public IDs: string[];
	public dataSets: {[id: string]: any[]};
	public insightDatasets: InsightDataset[];

	public dataHandler: DataHandler;
	private addDatasetHandler: AddDatasetHandler;
	private removeDatasetHandler: RemoveDatasetHandler;
	private listDatasetHandler: ListDatasetHandler;

	private root: ASTNode;
	private syntaxChecker: SyntaxChecker;

	constructor() {
		this.IDs = [];
		this.dataSets = {};
		this.insightDatasets = [];

		this.dataHandler = new DataHandler(this.IDs, this.dataSets, this.insightDatasets);
		this.addDatasetHandler = new AddDatasetHandler(this.dataHandler);
		this.removeDatasetHandler = new RemoveDatasetHandler(this.dataHandler);
		this.listDatasetHandler = new ListDatasetHandler(this.dataHandler);

		this.root = new ASTNode("WHERE", null, null);
		this.syntaxChecker = new SyntaxChecker();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return this.addDatasetHandler.addDataset(id, content, kind);
	}

	public removeDataset(id: string): Promise<string> {
		return this.removeDatasetHandler.removeDataset(id);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return this.listDatasetHandler.listData();
	}

	public performQuery(query: any): Promise<any[]> {
		return new Promise<any[]>((resolve, reject) => {
			this.root = new ASTNode("WHERE", null, null);
			this.syntaxChecker = new SyntaxChecker();
			try {
				this.root = new ASTNode("WHERE", null, null);
				this.syntaxChecker = new SyntaxChecker();

				this.syntaxChecker.checkQuerySyntax(query, this.IDs);
				this.root.buildSyntaxTree(query);
				// this.performQueryTestLogs(query);
				let returnArray: any[] = this.buildReturnArray(query);
				return resolve(returnArray);
			} catch (error) {
				return reject(error);
			}
		});
	}

	private buildReturnArray(query: any) {
		let datasetID: string = this.getIDFromQuery(query);
		let dataset: any[] = this.findDataset(datasetID);
		this.checkDatasetKind(datasetID);

		let matchingCourses: any[] = this.findMatchingCourses(dataset);
		let columnKeys: string[] = this.syntaxChecker.getColumnKeys();
		let returnArray: any[];

		if (query.TRANSFORMATIONS !== undefined) {
			let groupKeys: string[] = this.syntaxChecker.getGroupKeys();
			let groups: Group[] = Group.groupCourses(matchingCourses, groupKeys);

			let applyList: string[][] = Group.makeApplyList(query.TRANSFORMATIONS.APPLY);
			Group.applyToGroups(groups, applyList);
			returnArray = Group.convertGroups(groups, columnKeys);

		} else {
			returnArray = Group.convertCourses(matchingCourses, columnKeys);
		}

		this.sortReturnArray(returnArray);
		return returnArray;
	}

	private checkDatasetKind(datasetID: string) {
		let insightDataset: any = this.insightDatasets.find((obj) => obj.id === datasetID);
		if ((insightDataset.kind === "rooms") && (!this.syntaxChecker.getIsRooms())) {
			throw new InsightError("Referenced dataset not added yet");
		}
		if ((insightDataset.kind === "courses") && (this.syntaxChecker.getIsRooms())) {
			throw new InsightError("Referenced dataset not added yet");
		}
	}

	private getIDFromQuery(query: any): string {
		if (query.TRANSFORMATIONS !== undefined) {
			return QueryLogic.getID(this.syntaxChecker.getGroupKeys()[0]);
		} else {
			return QueryLogic.getID(this.syntaxChecker.getColumnKeys()[0]);
		}
	}

	private findDataset(datasetID: string): any[] {
		for (let id of this.IDs) {
			if (id === datasetID) {
				return this.dataSets[id];
			}
		}
		throw new Error("findDataset was called with a non-existing dataset ID - This should never happen!");
	}

	private findMatchingCourses(dataset: any): any[] {
		let matchingCourses: any[] = [];
		for (let course of dataset) {
			if (this.root.matchesQuery(course)) {
				matchingCourses.push(course);
			}
			if (matchingCourses.length > 5000) {
				throw new ResultTooLargeError("The result is too big. Only queries with a maximum of 5000 " +
					"results are supported.");
			}
		}
		return matchingCourses;
	}

	private sortReturnArray(returnArray: any[]) {
		let orderKeys: string[] = this.syntaxChecker.getOrderKeys();
		let dir: string = this.syntaxChecker.getDir();

		orderKeys.reverse();
		for (let orderKey of orderKeys) {
			returnArray.sort(this.dynamicSort(orderKey));
		}

		if (dir === "DOWN") {
			returnArray.reverse();
		}
	}

	// Test logs
	private performQueryTestLogs(query: any) {
		console.log("-- -- -- -- -- -- query -- -- -- -- -- --");
		console.log(query);
		console.log("-- -- -- -- -- -- traversals -- -- -- -- -- --");
		this.root.printInOrder(0);
		this.root.printLevelOrder();
	}

	// Code modified from https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
	// REQUIRES: valid course objects, valid key
	private dynamicSort(field: string) {
		return function(a: any, b: any) {
			return (a[field] < b[field]) ? -1 : (a[field] > b[field]) ? 1 : 0;
		};
	}

}
