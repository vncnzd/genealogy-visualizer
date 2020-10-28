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
const sleepTimeForConcurrentRequestsInMilliseconds = 50;
const sparqlQueryDispatcher: SPARQLQueryDispatcher = new SPARQLQueryDispatcher(endpointUrl, maxNumberOfConcurrentRequests, sleepTimeForConcurrentRequestsInMilliseconds);
const queryBuilder: QueryBuilder = new QueryBuilder(languageIdentifier);

// html elements
const searchButton: HTMLElement = document.querySelector('#search-button');
const searchInput: HTMLInputElement = document.querySelector("#search-input");
const searchResultTable: HTMLElement = document.querySelector("#search-results");
const jsPlumbContainer: HTMLElement = document.querySelector("#jsplumb-container");
const jsPlumbContainerContainer: HTMLElement = document.querySelector("#jsplumb-container-container");
const depthInput: HTMLInputElement = document.querySelector("#depth-input");
const descendantsButton: HTMLElement = document.querySelector("#descendants-button");
const zoomInButton: HTMLElement = document.querySelector("#zoom-in");
const zoomOutButton: HTMLElement = document.querySelector("#zoom-out");

const jsPlumbInst: jsPlumbInstance = jsPlumb.getInstance();
jsPlumbInst.setZoom(0.5);
jsPlumbInst.setContainer(jsPlumbContainer);

const genealogy: Genealogy = new Genealogy();
const genealogyView: GenealogyView = new GenealogyView(jsPlumbContainer, jsPlumbInst, depthInput, descendantsButton);
const genealogyController: GenealogyController = new GenealogyController(genealogy, genealogyView);

const searchList: SearchList = new SearchList();
const searchListView: SearchListView = new SearchListView(searchInput, searchButton, searchResultTable);
const searchListController = new SearchListController(searchList, searchListView, genealogyController);

Person.setQueryBuilder(queryBuilder);
Person.setSparqlQueryDispatcher(sparqlQueryDispatcher);

// tests

let scale = 1;
let isPaning: boolean = false;
let lastX: number = 0;
let lastY: number = 0;
let transformX: number = 0;
let transformY: number = 0

zoomOutButton.addEventListener("click", (event: MouseEvent) => {
    scale -= 0.1;
    if (scale < 0.1) {
        scale = 0.1;
    }
    jsPlumbInst.setZoom(scale);
    jsPlumbContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${transformX}, ${transformY})`;
});

zoomInButton.addEventListener("click", (event: MouseEvent) => {
    scale += 0.1;
    jsPlumbInst.setZoom(scale);
    jsPlumbContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${transformX}, ${transformY})`;
});

jsPlumbContainerContainer.addEventListener("mousedown", (event: MouseEvent) => {
    lastX = event.offsetX;
    lastY = event.offsetY;
    console.log(lastX);
    console.log(lastY);
    isPaning = true;
});

jsPlumbContainerContainer.addEventListener("mousemove", (event: MouseEvent) => {
    if (isPaning) {
        console.log("Paning");

        let xDifference = event.offsetX - lastX;
        let yDifference = event.offsetY - lastY;

        lastX = event.offsetX;
        lastY = event.offsetY;

        console.log(`Last X: ${xDifference}, Last Y: ${yDifference}`);

        transformX += xDifference;
        transformY += yDifference;
        
        jsPlumbContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${transformX}, ${transformY})`;
        jsPlumbInst.repaintEverything();
    }
});

jsPlumbContainerContainer.addEventListener("mouseup", (event: MouseEvent) => {
    isPaning = false;
});