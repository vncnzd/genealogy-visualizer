export class SPARQLQueryDispatcher {
	private endpointUrl: string;
	private numberOfConcurrentRequests: number;
	private maxNumberOfConcurrentRequests: number;
	private sleepTimeoutInMilliSeconds: number;
	private requestInit: RequestInit;

	constructor(endpoint: string, maxNumberOfConcurrentRequests: number = 5, sleepTimeoutInMilliseconds: number = 100) {
		this.numberOfConcurrentRequests = 0;
		this.endpointUrl = endpoint;
		this.maxNumberOfConcurrentRequests = maxNumberOfConcurrentRequests;
		this.sleepTimeoutInMilliSeconds = sleepTimeoutInMilliseconds;
		this.requestInit = { 
			headers: { 'Accept': 'application/sparql-results+json' } 
		};
	}

	public async query(sparqlQuery: string): Promise<string> {
		// This makes sure, that only maxNumberOfConcurrentRequests requests are made at the same time.
		while (this.numberOfConcurrentRequests >= this.maxNumberOfConcurrentRequests) {
			await this.sleep(this.sleepTimeoutInMilliSeconds);
		}

		const fullUrl: string = this.endpointUrl + '?query=' + encodeURIComponent(sparqlQuery);
		this.numberOfConcurrentRequests++;
		// console.log("Number of concurrent Requests: " + this.numberOfConcurrentRequests);
		
		return fetch(fullUrl, this.requestInit).then(response => {
			return response.json(); 
		}).catch((error) => {
			console.error(error);
		}).finally(() => {
			this.numberOfConcurrentRequests--;
		});
	}

	public setMaxNumberOfConcurrentRequests(maxNumberOfConcurrentRequests: number): void {
		if (maxNumberOfConcurrentRequests < 1) {
			this.maxNumberOfConcurrentRequests = 1;
			console.info("There is an attempt to set the max number of concurrent requests below 1.")
		} else {
			this.maxNumberOfConcurrentRequests = maxNumberOfConcurrentRequests;
		}
	}

	private async sleep(durationInMilliseconds: number): Promise<unknown> {
		return new Promise(resolve => setTimeout(resolve, durationInMilliseconds));
	}
}