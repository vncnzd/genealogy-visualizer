import { PersonDatabase } from "../personDatabase";
import { Person } from "./person";

export class SearchList {
    private searchResultPeople: Person[];
    private selectedPerson: Person;
    private personDatabase: PersonDatabase;

    constructor(personDatabase: PersonDatabase) {
        this.searchResultPeople = [];
        this.personDatabase = personDatabase;
    }

    private clearSearchResultPeople(): void {
        this.searchResultPeople.length = 0;
    }

    public findPersonInSearchResultPeople(id: string): Person {
        return this.searchResultPeople.find((element: Person): boolean => {
            return element.getId() === id;
        });
    }

    public findPersonByLabel(inputValue: string, limit: number = 20): Promise<Person[]> {
        const databasePromise: Promise<Person[]> = this.personDatabase.findPersonByLabel(inputValue, 20);
        
        databasePromise.then((foundPeople: Person[]): void => {
            this.clearSearchResultPeople();
            this.searchResultPeople.push(...foundPeople);
        });
        
        return databasePromise;
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