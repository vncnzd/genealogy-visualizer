import { Person } from "./models/person";

export interface PersonDatabase {
    getMotherOfPersonWithId(id: string): Promise<Person>
    getFatherOfPersonWithId(id: string): Promise<Person>
    getParentsOfPersonWithId(id: string): Promise<Person[]>
    getChildrenOfPersonWithId(id: string): Promise<Person[]>
    findPersonByLabel(label: string, resultLimit: number): Promise<Person[]>
}