import { ConnectParams, jsPlumbInstance } from "jsplumb";
import { GenealogyType } from "../genealogyType";
import { Person } from "../models/person";
import { PersonView } from "../views/personView";
import { TreeDrawer } from "./treeDrawer";
import { WalkerNode } from "./walkerNode";

export class WalkerTreeDrawer implements TreeDrawer {
    private distanceBetweenNodeOrigins: number;
    private pixelPerYear: number;
    private jsPlumbInst: jsPlumbInstance;
    private deathYearsOfLevel: number[][];
    private birthYearsOfLevel: number[][];
    private averageDeathYearsOfLevel: number[];
    private averageBirthYearsOfLevel: number[];

    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, pixelPerYear: number, jsPlumbInst: jsPlumbInstance, genealogyType: GenealogyType): void {
        this.deathYearsOfLevel = [];
        this.birthYearsOfLevel = [];
        this.pixelPerYear = pixelPerYear;
        this.jsPlumbInst = jsPlumbInst;
        
        const rootNode: WalkerNode = this.initializeNodes(rootPerson, personViewsMap, 0, genealogyType);     
        this.distanceBetweenNodeOrigins = rootNode.personView.getWidthInPx() * 2;
        
        this.averageBirthYearsOfLevel = this.calculateAverageYearOfLevel(this.birthYearsOfLevel);
        this.averageDeathYearsOfLevel = this.calculateAverageYearOfLevel(this.deathYearsOfLevel);

        const birthOrDeathdateGenerationDifference: number = this.getBirthOrDeathdateGenerationDifference(30, genealogyType);
        this.calculateMissingAverageYears(this.averageBirthYearsOfLevel, this.averageDeathYearsOfLevel, birthOrDeathdateGenerationDifference);
        // this.calculateMissingAverageYears(this.averageDeathYearsOfLevel, birthOrDeathdateGenerationDifference);

        this.firstWalk(rootNode);
        this.secondWalk(rootNode, -rootNode.preliminaryXPosition, 0);
    }

    private getBirthOrDeathdateGenerationDifference(generationDifference: number, genealogyType: GenealogyType): number {
        switch (genealogyType) {
            case GenealogyType.Ancestors:
                return Math.abs(generationDifference) * -1;
            case GenealogyType.Descendants:
                return Math.abs(generationDifference);

        }
    }

    private calculateAverageYearOfLevel(yearsOfLevel): number[] {
        return yearsOfLevel.map((years: number[]): number => {
            if (years == null) {
                return null;
            } else {
                return years.reduce((a: number, b: number): number => { return a + b }) / years.length;
            }
        });
    }

    private calculateMissingAverageYears(averageBirthYearsOfLevel: number[], averageDeathYearsOfLevel, age:  number): void {
        let lastAverageBirthYear: number;
        let indexOfLastAverageYear: number = -1;
        let firstLevelHasNoAverageDate: boolean = false;

        for (let i = 0; i < averageBirthYearsOfLevel.length; i++) {
            const numberOfLevelsBetweenlastAndCurrent: number = i - indexOfLastAverageYear - 1;
            let averageBirthYearOfCurrentLevel = averageBirthYearsOfLevel[i];
            let averageDeathYearOfCurrentLevel = averageDeathYearsOfLevel[i];

            if (averageBirthYearOfCurrentLevel == null && averageDeathYearOfCurrentLevel != null) {
                averageBirthYearsOfLevel[i] = averageDeathYearOfCurrentLevel - Math.abs(age) * 2;
            }
            if (averageDeathYearOfCurrentLevel == null && averageBirthYearOfCurrentLevel != null) {
                averageDeathYearsOfLevel[i] = averageBirthYearOfCurrentLevel + Math.abs(age) * 2;
            }
            
            if (averageBirthYearOfCurrentLevel != null) {
                if (numberOfLevelsBetweenlastAndCurrent > 0) {
                    if (firstLevelHasNoAverageDate) {
                        lastAverageBirthYear = averageBirthYearOfCurrentLevel - (numberOfLevelsBetweenlastAndCurrent + 1) * age;
                        firstLevelHasNoAverageDate = false;
                    }
                    
                    const timespan: number = averageBirthYearOfCurrentLevel - lastAverageBirthYear;
                    const factor: number = timespan / (numberOfLevelsBetweenlastAndCurrent + 1);
                    
                    for (let x = 0; x < numberOfLevelsBetweenlastAndCurrent; x++) {
                        const level: number = indexOfLastAverageYear + 1 + x;
                        const birthyear: number = lastAverageBirthYear + factor * (x + 1);
                        averageBirthYearsOfLevel[level] = birthyear;
                        averageDeathYearsOfLevel[level] = birthyear + Math.abs(age) * 2;
                    }
                }

                lastAverageBirthYear = averageBirthYearOfCurrentLevel;
                indexOfLastAverageYear = i;
            } else {
                if (i == 0) {
                    firstLevelHasNoAverageDate = true;
                }
                
                if (i == averageBirthYearsOfLevel.length - 1) {
                    if (firstLevelHasNoAverageDate) {
                        // There exist no average years in the array.
                        lastAverageBirthYear = 0;
                    } 

                    for (let x = 0; x < numberOfLevelsBetweenlastAndCurrent + 1; x++) {
                        const level: number = indexOfLastAverageYear + 1 + x;
                        averageBirthYearsOfLevel[level] = lastAverageBirthYear + age * (x + 1);
                        averageDeathYearsOfLevel[level] = averageBirthYearsOfLevel[level] + Math.abs(age) * 2;
                    }
                }
            }
        }
    }

    private initializeNodes(person: Person, personViewMap: Map<string, PersonView>, level: number, genealogyType: GenealogyType): WalkerNode {
        const currentNode: WalkerNode = new WalkerNode(person, personViewMap.get(person.getId()));
        currentNode.thread = null;
        currentNode.ancestor = currentNode;

        this.addYearOfDateOrNullToDatesArray(person.getDatesOfBirth()[0], this.birthYearsOfLevel, level);
        this.addYearOfDateOrNullToDatesArray(person.getDatesOfDeath()[0], this.deathYearsOfLevel, level);

        switch (genealogyType) {
            case GenealogyType.Ancestors:
                if (currentNode.person.getFather() != null) {
                    const fatherNode: WalkerNode = this.initializeNodes(currentNode.person.getFather(), personViewMap, level + 1, genealogyType);
                    fatherNode.parent = currentNode;
                    currentNode.children.push(fatherNode);
                }

                if (currentNode.person.getMother() != null) {
                    const motherNode: WalkerNode = this.initializeNodes(currentNode.person.getMother(), personViewMap, level + 1, genealogyType);
                    motherNode.parent = currentNode;
                    currentNode.children.push(motherNode);
                }
        
                if (currentNode.children.length == 2) {
                    currentNode.children[0].rightSibling = currentNode.children[1];
                    currentNode.children[1].leftSibling = currentNode.children[0];
                }
        
                for (let index = 0; index < currentNode.children.length; index++) {
                    const childNode = currentNode.children[index];
                    childNode.childrenIndex = index;
                }

                break;
            case GenealogyType.Descendants:
                const children: Person[] = person.getChildren();

                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    const childNode: WalkerNode = this.initializeNodes(child, personViewMap, level + 1, genealogyType);
                    childNode.childrenIndex = i;
                    childNode.parent = currentNode;
                    currentNode.children.push(childNode);
        
                    if (i > 0) {
                        childNode.leftSibling = currentNode.children[i - 1];
                        currentNode.children[i - 1].rightSibling = childNode;
                    }
                }

                break;
        }

        return currentNode;
    }

    private addYearOfDateOrNullToDatesArray(date: Date, datesArray: number[][], level: number): void {
        if (date != null) {
            if (datesArray[level] == null) datesArray[level] = [];
            datesArray[level].push(date.getFullYear());
        } else {
            datesArray[level] = null;
        }
    }

    private firstWalk(node: WalkerNode): void {
        if (node.isLeaf()) {
            if (node.leftSibling == null) {
                node.preliminaryXPosition = 0;
            } else {
                // Keep in mind, that the preliminary x position is the left upper corner of a drawn node.
                // This is why the distance between nodes should be at least the width of a node.
                // Otherwise nodes could overlap.
                node.preliminaryXPosition = node.leftSibling.preliminaryXPosition + this.distanceBetweenNodeOrigins;
                // In case one child is right below the parent child the lifelines would probably overlap.
                // This moves the child below the parent one unit to the right to prevent this.
                if (node.parent.children.length % 2 != 0 && Math.floor(node.parent.children.length / 2) == node.childrenIndex) {
                    node.preliminaryXPosition += this.distanceBetweenNodeOrigins;
                }
            }
        } else {
            let defaultAncestor: WalkerNode = node.getLeftMostChild();

            for (const child of node.children) {
                this.firstWalk(child);
                defaultAncestor = this.apportion(child, defaultAncestor);
            }

            this.executeShifts(node);

            let midpointBetweenChildren: number = 0.5 * (node.getLeftMostChild().preliminaryXPosition + node.getRightMostChild().preliminaryXPosition);
            
            // This positions the parent node one unit to the left if there is only one child to prevent conflicting lifelines.
            if (node.children.length == 1) {
                midpointBetweenChildren += this.distanceBetweenNodeOrigins / 2;
            }

            const leftSibling: WalkerNode = node.leftSibling;
            if (leftSibling != null) {
                // This happens, when the node has a left sibling and is not a leaf.
                node.preliminaryXPosition = leftSibling.preliminaryXPosition + this.distanceBetweenNodeOrigins;
                // This modifier gets applied to all children of this node later, since this node is now placed preliminary to the 
                // right of the left sibling.
                node.modifier = node.preliminaryXPosition - midpointBetweenChildren;
            } else {
                node.preliminaryXPosition = midpointBetweenChildren;
            }

        }
    }

    private secondWalk(currentNode: WalkerNode, offset: number, level: number) {
        // The offset takes care of placing the root node at x position 0 and placing all other nodes accordingly.
        currentNode.personView.setOffsetLeftInPx(currentNode.preliminaryXPosition + offset);
        this.positionNodeVertically(currentNode, level);
        
        if (currentNode.parent != null) {
            this.connect(this.jsPlumbInst, currentNode.parent, currentNode);
        }

        for (const child of currentNode.children) {
            this.secondWalk(child, offset + currentNode.modifier, level + 1);
        }
    }

    private apportion(node: WalkerNode, defaultAncestor: WalkerNode): WalkerNode {
        const leftSibling: WalkerNode = node.leftSibling;
        
        if (leftSibling != null) {

            let contourNodeInsideRightTree: WalkerNode = node;
            let contourNodeOutsideRightTree: WalkerNode = node; 
            let contourNodeInsideLeftTree: WalkerNode = leftSibling;
            let contourNodeOutsideLeftTree : WalkerNode = contourNodeInsideRightTree.parent.getLeftMostChild();

            let modsumInsideRightTree: number = contourNodeInsideRightTree.modifier;
            let modsumOutsideRightTree: number = contourNodeOutsideRightTree.modifier;
            let modsumInsideLeftTree: number = contourNodeInsideLeftTree.modifier;
            let modsumOutsideLeftTree: number = contourNodeOutsideLeftTree.modifier;

            while(contourNodeInsideLeftTree.getNextRight() != null && contourNodeInsideRightTree.getNextLeft() != null) {
                contourNodeInsideLeftTree = contourNodeInsideLeftTree.getNextRight();
                contourNodeInsideRightTree = contourNodeInsideRightTree.getNextLeft();
                contourNodeOutsideLeftTree = contourNodeOutsideLeftTree.getNextLeft();
                contourNodeOutsideRightTree = contourNodeOutsideRightTree.getNextRight();

                contourNodeOutsideRightTree.ancestor = node;

                // This calculates the necessary shift between the subtress so that the nodes on a level are placed 
                // next to each other.
                const shift: number = (contourNodeInsideLeftTree.preliminaryXPosition + modsumInsideLeftTree) - (contourNodeInsideRightTree.preliminaryXPosition + modsumInsideRightTree) + this.distanceBetweenNodeOrigins;

                if (shift > 0) {
                    this.moveSubtree(this.ancestor(contourNodeInsideLeftTree, node, defaultAncestor), node, shift);
                    modsumInsideRightTree += shift;
                    modsumOutsideRightTree += shift;
                }

                modsumInsideLeftTree += contourNodeInsideLeftTree.modifier;
                modsumInsideRightTree += contourNodeInsideRightTree.modifier;
                modsumOutsideLeftTree += contourNodeOutsideLeftTree.modifier;
                modsumOutsideRightTree += contourNodeOutsideRightTree.modifier;
            }

            if (contourNodeInsideLeftTree.getNextRight() != null && contourNodeOutsideRightTree.getNextRight() == null) {
                contourNodeOutsideRightTree.thread = contourNodeInsideLeftTree.getNextRight();
                contourNodeOutsideRightTree.modifier += modsumInsideLeftTree - modsumOutsideRightTree;
            }

            if (contourNodeInsideRightTree.getNextLeft() != null && contourNodeOutsideLeftTree.getNextLeft() == null) {
                contourNodeOutsideLeftTree.thread = contourNodeInsideRightTree.getNextLeft();
                contourNodeOutsideLeftTree.modifier += modsumInsideRightTree - modsumOutsideLeftTree;
                defaultAncestor = node;
            }
        }

        return defaultAncestor;
    }

    private executeShifts(node: WalkerNode): void {
        let shift: number = 0;
        let change: number = 0;

        for (let i = node.children.length - 1; i >= 0; i--) {
            const child = node.children[i];
            child.preliminaryXPosition += shift;
            child.modifier += shift;
            change += child.change;
            shift += child.shift + change;
        }
    }

    private ancestor(contourNodeInsideLeftTree: WalkerNode, node: WalkerNode, defaultAncestor: WalkerNode) {
        if (node.parent.children.includes(contourNodeInsideLeftTree.ancestor)) {
            return contourNodeInsideLeftTree.ancestor;
        } else {
            return defaultAncestor;
        }
    }

    private moveSubtree(wLeft: WalkerNode, wRight: WalkerNode, shift: number): void {
        const subtrees: number = wRight.childrenIndex - wLeft.childrenIndex;

        wRight.change -= shift / subtrees;
        wRight.shift += shift;

        wLeft.change += shift / subtrees;
        wRight.preliminaryXPosition += shift;

        wRight.modifier += shift;
    }

    private positionNodeVertically(node: WalkerNode, level: number): void {
        const lifelineBoxHeight: number = node.personView.getLifelineBoxHeightInPx();
        const lifelineBorderWidth: number = node.personView.getLifelineBoxBorderHeightInPx();

        const averageBirthYearOfLevel: number = this.averageBirthYearsOfLevel[level];
        const averageDeathYearOfLevel: number = this.averageDeathYearsOfLevel[level];
        const centerAgeOfLevel: number = (averageBirthYearOfLevel + averageDeathYearOfLevel) / 2;
        const centerOfLevelInPx: number = centerAgeOfLevel * this.pixelPerYear;

        const yearOfBirth: number = node.person.getDatesOfBirth()[0]?.getFullYear();
        const yearOfDeath: number = node.person.getDatesOfDeath()[0]?.getFullYear();
 
        let personContainerOffsetTopInPx: number;
        let personContainerOffsetBottomInPx: number;

        if (yearOfBirth == null) {
            personContainerOffsetTopInPx = centerOfLevelInPx - lifelineBoxHeight / 2;
        } else {
            personContainerOffsetTopInPx = yearOfBirth * this.pixelPerYear;
        }
        if (yearOfDeath == null) {
            personContainerOffsetBottomInPx = centerOfLevelInPx + lifelineBoxHeight / 2;
        } else {
            personContainerOffsetBottomInPx = yearOfDeath * this.pixelPerYear;
        }

        const containerHeightInPx: number = personContainerOffsetBottomInPx - personContainerOffsetTopInPx;

        // Position container (lifeline).
        node.personView.setOffsetTopInPx(personContainerOffsetTopInPx);
        node.personView.setHeightInPx(containerHeightInPx);

        // Position the person box in the center.
        const distanceToCenter: number = centerOfLevelInPx - personContainerOffsetTopInPx;
        const offsetTopOfPersonBox: number = distanceToCenter - lifelineBoxHeight / 2;
        let offsetTopOfLifelineBox: number = offsetTopOfPersonBox - node.personView.getLifelineBoxBorderHeightInPx();

        node.personView.setOffsetTopOfPersonBox(offsetTopOfPersonBox);
        node.personView.setOffsetTopOfLifelineBox(offsetTopOfLifelineBox);

        if (yearOfBirth != null && yearOfDeath != null) {
            // Check if the lifeline box has to be cut off. This only needs to be done, when there is both a birth and death
            // date, since if one of the dates or both is missing, the lifelinebox gets placed at the center of the level.
            if (offsetTopOfLifelineBox < 0) {
                // Lifeline box is inside the upper bound
                const difference: number = offsetTopOfLifelineBox;
                offsetTopOfLifelineBox = 0;

                let newHeightOfLifelineBox: number = lifelineBoxHeight + difference;
                if (newHeightOfLifelineBox < lifelineBorderWidth) newHeightOfLifelineBox = 0;

                node.personView.setOffsetTopOfLifelineBox(offsetTopOfLifelineBox);
                node.personView.setLifelineBoxHeightInPx(newHeightOfLifelineBox);
            } else if (offsetTopOfLifelineBox > containerHeightInPx - lifelineBoxHeight) {
                // Lifeline box is inside the lower bound
                if (offsetTopOfLifelineBox > containerHeightInPx - lifelineBorderWidth) {
                    node.personView.setLifelineBoxHeightInPx(0);
                } else {
                    const difference: number = offsetTopOfLifelineBox - (containerHeightInPx - lifelineBoxHeight);
                    const newLifelineBoxHeight: number = lifelineBoxHeight - difference;
                    node.personView.setLifelineBoxHeightInPx(newLifelineBoxHeight);
                }
            } 
        }
    }

    private connect(jsPlumbInst: jsPlumbInstance, source: WalkerNode, target: WalkerNode): void {
        const connectionParameters: ConnectParams = {
            anchor: ["Bottom", "Top"],
            connector: [ "Flowchart", {}],
            endpoint: "Dot",
            deleteEndpointsOnDetach: false,
            detachable: false,
            // @ts-ignore
            paintStyle: { 
                stroke: "black", 
                strokeWidth: 5 
            },
            endpointStyles: [
                { fill:"black"},
                { fill:"black" }
            ]
        };

        jsPlumbInst.connect({ source: source.person.getId(), target: target.person.getId() }, connectionParameters);
    }
}