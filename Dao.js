/**
 * Dao
 * An JSOMML implementation
 *
 * @version 0.1
 * @author Joan Belder
 * @copyright 2012
**/

(function (global, $) {
	"use strict";
	
	// Check if jQuery is enabled
	var hasJQuery = !!($ && $.fn && $.fn.jquery);
	
	// Allows warnings for debugging
	var warn = (global.console && global.console.warn) ?
		global.console.warn : function(){};
		
	// reference to original Dao object. used for util.noConflict
	var originalDao = global.Dao;

	/**
	 * Constructs an Dao element
	 * @param {Array|Dao|String|Element} data the data to construct the dao element from
	 *   if data is an array it is assumed to be a jsonml array
	 *   if data is another Dao element that dao element is returned
	 *   if data is a String a dao element with as tagname the string is returned
	 *   if data is a Element the Element structure is copied into a DAO element
	 * @param (Element} node the node to attach the DAO element to
	 * @param (int) flags
	**/
	var Dao = function Dao(data, node, flags) {
		
		// Allow construction without the new keyword
		if (!(this instanceof Dao)) {
			return new Dao(data, node);		
		};
		
		// Make sure it's at least set
		this.attachedNode = undefined;
		
		// make node po
		if (arguments.length == 2 && Object(node) instanceof Number) {
			flags = node;
		}
		
		// If it's a element, we should attach to it
		if (data instanceof Element) {
			this.createFromDOM(data, flags);
			// Ready
			return;
		}
		
		// Cloning is not what we do...
		if (data instanceof Dao) {
			return data;
		}
		
		// It's a jsonml object.. yay!	
		if (hasJQuery && data instanceof $) {
			if (flags & Dao.FLAG_JQUERY_LIVE) {
				// Push the actual jquery object if it's live
				this.push(data);
				return;
			}
			else {
				// Mutate data into an real array
				data = $.toArray();
			}
		}
		
		if (Array.isArray(data)) {
			
			// Lazy daoize attempt if it's an element
			if (data.length && data[0] && typeof data[0] === 'string') {
				for (var i = 0; i < data.length; i++) {
					this.push( data[i] );
				}
			}
			// It's probably no element so do a greedy daoize attempt
			else {
				for (var i = 0; i < data.length; i++) {
					this.push( new Dao(data[i], undefined, flags) );
				}
			}
		}
		else if (data instanceof Function) {
			this.push(data);
		}
		else if (data) {
			this.tagname(data.toString());
		}
		
		
		// Attach the node
		if (node instanceof Element) {
			this.attachedNode = node;
		}
	};

	// Define some Flags
	Dao.FLAG_NONE				= 0;
	Dao.FLAG_STRIP_WHITESPACE	= 1;
	Dao.FLAG_TRIM				= 2;
	Dao.FLAG_JQUERY_LIVE		= 4;
		
	// Let's build some Dao Utilities
	Dao.util = {};


	/**
	 * Dao.util.normattr
	 * Normalizes one or two arguments into a key pair list
	 * will return false if nothing was passed
	 * @param {Object|String} first key/pair object or a key value
 	 * @param {String} second a value if the first was was a key value
 	**/
	Dao.util.normattr = function(first, second) {
		// Passing nothing will result in nothing
		if (!first) {
			return false;
		}
		
		// So it's two arguments
		if (second) {
			var r = {};
			r[first] = second;
			return r;
		}
		
		// Otherwise it was an key pair list already
		return first;
	}
	

	/**
	 * Dao.util.extend
	 * This function will extend an object with certain properties
	 * will never extend the prototype of the object
	 * @param {Object} target the object to be extended
	 * @param {Object|String} attributes an properties object to add to target
	 *   This can also be the name of an property to extend
 	 * @param {String} When attributes is a string this is the value of the
 	 *   property
 	**/
	Dao.util.extend = function extend(target, attributes, value) {
		
		// Just don't do anything with improper arguments
		attributes = Dao.util.normattr(attributes, value);
		if (Object(target) !== target || !attributes) {
			return;
		}
				
		for (var n in attributes) {
			if (attributes.hasOwnProperty(n)) {
				Object.defineProperty(target, n, {
					value: attributes[n],
					writable: true,
					enumerable: true,
					configurable: true
				});
			}
		}
	};

	/**
	 * Dao.util.noConflict
	 * This will prevent namespace conflicts
	 * it will restore the original Dao back to the global
	 * object and return the Dao object
	 */
	Dao.util.noConflict = function noConflict() {
	
		global.Dao = originalDao;
		return Dao;
	
	};
	
	/**
	 * Dao.util.fromJSON
	 * Creates a Dao unit from JSON
	 * @param {String} jsonString the json string to create the Dao from
	 */
	Dao.util.fromJSON = function fromJSON(jsonString) {
		return new Dao(JSON.parse(jsonString));
	};
	
	/**
	 * Dao.util.delegate
 	 * Creates an delegated variant of the same function
	**/		
 	(function () {
		
		// use JQuery if availabe...
		if (hasJQuery) {
			Dao.util.delegate = function(selector, fn) {
				return function(ev) {
					if ($(ev.target).is(selector)) {
						fn.call(ev.target, ev);
					}
				};
			};
			return;
		}
		
		var opts = [
			"matchesSelector",
			"mozMatchesSelector",
			"webkitMatchesSelector",
			"oMatchesSelector"
		].filter(function(matches) {
			return !!document.documentElement[matches];
		});
		
		// check if it's supported
		if (opts.length) {
			var matchesSelector = opts[0];
		
			Dao.util.delegate = function(selector, fn) {
				return function(ev) {
					if (ev.target[matchesSelector](selector)) {
						fn.call(ev.target, ev);
					}
				};
			};
		}
		// Not supported
	
	})();


	// And build the Dao prototype
	// This is an extension to the array prototype
	// in order to comply with jsonml
	Dao.prototype = Object.create(Array.prototype);

	/**
	 * dao.toJSON
	 * returns the jsonml representation of the Dao object
	 * @return the jsonml representention of the Dao object
	**/
	Dao.util.extend(Dao.prototype, "toJSON", function toJSON() {
		return this.map(function(obj) {
			return (obj instanceof Dao) ? obj.toJSON() : obj;
		});
	});

	/**
 	 * dao.normalize
	 * Normalizes a Dao object.
	**/
	Dao.util.extend(Dao.prototype, "normalize", function normalize() {
		
		// check if it is actually representing an element
		if (!this.length || typeof this[0] !== "string") {
			console.log(this);
			this.unshift(false);
		}
		
		// First of all create a reference to the attributes object
		if (this.length < 2) {
			if (this.length === 0) {
				this.push(false);
			}
			if (this.length === 1) {
				this.push({});
			}
		};
		
		if (Object.getPrototypeOf(Object(this[1])) !== Object.prototype) {
			this.splice(1, 0, {});
		}	
	});

	/**
	 * dao.tagname
	 * returns and/or sets the tagname of the node. False when the dao element
	 * has no tagname
	 * @param (optional) {String} tagname the tagname to set
	**/
	Dao.util.extend(Dao.prototype, "tagname", function tagname(tagname) {
		
		this.normalize();
		if (tagname) {
			this[0] = tagname;
		}
		
		return this[0];
	});
	
	
	/**
	 * dao.attr
	 * returns and/or sets the attrs of the node. False when the dao element
	 * has no tagname
	 * @param (optional) {Object|String} key the name of the attribute to set, or
	 *   key value pairs of multiple attributes to set
	 * @param (optional) {String} value the value of the attribute to set
	**/
	Dao.util.extend(Dao.prototype, "attr", function attr(attributes, value) {
		
		attributes = Dao.util.normattr(attributes, value);
		this.normalize();
		
		if (attributes) {
			for (var key in attributes) {
				if (attributes.hasOwnProperty(key)) {
					
					// Just make some
					if (this[1][key] === undefined) {
						this[1][key] = value;
						continue;
					}
					
					// Already an array, just add some
					if (Array.isArray(this[1][key])) {
						this[1][key].push(value);
						continue;
					}
					
					// It's an event handler, just make it an array
					if (value instanceof Function) {
						this[1][key] = [this[1][key], value];
						continue;
					}
					
					// Just a value, do overwrite
					this[1][key] = value;
				}
			}
		}
		
		return this[1];
	});
	
	/**
	 * dao.on
	 * Adds an event listener to the object
	 * @param {String} event the name of the event to set
	 * @param (optional) {String} selector the selector for delegate events
	 * @param {function(ev)} the function to fire on the event
	**/
	Dao.util.extend(Dao.prototype, "on", function on(event, selector, fn) {
		if (arguments.length === 3) {
			fn = Dao.util.delegate(selector, fn);
			
			// Non-bubbling events that are not tied to the document-object. Should use capture
			if (event === "blur" || event === "focus") {
				fn.useCapture = true;
			}
		}
		
		this.attr(event, fn);
	});

	/**
	 * dao.render
	 * Refreshes the DOM node to which the Dao object 
	 * is attached.
	 * @param {Object} data the data to render if it's a template dao object
 	**/
	Dao.util.extend(Dao.prototype, "render", function render(data) {
		if (!this.attachedNode) {
			warn("Dao object had no attached node");
			return;
		}
		
		data = data || {};
		
		this.attachedNode = this.attachedNode.parentNode
			.replaceChild(this.build(data, this.attachedNode.ownerDocument), this.attachedNode);
	});
	
	/**
	 * dao.appendTo
	 * appends the Dao element to another Node
	 * @param {Element} the node to append the dao object to
	 * @param {Object} data the data to render if it's a template dao object
	**/
	Dao.util.extend(Dao.prototype, "appendTo", function(node, data) {
		if (!(node instanceof Element)) {
			warn("Can't connect to node");
		}
		
		node.appendChild(this.build(data), node.ownerDocument);
	});


	/**
	 * dao.createFromDOM
	 * @param {Element} domElement
 	**/
	Dao.util.extend(Dao.prototype, "createFromDOM", function createFromDOM(domElement, flags) {
		if (!(domElement instanceof Element)) {
			return;
		}
		
		flags = flags || Dao.FLAG_NONE;
		
		// Insert tag name
		this.push(domElement.nodeName.toLowerCase());
		
		// Insert attributes (if any)
		if (domElement.hasAttributes()) {
			var attr = {};
			for (var i = 0; i < domElement.attributes.length; i++) {
				attr[ domElement.attributes[i].name ] = domElement.attributes[i].value;
			}
			
			this.push(attr);
		};
		
		var parseComment = function parseComment(owner, comment) {
			if (comment.indexOf("dao-func ") === 0) {
				owner.push(
					new Function("data", decodeURI(comment.substr("dao-func ".length)))
				);
			}
		};
		
		// Build children
		for (var i = 0; i < domElement.childNodes.length; i++) {
			switch (domElement.childNodes[i].nodeType) {
				case Node.ELEMENT_NODE:
					this.push( new Dao( domElement.childNodes[i], flags ) ); break;
				case Node.TEXT_NODE: case Node.CDATA_SECTION_NODE:
					// Check if we should skip
					var d = domElement.childNodes[i].data;
					if ((flags & Dao.FLAG_STRIP_WHITESPACE) && !(/[^\t\n\r ]/.test(d))) {
						break;
					}
						
					this.push( (flags & Dao.FLAG_TRIM) ? d.trim() : d ); break;
				case Node.COMMENT_NODE:
					parseComment( this, domElement.childNodes[i].data ); break;
			}
		}
		
		// And attach the attached node
		this.attachedNode = domElement;
	});
	

	/**
	 * dao.build
	 * Builds the dao object into a dom node
	 * @param {Object} data the data to render if it's a template dao object
	 * @param (optional) {DOMDocument} doc the ownerdocument of the built dao object
 	**/
	Dao.util.extend(Dao.prototype, "build", function build(data, doc) {
		
		data = data || {};
		doc = doc || document;
		
		this.normalize();
		
		var element = (this[0]) ? doc.createElement(this[0]) : doc.createDocumentFragment();

		var handleProperty = function handleProperty(key, prop) {
			if (Array.isArray(prop)) {
				for (var i = 0; i < prop.length; i++) {
					handleProperty(key, prop[i]);
				}
			}
			else if (prop instanceof Function) {
				element.addEventListener(key, prop, prop.useCapture || false);
			}
			else {
				element.setAttribute(key, prop);
			}
		};

		// Only add attributes when it's actually an element
		if (this[0]) {
			for (var key in this[1]) {
				if (this[1].hasOwnProperty(key)) {
					handleProperty(key, this[1][key]);
				}
			}
		}
		
		// Helper function for building certain parts of the object
		var buildPart = function buildPart(item) {
			if (item instanceof Dao) {
				return item.build(data, doc);
			}
			if (Array.isArray(item)) {
				return (new Dao(item)).build(data, doc);
			}
					
			// Functions are done recursive, so they can return
			// dao element, strings, or event other functions =)
			if (item instanceof Function) {
				return buildPart( item(data, element, doc) );
			}
			// Allow jquery elements to appended if needed.
			if (hasJQuery && item instanceof $) {
				item.appendTo(element);
				return;
			}
			
			return doc.createTextNode(item);
 		};


		for (var i = 2; i < this.length; i++) {
			var toAppend = buildPart( this[i] );
			if (toAppend) {
				element.appendChild( toAppend );
			}
		}
		
		return element;
	});
	
	// And expose
	global.Dao = Dao;
})(window, window.jQuery);