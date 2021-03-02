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

    public getFatherOfPerson(id: string): Promise<Person> {
        const query = this.queryHelper.getFatherQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            const father = this.getFirstPersonFromArray(listOfPeople);
            
            return father;
        });
    }

    public getMotherOfPerson(id: string): Promise<Person> {
        const query = this.queryHelper.getMotherQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            const mother = this.getFirstPersonFromArray(listOfPeople);
            
            return mother;
        });
    }

    public getParentsOfPerson(id: string): Promise<Array<Person>> {
        let query: string = this.queryHelper.getParentsQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            return listOfPeople;
        });
    }

    public getChildrenOfPerson(id: string): Promise<Person[]> {
        const query = this.queryHelper.getChildrenQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            return listOfPeople;
        });
    }

    public findPersonByLabel(label: string, limitForNumberOfPeople: number): Promise<Person[]> {
        const query = this.queryHelper.getEntitySearchQuery(label, limitForNumberOfPeople);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            return listOfPeople;
        });
    }

    private getFirstPersonFromArray(people: Person[]): Person {
        if (people[0] !== undefined) {
            return people[0]; 
        } else {
            return null;
        }
    }

    private getListOfPeopleFromResponse(responseObject: Object): Person[] {
        let results: Object = responseObject["results"]["bindings"];
        let people: Person[] = [];
        let itemVariable = this.queryHelper.getItemVariable();

        for (const result of Object.values(results)) { // TODO: don't forget to add babel to webpack
            if (result.hasOwnProperty(itemVariable)) {
                const id: string = this.getIdFromResponse(result);
                const name: string = this.getNameFromResponse(result);
                const description: string = this.getDescriptionFromResponse(result);
                const sexOrGender: SexOrGender = this.getSexOrGenderFromResponse(result);
                const dateOfBirth: Date =  this.getDateOfBirthFromResponseEntry(result);
                const dateOfDeath: Date = this.getDateOfDeathFromResponseEntry(result);
                
                if (!people.find(element => element.getId() === id)) {
                    let person: Person = new Person(id);

                    person.setName(name);
                    person.setDescription(description);
                    if (dateOfBirth != null) person.getDatesOfBirth().push(dateOfBirth);
                    if (dateOfDeath != null) person.getDatesOfDeath().push(dateOfDeath);
                    person.setSexOrGender(sexOrGender);
                    people.push(person);
                } else {
                    let person: Person = people.find(element => element.getId() === id);

                    if (person.getDatesOfBirth().find(element => element.getTime() !== dateOfBirth.getTime())) {
                        person.getDatesOfBirth().push(dateOfBirth);
                    }

                    if (person.getDatesOfDeath().find(element => element.getTime() !== dateOfDeath.getTime())) {
                        person.getDatesOfDeath().push(dateOfDeath);
                    }
                }
            }
        }

        return people;
    }

    private getIdFromResponse(response: object): string {
        let itemVariable: string = this.queryHelper.getItemVariable();
        let id: string;

        if (response.hasOwnProperty(itemVariable)) {
            let itemAdress: string = response[itemVariable]["value"];
            id= itemAdress.split("/").pop(); // because item returns a string of format {endpoint}/entity/{id}
        } else {
            throw "Item has no id";
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
            let sexOrGenderWikidataId: string = responseEntry["sexOrGender"]["value"].split("/").pop();
            let sexOrGenderLabel: string = responseEntry["sexOrGenderLabel"]["value"];

            // Maybe put the getSexOrGenderIdForWikidataId method into this class since it is very specific.
            let sexOrGenderId: SexOrGenderId = SexOrGender.getSexOrGenderIdForWikidataId(sexOrGenderWikidataId);
            
            if (sexOrGenderId != null) {
                return new SexOrGender(sexOrGenderId, sexOrGenderLabel);
            } else {
                throw `No fitting sex or gender identifier found for wikidata id: ${sexOrGenderWikidataId} ${sexOrGenderLabel}`;
            }
        } else {
            console.info("Response entry has no sex or gender.");
            console.info(responseEntry);
            return null;
        }
    }

    private getDateOfBirthFromResponseEntry(responseEntry: object): Date {
        if (responseEntry.hasOwnProperty("dateOfBirth")) {
            let dateOfBirth: string = responseEntry["dateOfBirth"]["value"];
            return new Date(dateOfBirth);
        } else {
            return null;
        }
    }

    private getDateOfDeathFromResponseEntry(responseEntry: object): Date {
        if (responseEntry.hasOwnProperty("dateOfDeath")) {
            let dateOfBirth: string = responseEntry["dateOfDeath"]["value"];
            return new Date(dateOfBirth);
        } else {
            return null;
        }
    }
}