import {InsightError} from "./IInsightFacade";
import {QueryLogic} from "./QueryLogic";

export default class TransformsChecker {

	private groupKeys: string[];
	private applyList: any[];

	constructor() {
		this.groupKeys = [];
		this.applyList = [];
	}

	public getGroupKeys(): string[] {
		return this.groupKeys;
	}

	public getApplyList(): any[] {
		return this.applyList;
	}

	public checkTransforms(transforms: any) {
		if (transforms === undefined) {
			return;
		}
		this.checkGroup(transforms.GROUP);
		this.checkApply(transforms.APPLY);
	}

	private checkGroup(group: any) {
		if (group === undefined) {
			throw new InsightError("Missing GROUP");
		} else if (typeof group[Symbol.iterator] !== "function" || group.length === 0) {
			throw new InsightError("GROUP must be a non-empty array");
		}

		for (let key of group) {
			if (!QueryLogic.isMkey(key) && !QueryLogic.isSkey(key)) {
				throw new InsightError("Invalid key in GROUP");
			}
		}

		this.groupKeys = group;
	}

	private checkApply(apply: any) {
		if (apply === undefined) {
			throw new InsightError("Missing APPLY");
		} else if (typeof apply[Symbol.iterator] !== "function") {
			throw new InsightError("APPLY must be an array");
		}

		for (let applyRule of apply) {
			this.checkApplyRule(applyRule);
		}
		this.applyList = apply;
	}

	public checkApplyRule(applyRule: any) {
		// jesus christ
		if (typeof applyRule !== "object" || applyRule === null) {
			throw new InsightError("APPLYRULE must be an object");
		} else if (Object.keys(applyRule).length !== 1) {
			throw new InsightError("APPLYRULE must contain 1 key");
		} else if (!QueryLogic.isApplyKey(Object.keys(applyRule)[0])) {
			throw new InsightError("Invalid APPLYKEY in APPLYRULE");
		} else if (typeof Object.values(applyRule)[0] !== "object" || typeof Object.values(applyRule)[0] === null) {
			throw new InsightError("APPLY body must be an object");
		}
		let applyKey: any = Object.keys(applyRule)[0];
		let innerObj: any = Object.values(applyRule)[0];
		if (Object.keys(innerObj).length !== 1) {
			throw new InsightError("APPLY body must have 1 key");
		} else if (typeof Object.values(innerObj)[0] !== "string") {
			throw new InsightError("APPLYRULE target key must be a string");
		} else if (!QueryLogic.isApplyToken(Object.keys(innerObj)[0])) {
			throw new InsightError("Invalid APPLYTOKEN");
		} else {
			let applyToken: string = Object.keys(innerObj)[0];
			let key: any = Object.values(innerObj)[0];
			if (applyToken !== "COUNT" && !QueryLogic.isMkey(key)) {
				throw new InsightError("Invalid key type in " + applyToken);
			} else if (!QueryLogic.isMkey(key) && !QueryLogic.isSkey(key)) {
				throw new InsightError("Invalid key " + key + " in " + applyToken);
			}
		}
	}
}
