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
        this.secondWalk(rootNode, -rootNode.prelim, 0);

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
            childNode.number = i;
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
            child.number = index;
        }

        return walkerNode;
    }

    private firstWalk(v: WalkerNode): void {
        if (v.isLeaf()) {
            // In the algorithm described by Buchheimer et al. the preliminary x position of every leaf is just 0, 
            // which does not make sense, since the right sibling needs to have a distance to its left sibling.
            // v.prelim = 0;

            if (v.leftSibling == null) {
                v.prelim = 0;
            } else {
                v.prelim = v.leftSibling.prelim + this.distanceBetweenNodes;
            }
        } else {
            let defaultAncestor: WalkerNode = v.getLeftMostChild();

            for (const w of v.children) {
                this.firstWalk(w);
                defaultAncestor = this.apportion(w, defaultAncestor);
            }

            this.executeShifts(v);

            let midpoint = 0.5 * (v.getLeftMostChild().prelim + v.getRightMostChild().prelim);

            let w: WalkerNode = v.leftSibling;
            if (w != null) {
                v.prelim = w.prelim + this.distanceBetweenNodes;
                v.mod = v.prelim - midpoint;
            } else {
                v.prelim = midpoint;
            }
        }
    }

    private secondWalk(v: WalkerNode, m: number, level: number) {
        v.personView.setOffsetLeftInPx(v.prelim + m);
        v.personView.setOffsetTopInPx(level * this.distanceBetweenNodes);
        this.positionNodeVertically(v, level); // not part of the original algorithm

        for (const child of v.children) {
            this.connect(this.jsPlumbInst, v.person, child.person); // not part of the original algorithm
            this.secondWalk(child, m + v.mod, level + 1);
        }
    }

    private apportion(v: WalkerNode, defaultAncestor: WalkerNode): WalkerNode {
        let w: WalkerNode = v.leftSibling;
        
        if (w != null) {

            let vInsideRightTree: WalkerNode = v;
            let vOutsideRightTree: WalkerNode = v; 
            let vInsideLeftTree: WalkerNode = w;
            let vOutsideLeftTree : WalkerNode = vInsideRightTree.parent.getLeftMostChild();

            let modsumInsideRightTree: number = vInsideRightTree.mod;
            let modsumOutsideRightTree: number = vOutsideRightTree.mod;
            let modsumInsideLeftTree: number = vInsideLeftTree.mod;
            let modsumOutsideLeftTree: number = vOutsideLeftTree.mod;

            while(vInsideLeftTree.getNextRight() != null && vInsideRightTree.getNextLeft() != null) {
                vInsideLeftTree = vInsideLeftTree.getNextRight();
                vInsideRightTree = vInsideRightTree.getNextLeft();
                vOutsideLeftTree = vOutsideLeftTree.getNextLeft();
                vOutsideRightTree = vOutsideRightTree.getNextRight();

                vOutsideRightTree.ancestor = v;

                let shift: number = (vInsideLeftTree.prelim + modsumInsideLeftTree) - (vInsideRightTree.prelim + modsumInsideRightTree) + this.distanceBetweenNodes;

                if (shift > 0) {
                    this.moveSubtree(this.ancestor(vInsideLeftTree, v, defaultAncestor), v, shift);
                    modsumInsideRightTree += shift;
                    modsumOutsideRightTree += shift;
                }

                modsumInsideLeftTree += vInsideLeftTree.mod;
                modsumInsideRightTree += vInsideRightTree.mod;
                modsumOutsideLeftTree += vOutsideLeftTree.mod;
                modsumOutsideRightTree += vOutsideRightTree.mod;
            }

            if (vInsideLeftTree.getNextRight() != null && vOutsideRightTree.getNextRight() == null) {
                vOutsideRightTree.thread = vInsideLeftTree.getNextRight();
                vOutsideRightTree.mod += modsumInsideLeftTree - modsumOutsideRightTree;
            }

            if (vInsideRightTree.getNextLeft() != null && vOutsideLeftTree.getNextLeft() == null) {
                vOutsideLeftTree.thread = vInsideRightTree.getNextLeft();
                vOutsideLeftTree.mod += modsumInsideRightTree - modsumOutsideLeftTree;
                defaultAncestor = v;
            }
        }

        return defaultAncestor;
    }

    private executeShifts(v: WalkerNode): void {
        let shift: number = 0;
        let change: number = 0;

        for (let i = v.children.length - 1; i >= 0; i--) {
            const w = v.children[i];
            w.prelim += shift;
            w.mod += shift;
            change += w.change;
            shift += w.shift + change;
        }
    }

    private ancestor(vInsideLeftTree: WalkerNode, v: WalkerNode, defaultAncestor: WalkerNode) {
        if (v.parent.children.includes(vInsideLeftTree.ancestor)) {
            return vInsideLeftTree.ancestor;
        } else {
            return defaultAncestor;
        }
    }

    private moveSubtree(wLeft: WalkerNode, wRight: WalkerNode, shift: number): void {
        let subtrees: number = wRight.number - wLeft.number;

        wRight.change -= shift / subtrees;
        wRight.shift += shift;

        wLeft.change += shift / subtrees;
        wRight.prelim += shift;

        wRight.mod += shift;
    }

    // not part of the original algorithm
    private positionNodeVertically(node: WalkerNode, level: number): void {
        let yearOfBirthOfCurrentPerson: number = node.person.getDatesOfBirth()[0]?.getFullYear();
        // if (yearOfBirthOfCurrentPerson == null) {
        //     yearOfBirthOfCurrentPerson = Math.max(...this.birthYearsOfLevel[level])
        //     yearOfBirthOfCurrentPerson = this.calculateAproximateBirthYear(node, level);
        // }
        let yearOfDeathOfCurrentPerson: number = node.person.getDatesOfDeath()[0]?.getFullYear();
        // if (yearOfDeathOfCurrentPerson == null) {
        //     yearOfDeathOfCurrentPerson = 
        //     yearOfDeathOfCurrentPerson = this.calculateAproximateDeathYear(node, level);
        // }

        node.personView.setOffsetTopInPx(yearOfBirthOfCurrentPerson * this.pixelPerYear);
        node.personView.setHeightInPx((yearOfDeathOfCurrentPerson - yearOfBirthOfCurrentPerson) * this.pixelPerYear);

        let boundHeight: number = node.personView.getLifelineBoundHeightInPx();
        let yearDifference: number;

        if (this.drawAncestors) {
            let minDeathdateYearOfLevel: number = Math.min(...this.deathYearsOfLevel[level]);
            yearDifference = minDeathdateYearOfLevel - yearOfBirthOfCurrentPerson;
        } else {
            let maxBirthdateYearOfLevel: number = Math.max(...this.birthYearsOfLevel[level]);
            yearDifference = maxBirthdateYearOfLevel - yearOfBirthOfCurrentPerson;
        }

        let boxHeight: number = node.personView.getBoxHeight();
        let lifelineBoxHeight: number = node.personView.getLifelineBoxHeightInPx();
        let offsetTop = yearDifference * this.pixelPerYear - boxHeight - boundHeight;

        node.personView.setOffsetTopOfPersonBox(offsetTop);
        node.personView.setOffsetTopOfLifelineBox(yearDifference * this.pixelPerYear - lifelineBoxHeight);
        if (offsetTop < 0) {
            node.personView.setLifelineBoxHeightInPx(node.personView.getLifelineBoxHeightInPx() + offsetTop - boundHeight);
            node.personView.setOffsetTopOfLifelineBox(yearDifference * this.pixelPerYear - lifelineBoxHeight - offsetTop + boundHeight);
        }
    }

    private calculateAproximateBirthYear(node: WalkerNode, level: number): number {
        if (node.parent != null && node.parent.children.length > 1) {
            let summedUpBirthYears = 0;
            let numberOfValidSiblings = 0;
            
            for (const sibling of node.parent.children) {
                if (sibling.person.getDatesOfBirth().length > 0) {
                    numberOfValidSiblings++;
                    summedUpBirthYears += sibling.person.getDatesOfBirth()[0].getFullYear();
                }
            }

            let birthYearsMean = summedUpBirthYears / numberOfValidSiblings;
            return birthYearsMean;
        } else if (this.birthYearsOfLevel[level].length > 0) {
            return this.birthYearsOfLevel[level]?.reduce((a: number, b: number) => {return a + b}) / this.birthYearsOfLevel[level].length;
        } 
    }

    private calculateAproximateDeathYear(node: WalkerNode, level: number): number {
        if (node.parent != null && node.parent.children.length > 1) {
            let summedUpDeathYears = 0;
            let numberOfValidSiblings = 0;
            
            for (const sibling of node.parent.children) {
                if (sibling.person.getDatesOfDeath().length > 0) {
                    numberOfValidSiblings++;
                    summedUpDeathYears += sibling.person.getDatesOfDeath()[0].getFullYear();
                }
            }

            let deathYearsMean = summedUpDeathYears / numberOfValidSiblings;
            return deathYearsMean;
        } else {
            return this.deathYearsOfLevel[level]?.reduce((a: number, b: number) => {return a + b}) / this.deathYearsOfLevel[level].length;
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