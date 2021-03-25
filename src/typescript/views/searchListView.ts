import { LanguageManager } from "../LanguageManager";
import { Person } from "../models/person";

export class SearchListView {
    private searchInputElement: HTMLInputElement;
    private searchButtonElement: HTMLElement;
    private searchResultTableElement: HTMLElement;
    private germanLinkElement: HTMLElement;
    private englishLinkElement: HTMLElement;

    constructor(parentElement: HTMLElement) {
        const languageManager: LanguageManager = LanguageManager.getInstance();
        const containerElement: HTMLElement = document.createElement("div");
        containerElement.id = "search-container";
        parentElement.appendChild(containerElement);

        this.searchInputElement = document.createElement("input");
        this.searchInputElement.setAttribute("placeholder", languageManager.getCurrentLanguageData()["nameOfThePerson"]);
        this.searchInputElement.setAttribute("type", "search");
        containerElement.appendChild(this.searchInputElement);

        this.searchResultTableElement = document.createElement("table");
        this.searchResultTableElement.id = "search-results-table";
        containerElement.appendChild(this.searchResultTableElement);

        const languageButtonContainer: HTMLElement = document.createElement("div");
        languageButtonContainer.id = "language-button-container";
        parentElement.appendChild(languageButtonContainer);

        this.englishLinkElement = document.createElement("a");
        this.englishLinkElement.setAttribute("href", window.location.origin + window.location.pathname);
        this.englishLinkElement.innerText = languageManager.getCurrentLanguageData()["englishButton"];
        languageButtonContainer.appendChild(this.englishLinkElement);

        this.germanLinkElement = document.createElement("a");
        this.germanLinkElement.setAttribute("href", window.location.href + "?lang=de");
        this.germanLinkElement.innerText = languageManager.getCurrentLanguageData()["germanButton"];
        languageButtonContainer.appendChild(this.germanLinkElement);
    }

    public setSuggestionList(searchPeople: Array<Person>) {
        this.emptySearchResultsTable();

        for (const person of searchPeople) {
            const rowElement: HTMLElement = document.createElement("tr");
            rowElement.setAttribute('data-id', person.getId());
            rowElement.classList.add("search-row");
            this.searchResultTableElement.appendChild(rowElement);

            const labelDataElement: HTMLElement = document.createElement("td");
            const labelDataTextNode: Text = document.createTextNode(person.getName());
            labelDataElement.appendChild(labelDataTextNode);
            rowElement.appendChild(labelDataElement);

            const descriptionDataElement: HTMLElement = document.createElement("td");
            const descriptionDataTextNode: Text = document.createTextNode(person.getDescription());
            descriptionDataElement.appendChild(descriptionDataTextNode);
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