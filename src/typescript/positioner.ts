import { Person } from "./models/person";
import { PersonView } from "./views/personView";

export interface Positioner {
    run(rootPerson: Person, personViewMap: Map<string, PersonView>): void
}