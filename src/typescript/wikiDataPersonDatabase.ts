import { Person } from "./models/person";
import { PersonDatabase } from "./personDatabase";
import { QueryHelper } from "./queryHelper";
import { SexOrGender } from "./sexOrGender";
import { SPARQLQueryDispatcher } from "./sparqlQueryDispatcher";

export class WikidataPersonDatabase implements PersonDatabase {
    private queryHelper: QueryHelper;
    private sparqlQueryDispatcher: SPARQLQueryDispatcher;
    
    constructor(queryHelper: QueryHelper, sparqlQueryDispatcher: SPARQLQueryDispatcher) {
        this.queryHelper = queryHelper;
        this.sparqlQueryDispatcher = sparqlQueryDispatcher;
    }

    public getPerson(id: string): Promise<Person> {
        
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
        let results = responseObject["results"]["bindings"];
        let people: Person[] = [];

        for (const result of Object.values(results)) { // TODO: don't forget to add babel to webpack
            if (result.hasOwnProperty("item")) {
                const id: string = (result.hasOwnProperty("item")) ? result["item"]["value"].split("/").pop() : ""; // because item returns a string of format {endpoint}/entity/{id}
                const name: string = (result.hasOwnProperty("itemLabel")) ? result["itemLabel"]["value"] : "";
                const description: string = (result.hasOwnProperty("itemDescription")) ? result["itemDescription"]["value"] : "";
                const sexOrGender: SexOrGender = (result.hasOwnProperty("sexOrGender")) ? new SexOrGender(result["sexOrGender"]["value"].split("/").pop(), result["sexOrGenderLabel"]["value"]) : null;

                // TODO: deal with dates
                const dateOfBirth: Date = (result.hasOwnProperty("dateOfBirth")) ? new Date(result["dateOfBirth"]["value"]) : null;
                const dateOfDeath: Date = (result.hasOwnProperty("dateOfDeath")) ? new Date(result["dateOfDeath"]["value"]) : null;
                
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
}