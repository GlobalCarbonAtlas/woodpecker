// Extending Fanyctree
// ===================
//
// See also the [live demo](http://wwwendt.de/tech/fancytree/demo/sample-ext-childcounter.html) of this code.
//
// Every extension should have a comment header containing some information
// about the author, copyright and licensing. Also a pointer to the latest
// source code.
// Prefix with `/*!` so the comment is not removed by the minifier.

/*!
 * jquery.fancytree.childcounter.js
 *
 * Add a child counter bubble to tree nodes.
 * (Extension module for jquery.fancytree.js: https://github.com/mar10/fancytree/)
 *
 * Copyright (c) 2013, Martin Wendt (http://wwWendt.de)
 *
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 *
 * @version DEVELOPMENT
 * @date DEVELOPMENT
 */

// To keep the global namespace clean, we wrap everything in a closure

;(function($, undefined) {

// Consider to use [strict mode](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/)
"use strict";

// The [coding guidelines](http://contribute.jquery.org/style-guide/js/)
// require jshint compliance.
// But for this sample, we want to allow unused variables for demonstration purpose.

/*jshint unused:false */


// Adding methods
// --------------

// New member functions can be added to the `Fancytree` class.
// This function will be available for every tree instance.
//
//     var tree = $("#tree").fancytree("getTree");
//     tree.countSelected(false);

$.ui.fancytree._FancytreeClass.prototype.countSelected = function(topOnly){
	var tree = this,
		treeOptions = tree.options;
	return tree.getSelectedNodes(topOnly).length;
};


// The `FancytreeNode` class can also be easily extended. This would be called
// like
//
//     node.toUpper();

$.ui.fancytree._FancytreeNodeClass.prototype.toUpper = function(){
	var node = this;
	return node.setTitle(node.title.toUpperCase());
};


// Finally, we can extend the widget API and create functions that are called
// like so:
//
//     $("#tree").fancytree("widgetMethod1", "abc");

$.ui.fancytree.prototype.widgetMethod1 = function(arg1){
	var tree = this.tree;
	return arg1;
};


// Register a Fancytree extension
// ------------------------------
// A full blown extension, extension is available for all trees and can be
// enabled like so (see also the [live demo](http://wwwendt.de/tech/fancytree/demo/sample-ext-childcounter.html)):
//
//     $("#tree").fancytree({
//         extensions: ["childcounter"],
//         childcounter: {
//             hideExpanded: true
//         },
//         ...
//     });
//


/* 'childcounter' extension */
//Every extension must be registered by a unique name.
$.ui.fancytree.registerExtension("childcounter", {
// Version information should be compliant with [semver](http://semver.org)
	version: "1.0.0",

// Extension specific options and their defaults.
// This options will be available as `tree.options.childcounter`

	options: {
		deep: true,
		hideZeros: true,
		hideExpanded: false
	},

// Local functions are prefixed with an underscore '_'.

	_appendCounter: function(node){
	},

// Override virtual methods for this extension.
// `this`       : is this extension object
// `this._base` : the Fancytree instance
// `this._super`: the virtual function that was overridden (member of prev. extension or Fancytree)

	treeInit: function(ctx){
		var tree = ctx.tree,
			opts = ctx.options,
			self = this;

// Call the base implementation
		this._super(ctx);
	},

// Destroy this tree instance (we only call the default implementation, so
// this method could as well be omitted).

	treeDestroy: function(ctx){
		this._super(ctx);
	},

// Overload the `renderTitle` hook, to append a counter badge
	nodeRenderTitle: function(ctx, title) {
		var node = ctx.node,
			extOpts = ctx.options.childcounter,
			count = node.countChildren(extOpts.deep);
// Let the base implementation render the title
		this._super(ctx, title);
// Append a counter badge
		if( (count || ! extOpts.hideZeros) && (!node.isExpanded() || !extOpts.hideExpanded) ){
			$("span.fancytree-icon", node.span).append($("<span class='fancytree-childcounter'/>").text(count));
		}
	},
// Overload the `setExpanded` hook, so the conters are updated
	nodeSetExpanded: function(ctx, flag) {
		var tree = ctx.tree,
			node = ctx.node;
// Let the base implementation expand/collapse the node, then redraw the title
// after the animation has finished
		this._super(ctx, flag).done(function(){
			tree.nodeRenderTitle(ctx);
		});
	}

// End of extension definition
});
// End of namespace closure
}(jQuery));
