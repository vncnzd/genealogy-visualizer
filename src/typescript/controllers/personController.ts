import { Person } from "../models/person";
import { PersonView } from "../views/personView";

export class PersonController {
    private person: Person;
    private personView: PersonView;

    constructor(person: Person, personView: PersonView) {
        this.person = person;
        this.personView = personView;

        this.addDuplicatesButtonEventListener();
    };

    private addDuplicatesButtonEventListener(): void {
        let duplicatesButton: HTMLElement = this.personView.getDuplicatesButtonElement();
        duplicatesButton.addEventListener("click", (event: MouseEvent) => {
            let querySelector: string = `.duplicates-stroke-from-${this.person.getId()}, .duplicates-stroke-to-${this.person.getId()}`
            let strokesFromPersonElement: NodeList = document.querySelectorAll(querySelector);

            for (let i = 0; i < strokesFromPersonElement.length; i++) {
                const stroke: HTMLElement = <HTMLElement> strokesFromPersonElement[i];
                stroke.classList.toggle("hidden");
            }
        });
    }
}