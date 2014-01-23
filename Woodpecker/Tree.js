/**
 * Codes extract from http://mbostock.github.com/d3/talk/20111018/tree.html
 */

var Tree = Class.create( {

    initialize: function( parameters )
    {
        this.treeId = parameters.treeId;
        this.containerTreeId = parameters.containerTreeId;
        this.depth = parameters.depth ? parameters.depth : 100;
        var margin = parameters.margin ? parameters.margin : [0, 100, 0, 100];
        var width = parameters.width ? parameters.width - margin[1] - margin[3] : 1280 - margin[1] - margin[3];
        this.width = width;
        var height = parameters.height ? parameters.height - margin[0] - margin[2] : 800 - margin[0] - margin[2];
        var treeData = parameters.data;
        this.selectedValue = parameters.selectedValue ? parameters.selectedValue : false;
        this.callbackOnClickValue = parameters.callbackOnClickValue ? parameters.callbackOnClickValue : false;
        this.isRightToLeft = parameters.isRightToLeft;

        this.tree = d3.layout.tree().size( [height, width] );
        this.diagonal = d3.svg.diagonal().projection( function( d )
        {
            return [d.y, d.x];
        } );

        this.vis = d3.select( "#" + this.containerTreeId ).append( "svg:svg" )
                .attr( "id", this.treeId )
                .style( "width", width + margin[1] + margin[3] )
                .attr( "height", height + margin[0] + margin[2] )
                .append( "svg:g" )
                .attr( "transform", "translate(" + margin[3] + "," + margin[0] + ")" );

        this.root = treeData;
        this.root.x0 = height / 2;
        if( this.isRightToLeft )
            this.root.y0 = width;
        else
            this.root.y0 = 0;

        this.update( this.root );
        this.toggleAll( this.root );
        this.update( this.root );
    },

    update: function( source )
    {
        var i = 0;
        var duration = d3.event && d3.event.altKey ? 5000 : 500;

        var nodes = this.tree.nodes( this.root );
        // Normalize for fixed-depth.
        nodes.forEach( jQuery.proxy( function( d )
        {
            if( this.isRightToLeft )
                d.y = this.width - (d.depth * this.depth);
            else
                d.y = d.depth * this.depth;
        }, this ) );

        // Update the nodes…
        var node = this.vis.selectAll( "g.node" ).data( nodes, function( d )
        {
            return d.id || (d.id = ++i);
        } );

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append( "svg:g" )
                .attr( "class", "node" )
                .attr( "id", jQuery.proxy( function( d, i )
        {
            return "node_" + this.treeId + "_" + d.id;
        }, this ) )
                .attr( "transform", function( d )
        {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        } )
                .on( "click", jQuery.proxy( function( d )
        {
            if( !d.children && !d._children )
            {
                this.selectedValue = d.name;
                d3.selectAll( "#" + this.treeId + " .node" ).select( "text" ).classed( 'selected', false );
                d3.select( "#node_" + this.treeId + "_" + d.id ).select( "text" ).classed( 'selected', true );
            }

            // If we closed the first element, we close all
            if( 0 == d.depth && !d._children )
                this.toggleAll( d );
            else
                this.toggle( d );

            this.update( d );

            if( this.callbackOnClickValue )
                this.callbackOnClickValue( d );
        }, this ) );

        nodeEnter.append( "svg:circle" )
                .attr( "r", 1e-6 )
                .style( "fill", function( d )
        {
            return d._children ? "lightsteelblue" : "#fff";
        } );
        nodeEnter.append( "svg:text" )
                .attr( "x", jQuery.proxy( function( d )
        {
            if( this.isRightToLeft )
                return d.children || d._children ? 10 : -10;
            else
                return d.children || d._children ? -10 : 10;
        }, this ) )
                .attr( "dy", ".35em" )
                .attr( "text-anchor", jQuery.proxy( function( d )
        {
            if( this.isRightToLeft )
                return d.children || d._children ? "start" : "end";
            else
                return d.children || d._children ? "end" : "start";
        }, this ) )
                .text( function( d )
        {
            return d.name;
        } )
                .style( "fill-opacity", 1e-6 )
                .classed( 'selected', jQuery.proxy( function( d )
        {
            return this.selectedValue && this.selectedValue == d.name;
        }, this ) );

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
                .duration( duration )
                .attr( "transform", function( d )
        {
            return "translate(" + d.y + "," + d.x + ")";
        } );
        nodeUpdate.select( "circle" )
                .attr( "r", 4.5 )
                .style( "fill", function( d )
        {
            return d._children ? "lightsteelblue" : "#fff";
        } );
        nodeUpdate.select( "text" ).style( "fill-opacity", 1 );

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
                .duration( duration )
                .attr( "transform", function( d )
        {
            return "translate(" + source.y + "," + source.x + ")";
        } )
                .remove();
        nodeExit.select( "circle" ).attr( "r", 1e-6 );
        nodeExit.select( "text" ).style( "fill-opacity", 1e-6 );

        // Update the links…
        var link = this.vis.selectAll( "path.link" ).data( this.tree.links( nodes ), function( d )
        {
            return d.target.id;
        } );
        // Enter any new links at the parent's previous position.
        link.enter().insert( "svg:path", "g" )
                .attr( "class", "link" )
                .attr( "d", jQuery.proxy( function( d )
        {
            var o = {x: source.x0, y: source.y0};
            return this.diagonal( {source: o, target: o} );
        }, this ) )
                .transition()
                .duration( duration )
                .attr( "d", this.diagonal );
        // Transition links to their new position.
        link.transition()
                .duration( duration )
                .attr( "d", this.diagonal );
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
                .duration( duration )
                .attr( "d", jQuery.proxy( function( d )
        {
            var o = {x: source.x, y: source.y};
            return this.diagonal( {source: o, target: o} );
        }, this ) )
                .remove();

        // Stash the old positions for transition.
        nodes.forEach( function( d )
        {
            d.x0 = d.x;
            d.y0 = d.y;
        } );
    },

    // Toggle children.
    toggle: function( d )
    {
        if( d.children )
        {
            d._children = d.children;
            d.children = null;
        }
        else
        {
            d.children = d._children;
            d._children = null;
        }
    },

    toggleAll: function( d )
    {
        if( d.children )
        {
            d.children.forEach( jQuery.proxy( this.toggleAll, this ) );
            this.toggle( d );
        }
    }
} );
