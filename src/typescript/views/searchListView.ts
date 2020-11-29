import { Person } from "../models/person";

export class SearchListView {
    private searchInputElement: HTMLInputElement;
    private searchButtonElement: HTMLElement;
    private searchResultTableElement: HTMLElement;
    private currentSelectedRowElement: HTMLElement;

    constructor(parentElement: HTMLElement) {
        this.searchInputElement = document.createElement("input");
        parentElement.appendChild(this.searchInputElement);
        this.searchInputElement.setAttribute("type", "search");

        this.searchButtonElement = document.createElement("button");
        parentElement.appendChild(this.searchButtonElement);
        this.searchButtonElement.innerHTML = "Search";

        this.searchResultTableElement = document.createElement("table");
        parentElement.appendChild(this.searchResultTableElement);
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

    public markElementAsSelected(element: HTMLElement) {
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