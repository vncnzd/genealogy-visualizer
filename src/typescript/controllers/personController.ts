import { Person } from "../models/person";
import { PersonView } from "../views/personView";

export class PersonController {
    private person: Person;
    private personView: PersonView;

    constructor(person: Person, personView: PersonView) {
        this.person = person;
        this.personView = personView;

        this.addDuplicatesButtonEventListener();
        this.addExpandButtonEeventListener();
        this.addDeleteButtonEventListener();
    };

    private addDuplicatesButtonEventListener(): void {
        let duplicatesButton: HTMLElement = this.personView.getDuplicatesButtonElement();
        duplicatesButton.addEventListener("click", (event: MouseEvent) => {
            let baseId: string = this.person.getId().split("-")[0]; 
            let querySelector: string = `.duplicates-stroke-from-${this.person.getId()}, .duplicates-stroke-${baseId}`;
            let strokesFromPersonElement: NodeList = document.querySelectorAll(querySelector);

            for (let i = 0; i < strokesFromPersonElement.length; i++) {
                const stroke: HTMLElement = <HTMLElement> strokesFromPersonElement[i];
                stroke.classList.toggle("hidden");
            }
        });
    }

    private addExpandButtonEeventListener(): void {
        let expandButton: HTMLElement = this.personView.getExpandButtonElement();
        let additionalInfoContainer: HTMLElement = this.personView.getAdditionalInfoContainerElement();
        let personBox: HTMLElement = this.personView.getPersonBox();

        expandButton.addEventListener("click", (event: MouseEvent) => {
            expandButton.classList.toggle("turn-180");
            additionalInfoContainer.classList.toggle("opacity-100");
            personBox.classList.toggle("z-index-6");
        });
    }

    private addDeleteButtonEventListener(): void {
        let deleteButton: HTMLElement = this.personView.getDeleteButtonElement();

        deleteButton.addEventListener("click", (event: MouseEvent) => {
            console.log("delete");
            this.person.delete();
            this.personView.delete();
        });
    }
}