# Dao #

An [JSONML](http://jsonml.org/) implemenation.

Dao is an JSONML implementation with a few extra features, to make it more powerful.
It allows to work on direct dom element, as well on jQuery objects, and even direct array-like manipulation.
Dao does not extend any core javascript object and does not have any dependencies.
Although jQuery must be enabled in order to support it.

# Usage #
## Constructing Dao object ##

Dao simply functions as a wrapper of jsonml objects. So to create a Dao object 
one can create one by using some standard jsonml, array. Another Dao object, a 
jQuery object or an arbitrary DOM Node. Or a simple string to construct an element
with that as tagname.

All of these examples are valid constructors:

```js
	var dao = new Dao([ "a", {"href":"http://example.com"}, "a link" ]);
	var dao = new Dao(document.body);
	var dao = new Dao($("a"));
	var dao = new Dao(SomeDaoObject); // returns SomeDaoObject
	var dao = new Dao("a"); 
	// the pequals new Dao(document.createElement("a"));
```

Omitting the `new` keyword does exactly the same. 

```js
	var dao = Dao(document.body);
```

To construct a Dao element from a JSON string one should use the `Dao.util.fromJSON` function

```js
	var dao = Dao.util.fromJSON( SomeJSONString );
```

## To DOM or JSON ##
To go to a JSON string it's possible to simply use JSON.stringify

```js
	var someArray = JSON.stringify(new Dao(document.body));
```

To get a DOM node out of the Dao object call the `build` method. If the Dao represented an array 
of elements it will return a DocumentFragment rather than an Element.

````js
	var dao = new Dao([ "a", {"href":"http://example.com"}, "a link" ]);
	document.body.appendChild(dao.build());
	
	// works too
	var allLinks = new Dao($("a"));
	document.body.appendChild(allLinks.build);
```

## modifying a Dao object ##
Dao has as prototype the array object, so one can modify the Dao by the default array operations.

```js
	var dao = new Dao( ["div"] );
	dao.unshift( "newTagName" );
	dao.push( "some text" );
	dao.push( [ "p", {"class" : "dao-paragraph"}, "some paragraph" ]);
	dao[2] = new Dao ([ "strong", "bold text" ]);
	dao.build();
```

Further there are some methods on the Dao object to make editing the Dao 
object a little easier.

```js
	// change the tagname
	dao.tagname("a"); 
	
	// Add the following attributes
	dao.attr({
		"href" : "somelink",
	 	"rel" : "external"
 	});
 	// Alternative setting of the attribute
 	dao.attr("class", "newClass"); 
 	
 	// Add an event handler
	dao.on("click", function () {
 		console.log( "Hellow World!" );
	});
	
	// Add an delegate event handler
	dao.on("click", "a", function() {
		console.log( "I clicked another a" );
	});
```	

## using Dao as template ##
One of the more powerful functions is using Dao as a template.
For example: 

```js
	var tpl = new Dao(
		["ul",
			function( listItems, parentElement, ownerDocument ) {
				
				return listItems.map( function( item ) {
					return ["li", item];
				});
			
			}
		]);
	tpl.build([
		"first list item",
		"second list item"
	]);
```

Would produce the following HTML dom structure:

```html
	<ul>
		<li>first list item</li>
		<li>second list item</li>
	</ul>
```


All functions in the Dao object get executed when build is called. The first argument 
of the function will be equal to the first argument of build. The second argument will be
the DOM node of the parent element of which the function is a member. The third one is the
owner document. In case Dao isn't used on the normal document context.

The function in the Dao array can return strings as text nodes. It can return
new Dao objects ( thus even other functions ) , jQuery objects, or raw JSONML arrays.


## Construction flags ##
Todo: document these

## Browser support ##
Dao is tested in:

* Mozilla Firefox 8 and higher ( Should work from Firefox 3.6 )
* Google Chrome

# license #
Dao is MIT Licensed