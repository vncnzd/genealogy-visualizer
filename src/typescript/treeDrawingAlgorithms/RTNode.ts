import { Person } from "./models/person";
import { PersonView } from "./views/personView";

export class RTNode {
    public person: Person;
    public personView: PersonView;
    public offset: number;
    public thread: boolean;

    constructor(person: Person, personView: PersonView, offset: number, thread: boolean) {
        this.person = person;
        this.personView = personView;
        this.offset = offset;
        this.thread = thread;
    }
}