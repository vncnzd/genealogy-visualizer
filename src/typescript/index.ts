import { jsPlumb, jsPlumbInstance } from 'jsplumb';
import '../sass/style.scss';
import { GenealogyController } from './controllers/genealogyController';
import { SearchListController } from './controllers/searchListController';
import { LanguageIdentifier } from './languageIdentifier';
import { Genealogy } from './models/genealogy';
import { Person } from './models/person';
import { SearchList } from './models/searchList';
import { QueryBuilder } from './queryBuilder';
import { SPARQLQueryDispatcher } from './sparqlQueryDispatcher';
import { GenealogyView } from './views/genealogyView';
import { SearchListView } from './views/searchListView';

const languageIdentifier: LanguageIdentifier = LanguageIdentifier.EN;
const endpointUrl: string = 'https://query.wikidata.org/sparql';
const maxNumberOfConcurrentRequests = 5;
const sleepTimeForConcurrentRequestsInMilliseconds = 10;
const sparqlQueryDispatcher: SPARQLQueryDispatcher = new SPARQLQueryDispatcher(endpointUrl, maxNumberOfConcurrentRequests, sleepTimeForConcurrentRequestsInMilliseconds);
const queryBuilder: QueryBuilder = new QueryBuilder(languageIdentifier);

// html elements
const searchButton: HTMLElement = document.querySelector('#search-button');
const searchInput: HTMLInputElement = document.querySelector("#search-input");
const searchResultTable: HTMLElement = document.querySelector("#search-results");
const jsPlumbContainer: HTMLElement = document.querySelector("#jsplumb-container");
const jsPlumbContainerWrapper: HTMLElement = document.querySelector("#jsplumb-container-wrapper");
const depthInput: HTMLInputElement = document.querySelector("#depth-input");
const descendantsButton: HTMLElement = document.querySelector("#descendants-button");
const zoomInButton: HTMLElement = document.querySelector("#zoom-in");
const zoomOutButton: HTMLElement = document.querySelector("#zoom-out");

const jsPlumbInst: jsPlumbInstance = jsPlumb.getInstance();
jsPlumbInst.setContainer(jsPlumbContainer);

const genealogy: Genealogy = new Genealogy();
const genealogyView: GenealogyView = new GenealogyView(jsPlumbContainer, jsPlumbInst, depthInput, descendantsButton, jsPlumbContainerWrapper, zoomInButton, zoomOutButton);
const genealogyController: GenealogyController = new GenealogyController(genealogy, genealogyView);

const searchList: SearchList = new SearchList();
const searchListView: SearchListView = new SearchListView(searchInput, searchButton, searchResultTable);
const searchListController = new SearchListController(searchList, searchListView, genealogyController);

Person.setQueryBuilder(queryBuilder);
Person.setSparqlQueryDispatcher(sparqlQueryDispatcher);