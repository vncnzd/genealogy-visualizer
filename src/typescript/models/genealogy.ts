import { PersonDatabase } from "../personDatabase";
import { SexOrGenderIdentifier } from "../sexOrGenderIdentifier";
import { Person } from "./person";

export class Genealogy {
    private rootPerson: Person;
    private people: Map<string, Person>;
    private personDatabase: PersonDatabase;
    private depth: number;

    constructor(personDatabase: PersonDatabase) {
        this.people = new Map<string, Person>();
        this.personDatabase = personDatabase;
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
        if (depth > 0) {
            let parents: Person[] = await this.personDatabase.getParentsOfPerson(currentPerson.getId());
            let promises: Promise<Map<string, Person>>[] = [];

            for (const parent of parents) {
                if (relatedPeople.has(parent.getId())) {
                    // this parent has already been fetched, thus we don't have to deal with this branch anymore
                    let alreadyFetchedParent = relatedPeople.get(parent.getId());
                    currentPerson.setParent(alreadyFetchedParent);
                    alreadyFetchedParent.getChildren().push(currentPerson);
                } else {
                    currentPerson.setParent(parent);
                    parent.getChildren().push(currentPerson);
                    relatedPeople.set(parent.getId(), parent);
                    promises.push(this.getParentsOfPersonRecursively(parent, relatedPeople, depth - 1));
                }
            }

            return Promise.all(promises).then(() => { return relatedPeople });
        }
    }

    private async getChildrenOfPersonRecursively(currentPerson: Person, descendants: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        if (depth > 0) {
            let children: Person[] = await this.personDatabase.getChildrenOfPerson(currentPerson.getId());
            let promises: Promise<Map<string, Person>>[] = [];

            for (const child of children) {
                if (descendants.has(child.getId())) {
                    // this child has already been fetched, thus we don't have to deal with this branch anymore
                    let alreadyFetchedChild = descendants.get(child.getId());
                    currentPerson.getChildren().push(alreadyFetchedChild);
                } else {
                    currentPerson.getChildren().push(child);
                    descendants.set(child.getId(), child);
                    promises.push(this.getChildrenOfPersonRecursively(child, descendants, depth - 1));
                }
            }

            return Promise.all(promises).then(() => { return descendants });
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

    public getDepth(): number {
        return this.depth;
    }

    public setDepth(depth: number): void {
        this.depth = depth;
    }
}