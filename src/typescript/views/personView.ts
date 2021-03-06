import { jsPlumbInstance } from "jsplumb";
import { Person } from "../models/person";
import { SexOrGender } from "../sexOrGender";
import { SexOrGenderId } from "../sexOrGenderId";

export class PersonView {
    private boxWidthInPx: number;
    private boxHeightInPx: number;
    private rootElement: HTMLElement;
    private containerElement: HTMLElement;
    private boxElement: HTMLElement;
    private deleteButtonElement: HTMLElement;

    private lifeLineBoundTop: HTMLElement;
    private lifeLineBoundBottom: HTMLElement;
    private lifeLineTop: HTMLElement;
    private lifeLineBottom: HTMLElement;
    private lifeLineBoundHeightInPx: number;
    
    private jsPlumbInst: jsPlumbInstance;

    constructor(person: Person, rootElement: HTMLElement, jsPlumbInst: jsPlumbInstance) {
        this.rootElement = rootElement;
        this.jsPlumbInst = jsPlumbInst;
        this.boxWidthInPx = 200;
        this.boxHeightInPx = 125;
        this.lifeLineBoundHeightInPx = 10;

        this.createPersonNode(person);
    }

    public createPersonNode(person: Person): void {
        this.containerElement = document.createElement("div");
        this.containerElement.classList.add("person-container")
        this.rootElement.appendChild(this.containerElement);

        this.lifeLineBoundTop = this.createLifelineBoundElement(this.lifeLineBoundHeightInPx);
        this.containerElement.appendChild(this.lifeLineBoundTop);

        this.lifeLineTop = this.createLifelineElement(["lifeline-top"]);
        this.containerElement.appendChild(this.lifeLineTop);

        this.boxElement = this.createBoxElement(person, this.boxWidthInPx, this.boxHeightInPx);
        this.addSexOrGenderCSSClassesToElement(this.boxElement, person.getSexOrGender());
        this.containerElement.appendChild(this.boxElement);

        let nameParagraphElement: HTMLElement = this.createTextParagraphElement(person.getName(), ["person-name"]);
        this.boxElement.appendChild(nameParagraphElement);

        let dateContainer: HTMLElement = document.createElement("div");
        dateContainer.classList.add("date-container");
        this.boxElement.appendChild(dateContainer);

        let birthInput: HTMLInputElement = this.createNumberInputElement(["birth-and-death-input"]);
        birthInput.setAttribute("dir", "rtl");
        if (person.getDatesOfBirth()[0] != null) birthInput.valueAsNumber = person.getDatesOfBirth()[0].getFullYear();
        dateContainer.appendChild(birthInput);

        let minusDiv: HTMLElement = document.createElement("div");
        minusDiv.appendChild(document.createTextNode("-"));
        dateContainer.appendChild(minusDiv);

        let deathInput: HTMLInputElement = this.createNumberInputElement(["birth-and-death-input"]);
        if (person.getDatesOfDeath()[0] != null) deathInput.valueAsNumber =  person.getDatesOfDeath()[0].getFullYear();
        dateContainer.appendChild(deathInput);

        this.lifeLineBottom = this.createLifelineElement(["lifeline-bottom"]);
        this.containerElement.appendChild(this.lifeLineBottom);

        this.lifeLineBoundBottom = this.createLifelineBoundElement(this.lifeLineBoundHeightInPx);
        this.containerElement.appendChild(this.lifeLineBoundBottom);

        if (person.getDatesOfBirth()[0] == null) {
            this.setHasBirthdate(false);
        }
        if (person.getDatesOfDeath()[0] == null) {
            this.setHasDeathdate(false);
        }

        this.jsPlumbInst.draggable(this.containerElement);
    }

    private createNumberInputElement(cssClasses: string[]): HTMLInputElement {
        let numberInputElement: HTMLInputElement = document.createElement("input");
        numberInputElement.type = "number";
        
        for (const cssClass of cssClasses) {
            numberInputElement.classList.add("birth-and-death-input");
        }

        return numberInputElement;
    }

    private createTextParagraphElement(text: string, cssClasses: string[]): HTMLElement {
        let paragraphElement: HTMLElement = document.createElement("p");
        for (const cssClass of cssClasses) {
            paragraphElement.classList.add(cssClass);
        }
        paragraphElement.appendChild(document.createTextNode(text));
        return paragraphElement;
    }

    private addSexOrGenderCSSClassesToElement(htmlElement: HTMLElement, sexOrGender: SexOrGender): void {
        if (sexOrGender != null) {
            if (sexOrGender.getSexOrGenderId() === SexOrGenderId.male) {
                htmlElement.classList.add("male");
            } else if (sexOrGender.getSexOrGenderId() === SexOrGenderId.female) {
                htmlElement.classList.add("female")
            }
        } else {
            htmlElement.classList.add("unknown-gender");
        }
    }

    private createBoxElement(person: Person, boxWidthInPx: number, boxHeightInPx: number): HTMLElement {
        let boxElement: HTMLElement = document.createElement("div");
        boxElement.classList.add("person-box");
        boxElement.id = person.getId();
        boxElement.style.width = boxWidthInPx + "px";
        boxElement.style.height = boxHeightInPx + "px";
        
        return boxElement;
    }

    private createLifelineElement(cssClasses: string[]): HTMLElement{
        let lifeline: HTMLElement = document.createElement("div");
        lifeline.classList.add("lifeline");
        for (const className of cssClasses) {
            lifeline.classList.add(className);
        }

        return lifeline;
    }

    private createLifelineBoundElement(heightInPixel: number): HTMLElement {
        let lifelineBound: HTMLElement = document.createElement("div");
        lifelineBound.classList.add("lifeline", "lifeline-bound");
        lifelineBound.style.height = heightInPixel.toString + "px";

        return lifelineBound;
    }

    private setHasBirthdate(hasBirthdate: boolean) {
        if (!hasBirthdate) {
            this.lifeLineBoundTop.style.visibility = "hidden";
            this.lifeLineTop.style.visibility = "hidden";

            this.lifeLineBoundTop.classList.add("estimated-lifeline");
            this.lifeLineTop.classList.add("estimated-lifeline");
        } else {
            this.lifeLineBoundTop.style.visibility = "visible";
            this.lifeLineBottom.style.visibility = "visible";

            this.lifeLineBoundTop.classList.remove("estimated-lifeline");
            this.lifeLineTop.classList.remove("estimated-lifeline");
        }
    }

    private setHasDeathdate(hasDeathDate: boolean) {
        if (!hasDeathDate) {
            this.lifeLineBoundTop.style.visibility = "hidden";
            this.lifeLineBoundBottom.classList.add("estimated-lifeline");
            this.lifeLineBottom.classList.add("estimated-lifeline");
        } else {
            this.lifeLineBoundTop.style.visibility = "visible";
            this.lifeLineBoundBottom.classList.remove("estimated-lifeline");
            this.lifeLineBottom.classList.remove("estimated-lifeline");
        }
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
        let minHeight: number = this.boxHeightInPx + 2 * this.lifeLineBoundHeightInPx;
        if (height >= minHeight) {
            this.containerElement.style.height = height + "px";
        } else {
            this.containerElement.style.height = minHeight + "px";
        }
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
        return this.boxHeightInPx;
    }

    public getBoxWidth(): number {
        return this.boxWidthInPx;
    }

    public getLifelineBoundHeightInPx(): number {
        return this.lifeLineBoundHeightInPx;
    }
}