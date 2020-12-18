import { Person } from "./models/person";

export interface Positioner {
    run(rootPerson: Person): void
}