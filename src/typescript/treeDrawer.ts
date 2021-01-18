import { Person } from "./models/person";
import { PersonView } from "./views/personView";

export interface TreeDrawer {
    run(rootPerson: Person, personViewMap: Map<string, PersonView>): void
}