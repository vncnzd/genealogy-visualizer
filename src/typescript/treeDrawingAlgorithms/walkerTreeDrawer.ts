import { ConnectParams, jsPlumbInstance } from "jsplumb";
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
    private drawAncestors: boolean;

    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, pixelPerYear: number, jsPlumbInst: jsPlumbInstance, drawAncestors: boolean): void {
        this.pixelPerYear = pixelPerYear;
        this.jsPlumbInst = jsPlumbInst;
        this.deathYearsOfLevel = [];
        this.birthYearsOfLevel = [];
        this.drawAncestors = drawAncestors;
        
        let rootNode: WalkerNode;
        if (drawAncestors) {
            rootNode = this.initializeChildrenNodesForAncestors(rootPerson, personViewsMap, 0);
        } else {
            rootNode = this.initializeChildrenNodesForDescendants(rootPerson, personViewsMap, 0);
        }
        
        this.distanceBetweenNodes = rootNode.personView.getWidthInPx() * 2;

        this.firstWalk(rootNode);
        this.secondWalk(rootNode, -rootNode.preliminaryXPosition, 0);

        this.jsPlumbInst.repaintEverything(); // not the best solution probably
    }

    private initializeChildrenNodesForDescendants(person: Person, personViewMap: Map<string, PersonView>, level: number): WalkerNode {
        let personNode: WalkerNode = new WalkerNode(person, personViewMap.get(person.getId()));
        let children: Person[] = person.getChildren();

        if (person.getDatesOfBirth()[0] != null) {
            if (this.birthYearsOfLevel[level] == null) this.birthYearsOfLevel[level] = [];
            this.birthYearsOfLevel[level].push(person.getDatesOfBirth()[0].getFullYear());
        }
        if (person.getDatesOfDeath()[0] != null) {
            if (this.deathYearsOfLevel[level] == null) this.deathYearsOfLevel[level] = [];
            this.deathYearsOfLevel[level].push(person.getDatesOfDeath()[0].getFullYear());
        }

        personNode.thread = null;
        personNode.ancestor = personNode;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            let childNode: WalkerNode = this.initializeChildrenNodesForDescendants(child, personViewMap, level + 1);
            childNode.childrenIndex = i;
            childNode.parent = personNode;
            personNode.children.push(childNode);

            if (i > 0) {
                childNode.leftSibling = personNode.children[i - 1];
                personNode.children[i - 1].rightSibling = childNode;
            }
        }

        return personNode;
    }

    private initializeChildrenNodesForAncestors(person: Person, personViewMap: Map<string, PersonView>, level: number): WalkerNode {
        let walkerNode: WalkerNode = new WalkerNode(person, personViewMap.get(person.getId()));
        walkerNode.thread = null;
        walkerNode.ancestor = walkerNode;

        if (person.getDatesOfBirth()[0] != null) {
            if (this.birthYearsOfLevel[level] == null) this.birthYearsOfLevel[level] = [];
            this.birthYearsOfLevel[level].push(person.getDatesOfBirth()[0].getFullYear());
        }
        if (person.getDatesOfDeath()[0] != null) {
            if (this.deathYearsOfLevel[level] == null) this.deathYearsOfLevel[level] = [];
            this.deathYearsOfLevel[level].push(person.getDatesOfDeath()[0].getFullYear());
        }

        if (walkerNode.person.getFather() != null) {
            let fatherNode: WalkerNode = this.initializeChildrenNodesForAncestors(walkerNode.person.getFather(), personViewMap, level + 1);
            fatherNode.parent = walkerNode;
            walkerNode.children.push(fatherNode);
        }
        if (walkerNode.person.getMother() != null) {
            let motherNode: WalkerNode = this.initializeChildrenNodesForAncestors(walkerNode.person.getMother(), personViewMap, level + 1);
            motherNode.parent = walkerNode;
            walkerNode.children.push(motherNode);
        }

        if (walkerNode.children.length == 2) { // children have siblings
            walkerNode.children[0].rightSibling = walkerNode.children[1];
            walkerNode.children[1].leftSibling = walkerNode.children[0];
        }

        // maybe put this into the firstWalk method
        for (let index = 0; index < walkerNode.children.length; index++) {
            const child = walkerNode.children[index];
            child.childrenIndex = index;
        }

        return walkerNode;
    }

    private firstWalk(node: WalkerNode): void {
        if (node.isLeaf()) {
            // In the algorithm described by Buchheimer et al. the preliminary x position of every leaf is just 0, 
            // which does not make sense, since the right sibling needs to have a distance to its left sibling.
            // 
            // Original algorithm:
            // v.prelim = 0;

            if (node.leftSibling == null) {
                node.preliminaryXPosition = 0;
            } else {
                // Keep in mind, that the preliminary x position is the left upper corner of a node.
                node.preliminaryXPosition = node.leftSibling.preliminaryXPosition + this.distanceBetweenNodes;
            }
        } else {
            let defaultAncestor: WalkerNode = node.getLeftMostChild();

            for (const child of node.children) {
                this.firstWalk(child);
                defaultAncestor = this.apportion(child, defaultAncestor);
            }

            this.executeShifts(node);

            let midpointBetweenChildren: number = 0.5 * (node.getLeftMostChild().preliminaryXPosition + node.getRightMostChild().preliminaryXPosition);

            let leftSibling: WalkerNode = node.leftSibling;
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
        console.log(node.person.getName() + ": " + (node.preliminaryXPosition + offset));
        // The offset takes care of placing the root node at x position 0 and placing all other nodes accordingly.
        node.personView.setOffsetLeftInPx(node.preliminaryXPosition + offset);
        node.personView.setOffsetTopInPx(level * this.distanceBetweenNodes);
        this.positionNodeVertically(node, level); // not part of the original algorithm

        for (const child of node.children) {
            this.connect(this.jsPlumbInst, node.person, child.person); // not part of the original algorithm
            this.secondWalk(child, offset + node.modifier, level + 1);
        }
    }

    private apportion(node: WalkerNode, defaultAncestor: WalkerNode): WalkerNode {
        let leftSibling: WalkerNode = node.leftSibling;
        
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
                let shift: number = (contourNodeInsideLeftTree.preliminaryXPosition + modsumInsideLeftTree) - (contourNodeInsideRightTree.preliminaryXPosition + modsumInsideRightTree) + this.distanceBetweenNodes;

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
        let subtrees: number = wRight.childrenIndex - wLeft.childrenIndex;

        wRight.change -= shift / subtrees;
        wRight.shift += shift;

        wLeft.change += shift / subtrees;
        wRight.preliminaryXPosition += shift;

        wRight.modifier += shift;
    }

    // not part of the original algorithm
    private positionNodeVertically(node: WalkerNode, level: number): void {
        let yearOfBirth: number = node.person.getDatesOfBirth()[0]?.getFullYear();
        let yearOfDeath: number = node.person.getDatesOfDeath()[0]?.getFullYear();

        // refactor, only collect the min death year and max birth year for level!
        let minDeathYearOfLevel: number = Math.min(...this.deathYearsOfLevel[level]);
        let maxBirthYearOfLevel: number = Math.max(...this.birthYearsOfLevel[level]);

        if (this.drawAncestors) {
            if (yearOfBirth == null) {
                yearOfBirth = minDeathYearOfLevel - node.personView.getLifelineBoxHeightInPx() / this.pixelPerYear;
            }
            if (yearOfDeath == null) {
                yearOfDeath = minDeathYearOfLevel;
            }

            this.positionLifeline(yearOfBirth, yearOfDeath, node);

            let birthYearMinDeathYearDifference: number = minDeathYearOfLevel - yearOfBirth;
            let yearDifferenceInPx: number = birthYearMinDeathYearDifference * this.pixelPerYear;
            let relativeYPositionOfLifelineBox: number = yearDifferenceInPx  - node.personView.getLifelineBoxHeightInPx();

            this.positionLifelineBoxAndPersonBox(relativeYPositionOfLifelineBox, node);
            let lifelineHeight: number = (yearOfDeath - yearOfBirth) * this.pixelPerYear;
            this.checkLifelineBoxHeight(lifelineHeight, relativeYPositionOfLifelineBox, node);
        } else {
            if (yearOfBirth == null) {
                yearOfBirth = maxBirthYearOfLevel;
            }
            if (yearOfDeath == null) {
                yearOfDeath = maxBirthYearOfLevel + node.personView.getLifelineBoxHeightInPx() / this.pixelPerYear;
            }

            this.positionLifeline(yearOfBirth, yearOfDeath, node);

            let birthYearMaxBirthYearDifference: number = maxBirthYearOfLevel - yearOfBirth;
            let yearDifferenceInPx: number = birthYearMaxBirthYearDifference * this.pixelPerYear;
            let relativeYPositionOfLifelineBox: number = yearDifferenceInPx;

            this.positionLifelineBoxAndPersonBox(relativeYPositionOfLifelineBox, node);
            let lifelineHeight: number = (yearOfDeath - yearOfBirth) * this.pixelPerYear;
            this.checkLifelineBoxHeight(lifelineHeight, relativeYPositionOfLifelineBox, node);
        }
    }

    private positionLifelineBoxAndPersonBox(relativeYPositionOfLifelineBox: number, node: WalkerNode): void {
        node.personView.setOffsetTopOfLifelineBox(relativeYPositionOfLifelineBox);
        node.personView.setOffsetTopOfPersonBox(relativeYPositionOfLifelineBox + node.personView.getLifelineBoxBorderHeightInPx());
    }

    private positionLifeline(yearOfBirth: number, yearOfDeath: number, node: WalkerNode): void {
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
        let connectionParameters: ConnectParams = {
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
            // hoverPaintStyle: {
            //     stroke: "gray",
            // },
            endpointStyles: [
                { fill:"black"},
                { fill:"black" }
            ]
        };

        jsPlumbInst.connect({ source: source.getId(), target: target.getId() }, connectionParameters);
    }
}