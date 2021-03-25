import { Person } from "../models/person";
import { PersonView } from "../views/personView";

export class PersonController {
    private person: Person;
    private personView: PersonView;

    constructor(person: Person, personView: PersonView) {
        this.person = person;
        this.personView = personView;
        this.addEventListeners();
    };

    private addEventListeners(): void {
        this.personView.getDuplicatesButtonElement().addEventListener("click", this.toggleDuplicatesConection.bind(this));
        this.personView.getDeleteButtonElement().addEventListener("click", this.removePersonAndView.bind(this));
        this.personView.getBirthInputElement().addEventListener("click", this.setBirthYear.bind(this));
        this.personView.getDeathInputElement().addEventListener("click", this.setDeathYear.bind(this));
    }

    private toggleDuplicatesConection(): void {
        const baseId: string = this.person.getBaseId();
        const querySelector: string = `.duplicates-stroke-from-${this.person.getId()}, .duplicates-stroke-${baseId}`;

        const strokesFromPersonElement: NodeList = document.querySelectorAll(querySelector);

        for (let i = 0; i < strokesFromPersonElement.length; i++) {
            const stroke: HTMLElement = <HTMLElement> strokesFromPersonElement[i];
            stroke.classList.toggle("hidden");
        }
    }

    private removePersonAndView(): void {
        this.person.deleteAndRemoveReferences();
        this.personView.delete();
    }

    private setBirthYear(): void {
        let year: number = this.personView.getBirthInputElement().valueAsNumber;

        if (this.person.getDatesOfBirth().length == 0) {
            this.person.getDatesOfBirth().push(new Date());
        }

        this.person.getDatesOfBirth()[0].setFullYear(year);
    }

    private setDeathYear(): void {
        let year: number = this.personView.getDeathInputElement().valueAsNumber;

        if (this.person.getDatesOfDeath().length == 0) {
            this.person.getDatesOfDeath().push(new Date());
        }

        this.person.getDatesOfDeath()[0].setFullYear(year);
    }
}