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
        let query: string = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${fatherId} wdt:P40 ?${this.itemVariable}.`;
        query +=        this.getTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public getFatherQuery(personId: string): string {
        let query: string = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${personId} wdt:P22 ?${this.itemVariable}.`;
        query +=        this.getTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public getMotherQuery(personId: string): string {
        let query: string = `${this.getSelectVariables()} WHERE {`;
        query +=        `wd:${personId} wdt:P25 ?${this.itemVariable}.`;
        query +=        this.getTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public getParentsQuery(personId: string): string {
        let query: string = `${this.getSelectVariables()} WHERE {`;
        query +=        `?${this.itemVariable} wdt:P40 wd:${personId}.`;
        query +=        this.getTriples();
        query +=        this.getLabelService();
        query +=    "}"

        return query;
    }

    public getEntitySearchQuery(searchValue: string, limit: number = 15): string {
        let query: string = `${this.getSelectVariables()} WHERE { `;
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
        let select: string = "SELECT";

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

    public getItemVariable(): string {
        return this.itemVariable
    }
}