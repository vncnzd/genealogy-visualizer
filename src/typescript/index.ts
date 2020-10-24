import { SPARQLQueryDispatcher } from '../../sparqlQueryDispatcher';
import '../sass/style.scss';
import { LanguageIdentifier } from './languageIdentifier';
import { QueryBuilder } from './queryBuilder';

const languageIdentifier: LanguageIdentifier = LanguageIdentifier.EN;
const endpointUrl: string = 'https://query.wikidata.org/sparql';
const maxNumberOfConcurrentRequests = 5;
const sleepTimeForConcurrentRequestsInMilliseconds = 100;
const sparqlQueryDispatcher: SPARQLQueryDispatcher = new SPARQLQueryDispatcher(endpointUrl, maxNumberOfConcurrentRequests, sleepTimeForConcurrentRequestsInMilliseconds);
const queryBuilder: QueryBuilder = new QueryBuilder(languageIdentifier);

let query = queryBuilder.buildEntitySearchQuery("Charlemagne");
console.log(query);
sparqlQueryDispatcher.query(query).then(response => { console.log(response) });