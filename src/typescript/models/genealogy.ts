import { SexOrGenderIdentifier } from "../sexOrGenderIdentifier";
import { Person } from "./person";

export class Genealogy {
    private rootPerson: Person;

    constructor() {
    }

    // TODO Refactor this
    public async getChildrenOfPerson(currentPerson: Person, people: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        if (depth > 0) {
            let children: Person[] = await currentPerson.getChildrenFromDatabase();

            for (const child of children) {
                if (people.has(child.getId())) {
                    // this person was already visited, because the id is already in the map
                    // there is no need to continue the recursion with this node, because it should have already been done
                    let existingChild: Person = people.get(child.getId());
                    currentPerson.getChildren().push(existingChild);
                } else {
                    // this person was not visited before
                    // continue with the recursion
                    currentPerson.getChildren().push(child);
                    people.set(child.getId(), child);
                    this.getChildrenOfPerson(child, people, depth - 1);                     
                }

                this.addParentsToChild(currentPerson, child, people);
            }

            return Promise.resolve(people);
        } else {
            return Promise.resolve(people);
        }
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