import { Person } from "./models/person";
import { PersonNode } from "./personNode";
import { PersonView } from "./views/personView";

export class WSTreeDrawer {
    run(rootPerson: Person, personNodes: Map<string, PersonNode>, personViews: Map<string, PersonView>, maxHeight: number): void {
        let modifier: number[] = [];
        let modifierSum: number = 0;
        let nexPosition: number[] = [];
        let height: number = 0;
        let place: number = 0;

        let currentPerson: Person;
        let currentPersonView: PersonView;
        let currentPersonNode: PersonNode;

        let firstVisit: string = "firstVisit";
        let leftVisit: string = "leftVisit";
        let rightVisit: string = "rightVisit";

        for (let i = 0; i < maxHeight; i++) {
            modifier[i] = 0;
            nexPosition[i] = 1;
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
                        place = nexPosition[height];
                    } else if (currentPerson.getFather() == null) {
                        place = personNodes.get(currentPerson.getMother().getId()).getPosition().x - 1;
                    } else if (currentPerson.getMother() == null) {
                        place = personNodes.get(currentPerson.getFather().getId()).getPosition().x + 1;
                    } else {
                        place = (personNodes.get(currentPerson.getFather().getId()).getPosition().x + personNodes.get(currentPerson.getMother().getId()).getPosition().x) / 2;
                    }

                    modifier[height] = Math.max(modifier[height], nexPosition[height] - place);

                    if (isLeaf) {
                        currentPersonNode.getPosition().x = place;
                    } else {
                        currentPersonNode.getPosition().x = place + modifier[height];
                    }

                    nexPosition[height] = currentPersonNode.getPosition().x + 2;
                    currentPersonNode.setModifier(modifier[height]);
                    currentPerson = currentPerson.getChildren()[0];
                    currentPersonView = personViews.get(currentPerson.getId());
                    currentPersonNode = personNodes.get(currentPerson.getId());

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
                    currentPersonNode.getPosition().x = currentPersonNode.getPosition().x + modifierSum;
                    modifierSum = modifierSum + currentPersonNode.getModifier();
                    currentPersonNode.getPosition().y = 2 * currentPersonNode.getHeight() + 1;
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
                    currentPersonView = personViews.get(currentPerson.getId());
                    currentPersonNode = personNodes.get(currentPerson.getId());
                    break;
            }
        }

        console.log(personNodes);
    }
}