import { ConnectParams, jsPlumb, jsPlumbInstance, jsPlumbUtil } from "jsplumb";
import { Person } from "../models/person";
import { PersonView } from "./personView";
import { Position } from "../position"
import { TreeDrawer } from "../treeDrawingAlgorithms/treeDrawer";
import { WalkerTreeDrawer } from "../treeDrawingAlgorithms/walkerTreeDrawer";
import { LanguageManager } from "../LanguageManager";
import { View } from "./View";
import { GenealogyType } from "../genealogyType";

export class GenealogyView extends View {
    private containerElement: HTMLElement;
    private containerElementWrapper: HTMLElement;
    private jsPlumbInst: jsPlumbInstance;
    private numberOfGenerationsInput: HTMLInputElement;
    private directionInput: HTMLSelectElement;
    private zoomInButton: HTMLElement;
    private zoomOutButton: HTMLElement;
    private drawNewTreeButton: HTMLElement;
    private redrawTreeButton: HTMLElement;
    private currentRootPersonElement: HTMLElement;
    private loaderElement: HTMLElement;

    private timelineContainerWrapper: HTMLElement;
    private timelineContainer: HTMLElement;
    private timelineLineContainers: HTMLElement[];
    private timelineWidthInPx: number;
    private pixelPerYear: number;

    private scale = 1;
    private isPaning: boolean = false;
    private isDragginPersonView: boolean = false;
    private transformX: number = 0;
    private transformY: number = 0
    private zoomFactor: number;

    constructor(parentElement: HTMLElement) {
        super();
        this.timelineLineContainers = [];
        this.timelineWidthInPx = 50;
        this.pixelPerYear = 10;
        this.zoomFactor = 0.1;

        this.initializeHTMLElements(parentElement);
        this.addZoomEventListeners();
        this.addPanningEventListeners();
    }

    public connectDuplicates(duplicates: Map<string, Person[]>, personViews: Map<string, PersonView>): void {
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

    private initializeHTMLElements(parentElement: HTMLElement): void {
        const languageData: Object = LanguageManager.getInstance().getCurrentLanguageData();

        const optionsBar = this.createHTMLElement("div", [], "options-bar");
        parentElement.appendChild(optionsBar);

        const currentRootPersonContainer = this.createHTMLElement("div", [], "current-root-person-container");
        optionsBar.appendChild(currentRootPersonContainer);

        const currentRootPersonLabel: HTMLElement = this.createHTMLElement("div", [], "current-person-label");
        currentRootPersonLabel.textContent = languageData["currentRootPerson"];
        currentRootPersonContainer.appendChild(currentRootPersonLabel);

        this.currentRootPersonElement = this.createHTMLElement("div", [], "current-root-person-name");
        currentRootPersonContainer.appendChild(this.currentRootPersonElement);

        const displayOptionsContainer: HTMLElement = this.createHTMLElement("div", [], "display-options-container");
        optionsBar.appendChild(displayOptionsContainer);

        const directionContainer: HTMLElement = this.createHTMLElement("div", [], "direction-container");
        displayOptionsContainer.appendChild(directionContainer);

        const directionLabel = this.createHTMLElement("label");
        directionLabel.innerHTML = languageData["genealogyTypeLabel"];
        // directionLabel.setAttribute("for", "depth-input");
        directionContainer.appendChild(directionLabel);

        this.directionInput = document.createElement("select");
        const options: string[] = [languageData["ancestors"], languageData["descendants"]];
        for (const option of options) {
            const optionElement: HTMLOptionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.text = option;
            this.directionInput.appendChild(optionElement);
        }
        directionContainer.appendChild(this.directionInput);

        const numberOfGenerationsContainer: HTMLElement = this.createHTMLElement("div", [], "number-of-generations-container");
        displayOptionsContainer.appendChild(numberOfGenerationsContainer);

        const numberOfGenerationsInputLabel = this.createHTMLElement("label");
        numberOfGenerationsInputLabel.innerHTML = languageData["numberOfGenerationsInputLabel"];
        numberOfGenerationsInputLabel.setAttribute("for", "depth-input");
        numberOfGenerationsContainer.appendChild(numberOfGenerationsInputLabel);

        this.numberOfGenerationsInput = document.createElement("input");
        this.numberOfGenerationsInput.type = "number";
        this.numberOfGenerationsInput.name = "depth-input";
        this.numberOfGenerationsInput.id = "depth-input";
        this.numberOfGenerationsInput.max = "50";
        this.numberOfGenerationsInput.min = "1";
        this.numberOfGenerationsInput.value = "3";
        numberOfGenerationsContainer.appendChild(this.numberOfGenerationsInput);

        const drawTreeButtonContainer: HTMLElement = this.createHTMLElement("div", [], "draw-tree-button-container");
        optionsBar.appendChild(drawTreeButtonContainer);

        this.drawNewTreeButton = this.createHTMLElement("button", ["draw-tree-button"], "draw-new-tree-button");
        this.drawNewTreeButton.innerText = languageData["drawNewTree"];
        drawTreeButtonContainer.appendChild(this.drawNewTreeButton);

        this.redrawTreeButton = this.createHTMLElement("button", ["draw-tree-button"], "redraw-tree-button");
        this.redrawTreeButton.innerText = languageData["redrawTree"];
        drawTreeButtonContainer.appendChild(this.redrawTreeButton);

        const zoomButtonsContainer: HTMLElement = this.createHTMLElement("div", [], "zoom-button-container");
        optionsBar.appendChild(zoomButtonsContainer);

        this.zoomInButton = this.createHTMLElement("button", [], "zoom-in-button");
        this.zoomInButton.innerHTML = languageData["zoomInButtonText"];
        zoomButtonsContainer.appendChild(this.zoomInButton);

        this.zoomOutButton = this.createHTMLElement("button", [], "zoom-out-button");
        this.zoomOutButton.innerHTML = languageData["zoomOutButtonText"];
        zoomButtonsContainer.appendChild(this.zoomOutButton);

        this.containerElementWrapper = this.createHTMLElement("div", [], "jsplumb-container-wrapper");
        parentElement.appendChild(this.containerElementWrapper);

        this.loaderElement = this.createHTMLElement("div", ["loader", "hidden"]);
        this.containerElementWrapper.appendChild(this.loaderElement);
        
        this.containerElement = this.createHTMLElement("div", [], "jsplumb-container");
        this.containerElementWrapper.appendChild(this.containerElement);

        this.jsPlumbInst = jsPlumb.getInstance();
        this.jsPlumbInst.setContainer(this.containerElement);

        this.timelineContainerWrapper = this.createHTMLElement("div", [], "timeline-container-wrapper");
        this.containerElementWrapper.appendChild(this.timelineContainerWrapper);

        this.timelineContainer = this.createHTMLElement("div", [], "timeline-container");
        this.timelineContainerWrapper.appendChild(this.timelineContainer);
    }

    private rebuildTimelineAndScale(minYear: number, maxYear: number, roundValue: number = 100): void {
        this.removeAllChildElements(this.timelineContainer);
        minYear = Math.floor(minYear / roundValue) * roundValue;
        maxYear = Math.ceil(maxYear / roundValue) * roundValue;

        for (let year = minYear; year < maxYear; year += 5) {
            const lineContainer: HTMLElement = this.createHTMLElement("div", ["timeline-line-container"]);
            this.timelineContainer.appendChild(lineContainer);
            lineContainer.style.top = `${year * this.pixelPerYear}px`
            this.timelineLineContainers.push(lineContainer);

            const line: HTMLElement = this.createHTMLElement("div", ["timeline-line"]);
            lineContainer.appendChild(line);

            const number: HTMLElement = this.createHTMLElement("div", ["timeline-number"]);
            number.appendChild(document.createTextNode(year.toString()));

            lineContainer.appendChild(number);
        }

        this.adjustTimelineScale(this.scale);
    }

    public setLoaderIsVisible(isVisible: boolean): void {
        if (isVisible) {
            this.loaderElement.classList.remove("hidden");
        } else {
            this.loaderElement.classList.add("hidden");
        }
    }

    public drawGenealogyTree(rootPerson: Person, personViews: Map<string, PersonView>, genealogyType: GenealogyType): void {
        this.jsPlumbInst.reset();

        const timelineBounds: [number, number] = this.getTimespanForGenealogy(rootPerson);
        this.rebuildTimelineAndScale(timelineBounds[0] - 500, timelineBounds[1] + 500);
        
        const drawer: TreeDrawer = new WalkerTreeDrawer();
        drawer.run(rootPerson, personViews, this.pixelPerYear, this.jsPlumbInst, genealogyType);

        this.translateToPositionOfRootPersonView(personViews.get(rootPerson.getId()));
        this.addDragAndDropEventListenerToPersonViews(personViews);
    }

    public getTimespanForGenealogy(rootPerson: Person): [number, number] {
        let minYear: number = Number.MAX_VALUE; // Stupid?
        let maxYear: number = Number.MIN_VALUE;

        getMinYear(rootPerson);
        getMaxYear(rootPerson);

        return [minYear, maxYear];

        function getMinYear(person: Person): void {
            if (person.getDatesOfBirth().length > 0) {
                const yearOfBirth: number = person.getDatesOfBirth()[0].getFullYear();
                if (yearOfBirth < minYear) {
                    minYear = yearOfBirth;
                }
            }

            if (person.getFather() != null) {
                getMinYear(person.getFather());
            }
            if (person.getMother() != null) {
                getMinYear(person.getMother());
            }
        }

        function getMaxYear(person: Person): void {
            if (person.getDatesOfDeath().length > 0) {
                const yearOfDeath: number = person.getDatesOfDeath()[0].getFullYear();
                if (yearOfDeath > maxYear) {
                    maxYear = yearOfDeath;
                }
            }

            for (const child of person.getChildren()) {
                getMaxYear(child);
            }
        }
    }

    public setIsActivityOfRedrawButton(isActive: boolean): void {
        if (isActive) {
            this.redrawTreeButton.classList.add("active");
        } else {
            this.redrawTreeButton.classList.remove("active");
        }
    }

    public translateToPositionOfRootPersonView(personView: PersonView): void {
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

    private addDragAndDropEventListenerToPersonViews(personViews: Map<string, PersonView>) {
        personViews.forEach((personView: PersonView, id: string) => {
            const dragAndDropButton: HTMLElement = personView.getDragAndDropButtonElement();
            let isDraggingThisPersonView: boolean = false;

            dragAndDropButton.addEventListener("mousedown", (mouseEvent: MouseEvent) => {
                this.isDragginPersonView = true;
                isDraggingThisPersonView = true;
            });

            this.containerElementWrapper.addEventListener("mousemove", (mouseEvent: MouseEvent) => {
                if (isDraggingThisPersonView) {
                    personView.setOffsetLeftInPx(personView.getOffsetLeftInPx() + mouseEvent.movementX / this.scale);
                    this.jsPlumbInst.revalidate(id);
                }
            });

            this.containerElementWrapper.addEventListener("mouseup", (mouseEvent: MouseEvent) => {
                // gets executed for all person views...not good.
                isDraggingThisPersonView = false;
                this.isDragginPersonView = false;
            });
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
            if (this.isPaning && !this.isDragginPersonView) {
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
        return this.numberOfGenerationsInput;
    }

    public getGenealogyTypeSelectElement(): HTMLSelectElement {
        return this.directionInput;
    }

    public getContainer(): HTMLElement {
        return this.containerElement;
    }

    public getJSPlumbInstance(): jsPlumbInstance {
        return this.jsPlumbInst;
    }

    public getDrawTreeButton(): HTMLElement {
        return this.drawNewTreeButton;
    }

    public getRedrawTreeButton(): HTMLElement {
        return this.redrawTreeButton;
    }
}