import { Person } from "../models/person";
import { PersonView } from "../views/personView";

export class PersonController {
    private person: Person;
    private personView: PersonView;

    constructor(person: Person, personView: PersonView) {
        this.person = person;
        this.personView = personView;

        this.addDuplicatesButtonEventListener();
        this.addDeleteButtonEventListener();
        this.addBirthInputEventListener();
        this.addDeathInputEventListener();
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

    private addDeleteButtonEventListener(): void {
        let deleteButton: HTMLElement = this.personView.getDeleteButtonElement();

        deleteButton.addEventListener("click", (event: MouseEvent) => {
            this.person.delete();
            this.personView.delete();
        });
    }

    private addBirthInputEventListener(): void {
        let birthInput: HTMLInputElement = this.personView.getBirthInputElement();

        birthInput.addEventListener("change", (event: Event): void => {
            let year: number = birthInput.valueAsNumber;

            if (this.person.getDatesOfBirth().length > 0) {
                this.person.getDatesOfBirth()[0].setFullYear(year);
            }
        });
    }

    private addDeathInputEventListener(): void {
        let deathInput: HTMLInputElement = this.personView.getDeathInputElement();

        deathInput.addEventListener("change", (event: Event): void => {
            let year: number = deathInput.valueAsNumber;

            if (this.person.getDatesOfDeath().length > 0) {
                this.person.getDatesOfDeath()[0].setFullYear(year);
            }
        });
    }
}