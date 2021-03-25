import { jsPlumbInstance } from "jsplumb";
import { LanguageManager } from "../LanguageManager";
import { Person } from "../models/person";
import { SexOrGender } from "../sexOrGender";
import { SexOrGenderId } from "../sexOrGenderId";
import { View } from "./View";

export class PersonView extends View {
    private boxWidthInPx: number;
    private boxHeightInPx: number;

    private parentElement: HTMLElement;
    private containerElement: HTMLElement;
    private boxElement: HTMLElement;
    private nameParagraphElement: HTMLElement;
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
    private lifelineBoxBorderWidthInPx: number
    private lifeLineBoundHeightInPx: number;
    
    private jsPlumbInst: jsPlumbInstance;

    constructor(person: Person, rootElement: HTMLElement, jsPlumbInst: jsPlumbInstance) {
        super();
        this.boxWidthInPx = 230;
        this.boxHeightInPx = 150;
        this.lifeLineBoundHeightInPx = 15;
        this.lifelineBoxBorderWidthInPx = 15;
        this.lifelineBoxWidthInPx = this.boxWidthInPx + this.lifelineBoxBorderWidthInPx * 2;
        this.lifelineBoxHeightInPx = this.boxHeightInPx + this.lifelineBoxBorderWidthInPx * 2;
        
        this.parentElement = rootElement;
        this.jsPlumbInst = jsPlumbInst;
        this.initializeHTMLElements(person, rootElement);
    }

    public delete(): void {
        this.containerElement.remove();
        this.jsPlumbInst.remove(this.boxElement);
    }

    public toggleVisibilityOfDuplicatesButton(): void {
        this.duplicatesButton.classList.toggle("hidden");
    }

    public hideLifelineBox(): void {
        this.lifelineBox.style.visibility = "hidden";
    }

    private initializeHTMLElements(person: Person, rootElement: HTMLElement): void {
        this.containerElement = this.createHTMLElement("div", ["person-container"]);
        this.containerElement.style.width = this.lifelineBoxWidthInPx + "px";
        rootElement.appendChild(this.containerElement);

        this.lifeLineBoundTop = this.createHTMLElement("div", ["lifeline", "lifeline-bound"]);
        this.lifeLineBoundTop.style.height = this.lifeLineBoundHeightInPx + "px";
        this.containerElement.appendChild(this.lifeLineBoundTop);

        this.lifeline = this.createHTMLElement("div", ["lifeline", "lifeline-line"]);
        this.containerElement.appendChild(this.lifeline);

        this.lifelineBox = this.createHTMLElement("div", ["lifeline-box"]);
        this.lifelineBox.style.width = this.lifelineBoxWidthInPx + "px";
        this.lifelineBox.style.height = this.lifelineBoxHeightInPx + "px";
        this.containerElement.appendChild(this.lifelineBox);

        this.boxElement = this.createHTMLElement("div", ["person-box"], person.getId());
        this.boxElement.style.width = this.boxWidthInPx + "px";
        this.boxElement.style.height = this.boxHeightInPx + "px";
        this.addSexOrGenderCSSClassesToElement(this.boxElement, person.getSexOrGender());
        this.containerElement.appendChild(this.boxElement);

        this.nameParagraphElement = this.createHTMLElement("p", ["person-name"]);
        this.nameParagraphElement.appendChild(document.createTextNode(person.getName()));
        this.boxElement.appendChild(this.nameParagraphElement);

        let dateContainer: HTMLElement = this.createHTMLElement("div", ["date-container"]);
        this.boxElement.appendChild(dateContainer);

        this.birthInputElement = this.createNumberInputElement(["birth-and-death-input"]);
        this.birthInputElement.setAttribute("dir", "rtl");
        if (person.getDatesOfBirth()[0] != null) this.birthInputElement.valueAsNumber = person.getDatesOfBirth()[0].getFullYear();
        dateContainer.appendChild(this.birthInputElement);

        let minusDiv: HTMLElement = this.createHTMLElement("div");
        minusDiv.appendChild(document.createTextNode("-"));
        dateContainer.appendChild(minusDiv);

        this.deathInputElement = this.createNumberInputElement(["birth-and-death-input"]);
        if (person.getDatesOfDeath()[0] != null) this.deathInputElement.valueAsNumber =  person.getDatesOfDeath()[0].getFullYear();
        dateContainer.appendChild(this.deathInputElement);

        let buttonContainer: HTMLElement = this.createHTMLElement("div", ["person-button-container"]);
        this.boxElement.appendChild(buttonContainer);

        this.dragAndDropButtonElement = this.createHTMLElement("div", ["drag-and-drop-button"]);
        this.dragAndDropButtonElement.textContent = "⬌"
        buttonContainer.appendChild(this.dragAndDropButtonElement);
        
        this.duplicatesButton = this.createHTMLElement("button", ["duplicates-button", "hidden"]);
        this.duplicatesButton.innerText = LanguageManager.getInstance().getCurrentLanguageData()["duplicates"]
        buttonContainer.appendChild(this.duplicatesButton);

        this.deleteButtonElement = this.createHTMLElement("button", ["delete-button"]);
        this.deleteButtonElement.innerText = LanguageManager.getInstance().getCurrentLanguageData()["delete"];
        buttonContainer.appendChild(this.deleteButtonElement);

        this.lifeLineBoundBottom = this.createHTMLElement("div", ["lifeline", "lifeline-bound"])
        this.lifeLineBoundBottom.style.height = this.lifeLineBoundHeightInPx + "px";
        this.containerElement.appendChild(this.lifeLineBoundBottom);

        this.additionalInfoContainerElement = this.createHTMLElement("div", ["additional-info-container"]);
        this.boxElement.appendChild(this.additionalInfoContainerElement);

        let descriptionParagraph: HTMLElement = this.createHTMLElement("p");
        descriptionParagraph.appendChild(document.createTextNode(person.getDescription()));
        this.additionalInfoContainerElement.appendChild(descriptionParagraph);

        let wikidataLink: HTMLElement = this.createHTMLElement("a");
        wikidataLink.innerText = "https://www.wikidata.org/wiki/" + person.getBaseId();
        wikidataLink.setAttribute("href", "https://www.wikidata.org/wiki/" + person.getBaseId());
        wikidataLink.setAttribute("target", "_blank");
        this.additionalInfoContainerElement.appendChild(wikidataLink);

        this.setCssClassesForBirthAndDeathDate(person.getDatesOfBirth()[0], person.getDatesOfDeath()[0]);
    }

    private createNumberInputElement(cssClasses: string[]): HTMLInputElement {
        let numberInputElement: HTMLInputElement = document.createElement("input");
        numberInputElement.type = "number";
        
        for (const cssClass of cssClasses) {
            numberInputElement.classList.add("birth-and-death-input");
        }

        return numberInputElement;
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
        return this.lifelineBoxBorderWidthInPx;
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
        this.parentElement.removeChild(this.containerElement);
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

    public getNameParagraphElement(): HTMLElement {
        return this.nameParagraphElement;
    }
}