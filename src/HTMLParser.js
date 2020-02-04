import { nodeType, Node, Text, Element } from './interface.js';

class HTMLParser {
    /**
     * Creates a html parser object.
     *
     * @constructor
     * @param {Number} [pos] The index of the next character we haven't processed yet.
     * @param {String} [input] The string needs to parse.
     */
    constructor(input) {
        this.pos = 0;
        this.input = input;
    }
    /**
     * Read the character that position indicates without handling it.
     *
     * @param {Number} [shift] The value shifting the index of starting.
     * @returns {String} Returns character that position indicates.
     */
    nextChar(shift=0) {
        return this.input[this.pos+shift];
    }
    /**
     * Do the next characters start with the given string?
     *
     * @param {String} [str] The value matching.
     * @param {Number} [shift] The value shifting the index of starting.
     * @returns {Boolean} Returns `true` if it starts with the given string, else `false`.
     */
    startWith(str, shift=0) {
        if (typeof str !== 'string') {
            throw Error('Type of str is not string.');
        }

        if (this.input.slice(this.pos+shift, this.pos+str.length+shift) !== str) {
            return false;
        }

        return true;
    }
    /**
     * Check if it ends of input.
     *
     * @returns {Boolean} Returns `true` if it ends of input, else `false`.
     */
    eof() {
        return this.pos >= this.input.length ? true : false;
    }
    /**
     * Return the current character, and advance position to the next character.
     *
     * @param {Function} [callback] 
     * @returns {String} Returns the character that position indicates.
     */
    handleChar() {
        this.pos++;

        return this.input[this.pos];
    }
    /**
     * Handle characters that meet regex, and advance position.
     *
     * @param {RegExp} [regex] The pattern that meets need.
     * @param {Function} [callback] 
     * @returns {String} Returns the characters sequence matching.
     */
    handleSeq(regex) {
        const found = this.input.slice(this.pos).match(regex)[0];
        
        if (found) {
        		this.pos += found.length;
            
       			return found;
        } else {
        		throw Error('No match is found.');
        }
    }
    /**
     * Consume and ignore zero or more whitespace characters.
     *
     * @returns {String} Returns the character that position indicates.
     */
    consumeWhitespace() {
        while(this.input[this.pos] === ' ') {
            this.pos++;
        }

        return this.input[this.pos];
    }
    /**
     * Parse a tag or attribute name.
     *
     * @returns {String} Returns the characters of tag or attribute.
     */
    parseTagName() {
        return this.handleSeq(new RegExp('^[a-zA-Z0-9]+'));
    }
    /**
     * Parse a single node.
     * 
     * @returns {Node} Returns Text or Element.
     */
    parseNode() {
        if (this.nextChar() === '<') {
            return this.parseElement();
        } else {
            return this.parseText();
        }
    }
    /**
     * Parse a Text node.
     * 
     * @returns {Text} Returns Text Node.
     */
    parseText() {
        return new Text(this.handleSeq(new RegExp('^[^<]+(?=<)')));
    }
    /**
     * Parse a single Element.
     * 
     * @returns {Element} Returns Element Node.
     */
    parseElement() {
        // Opening tag
        this.handleChar();
        const tagName = this.parseTagName();
        const attrs = this.parseAttributes();
        if (this.nextChar() === '>') {
            this.handleChar();
        }

        // Contents
        const childNodes = this.parseNodes();

        // Closing tag
        this.handleSeq(`^</${tagName}>`);

        return new Element(
            tagName,
            attrs,
            childNodes,
            attrs.has('id') ? attrs.get('id') : '',
            attrs.has('class') ? attrs.get('class') : ''
        );
    }
    /**
     * Parse a list of name="value" pairs, separated by whitespace.
     * 
     * @returns {Map} Returns Map of name-value pairs.
     */
    parseAttributes() {
        let attributes = new Map();
        let name = '';
        let value = '';
        
        while(this.nextChar() !== '>') {
            this.consumeWhitespace();
            name = this.handleSeq('^[a-zA-Z-]+(?==)');
            this.handleChar();
            value = this.handleSeq(/(?<=")\w+(?=")/);
            this.handleChar();
            this.handleChar();
            attributes.set(name, value);
        }

        return attributes;
    }
    /**
     * Parse a list of nodes.
     * 
     * @returns {Node} Returns array of nodes.
     */
    parseNodes() {
        let nodes = [];

        while(!(this.eof() || this.startWith('</'))) {
            this.consumeWhitespace();
            nodes.push(this.parseNode());
        }

        return nodes;
    }
    /**
     * Parse an HTML document and return the root element.
     * 
     * @returns {Node} Returns HTML document Node.
     */
    static parse(str) {
        let nodes = new HTMLParser(str).parseNodes();

        // If the document contains a root element, just return it. Otherwise, create one.
        if (nodes.length === 1) {
            return nodes[0];
        } else {
            return new Element('html', new Map(), nodes);
        }
    }
}

export default HTMLParser;