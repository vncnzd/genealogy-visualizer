import { QueryBuilder } from "../queryBuilder";
import { SexOrGender } from "../sexOrGender";
import { SPARQLQueryDispatcher } from "../sparqlQueryDispatcher";

export class Person {
    private static sparqlQueryDispatcher: SPARQLQueryDispatcher;
    private static queryBuilder: QueryBuilder;
    
    private id: string;
    private name: string;
    private description: string;
    private father: Person;
    private mother: Person;
    private children: Person[];
    private datesOfBirth: Date[];
    private datesOfDeath: Date[];
    private sexOrGender: SexOrGender;

    constructor(id: string) {
        this.id = id;
        this.datesOfBirth = [];
        this.datesOfDeath = [];
        this.children = [];
    }

    public static findHumansByEntitySearch(searchValue: string): Promise<Array<Person>> {
        let query: string = Person.queryBuilder.buildEntitySearchQuery(searchValue);
        console.log(query);

        return this.sparqlQueryDispatcher.query(query).then(response => {
            return Person.getListOfPeopleFromResponse(response);
        });
    }

    private static getListOfPeopleFromResponse(responseObject: Object): Array<Person> {
        let results = responseObject["results"]["bindings"];
        let people: Person[] = [];

        for (const result of Object.values(results)) { // don't forget to add babel to webpack
            if (result.hasOwnProperty("item")) {
                const id: string = (result.hasOwnProperty("item")) ? result["item"]["value"].split("/").pop() : ""; // because item returns a string of format {endpoint}/entity/{id}
                const name: string = (result.hasOwnProperty("itemLabel")) ? result["itemLabel"]["value"] : "";
                const description: string = (result.hasOwnProperty("itemDescription")) ? result["itemDescription"]["value"] : "";
                const dateOfBirth: Date = (result.hasOwnProperty("dateOfBirth")) ? new Date(result["dateOfBirth"]["value"]) : null;
                const dateOfDeath: Date = (result.hasOwnProperty("dateOfDeath")) ? new Date(result["dateOfDeath"]["value"]) : null;

                if (!people.find(element => element.getId() === id)) {
                    let person: Person = new Person(id);

                    person.setName(name);
                    person.setDescription(description);
                    person.getDatesOfBirth().push(dateOfBirth);
                    person.getDatesOfDeath().push(dateOfDeath);
                    people.push(person);
                } else {
                    let person: Person = people.find(element => element.getId() === id);

                    if (person.getDatesOfBirth().find(e => e.getTime() !== dateOfBirth.getTime())) {
                        person.getDatesOfBirth().push(dateOfBirth);
                    }

                    if (person.getDatesOfDeath().find(e => e.getTime() !== dateOfDeath.getTime())) {
                        person.getDatesOfDeath().push(dateOfDeath);
                    }
                }
            }
        }

        return people;
    }

    public getChildrenFromDatabase(): Promise<Array<Person>> {
        let query: string = Person.queryBuilder.buildGetChildrenQuery(this.getId());
        
        return Person.sparqlQueryDispatcher.query(query).then(response => {
            return Person.getListOfPeopleFromResponse(response);
        });
    }

    public getFatherFromDatabase(): Promise<Array<Person>> {
        let query: string = Person.queryBuilder.buildGetFatherQuery(this.getId());

        return Person.sparqlQueryDispatcher.query(query).then(response => {
            return Person.getListOfPeopleFromResponse(response);
        });
    }

    public getMotherFromDatabase(): Promise<Array<Person>> {
        let query: string = Person.queryBuilder.buildGetMotherQuery(this.getId());

        return Person.sparqlQueryDispatcher.query(query).then(response => {
            return Person.getListOfPeopleFromResponse(response);
        });
    }

    public getParentsFromDatabase(): Promise<Array<Person>> {
        let query: string = Person.queryBuilder.buildGetParentsQuery(this.getId());

        return Person.sparqlQueryDispatcher.query(query).then(response => {
            return Person.getListOfPeopleFromResponse(response);
        });
    }

    public storeInSessionStorage(): void {
        sessionStorage.setItem(this.id, JSON.stringify(this));
    }

    public static retrievePersonFromSessionStorage(id: string): Person {
        let objectString: string = sessionStorage.getItem(id);

        if (objectString != null) {
            return <Person> JSON.parse(objectString);
        } else {
            return null;
        }
    }

    // getters and setters

    public static setSparqlQueryDispatcher(sparqlQueryDispatcher: SPARQLQueryDispatcher): void {
        this.sparqlQueryDispatcher = sparqlQueryDispatcher;
    }

    public static setQueryBuilder(queryBuilder: QueryBuilder): void {
        this.queryBuilder = queryBuilder;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public getDescription(): string {
        return this.description
    }

    public getFather(): Person {
        return this.father;
    }

    public getMother(): Person {
        return this.mother;
    }

    public getChildren(): Person[] {
        return this.children;
    }

    public getDatesOfBirth(): Date[] {
        return this.datesOfBirth;
    }

    public getDatesOfDeath(): Date[] {
        return this.datesOfDeath;
    }

    public setSexOrGender(sexOrGender: SexOrGender): void {
        this.sexOrGender = sexOrGender;
    }

    public getSexOrGender(): SexOrGender {
        return this.sexOrGender;
    }
}