import '../sass/style.scss';
import { GenealogyController } from './controllers/genealogyController';
import { SearchListController } from './controllers/searchListController';
import { LanguageIdentifier } from './languageIdentifier';
import { Genealogy } from './models/genealogy';
import { Person } from './models/person';
import { SearchList } from './models/searchList';
import { QueryHelper } from './queryHelper';
import { SPARQLQueryDispatcher } from './sparqlQueryDispatcher';
import { GenealogyView } from './views/genealogyView';
import { SearchListView } from './views/searchListView';
import * as languageData from './languageData.json';
import { PersonDatabase } from './personDatabase';
import { WikidataPersonDatabase } from './wikiDataPersonDatabase';

const urlParameters: URLSearchParams = new URLSearchParams(window.location.search);
const languageParameter: string = urlParameters.get("lang");
let languageIdentifier: LanguageIdentifier;
let currentLanguageData: Object;

switch (languageParameter) {
    case "de":
        languageIdentifier = LanguageIdentifier.DE;
        currentLanguageData = languageData["de"];
        break;
    case "en":
    default:
        languageIdentifier = LanguageIdentifier["en"];
        currentLanguageData = languageData.en
        break;
}

const endpointUrl: string = 'https://query.wikidata.org/sparql';
const maxNumberOfConcurrentRequests: number = 5;
const sleepTimeForConcurrentRequestsInMilliseconds: number = 10;
const sparqlQueryDispatcher: SPARQLQueryDispatcher = new SPARQLQueryDispatcher(endpointUrl, maxNumberOfConcurrentRequests, sleepTimeForConcurrentRequestsInMilliseconds);
const queryHelper: QueryHelper = new QueryHelper(languageIdentifier);
const personDatabase: PersonDatabase = new WikidataPersonDatabase(queryHelper, sparqlQueryDispatcher);

// html elements
const searchContainer: HTMLElement = document.querySelector("#search-container");
const genealogyContainer: HTMLElement = document.querySelector("#genealogy-container");

// models, views, controllers
const genealogy: Genealogy = new Genealogy(personDatabase);
const genealogyView: GenealogyView = new GenealogyView(genealogyContainer, currentLanguageData);
const genealogyController: GenealogyController = new GenealogyController(genealogy, genealogyView);

const searchList: SearchList = new SearchList();
const searchListView: SearchListView = new SearchListView(searchContainer, currentLanguageData);
const searchListController = new SearchListController(searchList, searchListView, genealogyController, personDatabase);