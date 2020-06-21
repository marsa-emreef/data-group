import {composeChangeEventName, DataSetter, hasNoValue, hasValue, HIDE_CLASS, Reducer} from "./types";
import noEmptyTextNode from "./libs/no-empty-text-node";
import DataRenderer from "./libs/data-renderer";

/**
 * ContextElement is HTMLElement which can render data in accordance with the template defined in it.
 * The following is an example of how we display the template page.
 *
 * <pre>
 *     <code>
 *         <context-element id="my-element">
 *             <div watch="name"></div>
 *             <div watch="city"></div>
 *             <div watch="email"></div>
 *         </context-element>
 *         <script>
 *             const contextElement = document.getElementById('my-element');
 *             contextElement.data = {name:"Javascript",city:"Tokyo",email:"javascript@contextelement.com};
 *         </script>
 *     </code>
 * </pre>
 *
 * ContextElement will populate the data into template by looking at the attribute which has watch keyword in it.
 * These attribute which has keyword `watch` in it are also known as active-attribute.
 * There are 3 kinds of active-attribute,  (watch / toggle / action). each attribute works with a different mechanism when ContextElement renders the data.
 *
 */
export class ContextElement<DataSource, Item> extends HTMLElement {
    public reducer: Reducer<DataSource, Item>;
    protected template: ChildNode[];
    protected renderer: DataRenderer<DataSource, Item>;
    protected dataSource: DataSource;
    protected onMountedCallback: () => void;

    /**
     * Constructor sets default value of reducer to return the parameter immediately (param) => param.
     */
    constructor() {
        super();
        this.template = null;
        this.renderer = null;
        this.reducer = (data) => data;
    }

    /**
     * Get the value of data in this ContextElement
     */
    get data(): DataSource {
        return this.dataSource;
    }

    /**
     * Set the value of ContextElement data
     * @param value
     */
    set data(value: DataSource) {
        this.setData(() => value);
    }

    /**
     * Callback function to set the data,
     * <pre>
     *     <code>
     *         contextElement.setData(data => ({...data,attribute:newValue});
     *     </code>
     * </pre>
     *
     * @param context
     */
    public setData = (context: DataSetter<DataSource>) => {
        this.dataSource = context(this.dataSource);
        this.render();
    };

    /**
     * onMounted is invoke when the Element is ready and mounted to the window.document.
     * <pre>
     *     <code>
     *         contextElement.onMounted(() => console.log(`ChildNodes Ready `,contextElement.childNodes.length > 0));
     *     </code>
     * </pre>
     * @param onMountedListener
     */
    public onMounted = (onMountedListener: () => void) => {
        this.onMountedCallback = onMountedListener;
    };

    /**
     * connectedCallback is invoked each time the custom element is appended into a document-connected element.
     * When connectedCallback invoked, it will initialize the active attribute, populate the template, and call
     * onMountedCallback. Populating the template will be invoke one time only, the next call of connectedCallback will not
     * repopulate the template again.
     */
    connectedCallback() {
        this.initAttribute();
        if (hasNoValue(this.template)) {
            this.classList.add(HIDE_CLASS);
            const requestAnimationFrameCallback = () => {
                this.populateTemplate();
                this.classList.remove(HIDE_CLASS);
                this.render();
                if (hasValue(this.onMountedCallback)) {
                    this.onMountedCallback();
                    this.onMountedCallback = null;
                }
            };
            requestAnimationFrame(requestAnimationFrameCallback);
        }
    }

    /**
     * updateDataCallback is a callback function that will set the data and call `dataChanged` method.
     * <pre>
     *     <code>
     *         contextElement.dataChanged = (data) => console.log("data changed");
     *     </code>
     * </pre>
     * @param dataSetter
     */
    protected updateDataCallback = (dataSetter: DataSetter<DataSource>) => {
        this.setData(dataSetter);
        const dataChangedEvent: string = composeChangeEventName('data');
        if (dataChangedEvent in this) {
            (this as any)[dataChangedEvent].call(this, this.dataSource);
        }
    };

    /**
     * render method is invoked by the component when it received a new data-update.
     * First it will create DataRenderer object if its not exist.
     * DataRenderer require ContextElement template, updateDataCallback, and reducer.
     * Each time render method is invoked, a new callback to get the latest data (dataGetter) is created and passed to
     * DataRenderer render method.
     *
     * DataRenderer then will use the dataGetter to call reducer to get a new updated copy of the data, update the template
     * and call the updateDataCallback to update the original data with a new copy.
     *
     */
    protected render = () => {
        if (hasNoValue(this.dataSource) || hasNoValue(this.template)) {
            return;
        }
        if (hasNoValue(this.renderer)) {
            const dataNodes: ChildNode[] = this.template.map(node => node.cloneNode(true)) as ChildNode[];
            this.renderer = new DataRenderer(dataNodes, this.updateDataCallback, this.reducer);
        }
        const reversedNodes: Node[] = [...this.renderer.nodes].reverse();
        let anchorNode: Node = document.createElement('template');
        this.append(anchorNode);
        for (const node of reversedNodes) {
            if (anchorNode.previousSibling !== node) {
                this.insertBefore(node, anchorNode);
            }
            anchorNode = node;
        }
        // @ts-ignore
        const data = this.dataSource as Item;
        const dataGetter = () => ({data});
        this.renderer.render(dataGetter);
        this.lastChild.remove();
    };

    /**
     * initAttribute is the method to initialize ContextElement attribute invoked each time connectedCallback is called.
     */
    protected initAttribute = () => {
        // we are nt implementing here
    };

    /**
     * Populate the ContextElement template by storing the node child-nodes into template property.
     * Once the child nodes is stored in template property, ContextElement will clear its content by calling this.innerHTML = ''
     */
    private populateTemplate = () => {
        this.template = Array.from(this.childNodes).filter(noEmptyTextNode());
        this.innerHTML = ''; // we cleanup the innerHTML
    };
}

