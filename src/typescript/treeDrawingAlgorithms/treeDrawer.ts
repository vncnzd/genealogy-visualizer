import { jsPlumbInstance } from "jsplumb";
import { Person } from "./models/person";
import { PersonView } from "./views/personView";

export interface TreeDrawer {
    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, pixelPerYear: number, jsPlumbInst: jsPlumbInstance, drawAncestors: boolean): void
}