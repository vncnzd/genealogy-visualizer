import { Person } from "./models/person";
import { WSPersonNode } from "./wsPersonNode";
import { PersonView } from "./views/personView";

export class WSTreeDrawer {
    run(rootPerson: Person, personNodes: Map<string, WSPersonNode>, personViews: Map<string, PersonView>, maxHeight: number): void {
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

        let multiplier: number = 100;

        for (let i = 0; i < maxHeight; i++) {
            modifier[i] = 0;
            nextPosition[i] = 1 * multiplier;
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
                        place = personViews.get(currentPerson.getMother().getId()).getOffsetLeftInPx() - 1 * multiplier;
                    } else if (currentPerson.getMother() == null) {
                        place = personViews.get(currentPerson.getFather().getId()).getOffsetLeftInPx() + 1 * multiplier;
                    } else {
                        place = (personViews.get(currentPerson.getFather().getId()).getOffsetLeftInPx() + personViews.get(currentPerson.getMother().getId()).getOffsetLeftInPx()) / 2;
                    }

                    modifier[height] = Math.max(modifier[height], nextPosition[height] - place);

                    if (isLeaf) {
                        currentPersonView.setOffsetLeftInPx(place);
                    } else {
                        currentPersonView.setOffsetLeftInPx(place + modifier[height]);
                    }

                    nextPosition[height] = currentPersonView.getOffsetLeftInPx() + 2 * multiplier;
                    currentPersonNode.setModifier(modifier[height]);

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
                    currentPersonView.setOffsetTopInPx((2 * currentPersonNode.getHeight() + 1) * multiplier);
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
}