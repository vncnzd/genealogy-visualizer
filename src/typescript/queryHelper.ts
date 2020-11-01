import { LanguageIdentifier } from "./languageIdentifier";

export class QueryHelper {
    private selectVariables: string[];
    private languageIdentifier: LanguageIdentifier;
    private itemVariable: string;

    constructor(languageIdentifier: LanguageIdentifier = LanguageIdentifier.EN) {
        this.languageIdentifier = languageIdentifier;
        this.itemVariable = "item";
        this.selectVariables = [this.itemVariable, this.itemVariable + "Label", this.itemVariable + "Description", "sexOrGender", "sexOrGenderLabel", "dateOfBirth", "dateOfDeath"];
    }

    public getChildrenQuery(fatherId: string): string {
        let query = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${fatherId} wdt:P40 ?${this.itemVariable}.`;
        query +=        this.getTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public getFatherQuery(personId: string): string {
        let query = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${personId} wdt:P22 ?${this.itemVariable}.`;
        query +=        this.getTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public getMotherQuery(personId: string): string {
        let query = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${personId} wdt:P25 ?${this.itemVariable}.`;
        query +=        this.getTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public getParentsQuery(personId: string): string {
        let query = `${this.getSelectVariables()} WHERE {`;
        query +=        `?${this.itemVariable} wdt:P40 wd:${personId}.`;
        query +=        this.getTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    // TODO: Maybe add dynasty as optional to this query or add dynastay as a second query and unify both result lists
    public getEntitySearchQuery(searchValue: string, limit: number = 15): string {
        let query = `${this.getSelectVariables()} WHERE { `;
        query +=        this.getTriples();
        query +=        `SERVICE wikibase:mwapi {`;
        query +=            `bd:serviceParam wikibase:endpoint "www.wikidata.org";`;
        query +=            `wikibase:api "EntitySearch";`;
        query +=            `mwapi:search "${searchValue}";`
        query +=            `mwapi:language "${this.languageIdentifier}".`;
        query +=            `?${this.itemVariable} wikibase:apiOutputItem mwapi:item.`;
        query +=        "} ";
        query +=        this.getLabelService();
        query +=    `} LIMIT ${limit}`;

        return query;
    }

    private getSelectVariables(): string {
        let select = "SELECT";

        for (const selectVariable of this.selectVariables) {
            select += " ?" + selectVariable;
        }

        return select;
    }

    private getLabelService(): string {
        return `SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.languageIdentifier}". }`
    }

    private getTriples(): string {
        let triples: string = `?${this.itemVariable} wdt:P31 wd:Q5.`;
        triples += ` OPTIONAL{ ?${this.itemVariable} wdt:P21 ?sexOrGender. }`;
        triples += ` OPTIONAL{ ?${this.itemVariable} wdt:P569 ?dateOfBirth. }`;
        triples += ` OPTIONAL{ ?${this.itemVariable} wdt:P570 ?dateOfDeath. }`;

        return triples;
    }
}