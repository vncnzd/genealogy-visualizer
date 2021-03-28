import { ConnectParams, jsPlumbInstance } from "jsplumb";
import { GenealogyType } from "../genealogyType";
import { Person } from "../models/person";
import { PersonView } from "../views/personView";
import { TreeDrawer } from "./treeDrawer";
import { WalkerNode } from "./walkerNode";

export class WalkerTreeDrawer implements TreeDrawer {
    private distanceBetweenNodes: number;
    private pixelPerYear: number;
    private jsPlumbInst: jsPlumbInstance;
    private deathYearsOfLevel: number[][];
    private birthYearsOfLevel: number[][];
    private averageDeathYearsOfLevel: number[];
    private averageBirthYearsOfLevel: number[];
    private genealogyType: GenealogyType;

    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, pixelPerYear: number, jsPlumbInst: jsPlumbInstance, genealogyType: GenealogyType): void {
        this.pixelPerYear = pixelPerYear;
        this.jsPlumbInst = jsPlumbInst;
        this.deathYearsOfLevel = [];
        this.birthYearsOfLevel = [];
        this.genealogyType = genealogyType;
        
        const rootNode: WalkerNode = this.initializeNodes(rootPerson, personViewsMap, 0, genealogyType);     
        this.averageBirthYearsOfLevel = this.calculateAverageYearOfLevel(this.birthYearsOfLevel);
        this.averageDeathYearsOfLevel = this.calculateAverageYearOfLevel(this.deathYearsOfLevel)
        this.distanceBetweenNodes = rootNode.personView.getWidthInPx() * 2;

        this.firstWalk(rootNode);
        this.secondWalk(rootNode, -rootNode.preliminaryXPosition, 0);

        this.jsPlumbInst.repaintEverything();
    }

    private calculateAverageYearOfLevel(yearsOfLevel): number[] {
        return yearsOfLevel.map((years: number[]): number => {
            if (years == null) {
                return null;
            } else {
                return years.reduce((a: number, b: number): number => { return a + b; }) / years.length;
            }
        });
    }

    private initializeNodes(person: Person, personViewMap: Map<string, PersonView>, level: number, genealogyType: GenealogyType): WalkerNode {
        const personNode: WalkerNode = new WalkerNode(person, personViewMap.get(person.getId()));
        personNode.thread = null;
        personNode.ancestor = personNode;

        if (person.getDatesOfBirth()[0] != null) {
            if (this.birthYearsOfLevel[level] == null) this.birthYearsOfLevel[level] = [];
            this.birthYearsOfLevel[level].push(person.getDatesOfBirth()[0].getFullYear());
        } else {
            this.birthYearsOfLevel[level] = null;
        }
        if (person.getDatesOfDeath()[0] != null) {
            if (this.deathYearsOfLevel[level] == null) this.deathYearsOfLevel[level] = [];
            this.deathYearsOfLevel[level].push(person.getDatesOfDeath()[0].getFullYear());
        } else {
            this.deathYearsOfLevel[level] = null;
        }

        switch (genealogyType) {
            case GenealogyType.Ancestors:
                if (personNode.person.getFather() != null) {
                    let fatherNode: WalkerNode = this.initializeNodes(personNode.person.getFather(), personViewMap, level + 1, genealogyType);
                    fatherNode.parent = personNode;
                    personNode.children.push(fatherNode);
                }

                if (personNode.person.getMother() != null) {
                    let motherNode: WalkerNode = this.initializeNodes(personNode.person.getMother(), personViewMap, level + 1, genealogyType);
                    motherNode.parent = personNode;
                    personNode.children.push(motherNode);
                }
        
                if (personNode.children.length == 2) { // There exists both father and mother. They are siblingnodes.
                    personNode.children[0].rightSibling = personNode.children[1];
                    personNode.children[1].leftSibling = personNode.children[0];
                }
        
                for (let index = 0; index < personNode.children.length; index++) {
                    const child = personNode.children[index];
                    child.childrenIndex = index;
                }

                break;
            case GenealogyType.Descendants:
                const children: Person[] = person.getChildren();

                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    const childNode: WalkerNode = this.initializeNodes(child, personViewMap, level + 1, genealogyType);
                    childNode.childrenIndex = i;
                    childNode.parent = personNode;
                    personNode.children.push(childNode);
        
                    if (i > 0) {
                        childNode.leftSibling = personNode.children[i - 1];
                        personNode.children[i - 1].rightSibling = childNode;
                    }
                }

                break;
        }

        return personNode;
    }

    private firstWalk(node: WalkerNode): void {
        if (node.isLeaf()) {
            if (node.leftSibling == null) {
                node.preliminaryXPosition = 0;
            } else {
                // Keep in mind, that the preliminary x position is the left upper corner of a drawn node.
                // This is why the distance between nodes should be at least the width of a node.
                // Otherwise nodes could overlap.
                node.preliminaryXPosition = node.leftSibling.preliminaryXPosition + this.distanceBetweenNodes;
                // New Code:
                if (node.parent.children.length % 2 != 0 && Math.floor(node.parent.children.length / 2) == node.childrenIndex) {
                    node.preliminaryXPosition += this.distanceBetweenNodes;
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
            
            // New Code
            if (node.children.length == 1) {
                midpointBetweenChildren += this.distanceBetweenNodes / 2;
            }

            const leftSibling: WalkerNode = node.leftSibling;
            if (leftSibling != null) {
                // This happens, when the node has a left sibling and is not a leaf.
                node.preliminaryXPosition = leftSibling.preliminaryXPosition + this.distanceBetweenNodes;
                // This modifier gets applied to all children of this node later, since this node is now placed preliminary to the 
                // right of the left sibling.
                node.modifier = node.preliminaryXPosition - midpointBetweenChildren;
            } else {
                node.preliminaryXPosition = midpointBetweenChildren;
            }

        }
    }

    private secondWalk(node: WalkerNode, offset: number, level: number) {
        // The offset takes care of placing the root node at x position 0 and placing all other nodes accordingly.
        node.personView.setOffsetLeftInPx(node.preliminaryXPosition + offset);
        // node.personView.setOffsetTopInPx(level * this.distanceBetweenNodes);
        this.positionNodeVertically(node, level);

        for (const child of node.children) {
            this.connect(this.jsPlumbInst, node.person, child.person); // not part of the original algorithm
            this.secondWalk(child, offset + node.modifier, level + 1);
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
                const shift: number = (contourNodeInsideLeftTree.preliminaryXPosition + modsumInsideLeftTree) - (contourNodeInsideRightTree.preliminaryXPosition + modsumInsideRightTree) + this.distanceBetweenNodes;

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
        const yearOfBirth: number = node.person.getDatesOfBirth()[0]?.getFullYear();
        const yearOfDeath: number = node.person.getDatesOfDeath()[0]?.getFullYear();

        const personContainerOffsetTopInPx: number = yearOfBirth * this.pixelPerYear;
        const personContainerOffsetBottomInPx: number = yearOfDeath * this.pixelPerYear;
        const containerHeightInPx: number = personContainerOffsetBottomInPx - personContainerOffsetTopInPx;

        // Position container (lifeline);
        node.personView.setOffsetTopInPx(personContainerOffsetTopInPx);
        node.personView.setHeightInPx(personContainerOffsetBottomInPx - personContainerOffsetTopInPx);

        // Position the person box in the center
        const averageBirthYearOfLevel: number = this.averageBirthYearsOfLevel[level];
        const averageDeathYearOfLevel: number = this.averageDeathYearsOfLevel[level];
        const centerOfLevelInPx: number = (averageBirthYearOfLevel + averageDeathYearOfLevel) / 2 * this.pixelPerYear;
        const distanceToCenter: number = centerOfLevelInPx - personContainerOffsetTopInPx;
        const offsetTopOfPersonBox: number = distanceToCenter - node.personView.getBoxHeight() / 2;
        const offsetTopOfLifelineBox: number = offsetTopOfPersonBox - node.personView.getLifelineBoxBorderHeightInPx();
        // const offsetTopOPersonBox: number = -200;
        // const offsetTopOfLifelineBox: number = offsetTopOPersonBox - node.personView.getLifelineBoxBorderHeightInPx();
        node.personView.setOffsetTopOfPersonBox(offsetTopOfPersonBox);
        node.personView.setOffsetTopOfLifelineBox(offsetTopOfLifelineBox);

        // Check if the lifeline box has to be cut off.
        if (offsetTopOfLifelineBox > containerHeightInPx - node.personView.getLifelineBoxHeightInPx()) {
            // Lifeline box is inside the lower bound
            const difference: number = offsetTopOfLifelineBox - (containerHeightInPx - node.personView.getLifelineBoxHeightInPx());
            const newLifelineBoxHeight: number = node.personView.getLifelineBoxHeightInPx() - difference;
            node.personView.setLifelineBoxHeightInPx(newLifelineBoxHeight);
        } else if (offsetTopOfLifelineBox < 0) {
            // Lifeline box is inside the upper bound
            const difference: number = offsetTopOfLifelineBox;
            const newOffsetTopOfLifelineBox: number = 0;

            let newHeightOfLifelineBox: number = node.personView.getLifelineBoxHeightInPx() + difference
            if (newHeightOfLifelineBox < 0) newHeightOfLifelineBox = 0;
            node.personView.setOffsetTopOfLifelineBox(newOffsetTopOfLifelineBox);
            node.personView.setLifelineBoxHeightInPx(newHeightOfLifelineBox);
        }
    }

    private testTwo(averageDatesOfBirth: number[], averageDatesOfDeath: number[], level, genealogyType: GenealogyType): [number, number] {
        const years: number = 30;
        let averageBirthYear: number;
        let averageDeathYear: number
        // const numberOfTraversibleNodes: number = 
        let nearestBirthdateLevel: number = Number.MAX_VALUE;
        let nearestDeathdateLevel: number = Number.MAX_VALUE;
        
        let genealogyTypeFactor: number;
        switch (genealogyType) {
            case GenealogyType.Ancestors:
                genealogyTypeFactor = -1;
                break;
            case GenealogyType.Descendants:
                genealogyTypeFactor = 1;
                break;
        }

        for (let i = 0; i < averageDatesOfBirth.length; i++) {
            const previousIndex: number = level - i;
            const nextIndex: number = level + i;

            const nextAverageBirthdate: number = averageDatesOfBirth[nextIndex];
            const nextAverageDeathdate: number = averageDatesOfDeath[nextIndex];
            const previousAverageBirthdate: number = averageDatesOfBirth[previousIndex];
            const previousAverageDeathdate: number = averageDatesOfDeath[previousIndex];

            if (nextAverageBirthdate != null && nearestBirthdateLevel == Number.MAX_VALUE) {
                nearestBirthdateLevel = nextIndex;
            }
            if (previousAverageBirthdate != null && nearestBirthdateLevel == Number.MAX_VALUE) {
                nearestBirthdateLevel = previousIndex;
            }
            if (nextAverageDeathdate != null && nearestDeathdateLevel == Number.MAX_VALUE) {
                nearestDeathdateLevel = nextIndex;
            }
            if (previousAverageDeathdate != null && nearestDeathdateLevel == Number.MAX_VALUE) {
                nearestDeathdateLevel = previousIndex;
            }
        }

        const birthdateLevelDifference: number = Math.abs(level - nearestBirthdateLevel);
        const deathdateLevelDifference: number = Math.abs(level - nearestDeathdateLevel);

        if (birthdateLevelDifference < deathdateLevelDifference) {
            averageBirthYear = averageDatesOfBirth[nearestBirthdateLevel] + birthdateLevelDifference * years * genealogyTypeFactor;
            averageDeathYear = averageBirthYear + years * 2;
        } else if (deathdateLevelDifference < birthdateLevelDifference) {
            averageDeathYear = averageDatesOfDeath[nearestDeathdateLevel] + deathdateLevelDifference * years * genealogyTypeFactor;
            averageBirthYear = averageDeathYear - years * 2;
        } else {
            averageBirthYear = averageDatesOfBirth[nearestBirthdateLevel] + birthdateLevelDifference * years * genealogyTypeFactor;
            averageDeathYear = averageDatesOfDeath[nearestDeathdateLevel] + deathdateLevelDifference * years * genealogyTypeFactor;
        }

        return [averageBirthYear, averageDeathYear];
    }

    private positionLifelineBoxAndPersonBox(relativeYPositionOfLifelineBox: number, node: WalkerNode): void {
        node.personView.setOffsetTopOfLifelineBox(relativeYPositionOfLifelineBox);
        node.personView.setOffsetTopOfPersonBox(relativeYPositionOfLifelineBox + node.personView.getLifelineBoxBorderHeightInPx());
    }

    private positionLifelineAccordingToYears(yearOfBirth: number, yearOfDeath: number, node: WalkerNode): void {
            // Set the birth date as the start of the life line.
            node.personView.setOffsetTopInPx(yearOfBirth * this.pixelPerYear);
            // Set the height of the lifeline according to the years lived.
            node.personView.setHeightInPx((yearOfDeath - yearOfBirth) * this.pixelPerYear);
    }

    private checkLifelineBoxHeight(lifelineHeight, relativeYPositionOfLifelineBox, node: WalkerNode): void {
        if (relativeYPositionOfLifelineBox < -node.personView.getLifelineBoxHeightInPx()) {
            // The lifeline box is above the lifeline.
            node.personView.hideLifelineBox();
        } else if (relativeYPositionOfLifelineBox < 0) {
            // The upper lifeline bound is inside the lifeline box. 
            node.personView.setLifelineBoxHeightInPx(node.personView.getLifelineBoxHeightInPx() + relativeYPositionOfLifelineBox);
            node.personView.setOffsetTopOfLifelineBox(0)
        } else if (relativeYPositionOfLifelineBox > lifelineHeight) {
            // The lower lifeline bound is inside the lifeline box.
              node.personView.hideLifelineBox();         
        } else if (relativeYPositionOfLifelineBox > lifelineHeight - node.personView.getLifelineBoxHeightInPx()) {
            // The lifeline box is below the lifeline.
            let lifelineBoxHeightInPx: number = node.personView.getLifelineBoxHeightInPx();
            let difference: number = relativeYPositionOfLifelineBox + lifelineBoxHeightInPx - lifelineHeight;
            node.personView.setLifelineBoxHeightInPx(lifelineBoxHeightInPx - difference);
        } 
    }

    private connect(jsPlumbInst: jsPlumbInstance, source: Person, target: Person): void {
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

        jsPlumbInst.connect({ source: source.getId(), target: target.getId() }, connectionParameters);
    }
}