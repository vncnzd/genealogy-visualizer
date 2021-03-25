import { Person } from "./models/person";
import { PersonDatabase } from "./personDatabase";
import { QueryHelper } from "./queryHelper";
import { SexOrGender } from "./sexOrGender";
import { SexOrGenderId } from "./sexOrGenderId";
import { SPARQLQueryDispatcher } from "./sparqlQueryDispatcher";

export class WikidataPersonDatabase implements PersonDatabase {
    private queryHelper: QueryHelper;
    private sparqlQueryDispatcher: SPARQLQueryDispatcher;
    
    constructor(queryHelper: QueryHelper, sparqlQueryDispatcher: SPARQLQueryDispatcher) {
        this.queryHelper = queryHelper;
        this.sparqlQueryDispatcher = sparqlQueryDispatcher;
    }

    public getFatherOfPersonWithId(id: string): Promise<Person> {
        const query = this.queryHelper.getFatherQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            const father = this.getFirstPersonFromArray(listOfPeople);
            
            return father;
        });
    }

    public getMotherOfPersonWithId(id: string): Promise<Person> {
        const query = this.queryHelper.getMotherQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            const mother = this.getFirstPersonFromArray(listOfPeople);
            
            return mother;
        });
    }

    public getParentsOfPersonWithId(id: string): Promise<Array<Person>> {
        const query: string = this.queryHelper.getParentsQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            return listOfPeople;
        });
    }

    public getChildrenOfPersonWithId(id: string): Promise<Person[]> {
        const query = this.queryHelper.getChildrenQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            return listOfPeople;
        });
    }

    public findPersonByLabel(label: string, resultLimit: number): Promise<Person[]> {
        const query = this.queryHelper.getEntitySearchQuery(label, resultLimit);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            return listOfPeople;
        });
    }

    private getFirstPersonFromArray(people: Person[]): Person {
        if (people[0] != null) {
            return people[0]; 
        } else {
            return null;
        }
    }

    private getListOfPeopleFromResponse(responseObject: Object): Person[] {
        const results: Object = responseObject["results"]["bindings"];
        const people: Person[] = [];
        const itemVariable = this.queryHelper.getItemVariable();

        for (const result of Object.values(results)) {
            if (result.hasOwnProperty(itemVariable)) {
                const id: string = this.getIdFromResponse(result);
                const name: string = this.getNameFromResponse(result);
                const description: string = this.getDescriptionFromResponse(result);
                const sexOrGender: SexOrGender = this.getSexOrGenderFromResponse(result);
                const dateOfBirth: Date =  this.getDateOfBirthFromResponseEntry(result);
                const dateOfDeath: Date = this.getDateOfDeathFromResponseEntry(result);
                
                const alreadyProcessedPerson: Person = people.find((element: Person): boolean => element.getId() == id);
                if (alreadyProcessedPerson == null) { 
                    // Create a new Person.
                    let person: Person = new Person(id);
                    person.setName(name);
                    person.setDescription(description);
                    if (dateOfBirth != null) person.getDatesOfBirth().push(dateOfBirth);
                    if (dateOfDeath != null) person.getDatesOfDeath().push(dateOfDeath);
                    person.setSexOrGender(sexOrGender);
                    people.push(person);
                } else {
                    // Add the new dates to the alreadyProcessedPerson.
                    if (dateOfBirth != null && !alreadyProcessedPerson.getDatesOfBirth().some((element: Date): boolean => element.getTime() == dateOfBirth.getTime())) {
                        alreadyProcessedPerson.getDatesOfBirth().push(dateOfBirth);
                    }

                    if (dateOfDeath != null && !alreadyProcessedPerson.getDatesOfDeath().some((element: Date): boolean => element.getTime() == dateOfDeath.getTime())) {
                        alreadyProcessedPerson.getDatesOfDeath().push(dateOfDeath);
                    }
                }
            }
        }

        return people;
    }

    private getIdFromResponse(response: object): string {
        const itemVariable: string = this.queryHelper.getItemVariable();
        let id: string;

        if (response.hasOwnProperty(itemVariable)) {
            let itemAdress: string = response[itemVariable]["value"];
            id = itemAdress.split("/").pop(); // Because the item returns a string of format {endpoint}/entity/{id}
        } else {
            console.log(response);
            throw "Item has no id.";
        }

        return id;
    }

    private getNameFromResponse(response: object): string {
        let itemVariable: string = this.queryHelper.getItemVariable();

        if (response.hasOwnProperty(itemVariable + "Label")) {
            return response[itemVariable + "Label"]["value"];
        } else {
            return "";
        }
    }

    private getDescriptionFromResponse(response: object): string {
        let itemVariable: string = this.queryHelper.getItemVariable();

        if (response.hasOwnProperty(itemVariable + "Description")) {
            return response[itemVariable + "Description"]["value"]
        } else {
            return "";
        }
    }

    private getSexOrGenderFromResponse(responseEntry: object): SexOrGender {
        if (responseEntry.hasOwnProperty("sexOrGender")) {
            const sexOrGenderWikidataId: string = responseEntry["sexOrGender"]["value"].split("/").pop();
            const sexOrGenderLabel: string = responseEntry["sexOrGenderLabel"]["value"];
            const sexOrGenderId: SexOrGenderId = this.getSexOrGenderIdForWikidataId(sexOrGenderWikidataId);
            
            if (sexOrGenderId != null) {
                return new SexOrGender(sexOrGenderId, sexOrGenderLabel);
            } else {
                console.warn( `No fitting sex or gender identifier found for wikidata id: ${sexOrGenderWikidataId} ${sexOrGenderLabel}`);
            }
        } else {
            console.info("Response entry has no sex or gender.");
            console.info(responseEntry);
            return null;
        }
    }

    public getSexOrGenderIdForWikidataId(sexOrGenderWikidataId: string): SexOrGenderId {
        switch (sexOrGenderWikidataId) {
            case "Q6581097":
                return SexOrGenderId.male;
            case "Q6581072":
                return SexOrGenderId.female;
            case "Q1097630":
                return  SexOrGenderId.intersex;
            case "Q1052281":
                return  SexOrGenderId.transgenderFemale;
            case "Q2449503":
                return SexOrGenderId.transgenderMale;
            default:
                return null;
        }
    }

    private getDateOfBirthFromResponseEntry(responseEntry: object): Date {
        if (responseEntry.hasOwnProperty("dateOfBirth")) {
            const dateOfBirth: string = responseEntry["dateOfBirth"]["value"];
            return this.getValidDateOrNull(dateOfBirth);
        } else {
            return null;
        }
    }

    private getDateOfDeathFromResponseEntry(responseEntry: object): Date {
        if (responseEntry.hasOwnProperty("dateOfDeath")) {
            const dateOfDeath: string = responseEntry["dateOfDeath"]["value"];
            return this.getValidDateOrNull(dateOfDeath);
        } else {
            return null;
        }
    }

    private getValidDateOrNull(dateString: string): Date {
        const date: Date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return null;
        } else {
            return date;
        }
    }
}