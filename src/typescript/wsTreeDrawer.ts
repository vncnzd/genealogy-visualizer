import { Person } from "./models/person";
import { WSPersonNode } from "./wsPersonNode";
import { PersonView } from "./views/personView";
import { TreeDrawer } from "./treeDrawer";
import { ConnectParams, jsPlumbInstance } from "jsplumb";

export class WSTreeDrawer implements TreeDrawer {
    run(rootPerson: Person, personViews: Map<string, PersonView>, maxHeight: number, pixelPerYear: number, jsPlumbInst: jsPlumbInstance): void {
        let personNodes: Map<string, WSPersonNode> = new Map<string, WSPersonNode>();
        this.instantiatePersonNodesForAncestorsAndAddThemToMap(rootPerson, personNodes, 0);

        console.log(rootPerson);
        console.log(personNodes);
        console.log(personViews);
        
        let modifier: number[] = [];
        let nextPosition: number[] = [];
        let modifierSum: number = 0;
        let place: number = 0;
        let height: number = 0;

        let currentPerson: Person;
        let currentPersonView: PersonView;
        let currentPersonNode: WSPersonNode;

        let firstVisit: string = "firstVisit";
        let leftVisit: string = "leftVisit";
        let rightVisit: string = "rightVisit";

        // not part of the original algorithm
        let distanceUnit: number = personViews.get(rootPerson.getId()).getBoxWidth();
        let maxBirthYearOfHeight: number[] = [];
        let minDeathYearOfHeight: number[] = [];
        let connectionParameters: ConnectParams = {
            anchors: ["Top", "Bottom"],
            connector: [ "Bezier", {}],
            endpoint: "Dot",
            deleteEndpointsOnDetach: false,
            detachable: false,
            // @ts-ignore
            paintStyle: { 
                stroke: "black", 
                strokeWidth: 5 
            },
            hoverPaintStyle: {
                stroke: "red",
            },
            endpointStyles: [
                { fill:"black"},
                { fill:"black" }
            ]
        };
        // end

        for (let i = 0; i < maxHeight; i++) {
            modifier[i] = 0;
            nextPosition[i] = 1 * distanceUnit;
        }

        currentPerson = rootPerson;
        currentPersonView = personViews.get(currentPerson.getId());
        currentPersonNode = personNodes.get(currentPerson.getId());

        currentPersonNode.setStatus(firstVisit);

        while (currentPerson != null) {
            switch (currentPersonNode.getStatus()) {
                case firstVisit:
                    currentPersonNode.setStatus(leftVisit);
                    if (currentPerson.getFather() != null) {
                        currentPerson = currentPerson.getFather();
                        currentPersonView = personViews.get(currentPerson.getId());
                        currentPersonNode = personNodes.get(currentPerson.getId());

                        currentPersonNode.setStatus(firstVisit);
                    }
                    break;
                case leftVisit:
                    currentPersonNode.setStatus(rightVisit);
                    if (currentPerson.getMother() != null) {
                        currentPerson = currentPerson.getMother();
                        currentPersonView = personViews.get(currentPerson.getId());
                        currentPersonNode = personNodes.get(currentPerson.getId());

                        currentPersonNode.setStatus(firstVisit);
                    }
                    break;
                case rightVisit:
                    height = currentPersonNode.getHeight();
                    let isLeaf: boolean = currentPerson.getFather() == null && currentPerson.getMother() == null;
                    
                    if (isLeaf) {
                        place = nextPosition[height];
                    } else if (currentPerson.getFather() == null) {
                        place = personViews.get(currentPerson.getMother().getId()).getOffsetLeftInPx() - 1 * distanceUnit;
                    } else if (currentPerson.getMother() == null) {
                        place = personViews.get(currentPerson.getFather().getId()).getOffsetLeftInPx() + 1 * distanceUnit;
                    } else {
                        place = (personViews.get(currentPerson.getFather().getId()).getOffsetLeftInPx() + personViews.get(currentPerson.getMother().getId()).getOffsetLeftInPx()) / 2;
                    }

                    modifier[height] = Math.max(modifier[height], nextPosition[height] - place);

                    if (isLeaf) {
                        currentPersonView.setOffsetLeftInPx(place);
                    } else {
                        currentPersonView.setOffsetLeftInPx(place + modifier[height]);
                    }

                    nextPosition[height] = currentPersonView.getOffsetLeftInPx() + 2 * distanceUnit;
                    currentPersonNode.setModifier(modifier[height]);

                    // not part of the original algorithm
                        if (maxBirthYearOfHeight[height] != null) {
                            if (maxBirthYearOfHeight[height] < currentPerson.getDatesOfBirth()[0].getFullYear()) {
                                maxBirthYearOfHeight[height] = currentPerson.getDatesOfBirth()[0].getFullYear();
                            }
                        } else {
                            maxBirthYearOfHeight[height] = currentPerson.getDatesOfBirth()[0].getFullYear();
                        }

                        if (minDeathYearOfHeight[height] != null) {
                            if (minDeathYearOfHeight[height] > currentPerson.getDatesOfDeath()[0].getFullYear()) {
                                minDeathYearOfHeight[height] = currentPerson.getDatesOfDeath()[0].getFullYear();
                            }
                        } else {
                            minDeathYearOfHeight[height] = currentPerson.getDatesOfDeath()[0].getFullYear();
                        }
                    // end

                    currentPerson = currentPerson.getChildren()[0];
                    if (currentPerson != null) {
                        currentPersonView = personViews.get(currentPerson.getId());
                        currentPersonNode = personNodes.get(currentPerson.getId());
                    }

                    break;
            }
        }

        currentPerson = rootPerson;
        currentPersonView = personViews.get(currentPerson.getId());
        currentPersonNode = personNodes.get(currentPerson.getId());

        currentPersonNode.setStatus(firstVisit);
        modifierSum = 0;

        while (currentPerson != null) {
            switch (currentPersonNode.getStatus()) {
                case firstVisit:
                    currentPersonView.setOffsetLeftInPx(currentPersonView.getOffsetLeftInPx() + modifierSum);
                    modifierSum = modifierSum + currentPersonNode.getModifier();
                    // currentPersonView.setOffsetTopInPx((2 * currentPersonNode.getHeight() + 1) * -multiplier);
                    
                    // not part of the original algorithm
                    currentPersonView.setOffsetTopInPx(currentPerson.getDatesOfBirth()[0].getFullYear() * pixelPerYear);
                    currentPersonView.setHeightInPx((currentPerson.getDatesOfDeath()[0].getFullYear() - currentPerson.getDatesOfBirth()[0].getFullYear()) * pixelPerYear);
                    height = currentPersonNode.getHeight();
                    let middleValue: number = (minDeathYearOfHeight[height] + maxBirthYearOfHeight[height]) / 2;
                    let boundHeight: number = 10;
                    currentPersonView.setTopPositionOfPersonBox((middleValue - currentPerson.getDatesOfBirth()[0].getFullYear()) * pixelPerYear - currentPersonView.getBoxHeight() / 2 - boundHeight);
                    if (currentPerson.getFather() != null) this.connect(jsPlumbInst, connectionParameters, currentPerson, currentPerson.getFather());
                    if (currentPerson.getMother() != null) this.connect(jsPlumbInst, connectionParameters, currentPerson, currentPerson.getMother());
                    jsPlumbInst.revalidate(currentPerson.getId());
                    // end
                    
                    currentPersonNode.setStatus(leftVisit);

                    if (currentPerson.getFather() != null) {
                        currentPerson = currentPerson.getFather();
                        currentPersonView = personViews.get(currentPerson.getId());
                        currentPersonNode = personNodes.get(currentPerson.getId());

                        currentPersonNode.setStatus(firstVisit);
                    }

                    break;
                case leftVisit:
                    currentPersonNode.setStatus(rightVisit);
                    if (currentPerson.getMother() != null) {
                        currentPerson = currentPerson.getMother();
                        currentPersonView = personViews.get(currentPerson.getId());
                        currentPersonNode = personNodes.get(currentPerson.getId());

                        currentPersonNode.setStatus(firstVisit);
                    }
                    break;
                case rightVisit:
                    modifierSum = modifierSum - currentPersonNode.getModifier();
                    currentPerson = currentPerson.getChildren()[0];

                    if (currentPerson != null) {
                        currentPersonView = personViews.get(currentPerson.getId());
                        currentPersonNode = personNodes.get(currentPerson.getId());
                    }
                    break;
            }
        }
    }

    
    private instantiatePersonNodesForAncestorsAndAddThemToMap(person: Person, personNodes: Map<string, WSPersonNode>, height: number) {
        let personNode: WSPersonNode = new WSPersonNode(person, height);
        personNodes.set(person.getId(), personNode);
        height++;

        if (person.getFather() != null) {
            this.instantiatePersonNodesForAncestorsAndAddThemToMap(person.getFather(), personNodes, height);
        }
        if (person.getMother() != null) {
            this.instantiatePersonNodesForAncestorsAndAddThemToMap(person.getMother(), personNodes, height);
        }
    }

    public connect(jsPlumbInst: jsPlumbInstance, connectionParameters: ConnectParams, source: Person, target: Person): void {
        jsPlumbInst.connect({ source: source.getId(), target: target.getId() }, connectionParameters);
    }
}