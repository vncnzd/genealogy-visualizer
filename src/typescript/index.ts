import '../sass/style.scss';
import { LanguageIdentifier } from './languageIdentifier';
import { QueryBuilder } from './queryBuilder';
import { SPARQLQueryDispatcher } from './sparqlQueryDispatcher';

const languageIdentifier: LanguageIdentifier = LanguageIdentifier.EN;
const endpointUrl: string = 'https://query.wikidata.org/sparql';
const maxNumberOfConcurrentRequests = 5;
const sleepTimeForConcurrentRequestsInMilliseconds = 100;
const sparqlQueryDispatcher: SPARQLQueryDispatcher = new SPARQLQueryDispatcher(endpointUrl, maxNumberOfConcurrentRequests, sleepTimeForConcurrentRequestsInMilliseconds);
const queryBuilder: QueryBuilder = new QueryBuilder(languageIdentifier);

let entitySearchQuery = queryBuilder.buildEntitySearchQuery("Charlemagne");
let childrenQuery = queryBuilder.buildGetChildrenQuery("Q3044");
let fatherQuery = queryBuilder.buildGetFatherQuery("Q3044")

sparqlQueryDispatcher.query(entitySearchQuery).then(response => { console.log(response) });
sparqlQueryDispatcher.query(childrenQuery).then(response => { console.log(response) });
sparqlQueryDispatcher.query(fatherQuery).then(response => { console.log(response) });