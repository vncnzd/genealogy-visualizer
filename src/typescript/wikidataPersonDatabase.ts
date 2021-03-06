import { Person } from "./models/person";
import { PersonDatabase } from "./personDatabase";
import { QueryGenerator } from "./queryGenerator";
import { SexOrGender } from "./sexOrGender";
import { SexOrGenderId } from "./sexOrGenderId";
import { SPARQLQueryDispatcher } from "./sparqlQueryDispatcher";

export class WikidataPersonDatabase implements PersonDatabase {
    private queryGenerator: QueryGenerator;
    private sparqlQueryDispatcher: SPARQLQueryDispatcher;
    
    constructor(queryHelper: QueryGenerator, sparqlQueryDispatcher: SPARQLQueryDispatcher) {
        this.queryGenerator = queryHelper;
        this.sparqlQueryDispatcher = sparqlQueryDispatcher;
    }

    public getFatherOfPersonById(id: string): Promise<Person> {
        const query = this.queryGenerator.generateGetFatherQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            const father = this.getFirstPersonFromArray(listOfPeople);
            
            return father;
        });
    }

    public getMotherOfPersonById(id: string): Promise<Person> {
        const query = this.queryGenerator.generateGetMotherQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            const mother = this.getFirstPersonFromArray(listOfPeople);
            
            return mother;
        });
    }

    public getParentsOfPersonById(id: string): Promise<Array<Person>> {
        const query: string = this.queryGenerator.generateGetParentsQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            return listOfPeople;
        });
    }

    public getChildrenOfPersonById(id: string): Promise<Person[]> {
        const query = this.queryGenerator.generateGetChildrenQuery(id);

        return this.sparqlQueryDispatcher.query(query).then((response: Object) => {
            const listOfPeople = this.getListOfPeopleFromResponse(response);
            return listOfPeople;
        });
    }

    public findPersonByLabel(label: string, resultLimit: number): Promise<Person[]> {
        const query = this.queryGenerator.generateEntitySearchQuery(label, resultLimit);

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
        const itemVariable = this.queryGenerator.getItemVariable();

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
        const itemVariable: string = this.queryGenerator.getItemVariable();
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
        let itemLabelVariable: string = this.queryGenerator.getItemLabelVariable();

        if (response.hasOwnProperty(itemLabelVariable)) {
            return response[itemLabelVariable]["value"];
        } else {
            return "";
        }
    }

    private getDescriptionFromResponse(response: object): string {
        let itemDescriptionVariable: string = this.queryGenerator.getItemDescriptionVariable();

        if (response.hasOwnProperty(itemDescriptionVariable)) {
            return response[itemDescriptionVariable]["value"]
        } else {
            return "";
        }
    }

    private getSexOrGenderFromResponse(responseEntry: object): SexOrGender {
        if (responseEntry.hasOwnProperty("sexOrGender")) {
            const sexOrGenderWikidataId: string = responseEntry[this.queryGenerator.getSexOrGenderVariable()]["value"].split("/").pop();
            const sexOrGenderLabel: string = responseEntry[this.queryGenerator.getSexOrGenderLabelVariable()]["value"];
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
            case "Q48270":
                return SexOrGenderId.nonBinary;
            default:
                return null;
        }
    }

    private getDateOfBirthFromResponseEntry(responseEntry: object): Date {
        const dateOfBirthVariable: string = this.queryGenerator.getDateOfBirthVariable();

        if (responseEntry.hasOwnProperty(dateOfBirthVariable)) {
            const dateOfBirth: string = responseEntry[dateOfBirthVariable]["value"];
            return this.getValidDateOrNull(dateOfBirth);
        } else {
            return null;
        }
    }

    private getDateOfDeathFromResponseEntry(responseEntry: object): Date {
        const dateOfDeathVariable: string = this.queryGenerator.getDateOfDeathVariable();

        if (responseEntry.hasOwnProperty(dateOfDeathVariable)) {
            const dateOfDeath: string = responseEntry[dateOfDeathVariable]["value"];
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