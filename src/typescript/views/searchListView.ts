import { LanguageManager } from "../LanguageManager";
import { Person } from "../models/person";
import { View } from "./View";

export class SearchListView extends View {
    private searchInputElement: HTMLInputElement;
    private searchButtonElement: HTMLElement;
    private searchResultTableElement: HTMLElement;
    private germanLinkElement: HTMLElement;
    private englishLinkElement: HTMLElement;

    constructor(parentElement: HTMLElement) {
        super();
        const languageManager: LanguageManager = LanguageManager.getInstance();
        const containerElement: HTMLElement = this.createHTMLElement("div", [], "search-container");
        parentElement.appendChild(containerElement);

        this.searchInputElement = document.createElement("input");
        this.searchInputElement.setAttribute("placeholder", languageManager.getCurrentLanguageData()["nameOfThePerson"]);
        this.searchInputElement.setAttribute("type", "search");
        containerElement.appendChild(this.searchInputElement);

        this.searchResultTableElement = this.createHTMLElement("table", [], "search-results-table");
        containerElement.appendChild(this.searchResultTableElement);

        const languageButtonContainer: HTMLElement = this.createHTMLElement("div", [], "language-button-container");
        parentElement.appendChild(languageButtonContainer);

        this.englishLinkElement = this.createHTMLElement("a");
        this.englishLinkElement.setAttribute("href", window.location.origin + window.location.pathname);
        this.englishLinkElement.innerText = languageManager.getCurrentLanguageData()["englishButton"];
        languageButtonContainer.appendChild(this.englishLinkElement);

        this.germanLinkElement = this.createHTMLElement("a");
        this.germanLinkElement.setAttribute("href", window.location.href + "?lang=de");
        this.germanLinkElement.innerText = languageManager.getCurrentLanguageData()["germanButton"];
        languageButtonContainer.appendChild(this.germanLinkElement);
    }

    public setSuggestionList(searchPeople: Array<Person>) {
        this.emptySearchResultsTable();

        for (const person of searchPeople) {
            const rowElement: HTMLElement = this.createHTMLElement("tr", ["search-row"]);
            rowElement.setAttribute('data-id', person.getId());
            rowElement.classList.add("search-row");
            this.searchResultTableElement.appendChild(rowElement);

            const labelDataElement: HTMLElement = this.createHTMLElement("td");
            labelDataElement.appendChild(document.createTextNode(person.getName()));
            rowElement.appendChild(labelDataElement);

            const descriptionDataElement: HTMLElement = this.createHTMLElement("td");
            descriptionDataElement.appendChild(document.createTextNode(person.getDescription()));
            rowElement.appendChild(descriptionDataElement);
        }
    }

    public setValueOfInputField(value: string): void {
        this.searchInputElement.value = value;
    }

    public emptySearchResultsTable(): void {
        this.searchResultTableElement.innerHTML = '';
    }

    public getSearchInputElement(): HTMLInputElement {
        return this.searchInputElement;
    }

    public getSearchButtonElement(): HTMLElement {
        return this.searchButtonElement;
    }

    public getResultTableElement(): HTMLElement {
        return this.searchResultTableElement;
    }
}