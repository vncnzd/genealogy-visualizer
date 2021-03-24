import { GenealogyType } from "../genealogyType";
import { PersonDatabase } from "../personDatabase";
import { Person } from "./person";

export class Genealogy {
    private rootPerson: Person;
    private people: Map<string, Person>;
    private duplicates: Map<string, Person[]>
    private personDatabase: PersonDatabase;
    private depth: number;
    private genealogyType: GenealogyType;

    constructor(personDatabase: PersonDatabase) {
        this.people = new Map<string, Person>();
        this.duplicates = new Map<string, Person[]>();
        this.personDatabase = personDatabase;
        this.genealogyType = GenealogyType.Ancestors;
    }

    public getRelatedPeopleOfRootPerson(): Promise<Map<String, Person>> {
        this.people.clear(); // See if it is necessary to clear the map everytime or if one could reuse already fetched people.

        switch (this.genealogyType) {
            case GenealogyType.Ancestors:
                return this.getParentsOfPersonRecursively(this.rootPerson, this.people, this.depth);
            case GenealogyType.Ancestors:
            
                break;
            default:
                console.warn("No Genealogy Type selected.") // Maybe throw an error in this case.
                break;
        }
    }

    public getAncestorsOfRootPerson(depth: number): Promise<Map<String, Person>> {
        this.people = new Map<string, Person>();
        this.people.set(this.rootPerson.getId(), this.rootPerson);
        return this.getParentsOfPersonRecursively(this.rootPerson, this.people, depth);
    }

    public getDescendantsOfRootPerson(depth: number): Promise<Map<string, Person>> {
        // Think about reusing the map, but this makes trouble if the depth is higher than before
        this.people = new Map<string, Person>();
        return this.getChildrenOfPersonRecursively(this.rootPerson, this.people, depth);
    }

    public async getParentsOfPersonRecursively(currentPerson: Person, relatedPeople: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
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

                    promises.push(this.getParentsOfPersonRecursively(parent, relatedPeople, depth - 1)); // Maybe? Better to clone?
                } else {
                    currentPerson.setParent(parent);
                    parent.getChildren().push(currentPerson);

                    promises.push(this.getParentsOfPersonRecursively(parent, relatedPeople, depth - 1));
                }
            }

            return Promise.all(promises).then(() => { return relatedPeople });
        }
    }

    private async getChildrenOfPersonRecursively(currentPerson: Person, relatedPeople: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
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
                    relatedPeople.set(child.getId(), child);
                    promises.push(this.getChildrenOfPersonRecursively(child, relatedPeople, depth - 1));
                } else {
                    currentPerson.getChildren().push(child);
                    relatedPeople.set(child.getId(), child);
                    promises.push(this.getChildrenOfPersonRecursively(child, relatedPeople, depth - 1));
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

    public getDepth(): number {
        return this.depth;
    }

    public setDepth(depth: number): void {
        this.depth = depth;
    }

    public setGenealogyType(genealogyType: GenealogyType): void {
        this.genealogyType = genealogyType;
    }

    public getGenealogyType(): GenealogyType {
        return this.genealogyType;
    }
}