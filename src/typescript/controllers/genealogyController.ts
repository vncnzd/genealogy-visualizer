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
            let depth = this.genealogyView.getDepth();

            this.genealogy.getDescendants(depth).then((descendants: Map<string, Person>) => {
                console.log(descendants.size + " descendants found");
                this.genealogyView.displayPersonWithDescendants(this.genealogy.getRootPerson());
            });
        });
    }

    public setRootPerson(person: Person): void {
        this.genealogy.setRootPerson(person);
    }
}