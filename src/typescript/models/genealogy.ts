import { SexOrGenderIdentifier } from "../sexOrGenderIdentifier";
import { Person } from "./person";

export class Genealogy {
    private rootPerson: Person;
    private people: Map<string, Person>;

    constructor() {
        this.people = new Map<string, Person>();
    }

    public getDescendants(depth: number): Promise<Map<string, Person>> {
        // Think about reusing the map, but this makes trouble if the depth is higher than before
        this.people = new Map<string, Person>();
        return this.getChildrenOfPersonRecursively(this.rootPerson, this.people, depth);
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

    private addParentsToChild(parent: Person, child: Person, peopleMap: Map<string, Person>) {
        switch (parent.getSexOrGender().getSexOrGenderId()) {
            case SexOrGenderIdentifier.male:
                child.setFather(parent);

                child.getMotherFromDatabase().then((mothers: Person[]) => {
                    if (mothers.length > 0) {
                        let mother: Person = mothers[0];
                        if (peopleMap.has(mother.getId())) {
                            mother = peopleMap.get(mother.getId());
                        }
                        child.setMother(mother);
                    }
                });
                break;
            case SexOrGenderIdentifier.female:
                child.setMother(parent);

                child.getFatherFromDatabase().then((fathers: Person[]) => {
                    if (fathers.length > 0) {
                        let father: Person = fathers[0];
                        if (peopleMap.has(father.getId())) {
                            father = peopleMap.get(father.getId());
                        }
                        child.setFather(father);
                    }
                });
                break;
            // TODO add switch cases for other enums
            default:
                break;
        }
    }

    public setRootPerson(person: Person): void {
        this.rootPerson = person;
    }

    public getRootPerson(): Person {
        return this.rootPerson;
    }
}