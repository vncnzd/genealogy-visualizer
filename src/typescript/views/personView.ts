import { jsPlumbInstance } from "jsplumb";
import { Person } from "../models/person";
import { SexOrGenderIdentifier } from "../sexOrGenderIdentifier";

export class PersonView {
    static boxWidth = 150;
    static boxHeight = 100;

    private rootElement: HTMLElement;
    private containerElement: HTMLElement;
    private boxElement: HTMLElement;
    private lifeLineTop: HTMLElement;
    private lifeLineBottom: HTMLElement;
    private deleteButtonElement: HTMLElement;

    private jsPlumbInst: jsPlumbInstance;

    constructor(person: Person, rootElement: HTMLElement, jsPlumbInst: jsPlumbInstance) {
        this.rootElement = rootElement;
        this.jsPlumbInst = jsPlumbInst;
        this.createPersonNode(person);
    }

    public createPersonNode(person: Person): void {
        this.containerElement = document.createElement("div");
        this.containerElement.classList.add("person-container")
        this.rootElement.appendChild(this.containerElement);

        this.lifeLineTop = document.createElement("div");
        this.lifeLineTop.classList.add("lifeline");
        this.containerElement.appendChild(this.lifeLineTop);

        this.boxElement = document.createElement("div");
        this.boxElement.classList.add("person-box");
        this.boxElement.id = person.getId();
        this.boxElement.style.width = PersonView.boxWidth + "px";
        this.boxElement.style.height = PersonView.boxHeight + "px";
        if (person.getSexOrGender().getSexOrGenderId() === SexOrGenderIdentifier.male) {
            this.boxElement.classList.add("male");
        } else if (person.getSexOrGender().getSexOrGenderId() === SexOrGenderIdentifier.female) {
            this.boxElement.classList.add("female")
        }

        let paragraphElement: HTMLElement = document.createElement("p");
        paragraphElement.classList.add("person-name");
        paragraphElement.appendChild(document.createTextNode(person.getName()));
        this.boxElement.appendChild(paragraphElement);

        let dateContainer: HTMLElement = document.createElement("div");
        dateContainer.classList.add("date-container");
        this.boxElement.appendChild(dateContainer);

        let birthInput: HTMLInputElement = document.createElement("input");
        birthInput.classList.add("birth-and-death-input");
        birthInput.type = "number";
        birthInput.valueAsNumber = person.getDatesOfBirth()[0].getFullYear();
        dateContainer.appendChild(birthInput);

        let minusDiv: HTMLElement = document.createElement("div");
        minusDiv.appendChild(document.createTextNode("-"));
        dateContainer.appendChild(minusDiv);

        let deathInput: HTMLInputElement = document.createElement("input");
        deathInput.classList.add("birth-and-death-input");
        deathInput.type = "number";
        deathInput.valueAsNumber = person.getDatesOfDeath()[0].getFullYear();
        dateContainer.appendChild(deathInput);
        
        this.containerElement.appendChild(this.boxElement);

        this.lifeLineBottom = document.createElement("div");
        this.lifeLineBottom.classList.add("lifeline");
        this.containerElement.appendChild(this.lifeLineBottom);

        this.jsPlumbInst.draggable(this.containerElement);
    }

    public setHeightInPx(height: number) {
        this.containerElement.style.height = `${height}px`;
    }

    public moveToPositionInPx(left: number, top: number) {
        this.containerElement.style.left = left + "px";
        this.containerElement.style.top = top + "px";
    }

    public getViewWidthInPx(): number {
        return this.containerElement.offsetWidth;
    }

    public getViewHeightInPx(): number {
        return this.containerElement.offsetHeight;
    }

    public getPositionLeft(): number {
        return this.containerElement.offsetLeft;
    }

    public getPositionTop(): number {
        return this.containerElement.offsetTop;
    }

    public getDeleteButtonElement(): HTMLElement {
        return this.deleteButtonElement;
    }

    public remove() {
        this.rootElement.removeChild(this.containerElement);
    }
}