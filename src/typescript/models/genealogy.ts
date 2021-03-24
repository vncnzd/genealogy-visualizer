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
        this.personDatabase = personDatabase;
        this.genealogyType = GenealogyType.Ancestors;
    }

    public getRelatedPeopleOfRootPerson(): Promise<Map<String, Person>> {
        this.people.clear(); // See if it is necessary to clear the map everytime or if one could reuse already fetched people.
        this.duplicates.clear();

        switch (this.genealogyType) {
            case GenealogyType.Ancestors:
                return this.getAncestorsOfPersonRecursively(this.rootPerson, this.people, this.numberOfGenerations);
            case GenealogyType.Descendants:
                return this.getDescendantsOfPersonRecursively(this.rootPerson, this.people, this.numberOfGenerations);
            default:
                console.warn("No Genealogy Type selected.") // Maybe throw an error in this case.
                break;
        }
    }

    private async getAncestorsOfPersonRecursively(currentPerson: Person, relatedPeople: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        relatedPeople.set(currentPerson.getId(), currentPerson);
        
        if (depth > 0) {
            let parents: Person[] = await this.personDatabase.getParentsOfPerson(currentPerson.getBaseId());
            let promises: Promise<Map<string, Person>>[] = [];

            for (const parent of parents) {
                if (relatedPeople.has(parent.getId())) {
                    let duplicatesForId: Person[] = this.duplicates.get(parent.getId());
                    if (duplicatesForId == null) {
                        duplicatesForId = [relatedPeople.get(parent.getId())];
                        this.duplicates.set(parent.getId(), duplicatesForId);
                    }

                    parent.setId(parent.getId(), duplicatesForId.length.toString());
                    duplicatesForId.push(parent);
                    
                    currentPerson.setParent(parent);
                    parent.getChildren().push(currentPerson);

                    promises.push(this.getAncestorsOfPersonRecursively(parent, relatedPeople, depth - 1)); // Maybe? Better to clone?
                } else {
                    currentPerson.setParent(parent);
                    parent.getChildren().push(currentPerson);

                    promises.push(this.getAncestorsOfPersonRecursively(parent, relatedPeople, depth - 1));
                }
            }

            return Promise.all(promises).then(() => { return relatedPeople });
        }
    }

    private async getDescendantsOfPersonRecursively(currentPerson: Person, relatedPeople: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        relatedPeople.set(currentPerson.getId(), currentPerson);
        
        if (depth > 0) {
            let children: Person[] = await this.personDatabase.getChildrenOfPerson(currentPerson.getBaseId());
            let promises: Promise<Map<string, Person>>[] = [];

            for (const child of children) {
                if (relatedPeople.has(child.getId())) {
                    let duplicatesForId: Person[] = this.duplicates.get(child.getId());
                    if (duplicatesForId == null) {
                        duplicatesForId = [relatedPeople.get(child.getId())];
                        this.duplicates.set(child.getId(), duplicatesForId);
                    }

                    child.setId(child.getId(), duplicatesForId.length.toString());
                    duplicatesForId.push(child);

                    currentPerson.getChildren().push(child);
                    promises.push(this.getDescendantsOfPersonRecursively(child, relatedPeople, depth - 1));
                } else {
                    currentPerson.getChildren().push(child);
                    promises.push(this.getDescendantsOfPersonRecursively(child, relatedPeople, depth - 1));
                }
            }

            return Promise.all(promises).then(() => { return relatedPeople });
        }
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