import {QueryLogic} from "./QueryLogic";

export default class ASTNode {

	private data: any;
	private leftChild: ASTNode | null;
	private rightChild: ASTNode | null;

	constructor(data: any, lc: ASTNode | null, rc: ASTNode | null) {
		this.data = data;
		this.leftChild = lc;
		this.rightChild = rc;
	}

	public buildSyntaxTree(query: any) {
		this.buildWhere(query.WHERE);
	}

	public buildWhere(where: any) {
		this.leftChild = new ASTNode(null, null, null);
		this.rightChild = new ASTNode(null, null, null);
		if (Object.keys(where).length === 0) {
			return;
		} else {
			this.leftChild.buildFilter(where);
		}
	}

	private buildFilter(filter: any) {
		if (QueryLogic.isLogic(filter)) {
			this.buildLogic(filter);
		} else if (QueryLogic.isMcomparison(filter)) {
			this.buildMcomparison(filter);
		} else if (QueryLogic.isScomparison(filter)) {
			this.buildScomparison(filter);
		} else if (QueryLogic.isNegation(filter)) {
			this.buildNegation(filter);
		} else {
			throw new Error("buildFilter was passed an invalid FILTER object - " +
				"this should have been checked elsewhere");
		}
	}

	private buildLogic(filter: any) {
		let logic: any;
		if (filter.AND !== undefined) {
			logic = filter.AND;
			this.data = "AND";
		} else if (filter.OR !== undefined) {
			logic = filter.OR;
			this.data = "OR";
		} else {
			throw new Error("buildLogic was passed an invalid LOGIC object - " +
				"this should have been checked elsewhere");
		}

		let logicNodes: ASTNode[] = [];
		for (let filterObj of logic) {
			let logicNode: ASTNode = new ASTNode(null, null, null);
			logicNode.buildFilter(filterObj);
			logicNodes.push(logicNode);
		}

		this.leftChild = new ASTNode(logicNodes, null, null);
		this.rightChild = new ASTNode(null, null, null);
	}

	private buildMcomparison(filter: any) {
		let mcomparison: any;
		if (filter.GT !== undefined) {
			mcomparison = filter.GT;
			this.data = "GT";
		} else if (filter.LT !== undefined) {
			mcomparison = filter.LT;
			this.data = "LT";
		} else if (filter.EQ !== undefined) {
			mcomparison = filter.EQ;
			this.data = "EQ";
		} else {
			throw new Error("buildMcomparison was passed an invalid MCOMPARISON object - " +
				"this should have been checked elsewhere");
		}

		let mkey: any = Object.keys(mcomparison)[0];
		let mkeyValue: any = Object.values(mcomparison)[0];
		let valNode = new ASTNode(mkeyValue, null, null);
		let rightNode = new ASTNode(null, null, null);
		this.leftChild = new ASTNode(mkey, valNode, rightNode);
		this.rightChild = new ASTNode(null, null, null);
	}

	private buildScomparison(filter: any) {
		let scomparison: any = filter.IS;
		this.data = "IS";

		let skey: any = Object.keys(scomparison)[0];
		let skeyValue: any = Object.values(scomparison)[0];
		let valNode = new ASTNode(skeyValue, null, null);
		let rightNode = new ASTNode(null, null, null);
		this.leftChild = new ASTNode(skey, valNode, rightNode);
		this.rightChild = new ASTNode(null, null, null);
	}

	private buildNegation(filter: any) {
		let negation: any = filter.NOT;
		this.data = "NOT";

		this.leftChild = new ASTNode(null, null, null);
		this.rightChild = new ASTNode(null, null, null);
		this.leftChild.buildFilter(negation);
	}

	public matchesQuery(course: any): boolean | undefined {
		if (this.data === null) {
			return true;
		} else if (this.data === "WHERE") {
			return this.leftChild?.matchesQuery(course);
		} else if (this.data === "AND") {
			let allTrue = (arr: any[]) => arr.every(Boolean);
			let results: boolean[] = [];
			for (let logicNode of this.leftChild?.data) {
				results.push(logicNode.matchesQuery(course));
			}
			return allTrue(results);
		} else if (this.data === "OR") {
			let someTrue = (arr: any[]) => arr.some(Boolean);
			let results: boolean[] = [];
			for (let logicNode of this.leftChild?.data) {
				results.push(logicNode.matchesQuery(course));
			}
			return someTrue(results);
		} else if (this.data === "LT") {
			let key: string = this.leftChild?.data;
			let val: number = this.leftChild?.leftChild?.data;
			return course[key] < val;
		} else if (this.data === "GT") {
			let key: string = this.leftChild?.data;
			let val: number = this.leftChild?.leftChild?.data;
			return course[key] > val;
		} else if (this.data === "EQ") {
			let key: string = this.leftChild?.data;
			let val: number = this.leftChild?.leftChild?.data;
			return course[key] === val;
		} else if (this.data === "IS") {
			let key: string = this.leftChild?.data;
			let val: string = this.leftChild?.leftChild?.data;
			return ASTNode.doesCourseValMatch(course[key], val);
		} else if (this.data === "NOT") {
			return !this.leftChild?.matchesQuery(course);
		} else {
			throw new Error("matchesQuery was passed a node with an invalid data key - this should never happen!");
		}
	}

	private static doesCourseValMatch(cVal: string, compStr: string): boolean {
		let hasStartAsterisk: boolean = compStr.charAt(0) === "*";
		let hasEndAsterisk: boolean = compStr.charAt(compStr.length - 1) === "*";

		if (hasStartAsterisk && hasEndAsterisk) {
			let noAsterisk: string = compStr.substring(1, compStr.length - 1);
			return cVal.includes(noAsterisk);
		} else if (hasStartAsterisk) {
			let noAsterisk: string = compStr.substring(1, compStr.length);
			let cValAtCompStr: string = cVal.substring(cVal.lastIndexOf(noAsterisk), cVal.length);
			return noAsterisk === cValAtCompStr;
		} else if (hasEndAsterisk) {
			let noAsterisk: string = compStr.substring(0, compStr.length - 1);
			let cValAtCompStr: string = cVal.substring(0, cVal.indexOf(noAsterisk) + noAsterisk.length);
			return noAsterisk === cValAtCompStr;
		} else {
			return cVal === compStr;
		}
	}

	public printInOrder(level: number) {
		this.leftChild?.printInOrder(level + 1);
		console.log(this.data === null ? "-".repeat(level) + "null" : "-".repeat(level) + this.data.toString());
		this.rightChild?.printInOrder(level + 1);
	}

	public printLevelOrder() {
		let levels: any[] = [];
		let queue: any[] = [this];
		while (queue.length) {
			let queueLength: number = queue.length;
			let level: any[] = [];
			for (let i = 0; i < queueLength; i++) {
				let node: ASTNode = queue.shift();
				if (node.leftChild !== null) {
					queue.push(node.leftChild);
				}
				if (node.rightChild !== null) {
					queue.push(node.rightChild);
				}
				if (node.data === null) {
					level.push("null");
				} else {
					level.push(node.data);
				}
			}
			levels.push(level);
		}
		console.log(levels.toString());
	}

}
