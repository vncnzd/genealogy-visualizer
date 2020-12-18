import { SexOrGenderIdentifier } from "../sexOrGenderIdentifier";
import { Person } from "./person";

export class Genealogy {
    private rootPerson: Person;
    private people: Map<string, Person>;

    constructor() {
        this.people = new Map<string, Person>();
    }

    public getAncestorsOfRootPerson(depth: number): Promise<Map<String, Person>> {
        this.people = new Map<string, Person>();
        return this.getParentsOfPersonRecursively(this.rootPerson, this.people, depth);
    }

    public getDescendantsOfRootPerson(depth: number): Promise<Map<string, Person>> {
        // Think about reusing the map, but this makes trouble if the depth is higher than before
        this.people = new Map<string, Person>();
        return this.getChildrenOfPersonRecursively(this.rootPerson, this.people, depth);
    }

    public async getParentsOfPersonRecursively(currentPerson: Person, relatedPeople: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        if (depth > 0) {
            let parents: Person[] = await currentPerson.getParentsFromDatabase();
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
            let children: Person[] = await currentPerson.getChildrenFromDatabase();
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
}