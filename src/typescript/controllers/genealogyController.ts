import { Genealogy } from "../models/genealogy";
import { Person } from "../models/person";
import { GenealogyView } from "../views/genealogyView";

export class GenealogyController {
    private genealogy: Genealogy;
    private genealogyView: GenealogyView;

    constructor(genealogy: Genealogy, genealogyView: GenealogyView) {
        this.genealogy = genealogy;
        this.genealogyView = genealogyView;
        this.addEventListenersToButtonsAndInput();
    }

    private addEventListenersToButtonsAndInput(): void {
        this.genealogyView.getDescendantsButton().addEventListener("click", (event: MouseEvent) => {
            this.genealogy.getDescendants(this.genealogyView.getDepth()).then(() => {
                this.genealogyView.displayPersonWithDescendants(this.genealogy.getRootPerson());
            });
        });
    }

    public setRootPerson(person: Person): void {
        this.genealogy.setRootPerson(person);
    }
}