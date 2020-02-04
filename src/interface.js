const nodeType = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3
};

Object.freeze(nodeType);

class Node {
    constructor(nodeType, childNodes=[]) {
        this.nodeType = nodeType;
        this.childNodes = childNodes;
    }
}

class Text extends Node {
    constructor(wholeText) {
    	super();
        this.nodeType = nodeType.TEXT_NODE;
        this.wholeText = wholeText;
    }
}

class Element extends Node {
    constructor(
        tagName,
        attributes=new Map(),
        childNodes=[],
        id='',
        className=''
    ) {
    	super();
        this.nodeType = nodeType.ELEMENT_NODE;
        this.tagName = tagName;
        this.attributes = attributes;
        this.childNodes = childNodes;
        this.id = id;
        this.className = className;
    }
}

export { nodeType, Node, Text, Element };