import { ConnectParams, jsPlumb, jsPlumbInstance, jsPlumbUtil } from "jsplumb";
import { Person } from "../models/person";
import { PersonView } from "./personView";
import { Position } from "../position"
import { TreeDrawer } from "../treeDrawingAlgorithms/treeDrawer";
import { WalkerTreeDrawer } from "../treeDrawingAlgorithms/walkerTreeDrawer";

export class GenealogyView {
    private containerElement: HTMLElement;
    private containerElementWrapper: HTMLElement;
    private jsPlumbInst: jsPlumbInstance;
    private depthInput: HTMLInputElement;
    private timeSettingsInput: HTMLSelectElement;
    private zoomInButton: HTMLElement;
    private zoomOutButton: HTMLElement;
    private drawTreeButton: HTMLElement;
    private redrawTreeButton: HTMLElement;
    private currentRootPersonElement: HTMLElement;

    private timelineContainerWrapper: HTMLElement;
    private timelineContainer: HTMLElement;
    private timelineLineContainers: HTMLElement[];
    private timelineWidthInPx: number;
    private pixelPerYear: number;

    private scale = 1;
    private isPaning: boolean = false;
    private transformX: number = 0;
    private transformY: number = 0
    private zoomFactor: number;

    constructor(parentElement: HTMLElement, languageData: Object) {
        this.timelineLineContainers = new Array<HTMLElement>(6000);
        this.timelineWidthInPx = 50;
        this.pixelPerYear = 10;
        this.zoomFactor = 0.1;
        // this.personViews = new Map<string, PersonView>();

        this.initializeHTMLElements(parentElement, languageData);
        this.addZoomEventListeners();
        this.addPanningEventListeners();
    }

    public connectDuplicates(duplicates: Map<string, Person[]>, personViews: Map<string, PersonView>): void {
        console.log(duplicates);

        duplicates.forEach((duplicatesList: Person[], id: string) => {
            for (let i = 0; i < duplicatesList.length; i++) {
                const duplicateOne: Person = duplicatesList[i];
                const personView: PersonView = personViews.get(duplicateOne.getId());
                personView.toggleVisibilityOfDuplicatesButton();

                for (let x = i + 1; x < duplicatesList.length; x++) {
                    const duplicateTwo: Person = duplicatesList[x];
                    const cssClass: string = "duplicates-stroke-" + id
                    
                    let connectionParameters: ConnectParams = {
                        anchor: ["Right", "Left"],
                        connector: [ "Straight", {}],
                        endpoint: ["Dot", { cssClass: "hidden " + cssClass } ],
                        deleteEndpointsOnDetach: false,
                        detachable: false,
                        // @ts-ignore
                        paintStyle: { 
                            stroke: "#ca0404",
                            strokeWidth: 7,
                            dashstyle: "6 4"
                        },
                        endpointStyles: [
                            { fill:"#ca0404", cssClass: "test-endpoint"},
                            { fill:"#ca0404", cssClass: "test-endpoint" }
                        ],
                        cssClass: "hidden " + cssClass
                    };

                    this.jsPlumbInst.connect({ source: duplicateOne.getId(), target: duplicateTwo.getId() }, connectionParameters);
                }
            }
        });
    }

    private initializeHTMLElements(parentElement: HTMLElement, languageData: Object): void {
        let optionsBar = document.createElement("div");
        optionsBar.id = "options-bar";
        parentElement.appendChild(optionsBar);

        let currentRootPersonContainer = document.createElement("div");
        currentRootPersonContainer.id = "current-root-person-container";
        optionsBar.appendChild(currentRootPersonContainer);

        let currentRootPersonLabel: HTMLElement = document.createElement("div");
        currentRootPersonLabel.textContent = "Current Root Person:";
        currentRootPersonContainer.appendChild(currentRootPersonLabel);

        this.currentRootPersonElement = document.createElement("div");
        this.currentRootPersonElement.textContent = "Henry VIII";
        currentRootPersonContainer.appendChild(this.currentRootPersonElement);

        let optionsContainer: HTMLElement = document.createElement("div");
        optionsBar.appendChild(optionsContainer);

        this.timeSettingsInput = document.createElement("select");
        let options: string[] = ["ascendancy", "descendancy"];
        optionsContainer.appendChild(this.timeSettingsInput);
        for (const option of options) {
            let optionElement: HTMLOptionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.text = option;
            this.timeSettingsInput.appendChild(optionElement);
        }

        const depthInputLabel = document.createElement("label");
        depthInputLabel.innerHTML = languageData["depthInputLabelText"];
        depthInputLabel.setAttribute("for", "depth-input");
        optionsContainer.appendChild(depthInputLabel);

        this.depthInput = document.createElement("input");
        this.depthInput.type = "number";
        this.depthInput.name = "depth-input";
        this.depthInput.id = "depth-input";
        this.depthInput.max = "50";
        this.depthInput.min = "1";
        this.depthInput.value = "4";
        optionsContainer.appendChild(this.depthInput);

        let zoomButtonsContainer: HTMLElement = document.createElement("div");
        optionsBar.appendChild(zoomButtonsContainer);

        this.zoomInButton = document.createElement("button");
        this.zoomInButton.id = "zoom-in-button";
        this.zoomInButton.innerHTML = languageData["zoomInButtonText"];
        zoomButtonsContainer.appendChild(this.zoomInButton);

        this.zoomOutButton = document.createElement("button");
        this.zoomOutButton.id = "zoom-out-button";
        this.zoomOutButton.innerHTML = languageData["zoomOutButtonText"];
        zoomButtonsContainer.appendChild(this.zoomOutButton);

        let drawTreeButtonContainer: HTMLElement = document.createElement("div");
        drawTreeButtonContainer.id = "draw-tree-button-container";
        optionsBar.appendChild(drawTreeButtonContainer);

        this.drawTreeButton = document.createElement("button");
        this.drawTreeButton.innerText = "Draw new tree";
        this.drawTreeButton.classList.add("draw-tree-button");
        this.drawTreeButton.id = "draw-new-tree-button"
        drawTreeButtonContainer.appendChild(this.drawTreeButton);

        this.redrawTreeButton = document.createElement("button");
        this.redrawTreeButton.innerText = "Redraw tree";
        this.redrawTreeButton.classList.add("draw-tree-button");
        this.redrawTreeButton.id = "redraw-tree-button"
        drawTreeButtonContainer.appendChild(this.redrawTreeButton);

        this.containerElementWrapper = document.createElement("div");
        this.containerElementWrapper.id = "jsplumb-container-wrapper";
        parentElement.appendChild(this.containerElementWrapper);
        
        this.containerElement = document.createElement("div");
        this.containerElement.id = "jsplumb-container";
        this.containerElementWrapper.appendChild(this.containerElement);

        this.jsPlumbInst = jsPlumb.getInstance();
        this.jsPlumbInst.setContainer(this.containerElement);

        this.addTimelineElements();
    }

    private addTimelineElements() {
        this.timelineContainerWrapper = document.createElement("div");
        this.timelineContainerWrapper.id = "timeline-container-wrapper";
        this.containerElementWrapper.appendChild(this.timelineContainerWrapper);

        this.timelineContainer = document.createElement("div");
        this.timelineContainer.id = "timeline-container";
        this.timelineContainerWrapper.appendChild(this.timelineContainer);
    }

    public adjustTimelineSpan(minYear: number, maxYear: number): void {
        this.timelineContainer.innerHTML = "";
        minYear = Math.ceil(minYear / 100) * 100;
        maxYear = Math.ceil(maxYear / 100) * 100


        for (let year = minYear; year < maxYear; year+= 5) {
            const lineContainer: HTMLElement = document.createElement("div");
            this.timelineContainer.appendChild(lineContainer);
            lineContainer.style.top = `${year * this.pixelPerYear}px`
            lineContainer.classList.add("timeline-line-container");
            this.timelineLineContainers.push(lineContainer);

            const line: HTMLElement = document.createElement("div");
            line.classList.add("timeline-line");
            lineContainer.appendChild(line);

            const number: HTMLElement = document.createElement("div");
            number.classList.add("timeline-number");
            const numberText: Text = document.createTextNode("" + year)
            number.appendChild(numberText);

            lineContainer.appendChild(number);
        }
    }

    public displayAncestors(rootPerson: Person, personViews: Map<string, PersonView>) {
        this.adjustTimelineSpan(rootPerson.getDatesOfBirth()[0].getFullYear() - 1000, rootPerson.getDatesOfBirth()[0].getFullYear() + 1000);
        this.jsPlumbInst.reset();
        let drawer: TreeDrawer = new WalkerTreeDrawer();
        drawer.run(rootPerson, personViews, this.pixelPerYear, this.jsPlumbInst, true);
        this.translateToPositionOfPersonView(personViews.get(rootPerson.getId()));
    }

    public displayDescendants(rootPerson: Person, personViews: Map<string, PersonView>) {
        this.adjustTimelineSpan(rootPerson.getDatesOfBirth()[0].getFullYear() - 1000, rootPerson.getDatesOfBirth()[0].getFullYear() + 1000);
        this.jsPlumbInst.reset();
        let drawer: TreeDrawer = new WalkerTreeDrawer();
        drawer.run(rootPerson, personViews, this.pixelPerYear, this.jsPlumbInst, false);
        this.translateToPositionOfPersonView(personViews.get(rootPerson.getId()));
    }

    public setRedrawButtonToActive(): void {
        this.redrawTreeButton.classList.add("active");
    }

    public translateToPositionOfPersonView(personView: PersonView): void {
        let wrapperWidth: number = this.containerElementWrapper.offsetWidth;
        let wrapperHeight: number = this.containerElementWrapper.offsetHeight;

        // Translate the container so that the personview is in the top left corner.
        this.transformY = -personView.getOffsetTopInPx() * this.scale;
        this.transformX = -personView.getOffsetLeftInPx() * this.scale;

        // Center the personview in the containerWrapper.
        this.transformX += wrapperWidth / 2 - personView.getWidthInPx() * this.scale / 2;
        this.transformY += wrapperHeight / 2 - personView.getHeightInPx() * this.scale / 2;

        // Translate and scale accordingly to the new values.
        this.translateAndScaleContainerAndTimeline(this.transformX, this.transformY, this.scale);
    }

    public clearContainer(): void {
        this.containerElement.innerHTML = "";
    }

    private addZoomEventListeners() {
        this.zoomOutButton.addEventListener("click", (event: MouseEvent) => {
            const relativeMousePosition: Position = this.getRelativeMousePosition(event);
            this.zoom(relativeMousePosition, -this.zoomFactor)
        });

        this.zoomInButton.addEventListener("click", (event: MouseEvent) => {
            const relativeMousePosition: Position = this.getRelativeMousePosition(event);
            this.zoom(relativeMousePosition, this.zoomFactor);
        });
        
        this.containerElementWrapper.addEventListener("wheel", (event: WheelEvent) => {
            const delta = Math.sign(event.deltaY);
            const minimumScale = 0.2;

            const relativeMousePosition: Position = this.getRelativeMousePosition(event);

            if (delta > 0) {
                if (this.scale > minimumScale) {
                    this.zoom(relativeMousePosition, -this.zoomFactor);
                }
            } else {
                this.zoom(relativeMousePosition, this.zoomFactor);
            }
        });
    }

    private zoom(mousePosition: Position, zoomFactor: number) {
        this.scaleAndTranslateElementsWithMousePosition(this.scale, this.scale + zoomFactor, mousePosition.x, mousePosition.y);
        this.scale += zoomFactor;
    }

    private getRelativeMousePosition(mouseEvent: MouseEvent): Position {
        let rect = this.containerElementWrapper.getBoundingClientRect();
        let mousePositionX = mouseEvent.clientX - rect.left;
        let mousePositionY = mouseEvent.clientY - rect.top;

        return new Position(mousePositionX, mousePositionY);
    }

    private scaleAndTranslateElementsWithMousePosition(currentScale: number, newScale: number, mousePositionX: number, mousePositionY: number): void {
        let scaleRatio = newScale / currentScale;

        let scaledMousePositionX = this.transformX + (mousePositionX - this.transformX) * scaleRatio;
        let scaledMousePositionY = this.transformY + (mousePositionY- this.transformY) * scaleRatio;

        this.transformX += mousePositionX - scaledMousePositionX;
        this.transformY += mousePositionY - scaledMousePositionY;

        this.translateAndScaleContainerAndTimeline(this.transformX, this.transformY, newScale);
        this.adjustTimelineScale(newScale);
    }

    private adjustTimelineScale(scale: number): void {
        this.timelineContainerWrapper.style.width = (this.timelineWidthInPx / scale) + "px";
        this.timelineContainerWrapper.style.fontSize = (1 / scale) + "rem";
        
        this.timelineLineContainers.forEach((element: Element, index: number) => {
            const timelineLineContainer: HTMLElement = (element as HTMLElement);
            const lineElement: HTMLElement = <HTMLElement> timelineLineContainer.children[0];

            lineElement.style.height = (1 / scale) + "px";
            
            if (index % 5 !== 0) {
                if (scale <= 0.5) {
                    timelineLineContainer.style.visibility = "hidden";
                } else {
                    timelineLineContainer.style.visibility = "visible";
                }
            }

        });
    }

    private translateAndScaleContainerAndTimeline(x: number, y: number, scale: number): void {
        this.containerElement.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
        this.timelineContainerWrapper.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, ${y})`;
    }

    private addPanningEventListeners() {
        this.containerElementWrapper.addEventListener("mousedown", (event: MouseEvent) => {
            this.isPaning = true;
        });
            
        this.containerElementWrapper.addEventListener("mouseup", (event: MouseEvent) => {
            this.isPaning = false;
        });
    
        this.containerElementWrapper.addEventListener("mousemove", (event: MouseEvent) => {
            if (this.isPaning) {
                let xDifference = event.movementX;
                let yDifference = event.movementY;
    
                this.transformX += xDifference;
                this.transformY += yDifference;

                this.translateAndScaleContainerAndTimeline(this.transformX, this.transformY, this.scale);
            }
        });
    }

    public setCurrentRootPerson(person: Person): void {
        this.currentRootPersonElement.textContent = person.getName();
    }

    // getters and setters

    public getDepthInput(): HTMLInputElement {
        return this.depthInput;
    }

    public getTimeSelectElement(): HTMLSelectElement {
        return this.timeSettingsInput;
    }

    public getContainer(): HTMLElement {
        return this.containerElement;
    }

    public getJSPlumbInstance(): jsPlumbInstance {
        return this.jsPlumbInst;
    }

    public getDrawTreeButton(): HTMLElement {
        return this.drawTreeButton;
    }

    public getRedrawTreeButton(): HTMLElement {
        return this.redrawTreeButton;
    }
}