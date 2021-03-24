import { Person } from "../models/person";

export class SearchListView {
    private searchInputElement: HTMLInputElement;
    private searchButtonElement: HTMLElement;
    private searchResultTableElement: HTMLElement;
    private currentSelectedRowElement: HTMLElement;

    constructor(parentElement: HTMLElement, languageData: Object) {
        let containerElement: HTMLElement = document.createElement("div");
        containerElement.id = "search-container";
        parentElement.appendChild(containerElement);

        this.searchInputElement = document.createElement("input");
        this.searchInputElement.setAttribute("placeholder", "Name of the person");
        this.searchInputElement.setAttribute("type", "search");
        containerElement.appendChild(this.searchInputElement);

        this.searchResultTableElement = document.createElement("table");
        this.searchResultTableElement.id = "search-results-table";
        containerElement.appendChild(this.searchResultTableElement);
    }

    public setSuggestionList(searchPeople: Array<Person>) {
        this.searchResultTableElement.innerHTML = ''; // empties the html list

        for (const person of searchPeople) {
            let rowElement: HTMLElement = document.createElement("tr");
            rowElement.setAttribute('data-id', person.getId());
            rowElement.classList.add("search-row");
            this.searchResultTableElement.appendChild(rowElement);

            let labelDataElement: HTMLElement = document.createElement("td");
            let labelDataTextNode: Text = document.createTextNode(person.getName());
            labelDataElement.appendChild(labelDataTextNode);
            rowElement.appendChild(labelDataElement);

            let descriptionDataElement: HTMLElement = document.createElement("td");
            let descriptionDataTextNode: Text = document.createTextNode(person.getDescription());
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

    // getters and setters

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