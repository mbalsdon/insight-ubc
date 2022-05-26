export class QueryLogic {

	// REQUIRES: valid key input
	// Return true if the given key is an MKEY, false otherwise
	public static isMkey(key: string): boolean {
		let id = this.getID(key);
		return (key === id + "_avg"
			|| key === id + "_pass"
			|| key === id + "_fail"
			|| key === id + "_audit"
			|| key === id + "_year"
			|| key === id + "_lat"
			|| key === id + "_lon"
			|| key === id + "_seats");
	}

	public static isSkey(key: string): boolean {
		let id = this.getID(key);
		return (key === id + "_dept"
			|| key === id + "_id"
			|| key === id + "_instructor"
			|| key === id + "_title"
			|| key === id + "_uuid"
			|| key === id + "_fullname"
			|| key === id + "_shortname"
			|| key === id + "_number"
			|| key === id + "_name"
			|| key === id + "_address"
			|| key === id + "_type"
			|| key === id + "_furniture"
			|| key === id + "_href");
	}

	public static isApplyKey(key: string): boolean {
		return !key.includes("_");
	}

	public static isApplyToken(token: string): boolean {
		return (token === "MAX"
		|| token === "MIN"
		|| token === "AVG"
		|| token === "COUNT"
		|| token === "SUM");
	}

	public static isCourseKey(key: string): boolean {
		let field: string = this.getField(key);
		return (field === "avg" || field === "pass" || field === "fail" || field === "audit" || field === "year"
			|| field === "dept" || field === "id" || field === "instructor" || field === "title"
			|| field === "uuid");
	}

	public static isRoomKey(key: string): boolean {
		let field: string = this.getField(key);
		return (field === "lat" || field === "lon" || field === "seats" || field === "fullname"
			|| field === "shortname" || field === "number" || field === "name" || field === "address"
			|| field === "type" || field === "furniture" || field === "href");
	}

	// REQUIRES: valid mkey/skey input
	// Returns the ID part of a KEY. For example, input "courses_avg" will return "courses"
	public static getID(key: string): string {
		return key.slice(0, key.indexOf("_"));
	}

	public static getField(key: string): string {
		return key.slice(key.indexOf("_") + 1, key.length);
	}

	public static makeGroupName(course: any, groupCourseFields: string[]): string {
		let groupName: string = "";
		for (let courseField of groupCourseFields) {
			groupName += course[courseField].toString();
			groupName += "&";
		}
		return groupName;
	}

	// Return true if the given object is a valid FILTER, false otherwise
	public static isFilter(object: any): boolean {
		return (this.isLogic(object)
			|| this.isMcomparison(object)
			|| this.isScomparison(object)
			|| this.isNegation(object));
	}

	// Return true if the given object is a valid LOGICCOMPARISON, false otherwise
	public static isLogic(object: any): boolean {
		return ((object.AND !== undefined) || (object.OR !== undefined));
	}

	// Return true if the given object is a valid MCOMPARISON, false otherwise
	public static isMcomparison(object: any): boolean {
		return ((object.GT !== undefined) || (object.LT !== undefined) || (object.EQ !== undefined));
	}

	// Return true if the given object is a valid SCOMPARISON, false otherwise
	public static isScomparison(object: any): boolean {
		return (object.IS !== undefined);
	}

	// Return true if the given object is a valid NEGATION, false otherwise
	public static isNegation(negIn: any): boolean {
		return (negIn.NOT !== undefined);
	}

}
