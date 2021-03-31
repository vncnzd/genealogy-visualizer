import { GenealogyType } from "../genealogyType";
import { PersonDatabase } from "../personDatabase";
import { Person } from "./person";

export class Genealogy {
    private rootPerson: Person;
    private people: Map<string, Person>;
    private duplicates: Map<string, Person[]>
    private personDatabase: PersonDatabase;
    private numberOfGenerations: number;
    private genealogyType: GenealogyType;

    constructor(personDatabase: PersonDatabase) {
        this.people = new Map<string, Person>();
        this.duplicates = new Map<string, Person[]>();
        this.genealogyType = GenealogyType.Ancestors; // Default.
        this.personDatabase = personDatabase;
    }

    public getGenealogyOfCurrentPersonFromDatabase(): Promise<Map<String, Person>> {
        this.people.clear();
        this.duplicates.clear();

        switch (this.genealogyType) {
            case GenealogyType.Ancestors:
                return this.getAncestorsOfPersonRecursively(this.rootPerson, this.people, this.numberOfGenerations);
            case GenealogyType.Descendants:
                return this.getDescendantsOfPersonRecursively(this.rootPerson, this.people, this.numberOfGenerations);
            default:
                throw "No Genealogy Type selected. Abortion.";
        }
    }

    private async getAncestorsOfPersonRecursively(currentPerson: Person, people: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        people.set(currentPerson.getId(), currentPerson);
        
        if (depth > 0) {
            const parents: Person[] = await this.personDatabase.getParentsOfPersonById(currentPerson.getBaseId());
            const promises: Promise<Map<string, Person>>[] = [];

            for (const parent of parents) {
                if (people.has(parent.getId())) { // The current parent appears at least twice in the genealogy.
                    this.markAsDuplicate(parent, people);
                }

                currentPerson.setParent(parent);
                parent.getChildren().push(currentPerson);
                promises.push(this.getAncestorsOfPersonRecursively(parent, people, depth - 1));
            }

            return Promise.all(promises).then(() => { return people });
        }
    }

    private async getDescendantsOfPersonRecursively(currentPerson: Person, people: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        people.set(currentPerson.getId(), currentPerson);
        
        if (depth > 0) {
            const children: Person[] = await this.personDatabase.getChildrenOfPersonById(currentPerson.getBaseId());
            const promises: Promise<Map<string, Person>>[] = [];

            for (const child of children) {
                if (people.has(child.getId())) { // The current child appears at least twice in the genealogy.
                    this.markAsDuplicate(child, people);
                }

                currentPerson.getChildren().push(child);
                child.setParent(currentPerson);
                promises.push(this.getDescendantsOfPersonRecursively(child, people, depth - 1));
            }

            return Promise.all(promises).then(() => { return people });
        }
    }


    private markAsDuplicate(person: Person,  people: Map<string, Person>): void {
        let duplicatesForId: Person[] = this.duplicates.get(person.getId());

        if (duplicatesForId == null) {
            duplicatesForId = [people.get(person.getId())];
            this.duplicates.set(person.getId(), duplicatesForId);
        }

        person.setId(person.getId(), duplicatesForId.length.toString());
        duplicatesForId.push(person);
    }

    public setRootPerson(person: Person): void {
        this.rootPerson = person;
    }

    public getRootPerson(): Person {
        return this.rootPerson;
    }

    public getPeople(): Map<string, Person> {
        return this.people;
    }

    public getDuplicates(): Map<string, Person[]> {
        return this.duplicates;
    }

    public getNumberOfGenerations(): number {
        return this.numberOfGenerations;
    }

    public setNumberOfGenerations(depth: number): void {
        this.numberOfGenerations = depth;
    }

    public setGenealogyType(genealogyType: GenealogyType): void {
        this.genealogyType = genealogyType;
    }

    public getGenealogyType(): GenealogyType {
        return this.genealogyType;
    }
}