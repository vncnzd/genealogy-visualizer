import { Person } from "./models/person";

export interface PersonDatabase {
    // getPerson(id: string): Promise<Person>
    getMotherOfPerson(id: string): Promise<Person>
    getFatherOfPerson(id: string): Promise<Person>
    getParentsOfPerson(id: string): Promise<Person[]>
    getChildrenOfPerson(id: string): Promise<Person[]>
    findPersonByLabel(label: string, limitForNumberOfPeople: number): Promise<Person[]>
}