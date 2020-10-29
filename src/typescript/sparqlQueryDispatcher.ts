import { LanguageIdentifier } from "./languageIdentifier";

export class SPARQLQueryDispatcher {
	private endpoint: string;
	private numberOfConcurrentRequests: number;
	private maxNumberOfConcurrentRequests: number;
	private sleepTimeoutInMilliSeconds: number;

	constructor(endpoint: string, maxNumberOfConcurrentRequests: number, sleepTimeoutInMilliseconds: number = 100) {
		this.numberOfConcurrentRequests = 0;
		this.endpoint = endpoint;
		this.maxNumberOfConcurrentRequests = maxNumberOfConcurrentRequests;
		this.sleepTimeoutInMilliSeconds = sleepTimeoutInMilliseconds;
	}

	async query(sparqlQuery): Promise<string> {
		await this.waitIfThereAreTooManyConcurrentRequests();

		const fullUrl: string = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
		const headers: HeadersInit = { 'Accept': 'application/sparql-results+json' };
		this.numberOfConcurrentRequests++;
		
		return fetch(fullUrl, {headers}).then(response => {
			return response.json(); 
		}).catch((error) => {
			console.error(error);
		}).finally(() => {
			this.numberOfConcurrentRequests--;
			console.log(this.numberOfConcurrentRequests);
		});
	}

	public setMaxNumberOfConcurrentRequests(maxNumberOfConcurrentRequests: number): void {
		if (maxNumberOfConcurrentRequests < 1) {
			console.info("There is an attempt to set the max number of concurrent requests below 1")
		} else {
			this.maxNumberOfConcurrentRequests = maxNumberOfConcurrentRequests;
		}
	}

	private async waitIfThereAreTooManyConcurrentRequests() {
		// makes sure, that only maxNumberOfConcurrentRequests are done at the same time
		while (this.numberOfConcurrentRequests >= this.maxNumberOfConcurrentRequests) {
			await new Promise(r => setTimeout(r, this.sleepTimeoutInMilliSeconds));
		}
	}
}