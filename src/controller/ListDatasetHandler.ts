import {InsightDataset} from "./IInsightFacade";
import DataHandler from "./DataHandler";

export default class RemoveDatasetHandler {
	private dataHandler: DataHandler;

	constructor(dataHandler: DataHandler) {
		this.dataHandler = dataHandler;
	}

	public listData(): Promise<InsightDataset[]> {
		return this.dataHandler.clearCache().then(() => {
			return this.dataHandler.loadData();
		}).then((data) => {
			return this.dataHandler.saveToCache(data);
		}).then(() => {
			return Promise.resolve(this.dataHandler.insightDatasets);
		});
	}
}
