import '../sass/style.scss';
import { LanguageIdentifier } from './languageIdentifier';
import { Person } from './models/person';
import { QueryBuilder } from './queryBuilder';
import { SPARQLQueryDispatcher } from './sparqlQueryDispatcher';

const languageIdentifier: LanguageIdentifier = LanguageIdentifier.EN;
const endpointUrl: string = 'https://query.wikidata.org/sparql';
const maxNumberOfConcurrentRequests = 5;
const sleepTimeForConcurrentRequestsInMilliseconds = 100;
const sparqlQueryDispatcher: SPARQLQueryDispatcher = new SPARQLQueryDispatcher(endpointUrl, maxNumberOfConcurrentRequests, sleepTimeForConcurrentRequestsInMilliseconds);
const queryBuilder: QueryBuilder = new QueryBuilder(languageIdentifier);

Person.setQueryBuilder(queryBuilder);
Person.setSparqlQueryDispatcher(sparqlQueryDispatcher);

Person.findHumansByEntitySearch("cleopatra").then((person: Person[]) => console.log(person));

// let personID = "Q3044";
// let entitySearchQuery = queryBuilder.buildEntitySearchQuery("Charlemagne");
// let childrenQuery = queryBuilder.buildGetChildrenQuery(personID);
// let fatherQuery = queryBuilder.buildGetFatherQuery(personID);
// let motherQuery = queryBuilder.buildGetMotherQuery(personID);
// let parentsQuery = queryBuilder.buildGetParentsQuery(personID);

// sparqlQueryDispatcher.query(entitySearchQuery).then(response => { console.log(response) });
// sparqlQueryDispatcher.query(childrenQuery).then(response => { console.log(response) });
// sparqlQueryDispatcher.query(fatherQuery).then(response => { console.log(response) });
// sparqlQueryDispatcher.query(motherQuery).then(response => { console.log(response) });
// sparqlQueryDispatcher.query(parentsQuery).then(response => { console.log(response) });
