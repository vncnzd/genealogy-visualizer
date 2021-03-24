import { jsPlumbInstance } from "jsplumb";
import { LanguageManager } from "../LanguageManager";
import { Person } from "../models/person";
import { SexOrGender } from "../sexOrGender";
import { SexOrGenderId } from "../sexOrGenderId";

export class PersonView {
    private boxWidthInPx: number;
    private boxHeightInPx: number;
    private rootElement: HTMLElement;
    private containerElement: HTMLElement;
    private boxElement: HTMLElement;
    private duplicatesButton: HTMLElement;
    private deleteButtonElement: HTMLElement;
    private additionalInfoContainerElement: HTMLElement;
    private birthInputElement: HTMLInputElement;
    private deathInputElement: HTMLInputElement;
    private dragAndDropButtonElement: HTMLElement;

    private lifeLineBoundTop: HTMLElement;
    private lifeline: HTMLElement;
    private lifeLineBoundBottom: HTMLElement;
    private lifelineBox: HTMLElement;
    private lifelineBoxWidthInPx: number;
    private lifelineBoxHeightInPx: number;
    private lifelineBoxBorderHeightInPx: number
    private lifeLineBoundHeightInPx: number;
    
    private jsPlumbInst: jsPlumbInstance;

    constructor(person: Person, rootElement: HTMLElement, jsPlumbInst: jsPlumbInstance) {
        this.rootElement = rootElement;
        this.jsPlumbInst = jsPlumbInst;
        this.boxWidthInPx = 230;
        this.boxHeightInPx = 150;

        this.lifeLineBoundHeightInPx = 15;
        this.lifelineBoxBorderHeightInPx = 15;
        this.lifelineBoxWidthInPx = this.boxWidthInPx + this.lifelineBoxBorderHeightInPx * 2;
        this.lifelineBoxHeightInPx = this.boxHeightInPx + this.lifelineBoxBorderHeightInPx * 2;
        this.createPersonNode(person);
    }

    public delete(): void {
        this.containerElement.remove();
        this.jsPlumbInst.remove(this.boxElement);
    }

    private createPersonNode(person: Person): void {
        this.containerElement = document.createElement("div");
        this.containerElement.classList.add("person-container");
        this.containerElement.style.width = this.lifelineBoxWidthInPx + "px";
        this.rootElement.appendChild(this.containerElement);

        this.lifeLineBoundTop = this.createLifelineBoundElement(this.lifeLineBoundHeightInPx);
        this.containerElement.appendChild(this.lifeLineBoundTop);

        this.lifeline = this.createLifelineElement(["lifeline-line"]);
        this.containerElement.appendChild(this.lifeline);

        this.lifelineBox = this.createLifelineBoxElement();
        this.lifelineBox.style.width = this.lifelineBoxWidthInPx + "px";
        this.lifelineBox.style.height = this.lifelineBoxHeightInPx + "px";
        this.containerElement.appendChild(this.lifelineBox);

        this.boxElement = this.createBoxElement(person, this.boxWidthInPx, this.boxHeightInPx);
        this.addSexOrGenderCSSClassesToElement(this.boxElement, person.getSexOrGender());
        this.containerElement.appendChild(this.boxElement);

        let nameParagraphElement: HTMLElement = this.createTextParagraphElement(person.getName(), ["person-name"]);
        this.boxElement.appendChild(nameParagraphElement);

        let dateContainer: HTMLElement = document.createElement("div");
        dateContainer.classList.add("date-container");
        this.boxElement.appendChild(dateContainer);

        this.birthInputElement = this.createNumberInputElement(["birth-and-death-input"]);
        this.birthInputElement.setAttribute("dir", "rtl");
        if (person.getDatesOfBirth()[0] != null) this.birthInputElement.valueAsNumber = person.getDatesOfBirth()[0].getFullYear();
        dateContainer.appendChild(this.birthInputElement);

        let minusDiv: HTMLElement = document.createElement("div");
        minusDiv.appendChild(document.createTextNode("-"));
        dateContainer.appendChild(minusDiv);

        this.deathInputElement = this.createNumberInputElement(["birth-and-death-input"]);
        if (person.getDatesOfDeath()[0] != null) this.deathInputElement.valueAsNumber =  person.getDatesOfDeath()[0].getFullYear();
        dateContainer.appendChild(this.deathInputElement);

        let buttonContainer: HTMLElement = document.createElement("div");
        buttonContainer.classList.add("person-button-container");
        this.boxElement.appendChild(buttonContainer);

        this.dragAndDropButtonElement = document.createElement("div");
        this.dragAndDropButtonElement.classList.add("drag-and-drop-button");
        this.dragAndDropButtonElement.textContent = "⬌"
        buttonContainer.appendChild(this.dragAndDropButtonElement);
        
        this.duplicatesButton = this.createDuplicatesButtonElement();
        buttonContainer.appendChild(this.duplicatesButton);

        this.deleteButtonElement = document.createElement("button");
        this.deleteButtonElement.innerText = "Delete";
        this.deleteButtonElement.classList.add("delete-button");
        buttonContainer.appendChild(this.deleteButtonElement);


        this.lifeLineBoundBottom = this.createLifelineBoundElement(this.lifeLineBoundHeightInPx);
        this.containerElement.appendChild(this.lifeLineBoundBottom);

        this.additionalInfoContainerElement = this.createAdditionalInfoContainer();
        this.boxElement.appendChild(this.additionalInfoContainerElement);

        let descriptionParagraph: HTMLElement = document.createElement("p");
        descriptionParagraph.appendChild(new Text(person.getDescription()));
        this.additionalInfoContainerElement.appendChild(descriptionParagraph);

        let wikidataLink: HTMLElement = document.createElement("a");
        wikidataLink.innerText = "https://www.wikidata.org/wiki/" + person.getBaseId();
        wikidataLink.setAttribute("href", "https://www.wikidata.org/wiki/" + person.getBaseId());
        wikidataLink.setAttribute("target", "_blank");
        this.additionalInfoContainerElement.appendChild(wikidataLink);

        this.setCssClassesForBirthAndDeathDate(person.getDatesOfBirth()[0], person.getDatesOfDeath()[0]);

        // this.jsPlumbInst.draggable(this.containerElement);
    }

    private createAdditionalInfoContainer(): HTMLElement {
        let additionalInfoContainer: HTMLElement = document.createElement("div");
        additionalInfoContainer.classList.add("additional-info-container");
        return additionalInfoContainer;
    }

    private createDuplicatesButtonElement(): HTMLElement {
        let duplicatesButton: HTMLElement = document.createElement("button");
        duplicatesButton.classList.add("duplicates-button");
        duplicatesButton.classList.toggle("hidden");
        duplicatesButton.innerText = "Show duplicates"; // TODO get text for different languages
        return duplicatesButton;
    }

    public toggleVisibilityOfDuplicatesButton(): void {
        this.duplicatesButton.classList.toggle("hidden");
    }

    private createLifelineBoxElement(): HTMLElement {
        let lifelineBoxElement: HTMLElement = document.createElement("div");
        lifelineBoxElement.classList.add("lifeline-box");

        return lifelineBoxElement;
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
        lifelineBound.style.height = heightInPixel + "px";

        return lifelineBound;
    }

    public hideLifelineBox(): void {
        this.lifelineBox.style.visibility = "hidden";
    }

    private setCssClassesForBirthAndDeathDate(birthdate: Date, deathdate: Date): void {
        if (birthdate == null && deathdate == null) {
            this.lifeline.style.visibility = "hidden";
            this.lifeLineBoundTop.style.visibility = "hidden";
            this.lifeLineBoundBottom.style.visibility = "hidden";
            this.lifelineBox.style.visibility = "hidden";
        } else if (birthdate == null) {
            this.lifelineBox.classList.add("gradient-transparent-lifeline");
            this.lifeLineBoundTop.style.visibility = "hidden";
        } else if (deathdate == null) {
            this.lifelineBox.classList.add("gradient-lifeline-transparent");
            this.lifeLineBoundBottom.style.visibility = "hidden";
        }
    }

    public setBorderColor(color: string): void {
        this.boxElement.style.borderColor = color;
    }

    public setOffsetTopOfLifelineBox(distanceInPx: number): void {
        this.lifelineBox.style.top = distanceInPx + "px";
    }

    public setOffsetTopOfPersonBox(distanceInPx: number): void {
        this.boxElement.style.top = distanceInPx + "px";
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

    public getDuplicatesButtonElement(): HTMLElement {
        return this.duplicatesButton;
    }

    public getLifelineBoxHeightInPx(): number {
        return this.lifelineBoxHeightInPx;
    }

    public setLifelineBoxHeightInPx(heightInPx: number): void {
        this.lifelineBox.style.height = heightInPx + "px";
    }

    public getLifelineBoxBorderHeightInPx(): number {
        return this.lifelineBoxBorderHeightInPx;
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

    public getAdditionalInfoContainerElement(): HTMLElement {
        return this.additionalInfoContainerElement;
    }

    public getPersonBox(): HTMLElement {
        return this.boxElement;
    }

    public getDeathInputElement(): HTMLInputElement {
        return this.deathInputElement;
    }

    public getBirthInputElement(): HTMLInputElement {
        return this.birthInputElement;
    }

    public getDragAndDropButtonElement(): HTMLElement {
        return this.dragAndDropButtonElement;
    }
}