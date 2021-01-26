import { Person } from "./models/person";
import { PersonView } from "./views/personView";

export interface TreeDrawer {
    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, height: number, pixelPerYear: number): void
}