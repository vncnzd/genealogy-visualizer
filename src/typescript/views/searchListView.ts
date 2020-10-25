import { Person } from "../models/person";

export class SearchListView {
    private searchInputElement: HTMLInputElement;
    private searchButtonElement: HTMLElement;
    private searchResultTableElement: HTMLElement;
    private currentSelectedRowElement: HTMLElement;

    constructor(searchInputElement: HTMLInputElement, searchButtonElement: HTMLElement, searchResultTable: HTMLElement) {
        this.searchInputElement = searchInputElement;
        this.searchButtonElement = searchButtonElement;
        this.searchResultTableElement = searchResultTable;
    }

    public updateList(searchPeople: Array<Person>) {
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

    public markListElementAsSelected(element: HTMLElement) {
        if (this.currentSelectedRowElement != null) {
            this.currentSelectedRowElement.classList.remove("selected-row");
        }

        this.currentSelectedRowElement = element;
        this.currentSelectedRowElement.classList.add("selected-row");
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