import { jsPlumbInstance } from "jsplumb";
import { Person } from "./models/person";
import { SexOrGender } from "./sexOrGender";
import { SexOrGenderIdentifier } from "./sexOrGenderIdentifier";
import { TreeDrawer } from "./treeDrawer";
import { PersonView } from "./views/personView";
import { WalkerNode } from "./walkerNode";

export class WalkerTreeDrawer implements TreeDrawer {
    private distance: number;

    constructor() {
        this.distance = 100;
    }

    run(rootPerson: Person, personViewsMap: Map<string, PersonView>, height: number, pixelPerYear: number, jsPlumbInst: jsPlumbInstance): void {
        let rootNode: WalkerNode = this.initializeChildrenNodes(rootPerson, personViewsMap);
        this.firstWalk(rootNode);
        this.secondWalk(rootNode, -rootNode.prelim, 0);
        console.log(rootNode);
    }

    private initializeChildrenNodes(person, personViewMap: Map<string, PersonView>): WalkerNode {
        let walkerNode: WalkerNode = new WalkerNode(person, personViewMap.get(person.getId()));
        walkerNode.mod = 0;
        walkerNode.thread = null;
        walkerNode.ancestor = walkerNode;

        if (walkerNode.person.getFather() != null) {
            let fatherNode: WalkerNode = this.initializeChildrenNodes(walkerNode.person.getFather(), personViewMap);
            fatherNode.parent = walkerNode;
            walkerNode.children.push(fatherNode);
        }
        if (walkerNode.person.getMother() != null) {
            let motherNode: WalkerNode = this.initializeChildrenNodes(walkerNode.person.getMother(), personViewMap);
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
            v.prelim = 0;
        } else {
            let defaultAncestor: WalkerNode = v.getLeftMostChild();

            for (const child of v.children) {
                this.firstWalk(child);
                this.apportion(child, defaultAncestor);
            }

            this.executeShifts(v);

            let midpoint = 0.5 * (v.getLeftMostChild().prelim + v.getRightMostChild().prelim);

            if (v.leftSibling != null) {
                let w: WalkerNode = v.leftSibling;
                v.prelim = w.prelim + this.distance;
                v.mod = v.prelim - midpoint;
            } else {
                v.prelim = midpoint;
            }
        }
    }

    private secondWalk(v: WalkerNode, m: number, level: number) {
        v.personView.setOffsetLeftInPx(v.prelim + m);
        v.personView.setOffsetTopInPx(level * 150);

        for (const child of v.children) {
            this.secondWalk(child, m, level + 1);
        }
    }

    private apportion(v: WalkerNode, defaultAncestor: WalkerNode): void {
        if (v.leftSibling != null) {
            let w: WalkerNode = v.leftSibling;

            let vInsideRightTree: WalkerNode = v;
            let vOutsideRightTree: WalkerNode = v; 
            let vInsideLeftTree: WalkerNode = w;
            let vOutsideLeftTree : WalkerNode = vInsideRightTree.parent.getLeftMostChild(); // leftmost sibling

            let sInsideRightTree: number = vInsideRightTree.mod;
            let sOutsideRightTree: number = vOutsideRightTree.mod;
            let sInsideLeftTree: number = vInsideLeftTree.mod;
            let sOutsideLeftTree: number = vOutsideLeftTree.mod;

            while(vInsideLeftTree.getNextRight() != null && vInsideRightTree.getNextRight != null) {
                vInsideLeftTree = vInsideLeftTree.getNextRight();
                vInsideRightTree =vInsideRightTree.getNextLeft();
                vOutsideLeftTree =vOutsideLeftTree.getNextLeft();
                vOutsideRightTree = vOutsideRightTree.getNextRight();

                vOutsideRightTree.ancestor = v;
                let shift: number = (vInsideLeftTree.prelim + sInsideLeftTree) - (vInsideRightTree.prelim + sInsideRightTree) + this.distance;

                if (shift > 0) {
                    this.moveSubtree(this.ancestor(vInsideLeftTree, v, defaultAncestor), v, shift);
                    sInsideRightTree = sInsideRightTree + shift;
                    sOutsideRightTree = sOutsideRightTree + shift;
                }

                sInsideLeftTree = sInsideLeftTree + vInsideLeftTree.mod;
                sInsideRightTree = sInsideRightTree + vInsideRightTree.mod;
                sOutsideLeftTree = sOutsideLeftTree + vOutsideLeftTree.mod;
                sOutsideRightTree = sOutsideRightTree + vOutsideRightTree.mod;
            }

            if (vInsideLeftTree.getNextRight() != null && vOutsideRightTree.getNextRight() == null) {
                vOutsideRightTree.thread = vInsideLeftTree.getNextRight();
                vOutsideRightTree.mod = vOutsideRightTree.mod + sInsideLeftTree - sOutsideRightTree;
            }

            if (vInsideRightTree.getNextLeft() != null && vOutsideLeftTree.getNextLeft == null) {
                vOutsideLeftTree.thread = vInsideRightTree.getNextLeft();
                vOutsideLeftTree.mod = vOutsideLeftTree.mod + sInsideRightTree - sOutsideLeftTree;
                defaultAncestor = v;
            }
        }
    }

    private executeShifts(v: WalkerNode): void {
        let shift: number = 0;
        let change: number = 0;

        for (const child of v.children) {
            child.prelim = child.prelim + shift;
            child.mod = child.mod + shift;
            change = change + child.change;
            shift = shift + child.shift + change;
        }
    }

    private ancestor(vInside: WalkerNode, v: WalkerNode, defaultAncestor: WalkerNode) {
        if (vInside.ancestor == v.leftSibling || vInside.ancestor.leftSibling == v) {
            return vInside.ancestor;
        } else {
            return defaultAncestor;
        }
    }

    private moveSubtree(wLeft: WalkerNode, wRight: WalkerNode, shift: number): void {
        let subtrees: number = wRight.number - wLeft.number;

        wRight.change = wRight.change - shift / subtrees;
        wRight.shift = wRight.shift + shift;

        wLeft.change = wLeft.change + shift / subtrees;
        wRight.prelim = wRight.prelim + shift;

        wRight.mod = wRight.mod + shift;
    }
}