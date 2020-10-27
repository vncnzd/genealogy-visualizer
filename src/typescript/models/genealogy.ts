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

    // TODO Refactor this
    private async getChildrenOfPersonRecursively(currentPerson: Person, descendants: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        if (depth > 0) {
            let children: Person[] = await currentPerson.getChildrenFromDatabase();

            for (const child of children) {
                if (descendants.has(child.getId())) {
                    // child already in descendants map, thus already visited
                    let existingChild: Person = descendants.get(child.getId());
                    currentPerson.getChildren().push(existingChild);
                } else {
                    // child is not in descendants map, thus not visited before
                    descendants.set(child.getId(), child);
                    currentPerson.getChildren().push(child);
                    
                    // Remove the awaits to make this method faster, but then the map gets immediately returned,
                    // so that you don't know when it ended.
                    await this.getChildrenOfPersonRecursively(child, descendants, depth - 1);
                    await this.addParentsToChild(currentPerson, child, descendants);
                }
            }
        }

        return descendants;
    }

    private addParentsToChild(parent: Person, child: Person, peopleMap: Map<string, Person>) {
        switch (parent.getSexOrGender().getSexOrGenderIdentifier()) {
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