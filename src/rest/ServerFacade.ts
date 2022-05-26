import InsightFacade from "../controller/InsightFacade";
import {Request, Response} from "express";
import {InsightDataset, InsightDatasetKind, NotFoundError} from "../controller/IInsightFacade";

export default class ServerFacade {
	private facade: InsightFacade;

	constructor() {
		this.facade = new InsightFacade();
		this.addDataset = this.addDataset.bind(this);
		this.removeDataset = this.removeDataset.bind(this);
		this.listDatasets = this.listDatasets.bind(this);
		this.performQuery = this.performQuery.bind(this);
	}

	// The next two methods handle the echo service.
	public static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = ServerFacade.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}

	public addDataset(req: Request, res: Response) {
		console.log(`Server::addDataset(..) - params: ${JSON.stringify(req.params)}`);
		console.log(req.body);

		let convertedZipData: string = req.body.toString("base64");
		let kind: InsightDatasetKind = InsightDatasetKind.Courses;
		if (req.params.kind === "rooms") {
			kind = InsightDatasetKind.Rooms;
		} else if (req.params.kind === "courses") {
			kind = InsightDatasetKind.Courses;
		} else {
			res.status(400).json({error: "Invalid dataset kind"});
		}

		this.facade.addDataset(req.params.id, convertedZipData, kind)
			.then((response: string[]) => {
				res.status(200).json({result: response});
			})
			.catch((err: any) => {
				res.status(400).json({error: err.message});
			});

	}

	public removeDataset(req: Request, res: Response) {
		console.log(`Server::removeDataset(..) - params: ${JSON.stringify(req.params)}`);
		this.facade.removeDataset(req.params.id)
			.then((response: string) => {
				res.status(200).json({result: response});
			})
			.catch((err: any) => {
				let code: number;
				if (err instanceof NotFoundError) {
					code = 404;
				} else {
					code = 400;
				}
				res.status(code).json({error: err.message});
			});
	}

	public listDatasets(req: Request, res: Response) {
		console.log("Server::listDatasets(..)");
		this.facade.listDatasets()
			.then((response: InsightDataset[]) => {
				res.status(200).json({result: response});
			});
	}

	public performQuery(req: Request, res: Response) {
		console.log("Server::performQuery(..) - POST body: ");
		console.log(req.body);

		this.facade.dataHandler.clearCache().then(() => {
			return this.facade.dataHandler.loadData();
		}).then((data: string[]) => {
			return this.facade.dataHandler.saveToCache(data);
		}).then(() => {

			this.facade.performQuery(req.body)
				.then((response: any[]) => {
					res.status(200).json({result: response});
				})
				.catch((err: any) => {
					res.status(400).json({error: err.message});
				});
		});
	}

}
