import { Person } from "./person";

export class SearchList {
    private searchResultPeople: Person[];
    private selectedPerson: Person;

    constructor() {
        this.searchResultPeople = [];
        this.selectedPerson = null;
    }

    public clearSearchResultPeople(): void {
        this.searchResultPeople.length = 0;
    }

    public findPersonInSearchResultPeople(id: string): Person {
        return this.searchResultPeople.find((element: Person): boolean => {
            return element.getId() === id;
        });
    }

    // getters and setters

    public getSearchResultPeople(): Person[] {
        return this.searchResultPeople;
    }

    public getSelectedPerson(): Person {
        return this.selectedPerson;
    }

    public setSelectedPerson(person: Person): void {
        this.selectedPerson = person;
    }
}