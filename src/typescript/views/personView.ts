import { jsPlumbInstance } from "jsplumb";
import { Person } from "../models/person";
import { SexOrGenderIdentifier } from "../sexOrGenderIdentifier";

export class PersonView {
    private static boxWidthInPx: number = 150; // TODO maybe add static getter and setter
    private static boxHeightInPx: number = 100;

    private rootElement: HTMLElement;
    private containerElement: HTMLElement;
    private boxElement: HTMLElement;
    private lifeLineBoundTop: HTMLElement;
    private lifeLineBoundBottom: HTMLElement;
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

        this.lifeLineBoundTop = document.createElement("div");
        this.lifeLineBoundTop.classList.add("lifeline", "lifeline-bound");
        this.containerElement.appendChild(this.lifeLineBoundTop);

        this.lifeLineTop = document.createElement("div");
        this.lifeLineTop.classList.add("lifeline", "lifeline-top");
        this.containerElement.appendChild(this.lifeLineTop);

        this.boxElement = document.createElement("div");
        this.boxElement.classList.add("person-box");
        this.boxElement.id = person.getId();
        this.boxElement.style.width = PersonView.boxWidthInPx + "px";
        this.boxElement.style.height = PersonView.boxHeightInPx + "px";
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
        birthInput.setAttribute("dir", "rtl");
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
        this.lifeLineBottom.classList.add("lifeline", "lifeline-bottom");
        this.containerElement.appendChild(this.lifeLineBottom);

        this.lifeLineBoundBottom = document.createElement("div");
        this.lifeLineBoundBottom.classList.add("lifeline", "lifeline-bound");
        this.containerElement.appendChild(this.lifeLineBoundBottom);

        this.jsPlumbInst.draggable(this.containerElement);
    }

    public setTopPositionOfPersonBox(distanceInPx: number): void {
        this.lifeLineTop.style.flexBasis = distanceInPx + "px";
    }

    public getWidthInPx(): number {
        return this.containerElement.offsetWidth;
    }

    public setWidthInPx(width: number): void {
        this.containerElement.style.width = width + "px";
    }

    public getHeightInPx(): number {
        return this.containerElement.offsetHeight;
    }

    public setHeightInPx(height: number): void {
        this.containerElement.style.height = height + "px";
    }

    public getOffsetLeftInPx(): number {
        return this.containerElement.offsetLeft;
    }

    public setOffsetLeftInPx(offsetLeft: number): void {
        this.containerElement.style.left = offsetLeft + "px";
    }

    public getOffsetTopInPx(): number {
        return this.containerElement.offsetTop;
    }

    public setOffsetTopInPx(offsetTop: number): void {
        this.containerElement.style.top = offsetTop + "px";
    }

    public getDeleteButtonElement(): HTMLElement {
        return this.deleteButtonElement;
    }

    public remove(): void {
        this.rootElement.removeChild(this.containerElement);
    }

    public getBoxHeight(): number {
        return PersonView.boxHeightInPx;
    }

    public getBoxWidth(): number {
        return PersonView.boxWidthInPx;
    }
}