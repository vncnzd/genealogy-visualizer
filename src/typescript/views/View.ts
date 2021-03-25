export abstract class View {
    protected createHTMLElement(elementType: string, cssClasses: string[] = [], id: string = null): HTMLElement {
        const element: HTMLElement = document.createElement(elementType);
        element.classList.add(...cssClasses);

        if (id != null) {
            element.id = id;
        }

        return element;
    };

    protected removeAllChildElements(element: HTMLElement): void {
        element.innerHTML = "";
    }
}