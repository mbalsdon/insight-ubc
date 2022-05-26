import {QueryLogic} from "./QueryLogic";
import Decimal from "decimal.js";

export enum ApplyRule {
	max = 0,
	min = 1,
	avg = 2,
	sum = 3,
	count = 4
}
export default class Group {

	private name: string;
	private courses: any[];
	private applyRuleVals: number[];
	private applyKeys: string[];

	constructor(name: string) {
		this.name = name;
		this.courses = [];
		this.applyRuleVals = [-1, -1, -1, -1, -1];
		this.applyKeys = ["", "", "", "", ""];
	}

	public getName(): string {
		return this.name;
	}

	public getCourses(): any[] {
		return this.courses;
	}

	public getApplyRuleVal(rule: ApplyRule): number {
		if (rule === ApplyRule.max) {
			return this.applyRuleVals[ApplyRule.max];
		} else if (rule === ApplyRule.min) {
			return this.applyRuleVals[ApplyRule.min];
		} else if (rule === ApplyRule.avg) {
			return this.applyRuleVals[ApplyRule.avg];
		} else if (rule === ApplyRule.sum) {
			return this.applyRuleVals[ApplyRule.sum];
		} else if (rule === ApplyRule.count) {
			return this.applyRuleVals[ApplyRule.count];
		} else {
			throw new Error("getApplyRuleVal was passed an invalid APPLYRULE - this should never happen!");
		}
	}

	public getApplyKey(rule: ApplyRule): string {
		if (rule === ApplyRule.max) {
			return this.applyKeys[ApplyRule.max];
		} else if (rule === ApplyRule.min) {
			return this.applyKeys[ApplyRule.min];
		} else if (rule === ApplyRule.avg) {
			return this.applyKeys[ApplyRule.avg];
		} else if (rule === ApplyRule.sum) {
			return this.applyKeys[ApplyRule.sum];
		} else if (rule === ApplyRule.count) {
			return this.applyKeys[ApplyRule.count];
		} else {
			throw new Error("getApplyKey was passed an invalid APPLYRULE - this should never happen!");
		}
	}

	public pushCourse(course: any) {
		this.courses.push(course);
	}

	public doApply(applyTriple: string[]) {
		// applykey, applyrule, targetkey
		if (applyTriple[1] === "MAX") {
			this.calculateMax(applyTriple[2]);
			this.applyKeys[ApplyRule.max] = applyTriple[0];
		} else if (applyTriple[1] === "MIN") {
			this.calculateMin(applyTriple[2]);
			this.applyKeys[ApplyRule.min] = applyTriple[0];
		} else if (applyTriple[1] === "AVG") {
			this.calculateAvg(applyTriple[2]);
			this.applyKeys[ApplyRule.avg] = applyTriple[0];
		} else if (applyTriple[1] === "SUM") {
			this.calculateSum(applyTriple[2]);
			this.applyKeys[ApplyRule.sum] = applyTriple[0];
		} else if (applyTriple[1] === "COUNT") {
			this.calculateCount(applyTriple[2]);
			this.applyKeys[ApplyRule.count] = applyTriple[0];
		} else {
			throw new Error("doApply was passed an applyTriple without a valid APPLYRULE - " +
				"this should never happen!");
		}
	}

	public calculateMax(courseField: string) {
		this.applyRuleVals[ApplyRule.max] = this.courses[0][courseField];
		for (let course of this.courses) {
			if (course[courseField] > this.applyRuleVals[ApplyRule.max]) {
				this.applyRuleVals[ApplyRule.max] = course[courseField];
			}
		}
	}

	public calculateMin(courseField: string) {
		this.applyRuleVals[ApplyRule.min] = this.courses[0][courseField];
		for (let course of this.courses) {
			if (course[courseField] < this.applyRuleVals[ApplyRule.min]) {
				this.applyRuleVals[ApplyRule.min] = course[courseField];
			}
		}
	}

	public calculateAvg(courseField: string) {
		let total: Decimal = new Decimal(0);
		for (let course of this.courses) {
			let value: Decimal = new Decimal(course[courseField]);
			total = total.add(value);
		}
		let avg = total.toNumber() / this.courses.length;
		this.applyRuleVals[ApplyRule.avg] = Number(avg.toFixed(2));
	}

	public calculateSum(courseField: string) {
		let sum: number = 0;
		for (let course of this.courses) {
			sum += course[courseField];
		}
		this.applyRuleVals[ApplyRule.sum] = Number(sum.toFixed(2));
	}

	public calculateCount(courseField: string) {
		this.applyRuleVals[ApplyRule.count] = 0;
		let set: any[] = [];
		for (let course of this.courses) {
			if (!set.includes(course[courseField])) {
				set.push(course[courseField]);
				this.applyRuleVals[ApplyRule.count] = this.applyRuleVals[ApplyRule.count] + 1;
			}
		}
	}

	public static convertGroups(groups: Group[], columnKeys: string[]): any[] {
		let returnArray: any[] = [];

		for (let group of groups) {

			let converted: any = {};
			for (let colKey of columnKeys) {
				let field: string;
				if (QueryLogic.isApplyKey(colKey)) {
					field = colKey;
					if (group.getApplyKey(ApplyRule.max) === colKey) {
						converted[colKey] = group.getApplyRuleVal(ApplyRule.max);
					} else if (group.getApplyKey(ApplyRule.min) === colKey) {
						converted[colKey] = group.getApplyRuleVal(ApplyRule.min);
					} else if (group.getApplyKey(ApplyRule.avg) === colKey) {
						converted[colKey] = group.getApplyRuleVal(ApplyRule.avg);
					} else if (group.getApplyKey(ApplyRule.sum) === colKey) {
						converted[colKey] = group.getApplyRuleVal(ApplyRule.sum);
					} else if (group.getApplyKey(ApplyRule.count) === colKey) {
						converted[colKey] = group.getApplyRuleVal(ApplyRule.count);
					} else {
						throw new Error("convertGroups was called in an InsightFacade with an invalid applykey - " +
							"this should never happen!");
					}
				} else if (QueryLogic.isMkey(colKey) || QueryLogic.isSkey(colKey)) {
					field = QueryLogic.getField(colKey);
					converted[colKey] = group.getCourses()[0][colKey];
				} else {
					throw new Error("convertGroups was called in an InsightFacade with an invalid colKey - " +
						"this should never happen!");
				}
			}
			returnArray.push(converted);
		}
		return returnArray;
	}

	public static groupCourses(matchingCourses: any[], groupKeys: string[]): Group[] {
		let groups: Group[] = [];

		for (let course of matchingCourses) {
			let groupName: string = QueryLogic.makeGroupName(course, groupKeys);
			let groupIndex: number = groups.findIndex((group: Group) => group.getName() === groupName);
			// if the group already exists, add the course to it. if not, make a new group
			if (groupIndex !== -1) {
				groups[groupIndex].pushCourse(course);
			} else {
				let group: Group = new Group(groupName);
				group.pushCourse(course);
				groups.push(group);
			}
		}
		return groups;
	}

	public static applyToGroups(groups: Group[], applyList: string[][]) {
		for (let group of groups) {
			for (let applyTriple of applyList) {
				group.doApply(applyTriple);
			}
		}
	}

	public static convertCourses(matchingCourses: any[], columnKeys: string[]): any[] {
		let returnArray: any[] = [];
		for (let course of matchingCourses) {
			let converted: any = {};
			for (let colKey of columnKeys) {
				converted[colKey] = course[colKey];
			}
			returnArray.push(converted);
		}
		return returnArray;
	}

	public static makeApplyList(apply: any): string[][] {
		let applyList: string[][] = [];
		for (let obj of apply) {
			let applyKey: any = Object.keys(obj)[0];
			let innerObj: any = Object.values(obj)[0];
			let applyRule: any = Object.keys(innerObj)[0];
			let targetKey: any = Object.values(innerObj)[0];
			let triple: string[] = [applyKey, applyRule, targetKey];
			applyList.push(triple);
		}
		return applyList;
	}

}
