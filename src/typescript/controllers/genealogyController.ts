import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { GenealogyView } from "../views/genealogyView";

export class GenealogyController {
    private genealogy: Genealogy;
    private genealogyView: GenealogyView;

    constructor(genealogy: Genealogy, genealogyView: GenealogyView) {
        this.genealogy = genealogy;
        this.genealogyView = genealogyView;
        // this.addEventListenersToButtonsAndInput();
    }

    public getDescendants(): Promise<Map<string, Person>> {
        return this.genealogy.getDescendants(this.genealogyView.getDepth());
    }

    public setRootPerson(person: Person): void {
        this.genealogy.setRootPerson(person);
    }
}