import { Person } from "./models/person";

export interface PersonDatabase {
    getMotherOfPersonById(id: string): Promise<Person>
    getFatherOfPersonById(id: string): Promise<Person>
    getParentsOfPersonById(id: string): Promise<Person[]>
    getChildrenOfPersonById(id: string): Promise<Person[]>
    findPersonByLabel(label: string, resultLimit: number): Promise<Person[]>
}