import { Person } from "./person";

export class Genealogy {
    private rootPerson: Person;

    constructor() {
    }

    public async getChildrenOfPerson(person: Person, people: Map<string, Person>, depth: number = 1): Promise<Map<string, Person>> {
        if (depth > 0) {
            await person.getChildrenFromDatabase().then((children: Person[]) => {
                for (const child of children) {
                    if (!people.has(child.getId())) {
                        person.getChildren().push(child);
                        people.set(child.getId(), child);
                    } else {
                        console.log("duplicate");
                        person.getChildren().push(people.get(child.getId()));
                    }

                    // TODO: set mother and father of child
                    this.getChildrenOfPerson(child, people, depth - 1);
                }
            });

            return people
        } else {
            return people;
        }
    }

    public setRootPerson(person: Person): void {
        this.rootPerson = person;
    }

    public getRootPerson(): Person {
        return this.rootPerson;
    }
}