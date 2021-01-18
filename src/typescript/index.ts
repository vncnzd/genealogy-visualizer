import '../sass/style.scss';
import { GenealogyController } from './controllers/genealogyController';
import { SearchListController } from './controllers/searchListController';
import { Genealogy } from './models/genealogy';
import { SearchList } from './models/searchList';
import { QueryHelper } from './queryHelper';
import { SPARQLQueryDispatcher } from './sparqlQueryDispatcher';
import { GenealogyView } from './views/genealogyView';
import { SearchListView } from './views/searchListView';
import { PersonDatabase } from './personDatabase';
import { WikidataPersonDatabase } from './wikiDataPersonDatabase';
import { LanguageManager } from './LanguageManager';

const urlParameters: URLSearchParams = new URLSearchParams(window.location.search);
const languageParameter: string = urlParameters.get("lang");

const languageManager: LanguageManager = new LanguageManager();
languageManager.setlanguage(languageParameter);

const endpointUrl: string = 'https://query.wikidata.org/sparql';
const maxNumberOfConcurrentRequests: number = 5;
const sleepTimeForConcurrentRequestsInMilliseconds: number = 10;
const sparqlQueryDispatcher: SPARQLQueryDispatcher = new SPARQLQueryDispatcher(endpointUrl, maxNumberOfConcurrentRequests, sleepTimeForConcurrentRequestsInMilliseconds);
const queryHelper: QueryHelper = new QueryHelper(languageManager.getCurrentLanguageId());
const personDatabase: PersonDatabase = new WikidataPersonDatabase(queryHelper, sparqlQueryDispatcher);

// html elements
const searchListContainer: HTMLElement = document.querySelector("#search-container");
const genealogyContainer: HTMLElement = document.querySelector("#genealogy-container");

// models, views, controllers
const genealogy: Genealogy = new Genealogy(personDatabase);
const genealogyView: GenealogyView = new GenealogyView(genealogyContainer, languageManager.getCurrentLanguageData());
const genealogyController: GenealogyController = new GenealogyController(genealogy, genealogyView);

const searchList: SearchList = new SearchList();
const searchListView: SearchListView = new SearchListView(searchListContainer, languageManager.getCurrentLanguageData());
const searchListController = new SearchListController(searchList, searchListView, genealogyController, personDatabase);