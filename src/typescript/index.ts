import '../sass/style.scss';
import { SearchListController } from './controllers/searchListController';
import { LanguageIdentifier } from './languageIdentifier';
import { Person } from './models/person';
import { SearchList } from './models/searchList';
import { QueryBuilder } from './queryBuilder';
import { SPARQLQueryDispatcher } from './sparqlQueryDispatcher';
import { SearchListView } from './views/searchListView';

const languageIdentifier: LanguageIdentifier = LanguageIdentifier.EN;
const endpointUrl: string = 'https://query.wikidata.org/sparql';
const maxNumberOfConcurrentRequests = 5;
const sleepTimeForConcurrentRequestsInMilliseconds = 100;
const sparqlQueryDispatcher: SPARQLQueryDispatcher = new SPARQLQueryDispatcher(endpointUrl, maxNumberOfConcurrentRequests, sleepTimeForConcurrentRequestsInMilliseconds);
const queryBuilder: QueryBuilder = new QueryBuilder(languageIdentifier);

// html elements
const searchButton: HTMLElement = document.querySelector('#search-button');
const searchInput: HTMLInputElement = document.querySelector("#search-input");
const searchResultTable: HTMLElement = document.querySelector("#search-results");

const searchList: SearchList = new SearchList();
const searchListView: SearchListView = new SearchListView(searchInput, searchButton, searchResultTable);
const searchListController = new SearchListController(searchList, searchListView);

Person.setQueryBuilder(queryBuilder);
Person.setSparqlQueryDispatcher(sparqlQueryDispatcher);