import { Person } from "./person";

export class SearchList {
    private resultPeople: Person[];
    private selectedPerson: Person;

    constructor() {
        this.resultPeople = [];
    }

    public clearResultPeople(): void {
        this.resultPeople.length = 0;
    }

    public findPersonInResultPeople(id: string): Person {
        return this.resultPeople.find(element => {
            return element.getId() === id;
        });
    }

    // getters and setters

    public getResultPeople(): Person[] {
        return this.resultPeople;
    }

    public getSelectedPerson(): Person {
        return this.selectedPerson;
    }

    public setSelectedPerson(person: Person): void {
        this.selectedPerson = person;
    }
}