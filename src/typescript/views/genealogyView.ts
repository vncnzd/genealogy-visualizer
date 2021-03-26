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
    private genealogyTypeInput: HTMLSelectElement;
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

    private scale;
    private minScale;
    private isPaning: boolean = false;
    private isDraggingAPersonNode: boolean = false;
    private transformX: number = 0;
    private transformY: number = 0
    private zoomFactor: number;

    constructor(parentElement: HTMLElement) {
        super();
        this.timelineLineContainers = [];
        this.timelineWidthInPx = 50;
        this.pixelPerYear = 10;
        this.zoomFactor = 0.1;
        this.scale = 1;
        this.minScale = 0.1;

        this.initializeHTMLElements(parentElement);
        this.addZoomEventListeners();
        this.addPanningEventListeners();
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

        const genealogyTypeContainer: HTMLElement = this.createHTMLElement("div", [], "direction-container");
        displayOptionsContainer.appendChild(genealogyTypeContainer);

        const genealogyTypeLabel = this.createHTMLElement("label");
        genealogyTypeLabel.innerHTML = languageData["genealogyTypeLabel"];
        // directionLabel.setAttribute("for", "depth-input");
        genealogyTypeContainer.appendChild(genealogyTypeLabel);

        this.genealogyTypeInput = document.createElement("select");
        const options: string[] = [languageData["ancestors"], languageData["descendants"]];
        for (const option of options) {
            const optionElement: HTMLOptionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.text = option;
            this.genealogyTypeInput.appendChild(optionElement);
        }
        genealogyTypeContainer.appendChild(this.genealogyTypeInput);

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
        this.setIsActiveOfDrawNewButton(false);
        drawTreeButtonContainer.appendChild(this.drawNewTreeButton);

        this.redrawTreeButton = this.createHTMLElement("button", ["draw-tree-button"], "redraw-tree-button");
        this.redrawTreeButton.innerText = languageData["redrawTree"];
        this.setIsActiveOfRedrawButton(false);
        drawTreeButtonContainer.appendChild(this.redrawTreeButton);

        this.containerElementWrapper = this.createHTMLElement("div", [], "jsplumb-container-wrapper");
        parentElement.appendChild(this.containerElementWrapper);

        const zoomButtonsContainer: HTMLElement = this.createHTMLElement("div", [], "zoom-button-container");
        this.containerElementWrapper.appendChild(zoomButtonsContainer);

        this.zoomInButton = this.createHTMLElement("button", [], "zoom-in-button");
        this.zoomInButton.innerHTML = languageData["zoomInButtonText"];
        zoomButtonsContainer.appendChild(this.zoomInButton);

        this.zoomOutButton = this.createHTMLElement("button", [], "zoom-out-button");
        this.zoomOutButton.innerHTML = languageData["zoomOutButtonText"];
        zoomButtonsContainer.appendChild(this.zoomOutButton);

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

    public clearContainer(): void {
        this.removeAllChildElements(this.containerElement);
    }

    public setLoaderIsVisible(isVisible: boolean): void {
        if (isVisible) {
            this.loaderElement.classList.remove("hidden");
        } else {
            this.loaderElement.classList.add("hidden");
        }
    }

    public drawGenealogyTree(rootPerson: Person, personViews: Map<string, PersonView>, genealogyType: GenealogyType, duplicates: Map<string, Person[]>): void {
        // Clearing the container has to be done in the calling method. Otherwise the new PersonView objects get removed aswell.
        this.jsPlumbInst.reset();

        const timelineBounds: [number, number] = this.getTimespanForGenealogy(rootPerson);
        this.rebuildTimelineAndScale(timelineBounds[0] - 500, timelineBounds[1] + 500);

        const drawer: TreeDrawer = new WalkerTreeDrawer();
        drawer.run(rootPerson, personViews, this.pixelPerYear, this.jsPlumbInst, genealogyType);

        this.translateToPositionOfRootPersonView(personViews.get(rootPerson.getId()));
        this.addDragAndDropEventListenerToPersonViews(personViews);
        this.connectDuplicates(duplicates, personViews);
    }

    private connectDuplicates(duplicates: Map<string, Person[]>, personViews: Map<string, PersonView>): void {
        const connectionParameters: ConnectParams = {
            anchor: ["Right", "Left"],
            connector: ["Straight", {}],
            deleteEndpointsOnDetach: false,
            detachable: false,
            // @ts-ignore
            paintStyle: {
                stroke: "#ca0404",
                strokeWidth: 7,
                dashstyle: "6 4"
            },
            endpointStyles: [
                { fill: "#ca0404" },
                { fill: "#ca0404" }
            ]
        };

        duplicates.forEach((duplicatesList: Person[], id: string) => {
            for (let i = 0; i < duplicatesList.length; i++) {
                const duplicateOne: Person = duplicatesList[i];
                const personView: PersonView = personViews.get(duplicateOne.getId());
                personView.toggleVisibilityOfDuplicatesButton();

                for (let x = i + 1; x < duplicatesList.length; x++) {
                    const duplicateTwo: Person = duplicatesList[x];
                    const cssClass: string = "duplicates-stroke-" + id;

                    connectionParameters["endpoint"] = ["Dot", { cssClass: "hidden " + cssClass }];
                    connectionParameters["cssClass"] = "hidden " + cssClass;

                    this.jsPlumbInst.connect({ source: duplicateOne.getId(), target: duplicateTwo.getId() }, connectionParameters);
                }
            }
        });
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

    private getTimespanForGenealogy(rootPerson: Person): [number, number] {
        let minYear: number = Number.MAX_VALUE;
        let maxYear: number = Number.MIN_VALUE;

        getMinYear(rootPerson);
        getMaxYear(rootPerson);

        if (minYear == Number.MAX_VALUE && maxYear == Number.MIN_VALUE) {
            minYear = 0;
            maxYear = 0;
        }

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

    public setIsActiveOfRedrawButton(isActive: boolean): void {
        if (isActive) {
            this.redrawTreeButton.classList.remove("inactive");
        } else {
            this.redrawTreeButton.classList.add("inactive");
        }
    }

    public setIsActiveOfDrawNewButton(isActive: boolean): void {
        if (isActive) {
            this.drawNewTreeButton.classList.remove("inactive");
        } else {
            this.drawNewTreeButton.classList.add("inactive");
        }
    }

    public translateToPositionOfRootPersonView(personView: PersonView): void {
        let containerWrapperWidth: number = this.containerElementWrapper.offsetWidth;
        let containerWrapperHeight: number = this.containerElementWrapper.offsetHeight;

        // Translate the container so that the personview is in the top left corner.
        this.transformY = -personView.getOffsetTopInPx() * this.scale;
        this.transformX = -personView.getOffsetLeftInPx() * this.scale;

        // Center the personview in the containerWrapper.
        this.transformX += containerWrapperWidth / 2 - personView.getWidthInPx() * this.scale / 2;
        this.transformY += containerWrapperHeight / 2 - personView.getHeightInPx() * this.scale / 2;

        // Translate and scale the container and timeline accordingly.
        this.translateAndScaleContainerAndTimeline(this.transformX, this.transformY, this.scale);
    }

    private addZoomEventListeners() {
        this.zoomOutButton.addEventListener("click", (event: MouseEvent) => {
            const centerOfWrapper: Position = new Position(this.containerElementWrapper.offsetWidth / 2, this.containerElementWrapper.offsetHeight / 2);
            this.zoomBy(-this.zoomFactor, centerOfWrapper);
        });

        this.zoomInButton.addEventListener("click", (event: MouseEvent) => {
            const centerOfWrapper: Position = new Position(this.containerElementWrapper.offsetWidth / 2, this.containerElementWrapper.offsetHeight / 2);
            this.zoomBy(this.zoomFactor, centerOfWrapper);
        });

        this.containerElementWrapper.addEventListener("wheel", (event: WheelEvent) => {
            const delta = Math.sign(event.deltaY);
            const relativeMousePosition: Position = this.getRelativeMousePosition(event);

            if (delta > 0) {
                // Zoom out.
                this.zoomBy(-this.zoomFactor, relativeMousePosition);
            } else {
                // Zoom out.
                this.zoomBy(this.zoomFactor, relativeMousePosition);
            }
        });
    }

    private zoomBy(zoomFactor: number, relativeMousePosition: Position): void {
        const newScale: number = this.scale + zoomFactor;

        if (newScale > this.minScale) {
            this.scaleAndTranslateElementsWithMousePosition(this.scale, newScale, relativeMousePosition.x, relativeMousePosition.y);
            this.scale = newScale;
        } 
    }

    private getRelativeMousePosition(mouseEvent: MouseEvent): Position {
        const rect = this.containerElementWrapper.getBoundingClientRect();
        const mousePositionX = mouseEvent.clientX - rect.left;
        const mousePositionY = mouseEvent.clientY - rect.top;

        return new Position(mousePositionX, mousePositionY);
    }

    private scaleAndTranslateElementsWithMousePosition(currentScale: number, newScale: number, mousePositionX: number, mousePositionY: number): void {
        const scaleRatio = newScale / currentScale;

        const scaledMousePositionX = this.transformX + (mousePositionX - this.transformX) * scaleRatio;
        const scaledMousePositionY = this.transformY + (mousePositionY - this.transformY) * scaleRatio;

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
            const lineElement: HTMLElement = <HTMLElement>timelineLineContainer.children[0];

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
                mouseEvent.preventDefault();

                this.isDraggingAPersonNode = true;
                isDraggingThisPersonView = true;
            });

            this.containerElementWrapper.addEventListener("mousemove", (mouseEvent: MouseEvent) => {
                mouseEvent.preventDefault();

                if (isDraggingThisPersonView) {
                    personView.setOffsetLeftInPx(personView.getOffsetLeftInPx() + mouseEvent.movementX / this.scale);
                    this.jsPlumbInst.revalidate(id);
                }
            });

            this.containerElementWrapper.addEventListener("mouseup", (mouseEvent: MouseEvent) => {
                mouseEvent.preventDefault();

                isDraggingThisPersonView = false;
                this.isDraggingAPersonNode = false;
            });
        });
    }

    private translateAndScaleContainerAndTimeline(x: number, y: number, scale: number): void {
        this.containerElement.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
        this.timelineContainerWrapper.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, ${y})`;
    }

    private addPanningEventListeners() {
        this.containerElementWrapper.addEventListener("mousedown", (mouseEvent: MouseEvent) => {
            mouseEvent.preventDefault();

            this.isPaning = true;
        });

        this.containerElementWrapper.addEventListener("mouseup", (mouseEvent: MouseEvent) => {
            mouseEvent.preventDefault();

            this.isPaning = false;
        });

        this.containerElementWrapper.addEventListener("mousemove", (mouseEvent: MouseEvent) => {
            mouseEvent.preventDefault();

            if (this.isPaning && !this.isDraggingAPersonNode) {
                this.transformX += mouseEvent.movementX;
                this.transformY += mouseEvent.movementY;

                this.translateAndScaleContainerAndTimeline(this.transformX, this.transformY, this.scale);
            }
        });
    }

    public setCurrentRootPerson(person: Person): void {
        this.currentRootPersonElement.textContent = person.getName();
    }

    public getNumberOfGenerations(): HTMLInputElement {
        return this.numberOfGenerationsInput;
    }

    public getGenealogyTypeSelectElement(): HTMLSelectElement {
        return this.genealogyTypeInput;
    }

    public getContainer(): HTMLElement {
        return this.containerElement;
    }

    public getJSPlumbInstance(): jsPlumbInstance {
        return this.jsPlumbInst;
    }

    public getDrawNewTreeButton(): HTMLElement {
        return this.drawNewTreeButton;
    }

    public getRedrawTreeButton(): HTMLElement {
        return this.redrawTreeButton;
    }
}