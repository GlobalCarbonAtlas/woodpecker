/* 
 * Copyright Patrick Brockmann, Vanessa Maigne & Pascal Evano, 2013  
 *
 * Patrick.Brockmann@lsce.ipsl.fr
 * Vanessa.Maigne@lsce.ipsl.fr
 * Pascal.Evano@lsce.ipsl.fr
 *
 * Licensed under the CeCILL-B license under French law and abiding
 * by the rules of distribution of free software. You can  use, modify
 * and/or redistribute the software under the terms of the CeCILL-B
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 *
 ##########################################################################
 This class needs the followed files :
 - for the right menu
 - js/wdContextMenu/wdContextMenu/src/Plugins/jquery.contextmenu.js
 - css/wdContextMenu/css/contextmenu.css
 - for the colorpicker
 - js/farbtastic/farbtastic.js

 Parameters :
 - imagesToInsertInExport :
 - displayBackground : boolean to indicates if we add a background to the images (for transparents images by example). Use of exportFooter style in css.
 - images : array of images to display
 - encodedImage : the encoded image in base64
 - width : the width of the image (need to calculate the rect width if a background is asked)
 - height : the height of the image (need to calculate the rect height if a background is asked)
 */

var Woodpecker = Class.create( {
    initialize: function( parameters )
    {
        // Param
        this.containerId = parameters.containerId;
        this.container = $( "#" + this.containerId );
        this.data = parameters.data ? parameters.data : false;
        this.displayPlot = !parameters.displayPlot;
        this.toolsContainer = parameters.toolsContainer ? parameters.toolsContainer : "body";
        this.displayContextuelMenu = parameters.displayContextuelMenu;
        this.displayIconesMenu = parameters.displayIconesMenu;
        this.activeKeys = parameters.activeKeys;
        this.imagesToInsertInExport = parameters.imagesToInsertInExport ? parameters.imagesToInsertInExport : false;

        this.translateGraph = {"top": 10, "right": 0, "bottom": 70, "left": 70};
        this.isFirefox = /firefox/i.test( window.navigator.userAgent.toLowerCase() );
        this.svgWidth = parameters.width ? parameters.width : (this.container.width() ? this.container.width() : 500);
        if( this.displayIconesMenu )
            this.svgWidth = this.svgWidth - 20;
        this.svgHeight = parameters.height ? parameters.height : (260 < this.container.height() ? this.container.height() - 160 : 400);
        this.plotSize = {
            "width":  this.svgWidth - this.translateGraph.left - this.translateGraph.right,
            "height": this.svgHeight - this.translateGraph.top - this.translateGraph.bottom
        };
        this.zIndex = 0;

        this.displayPoints = false;
        this.dotRadius = 2.5;
        this.imgPath = parameters.imgPath ? parameters.imgPath : "Woodpecker/img";

        this.xAxisLabelText = parameters.xAxisLabelText ? parameters.xAxisLabelText : false;
        this.yAxisLabelText = parameters.yAxisLabelText ? parameters.yAxisLabelText : false;

        this.xmax = parameters.xmax || 100;
        this.xmin = parameters.xmin || 0;
        this.ymax = parameters.ymax || 100;
        this.ymin = parameters.ymin || 0;
        this.xDomain = false;
        this.yDomain = false;

        this.color = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf","#aec7e8","#ffbb78","#98df8a","#ff9896","#c5b0d5","#c49c94","#f7b6d2","#c7c7c7","#dbdb8d","#9edae5"];
        this.selectedLineIndex = 0;
        this.selectedLine = false;

        this.x = d3.time.scale().domain( [this.xmin, this.xmax] ).range( [0, this.plotSize.width] );
        this.y = d3.scale.linear().domain( [this.ymin, this.ymax] ).nice().range( [0, this.plotSize.height] ).nice();

        this.xAxis = d3.svg.axis().scale( this.x ).orient( 'bottom' );
        this.yAxis = d3.svg.axis().scale( this.y ).orient( 'left' );

        // Interpolation tree
        this.interpolation = parameters.interpolation ? parameters.interpolation : "linear";
        this.containerInterpolationTree = "WPinterpolationTree";
        this.containerInterpolationTreeContent = "WPinterpolationTreeContent";
//        this.containerInterpolationValue = $( "#interpolationValue" );
        this.interpolationInitWidth = 150;
        this.treeDepth = 100;
        this.treeCreated = false;

        this.zoomXAvailable = true;
        this.zoomYAvailable = true;
        if( this.activeKeys )
        {
            d3.select( "body" ).on( "keydown", jQuery.proxy( this.keydownXY, this ) );
            d3.select( "body" ).on( "keypress", jQuery.proxy( this.keydownXY, this ) );
            d3.select( "body" ).on( "keyup", jQuery.proxy( this.keyupXY, this ) );
        }

        this.createDivsForGraph( this.toolsContainer );

        if( this.displayContextuelMenu || this.displayIconesMenu )
        {
            // Preload icon image
            $( '<img/>' )[0].src = this.imgPath + "/axisY_lock.svg";
            $( '<img/>' )[0].src = this.imgPath + "/axisX_lock.svg";
            $( '<img/>' )[0].src = this.imgPath + "/line.svg";
        }
        this.createGraph( true );
        this.bindTools();
    },


// **************************************************************
// ********************** GRAPH ********************************
// **************************************************************
    createGraph: function( isNewGraph )
    {
        // This div is neeeded to clone the graph in one invisible div to remove unprintable elements
        var divToCloneGraph = $( '<div id="WPdivToCloneToExportGraph"></div>' );
        this.container.append( divToCloneGraph );
        if( this.displayIconesMenu )
            this.createOrUpdateIconesMenu();
        if( isNewGraph )
        {
            this.updateXYDomains();
            this.createSVG();
            this.createColorPicker();
            if( this.displayContextuelMenu || this.displayIconesMenu )
                this.createTreeForInterpolation();
        }
        this.addOrUpdateLinesAndPoints();
        this.createOrUpdateAxis();
        this.createOrUpdateLegend();
        this.bindZoomsToGraph();
        if( this.displayContextuelMenu )
            this.createOrUpdateContextMenu();
        this.redraw();
    },

    update: function()
    {
        this.createGraph( false );
    },

    createSVG: function()
    {
        this.vis = d3.select( "#" + this.containerId )
                .append( "div" ).attr( "id", "WPdivToExportGraph" )
                .append( 'svg' )
                .attr( "version", "1.1" )
                .attr( "xml:space", "preserve" )
                .attr( "xmlns", "http://www.w3.org/2000/svg" )
                .attr( "xmlns:xmlns:xlink", "http://www.w3.org/1999/xlink" )
                .attr( "viewBox", "0 0 " + this.svgWidth + " " + this.svgHeight )
                .attr( "preserveAspectRatio", "xMinYMin" )
//                .attr( "width", this.svgWidth )
//                .attr( "height", this.svgHeight )
                .attr( "id", "WPgraphSvg" )
                .attr( "pointer-events", "all" )
                .append( "g" )
                .attr( 'class', 'wrap' );

        // ClipPath to block zoom and pan in one zone
        this.vis.append( "defs" ).append( "clipPath" )
                .attr( "id", "clip" )
                .append( "rect" )
                .attr( "id", "clip-rect" )
                .attr( "width", this.plotSize.width )
                .attr( "height", this.plotSize.height );

        // Legends
        this.vis.append( 'g' ).attr( 'class', 'legends' );

        // Zone to plot and manage events
        this.plot = this.vis.append( "g" )
                .attr( "transform", 'translate(' + this.translateGraph.left + ',' + this.translateGraph.top + ')' );

        this.plot.append( "rect" )
                .attr( "width", this.plotSize.width )
                .attr( "height", this.plotSize.height )
                .attr( "style", "fill:white" );

        // Axis and graph
        this.ticksX = this.plot.append( 'g' ).attr( 'class', 'x axis' );
        this.ticksY = this.plot.append( 'g' ).attr( 'class', 'y axis' );
        this.plot.append( 'g' )
                .attr( "clip-path", "url(#clip)" )
                .attr( 'class', 'lines' );
    },

    onClickRemoveLines: function()
    {
        this.removeAllLines();
        if( this.displayContextuelMenu )
            this.createOrUpdateContextMenu();
        if( this.displayIconesMenu )
            this.createOrUpdateIconesMenu();
        this.selectedLineIndex = 0;
    },

    onClickPoint: function()
    {
        this.displayPoints = !this.displayPoints;
        this.redraw();
        if( this.displayContextuelMenu )
            this.createOrUpdateContextMenu();
        if( this.displayIconesMenu )
            this.createOrUpdateIconesMenu();
    },

    setData: function( data )
    {
        this.data = data;
    },


// **************************************************************
// *********************** AXIS *********************************
// **************************************************************
    createOrUpdateAxis: function()
    {
        // If domains are already changed by a zoom or pan, we don't update
        if( this.xDomain )
            this.x.domain( this.xDomain );
        if( this.yDomain )
            this.y.domain( this.yDomain );

        this.xAxis.ticks( this.svgWidth / 100 ).tickSize( -(this.plotSize.height), 0 );
        this.yAxis.ticks( this.svgHeight / 36 ).tickSize( -(this.plotSize.width), 0 );

        var g = d3.select( 'g.wrap' );

        // X axis
        //this.xAxisLabelText = "Flux/kgC/m2/h/m33/g/m2/m2/d";
        this.xPosition = this.x.range()[1] / 2 - getTextWidth( this.containerId, this.xAxisLabelText ) / 2;
        var xLabel = this.getAxisLabelInArrayWithExponent( this.xAxisLabelText );

        g.select( '.x.axis' ).append( 'text' )
                .attr( 'class', 'axislabel' )
                .attr( 'text-anchor', 'middle' )
                .attr( 'x', this.x.range()[1] / 2 + 35 )
                .attr( 'y', this.translateGraph.bottom - 30 );

        var xAxisLabel = g.select( '.x.axis text.axislabel' ).selectAll( 'tspan' ).data( xLabel );
        xAxisLabel.enter().append( 'tspan' )
                .attr( 'dy', jQuery.proxy( function( d )
        {
            if( d.isExponent )
                return -5;
            else
                return 5;
        }, this ) );
        xAxisLabel.exit().remove();
        xAxisLabel.text( function( d )
        {
            return d.label
        } );

        g.select( '.x.axis' )
                .attr( 'transform', 'translate(0,' + this.y.range()[0] + ')' )
                .call( this.xAxis )
                .selectAll( 'line' )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );

        // Y axis
        //this.yAxisLabelText = "m2/h/m33/g/m2/m2/d";
        this.xPosition = -this.y.range()[0] / 2 - getTextWidth( this.containerId, this.yAxisLabelText ) / 2;
        var yLabel = this.getAxisLabelInArrayWithExponent( this.yAxisLabelText );

        g.select( '.y.axis' ).append( 'text' )
                .attr( 'class', 'axislabel' )
                .attr( 'transform', 'rotate(-90)' )
                .attr( 'y', 15 - this.translateGraph.left )
                .attr( 'x', -this.y.range()[0] / 2 - 45 );

        var yAxisLabel = g.select( '.y.axis text.axislabel' ).selectAll( 'tspan' ).data( yLabel );
        yAxisLabel.enter().append( 'tspan' )
                .attr( 'dy', jQuery.proxy( function( d )
        {
            if( d.isExponent )
                return -5;
            else
                return 5;
        }, this ) );
        yAxisLabel.exit().remove();
        yAxisLabel.text( function( d )
        {
            return d.label
        } );

        g.select( '.y.axis' )
                .call( this.yAxis )
                .selectAll( 'line' )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );

        g.selectAll( '.y.axis g text' ).attr( "x", -5 );
        g.selectAll( '.x.axis g text' ).attr( "y", 5 );
    },

    /**
     * This method returns a array of object with :
     *   .label = subString of the label
     *   .isExponent = indicates if the subString is a basic text or an exponent
     * @param label
     */
    getAxisLabelInArrayWithExponent : function( label )
    {
        var labelArray = new Array();

        // numbersInString is an array with extracted numbers from the label
        var numbersInString = label.match( /\d+/g );
        if( null == numbersInString )
            return [
                {"label":label, "isExponent":false}
            ];
        numbersInString = jQuery.unique( numbersInString );
        // indexHash contains : key = index of number position, value = length of numer
        var indexHash = new Hashtable();
        jQuery.each( numbersInString, function( i, d )
        {
            var indexArray = label.allIndexOf( d );
            jQuery.each( indexArray, function( ii, dd )
            {
                indexHash.put( dd, d.length );
            } );
        } );

        var keys = indexHash.keys().sort( function( a, b )
        {
            return a - b;
        } );
        jQuery.each( keys, function( i, d )
        {
            var subLabel = new Object();
            if( 0 == i )
            {
                subLabel.label = label.slice( 0, d );
                subLabel.isExponent = subLabel.label.match( /\d+/g ) != undefined;
                labelArray.push( subLabel );
                subLabel = new Object();
                subLabel.label = label.slice( d, d + indexHash.get( d ) );
                subLabel.isExponent = subLabel.label.match( /\d+/g ) != undefined;
                labelArray.push( subLabel );
            }
            else
            {
                subLabel.label = label.slice( keys[i - 1] + indexHash.get( keys[i - 1] ), d );
                subLabel.isExponent = subLabel.label.match( /\d+/g ) != undefined;
                labelArray.push( subLabel );
                subLabel = new Object();
                subLabel.label = label.slice( d, d + indexHash.get( d ) );
                subLabel.isExponent = subLabel.label.match( /\d+/g ) != undefined;
                labelArray.push( subLabel );
            }
        } );
        var subLabel = new Object();
        subLabel.label = label.slice( keys[keys.length - 1] + indexHash.get( keys[keys.length - 1] ), label.length );
        subLabel.isExponent = subLabel.label.match( /\d+/g );
        labelArray.push( subLabel );
        return labelArray;
    },

    onClickAxis: function()
    {
        this.zIndex ++;
        this.divAxis.css( {position:"absolute", top:$( "#WPaxisIcone" ).offset().top + 50 + "px", left : $( "#WPaxisIcone" ).offset().left + "px", "zIndex": this.zIndex} );
        this.divAxis.fadeToggle();
        var xDomain = this.getXDomain();
        var xTime = Date.parse( xDomain[0] );
        $( "#xMin" ).val( $.datepicker.formatDate( 'yy-mm-dd', new Date( xTime ) ) );
        var yTime = Date.parse( xDomain[1] );
        $( "#xMax" ).val( $.datepicker.formatDate( 'yy-mm-dd', new Date( yTime ) ) );
        var yDomain = this.getYDomain();
        $( "#yMin" ).val( yDomain[0].toFixed( 5 ) );
        $( "#yMax" ).val( yDomain[1].toFixed( 5 ) );
    },

    onClickUpdateAxis: function()
    {
        var xDomain = [new Date( $( "#xMin" ).val() ), new Date( $( "#xMax" ).val() )];
        var yDomain = [$( "#yMin" ).val(), $( "#yMax" ).val()];
        this.updateXYDomainsWithValues( xDomain, yDomain );
        this.redraw();
        this.divAxis.fadeToggle();
        this.zoomXAvailable = false;
        this.zoomYAvailable = false;
        this.updateZoomXY();
    },

    setYAxisLabelText: function( yAxisLabelText )
    {
        this.yAxisLabelText = yAxisLabelText;
    },


// **************************************************************
// ********************* LINES, POINTS***************************
// **************************************************************
    addOrUpdateLinesAndPoints: function()
    {
        if( !this.displayPlot )
            return;

        var dotRadius = this.dotRadius;
        if( !this.displayPoints )
            dotRadius = 0;

        var seriesData = this.data.map( function( d )
        {
            return d.data
        } );

        var gLines = d3.select( ('g.lines') );
        var lines = gLines.selectAll( '.line' ).data( this.data.filter( function( d )
        {
            return !d.disabled
        } ) );
        var linesEnter = lines.enter().append( 'g' ).attr( 'class', 'line' );

        d3.transition( lines )
                .style( 'stroke-opacity', 1 )
                .style( 'fill-opacity', .5 );
        lines.attr( 'class', function( d, i )
        {
            return 'line line-' + i
        } )
                .classed( 'hover', function( d )
        {
            return d.hover
        } )
                .style( 'fill', jQuery.proxy( function( d, i )
        {
            if( !d.color )
                d.color = this.getFreeColor( i );
            return d.color
        }, this ) )
                .style( 'stroke', jQuery.proxy( function( d, i )
        {
            if( !d.color )
                d.color = this.getFreeColor( i );
            return d.color
        }, this ) )
                .on( 'click', jQuery.proxy( function( d, i )
        {
            this.onClickLine( i, d );
        }, this ) );
        d3.transition( lines.exit() )
                .style( 'stroke-opacity', 1e-6 )
                .style( 'fill-opacity', 1e-6 )
                .remove();

        var paths = lines.selectAll( 'path' )
                .data( function( d, i )
        {
            return [d.data]
        } );
        paths.enter().append( 'path' )
                .attr( 'd', d3.svg.line()
                .defined( function( d )
        {
            return !isNaN( d[1] );
        } )
                .x( jQuery.proxy( function( d )
        {
            return this.x( d[0] )
        }, this ) )
                .y( jQuery.proxy( function( d )
        {
            return this.y( d[1] )
        }, this ) ) );
        paths.exit().remove();

        d3.transition( paths )
                .attr( 'd', d3.svg.line()
                .defined( function( d )
        {
            return !isNaN( d[1] );
        } )
                .interpolate( this.interpolation )
                .x( jQuery.proxy( function( d )
        {
            return this.x( d[0] )
        }, this ) )
                .y( jQuery.proxy( function( d )
        {
            return this.y( d[1] )
        }, this ) ) );

        var points = lines.selectAll( 'circle.point' )
                .data(
                function( d )
                {
                    return d.data
                } );
        points.enter().append( 'circle' )
                .append( "title" )
                .attr( "class", "titleClass" )
                .text( function( d )
        {
            var timeValue = Date.parse( d[0] );
            return $.datepicker.formatDate( 'yy-mm-dd', new Date( timeValue ) ) + ", " + d[1].toFixed( 5 )
        } );
        points.exit().remove();
        points.attr( 'class', function( d, i )
        {
            return 'point point-' + i
        } );

        d3.transition( points )
                .attr( 'cx', jQuery.proxy( function( d )
        {
            return this.x( d[0] )
        }, this ) )
                .attr( 'cy', jQuery.proxy( function( d )
        {
            return this.y( d[1] )
        }, this ) )
                .attr( 'r', function( d )
        {
            if( !isNaN( d[1] ) )
                return dotRadius;
            else
                return 0;
        } );
    },

    onClickLine: function( i, d )
    {
        this.selectedLine = d;
        this.onClickLegendCircle( i );
    },

    removeAllLines: function()
    {
        this.data.splice( 0, this.data.length );
        this.addOrUpdateLinesAndPoints();
        this.createOrUpdateLegend();
    },


// **************************************************************
// ********************** LEGEND ********************************
// **************************************************************
    createOrUpdateLegend : function()
    {
        if( !this.displayPlot )
            return;

        var legendLeft = this.translateGraph.left + 15;
        var gLegends = d3.select( 'g.legends' ).attr( 'transform', 'translate(' + legendLeft + ',' + (this.plotSize.height + this.translateGraph.top + 45) + ')' );

        var legends = gLegends.selectAll( '.legend' ).data( this.data );
        var legendsEnter = legends.enter().append( 'g' ).attr( 'class', 'legend' );

        legendsEnter.append( 'circle' )
                .attr( 'r', 5 )
                .attr( "id", jQuery.proxy( function( d, i )
        {
            return "WPLegendCircle" + i;
        }, this ) );
        legendsEnter.append( 'text' )
                .attr( 'text-anchor', 'start' )
                .attr( 'dy', '.32em' )
                .attr( 'dx', '8' )
                .on( 'click', jQuery.proxy( function( d, i )
        {
            this.onClickLegend( d );
        }, this ) )
                .on( 'dblclick', jQuery.proxy( function( d, i )
        {
            this.onDblClickLegend( d );
        }, this ) );

        legendsEnter.on( 'mouseover', jQuery.proxy( function( d, i )
        {
            this.onMouseOverOrOutLegend( d, true );
        }, this ) )
                .on( 'mouseout', jQuery.proxy( function( d, i )
        {
            this.onMouseOverOrOutLegend( d, false );
        }, this ) );
        legendsEnter.append( "svg:image" )
                .attr( "xlink:href", this.imgPath + "/trash2.svg" )
                .attr( "width", "20" )
                .attr( "height", "20" )
                .attr( "x", "-35" )
                .attr( "y", "-12" )
                .attr( "id", jQuery.proxy( function( d, i )
        {
            return "WPLegendImage" + i;
        }, this ) )
                .attr( "class", "removeLegend" )
                .on( 'click', jQuery.proxy( function( d, i )
        {
            this.onDblClickLegend( d );
        }, this ) );
        legends.exit().remove();

        // Update text when remove legend
        legends.select( 'text' ).text( function( d )
        {
            return d.label
        } );

        // Update color when remove legend
        legends.select( 'circle' )
                .style( 'fill', jQuery.proxy( function( d, i )
        {
            if( d.disabled )
                return "white";
            return d.color || this.getFreeColor( i )
        }, this ) )
                .style( 'stroke', jQuery.proxy( function( d, i )
        {
            return d.color || this.getFreeColor( i )
        }, this ) );
        legends.select( 'text.removeLegend' )
                .style( 'fill', jQuery.proxy( function( d, i )
        {
            return d.color
        }, this ) );

        // Add events on circles only
        var legendsCircles = gLegends.selectAll( '.legend circle' );
        legendsCircles.on( 'click', jQuery.proxy( function( d, i )
        {
            this.selectedLine = d;
            this.onClickLegendCircle( i );
        }, this ) );

        var ypos = 5;
        var xpos = 5;
        legends.attr( 'transform', function( d, i )
        {
            ypos += 20;
            return 'translate(' + xpos + ',' + ypos + ')';
        } )
                .classed( 'disabled', function( d )
        {
            return d.disabled
        } );

        // svg
        var newHeight = this.svgHeight + ypos + 20;
        d3.select( "#" + this.containerId ).select( "svg" )
                .attr( "viewBox", "0 0 " + this.svgWidth + " " + newHeight );
        // graph
        this.container.attr( "style", "height:" + newHeight + "px" );
    },

    onMouseOverOrOutLegend: function( d, isOver )
    {
        d.hover = isOver;
        this.addOrUpdateLinesAndPoints();
    },

    onClickLegend: function( d )
    {
        d.disabled = !d.disabled;

        // If no more data to display, we display all the series
        if( !this.data.filter(
                function( d )
                {
                    return !d.disabled
                } ).length )
        {
            this.data.forEach( function( d )
            {
                d.disabled = false;
            } );
        }

        this.createOrUpdateLegend();
        this.createOrUpdateAxis();
        this.addOrUpdateLinesAndPoints();
    },

    onDblClickLegend: function( d )
    {
        d.hover = true;
        this.data.splice( $.inArray( d, this.data ), 1 );

        this.createOrUpdateLegend();
        this.addOrUpdateLinesAndPoints();
    },

    onClickLegendCircle: function( i )
    {
        if( this.selectedLineIndex == i )
            this.containerColor.fadeToggle();
        else
            this.containerColor.fadeIn();
        if( d3.event )
            this.containerColor.css( {position:"absolute", top:d3.event.pageY + 10 + "px", left : d3.event.pageX + 10 + "px"} );
        this.containerColor.css( { backgroundColor:this.selectedLine.color } );
        this.selectedLineIndex = i;
    },


// **************************************************************
// *********************** DOMAINS ******************************
// **************************************************************
    /**
     * This method update the x and y domains in function of the enable data and the size of the graph
     */
    updateXYDomainsWithValues: function( xDomain, yDomain )
    {
        this.xDomain = xDomain;
        this.yDomain = yDomain;
        this.updateXYDomains();
    },

    updateXYDomains: function()
    {
        var series = this.getEnableDataSeries();
        if( !this.xDomain )
            this.x.domain( d3.extent( d3.merge( series ), function( d )
            {
                return d[0]
            } ) )
                    .range( [0, this.plotSize.width] );
        else
            this.x.domain( this.xDomain ).range( [0, this.plotSize.width] );

        if( !this.yDomain )
            this.y.domain( d3.extent( d3.merge( series ), function( d )
            {
                return d[1]
            } ) )
                    .range( [this.plotSize.height, 0] );
        else
            this.y.domain( this.yDomain ).range( [this.plotSize.height, 0] );

        this.xDomain = this.updateDomainIfUniqueValue( this.xDomain, this.x.domain() );
        this.yDomain = this.updateDomainIfUniqueValue( this.yDomain, this.y.domain() );
    },

    /**
     * This method returns only the series to display (not the disabled ones)
     */
    getEnableDataSeries: function()
    {
        return this.data.filter(
                function( d )
                {
                    return !d.disabled
                } ).map( function( d )
        {
            return d.data;
        } );
    },

    updateDomainIfUniqueValue: function( domain, axisDomain )
    {
        if( !domain && axisDomain[0] == axisDomain[1] )
            return [axisDomain[0] - axisDomain[0] / 2, axisDomain[0] + axisDomain[0] / 2];
        else
            return domain;
    },

    getXDomain: function()
    {
        return this.x.domain();
    },

    getYDomain: function()
    {
        return this.y.domain();
    },


// **************************************************************
// *********************** REDRAW  ******************************
// **************************************************************
    /**
     * This method update (position and resize) the lines and points after a pan or zoom
     */
    redrawAfterPanOrZoom: function()
    {
        this.xDomain = this.x.domain();
        this.yDomain = this.y.domain();
        this.redraw();
    },

    redraw : function()
    {
        var lines = d3.select( '.lines' ).selectAll( '.line' );

        // Update lines
        var paths = lines.selectAll( 'path' );
        paths.attr( 'd', d3.svg.line()
                .defined( function( d )
        {
            return !isNaN( d[1] );
        } )
                .interpolate( this.interpolation )
                .x( jQuery.proxy( function( d )
        {
            return this.x( d[0] )
        }, this ) )
                .y( jQuery.proxy( function( d )
        {
            return this.y( d[1] )
        }, this ) ) );

        // Update points (change radius to 0 to hide points)
        if( this.displayPoints )
        {
            var points = lines.selectAll( 'circle.point' );
            points.attr( 'r', jQuery.proxy( function( d )
            {
                if( !isNaN( d[1] ) )
                    return this.dotRadius;
                else
                    return 0;
            }, this ) )
                    .attr( 'cx', jQuery.proxy( function( d )
            {
                return this.x( d[0] )
            }, this ) )
                    .attr( 'cy', jQuery.proxy( function( d )
            {
                return this.y( d[1] )
            }, this ) );
        }
        else
        {
            var points = lines.selectAll( 'circle.point' );
            points.attr( 'r', 0 );
        }

        // Update colors
        var seriesCircles = d3.selectAll( '.legend circle' );
        seriesCircles.style( 'fill', function( d, i )
        {
            return d.disabled ? "white" : d.color;
        } )
                .style( 'stroke', function( d, i )
        {
            return d.color
        } );
        lines.style( 'fill', function( d, i )
        {
            return d.color
        } )
                .style( 'stroke', function( d, i )
        {
            return d.color
        } );
        var seriesLegendText = d3.selectAll( '.legend text.removeLegend' );
        seriesLegendText.style( 'fill', function( d, i )
        {
            return d.color;
        } );

        this.createOrUpdateAxis();
    },


// **************************************************************
// ************************** ZOOM ******************************
// **************************************************************
    /**
     * This method bind
     *   - standard zoom to mousewheel
     *   - zoom by X axis to shitfKey + mousewheel
     *   - zoom by Y axis to shitfKey + altKey + mousewheel
     * Differents terms for each browser : mousewheel (IE9, Chrome, Safari, Opera), DOMMouseScroll (Firefox), onmousewheel (IE 6/7/8)
     */
    bindZoomsToGraph: function()
    {
        var wheelEventAllBrowsers = "onwheel" in document.createElement( "div" ) ? "wheel" : // Modern browsers support "wheel"
                document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
                        "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

        this.plot.call( d3.behavior.zoom().x( this.x ).y( this.y ).on( "zoom", jQuery.proxy( this.redrawAfterPanOrZoom, this ) ) );

        this.plot.on( "mouseup", jQuery.proxy( function()
        {
//            this.plot.call( d3.behavior.zoom().x( this.x ).y( this.y ).on( "zoom", jQuery.proxy( this.redrawAfterPanOrZoom, this ) ) );
            this.bindZoom();
        }, this ) );

        this.container.on( wheelEventAllBrowsers, jQuery.proxy( function()
        {
            this.bindZoom();
        }, this ) );
    },

    bindZoom: function()
    {
        if( this.zoomXAvailable && this.zoomYAvailable )
            this.plot.call( d3.behavior.zoom().x( this.x ).y( this.y ).on( "zoom", jQuery.proxy( this.redrawAfterPanOrZoom, this ) ) );
        else
        {
            if( this.zoomXAvailable )
                this.plot.call( d3.behavior.zoom().x( this.x ).on( "zoom", jQuery.proxy( this.redrawAfterPanOrZoom, this ) ) );
            else if( this.zoomYAvailable )
                this.plot.call( d3.behavior.zoom().y( this.y ).on( "zoom", jQuery.proxy( this.redrawAfterPanOrZoom, this ) ) );
            else
                this.plot.call( d3.behavior.zoom().y( this.y ).on( "zoom", null ) );
        }
    },

    initZoom: function()
    {
        this.xDomain = false;
        this.yDomain = false;
        this.updateXYDomains();
        this.createOrUpdateAxis();
        this.redraw();
        this.bindZoom();
    },

    updateZoomXY: function()
    {
        if( this.displayIconesMenu )
            this.createOrUpdateIconesMenu();
        if( this.displayContextuelMenu )
            this.createOrUpdateContextMenu();
        this.bindZoom();
    },

    onClickZoomX:function()
    {
        this.zoomXAvailable = !this.zoomXAvailable;
        this.createOrUpdateIconesMenu();
        this.createOrUpdateContextMenu();
        this.bindZoom();
    },

    onClickZoomY:function()
    {
        this.zoomYAvailable = !this.zoomYAvailable;
        this.createOrUpdateIconesMenu();
        this.createOrUpdateContextMenu();
        this.bindZoom();
    },


// **************************************************************
// ************************** KEY *******************************
// **************************************************************
    keydownXY: function()
    {
        switch( d3.event.keyCode )
        {
            case 88:  // x
                this.zoomXAvailable = true;
                this.zoomYAvailable = false;
                this.updateZoomXY();
                break;
            case 89:  // y
                this.zoomYAvailable = true;
                this.zoomXAvailable = false;
                this.updateZoomXY();
                break;
        }
    },

    keyupXY: function()
    {
        this.zoomXAvailable = true;
        this.zoomYAvailable = true;
        this.updateZoomXY();
    },


// **************************************************************
// ************************** MENU ******************************
// **************************************************************
    createOrUpdateContextMenu: function()
    {
        var items = new Array();
        var isMoreLines = (0 < this.data.length);
        if( isMoreLines )
            items.push( { text: "Reset zoom", icon: this.imgPath + "/maximize2.svg", alias:"zoom", action: jQuery.proxy( this.initZoom, this ) } );
        else
            items.push( { text: "Reset zoom", icon: this.imgPath + "/maximize2.svg", disable:true } );
        items.push( { text: "Interpolation", icon: this.imgPath + "/interpolation.svg", alias:"interpolation", action: jQuery.proxy( this.onClickDisplayInterpolation, this ) } );
        if( isMoreLines )
            items.push( { text: "Change axis bounds", icon: this.imgPath + "/axis.svg", alias:"axis", action: jQuery.proxy( this.onClickAxis, this ) } );
        else
            items.push( { text: "Change axis bounds", icon: this.imgPath + "/axis.svg", disable:true } );

        if( !this.zoomYAvailable )
            items.push( { text: "Lock or unlock zoom in on Y", icon: this.imgPath + "/axisY_lock.svg", alias:"axisY", action: jQuery.proxy( this.onClickZoomY, this ) } );
        else
            items.push( { text: "Lock or unlock zoom in on Y", icon: this.imgPath + "/axisY.svg", alias:"axisY", action: jQuery.proxy( this.onClickZoomY, this ) } );
        if( !this.zoomXAvailable )
            items.push( { text: "Lock or unlock zoom in on X", icon: this.imgPath + "/axisX_lock.svg", alias:"axisX", action: jQuery.proxy( this.onClickZoomX, this ) } );
        else
            items.push( { text: "Lock or unlock zoom in on X", icon: this.imgPath + "/axisX.svg", alias:"axisX", action: jQuery.proxy( this.onClickZoomX, this ) } );

        if( isMoreLines )
            if( this.displayPoints )
                items.push( { text: "Hide points", icon: this.imgPath + "/line.svg", alias:"points", action: jQuery.proxy( this.onClickPoint, this ) } );
            else
                items.push( { text: "Display points", icon: this.imgPath + "/points.svg", alias:"points", action: jQuery.proxy( this.onClickPoint, this ) } );
        else
            items.push( { text: "Display points", icon: this.imgPath + "/points.svg", disable:true } );

        items.push( { text: "Export graph", icon: this.imgPath + "/export.svg", alias:"export", action: jQuery.proxy( this.onClickExport, this ) } );
        if( isMoreLines )
            items.push( { text: "Delete line(s)", icon: this.imgPath + "/trash2.svg", alias:"lines", action: jQuery.proxy( this.onClickRemoveLines, this ) } );
        else
            items.push( { text: "Delete line(s)", icon: this.imgPath + "/trash2.svg", disable:true } );

        var option = { width: 230, items: items};

        // Add a title to the menu
        var menuTitleDiv = $( '<div class="WPcontainerTitle WPmenuTitleClose"><div class="WPcontainerTitleText">Menu </div><div class="WPcontainerTitleClose"><img src="' + this.imgPath + '/close.png"></div></div>' );
        this.container.contextmenu( option, "WPrightMenu" + this.containerId, menuTitleDiv, true );
    },

    createOrUpdateIconesMenu: function()
    {
        $( "#WPiconesMenu" ).empty();
        var divMenu;
        if( $( "#WPiconesMenu" )[0] )
            divMenu = $( "#WPiconesMenu" );
        else
        {
            divMenu = $( '<div id="WPiconesMenu"></div>' );
            this.container.append( divMenu );
        }

        if( 0 < this.data.length )
        {
            var divZoom = $( '<div id="WPzoomIcone" class="WPiconeMenu"><img src="' + this.imgPath + '/maximize2.svg" title="Reset zoom"/></div>' );
            divZoom.on( "click", jQuery.proxy( this.initZoom, this ) );
            var divTrash = $( '<div id="WPlineIcone" class="WPiconeMenu"><img src="' + this.imgPath + '/trash2.svg" title="Delete line(s)"/></div>' );
            divTrash.on( "click", jQuery.proxy( this.onClickRemoveLines, this ) );
            if( this.displayPoints )
                var divPoint = $( '<div id="WPpointIcone" class="WPiconeMenu"><img src="' + this.imgPath + '/line.svg" title="Hide points"/></div>' );
            else
                var divPoint = $( '<div id="WPpointIcone" class="WPiconeMenu"><img src="' + this.imgPath + '/points.svg" title="Display points"/></div>' );
            divPoint.on( "click", jQuery.proxy( this.onClickPoint, this ) );
            var divAxis = $( '<div id="WPaxisIcone" class="WPiconeMenu"><img src="' + this.imgPath + '/axis.svg" title="Change axis bounds"/></div>' );
            divAxis.on( "click", jQuery.proxy( this.onClickAxis, this ) );
        }
        else
        {
            var divZoom = $( '<div id="WPzoomIcone" class="WPiconeMenu disabled"><img src="' + this.imgPath + '/maximize2.svg" title="Reset zoom"/></div>' );
            var divTrash = $( '<div id="WPlineIcone" class="WPiconeMenu disabled"><img src="' + this.imgPath + '/trash2.svg" title="Delete line(s)"/></div>' );
            var divPoint = $( '<div id="WPpointIcone" class="WPiconeMenu disabled"><img src="' + this.imgPath + '/points.svg" title="Display points"/></div>' );
            var divAxis = $( '<div id="WPaxisIcone" class="WPiconeMenu disabled"><img src="' + this.imgPath + '/axis.svg" title="Change axis bounds"/></div>' );
        }

        var divInterpolation = $( '<div id="WPinterpolationIcone" class="WPiconeMenu"><img src="' + this.imgPath + '/interpolation.svg" title="Interpolation"/></div>' );
        divInterpolation.on( "click", jQuery.proxy( this.onClickDisplayInterpolation, this ) );
        var divExport = $( '<div id="WPexportIcone" class="WPiconeMenu"><img src="' + this.imgPath + '/export.svg" title="Export graph"/></div>' );
        divExport.on( "click", jQuery.proxy( this.onClickExport, this ) );
        var divXAxis = $( '<div id="WPXaxisImage" class="WPiconeMenu"><img src="' + this.imgPath + '/axisX.svg" title="Lock or unlock zoom in on X"/></div>' );
        if( !this.zoomXAvailable )
            divXAxis = $( '<div id="WPXaxisImage" class="WPiconeMenu"><img src="' + this.imgPath + '/axisX_lock.svg" title="Lock or unlock zoom in on X"/></div>' );
        divXAxis.on( "click", jQuery.proxy( function()
        {
            this.onClickZoomX();
        }, this ) );
        var divYAxis = $( '<div id="WPYaxisImage" class="WPiconeMenu"><img src="' + this.imgPath + '/axisY.svg" title="Lock or unlock zoom in on Y"/></div>' );
        if( !this.zoomYAvailable )
            divYAxis = $( '<div id="WPYaxisImage" class="WPiconeMenu"><img src="' + this.imgPath + '/axisY_lock.svg" title="Lock or unlock zoom in on Y"/></div>' );
        divYAxis.on( "click", jQuery.proxy( function()
        {
            this.onClickZoomY();
        }, this ) );

        divMenu.append( divZoom );
        divMenu.append( divInterpolation );
        divMenu.append( divAxis );
        divMenu.append( divYAxis );
        divMenu.append( divXAxis );
        divMenu.append( divPoint );
        divMenu.append( divExport );
        divMenu.append( divTrash );
    },


// **************************************************************
// ************************** COLOR *****************************
// **************************************************************
    createColorPicker: function()
    {
        this.colorPicker = $.farbtastic( this.containerColorPickerId ).linkTo( jQuery.proxy( this.onClickColorPicker, this ) );
    },

    onClickColorPicker: function()
    {
        this.containerColor.css( { backgroundColor:this.colorPicker.color } );
        if( !this.selectedLine )
            this.selectedLine = this.data[0];
        this.selectedLine.color = this.colorPicker.color;
        var color = this.color;
        color[this.selectedLineIndex] = this.colorPicker.color;
        this.color = color;
        this.redraw();
    },

    getFreeColor: function( i )
    {
        var color = this.color[i % 20];
        if( 20 <= i )
            return color;
        var isColorFree = true;
        jQuery.each( this.data, jQuery.proxy( function( i, element )
        {
            if( element.color == color )
                isColorFree = false;
        }, this ) );
        if( isColorFree )
            return color;
        else
        {
            i++;
            return this.getFreeColor( i );
        }
    },

// **************************************************************
// ************************ INTERPOLATION ***********************
// **************************************************************
    createTreeForInterpolation: function()
    {
        $( "#WPiTree" ).remove();
        // Display default value
//        this.containerInterpolationValue.html( this.interpolation );
        $( "#" + this.containerInterpolationTree ).width( this.interpolationInitWidth );

        var data = this.getDataForInterpolation();
        var variables = {treeId: "WPiTree",
            width:400,
            height:100,
            containerTreeId:this.containerInterpolationTreeContent,
            data:data,
            selectedValue:this.interpolation,
            callbackOnClickValue:jQuery.proxy( this.onClickInterpolation, this ),
            depth:this.treeDepth
        };
        new Tree( variables );
    },

    getDataForInterpolation: function()
    {
        return {"name": "Mode", "children":[
            {"name":"linear"},
            {"name":"basis"},
            {"name":"bundle"},
            {"name":"cardinal"},
            {"name":"step", "children":[
                {"name":"step-before"},
                {"name":"step-after"}
            ]}
        ]};
    },

    onClickDisplayInterpolation: function()
    {
        this.zIndex++;
        $( "#" + this.containerInterpolationTree ).css( {position:"absolute", top:$( "#WPinterpolationIcone" ).offset().top + 50 + "px", left : $( "#WPinterpolationIcone" ).offset().left - 140 + "px", "zIndex":this.zIndex} );
        $( "#" + this.containerInterpolationTree ).fadeToggle();
    },

    resizeDivForTree: function( argument, containerId, treeInitWidth )
    {
        if( argument.children )
            d3.select( "#" + containerId ).transition().style( "width", (treeInitWidth + this.treeDepth * (argument.depth + 1) + 50) + "px" );
        else if( argument._children )
            d3.select( "#" + containerId ).transition().style( "width", (treeInitWidth + argument.depth * (this.treeDepth + 50) + "px" ) );
    },

    onClickInterpolation: function( argument )
    {
        // Adjust container size
        this.resizeDivForTree( argument, this.containerInterpolationTree, this.interpolationInitWidth );
        this.resizeDivForTree( argument, "iTree", this.interpolationInitWidth );

        if( !argument.children && !argument._children )
        {
//            this.containerInterpolationValue.html( argument.name );
            this.interpolation = argument.name;
            this.redraw();
        }
    },


// **************************************************************
// *************************** EXPORT ***************************
// **************************************************************
    onClickExport: function()
    {
        this.zIndex ++;
        $( "#WPExport" ).css( {position:"absolute", top:$( "#WPexportIcone" ).offset().top + 50 + "px", left : $( "#WPexportIcone" ).offset().left - 150 + "px", "zIndex":this.zIndex} );
        $( "#WPExport" ).fadeToggle();
    },

    onClickExportSVG: function()
    {
        this.onClickExportWithParameters( "svg" );
    },

    onClickExportPNG: function()
    {
        this.onClickExportWithParameters( "png" );
    },

    /**
     * The div "WPdivToExportGraph" is needed because we have to put the svg in one parent div to display only the content on this parent.
     *  Without this div, the export add the iconesMenu which is not what we want and which doesn't work !
     * The div "WPdivToCloneToExportGraph" is needed because we have to clone the svg before the export to remove some elements (".removeLegend") and change the style
     * @param value
     */
    onClickExportWithParameters: function( value )
    {
        var context = this[0];
        var value = this[1];

        $( "#WPdivToCloneToExportGraph" ).show();

        $( "#WPdivToCloneToExportGraph" ).empty();
        $( "#WPdivToCloneToExportGraph" ).append( $( "#WPdivToExportGraph svg" ).clone() );
        $( "#WPdivToCloneToExportGraph .removeLegend" ).remove();

        var fontSize = getStyleSheetPropertyValue( "#WPgraphSvg text, #divToGetCss", "fontSize" );
        var fontWeight = getStyleSheetPropertyValue( "#WPgraphSvg text, #divToGetCss", "fontWeight" );
        if( null == fontSize )
            fontSize = "15px";
        if( null == fontWeight )
            fontWeight = "bold";

        // We have to attribute style to graph to export because of the css is not managed
        d3.select( "#WPdivToCloneToExportGraph svg" ).selectAll( "g line" ).attr( "style", "shape-rendering: crispedges; stroke:#000000; stroke-opacity: 0.25" );
        d3.select( "#WPdivToCloneToExportGraph svg" ).selectAll( "path.domain" ).attr( "style", "shape-rendering: crispedges; stroke:#000000; stroke-opacity: 0.75" );
        d3.select( "#WPdivToCloneToExportGraph svg" ).selectAll( "line.zero" ).attr( "style", "shape-rendering: crispedges; stroke:#000000; stroke-opacity: 0.75" );
        d3.select( "#WPdivToCloneToExportGraph svg" ).selectAll( ".lines path" ).attr( "style", "fill:none; stroke-linecap: round; stroke-width: 3.5px" );
        d3.select( "#WPdivToCloneToExportGraph svg" ).selectAll( "text" ).attr( "style", "font-size: " + fontSize + "; font-weight: " + fontWeight + "; font-family: 'Ubuntu',Arial,sans-serif" );
        d3.select( "#WPdivToCloneToExportGraph svg" ).selectAll( "g.y.axis text" ).attr( "style", "text-anchor: end; cursor: ns-resize; stroke: none; font-size: " + fontSize + "; font-weight: " + fontWeight + "; font-family: 'Ubuntu',Arial,sans-serif" );
        d3.select( "#WPdivToCloneToExportGraph svg" ).selectAll( "g.x.axis text" ).attr( "style", "text-anchor: middle; cursor: ns-resize; stroke: none; font-size: " + fontSize + "; font-weight: " + fontWeight + "; font-family: 'Ubuntu',Arial,sans-serif" );
        d3.select( "#WPdivToCloneToExportGraph svg" ).select( "g.y.axis text.axislabel" ).attr( 'x', -context.y.range()[0] / 4 - 45 );

        d3.select( "#WPdivToCloneToExportGraph svg" )
                .attr( "width", $( "#WPdivToExportGraph" ).width() )
                .attr( "height", $( "#WPdivToExportGraph" ).height() );

        // Add logo if necessary
        if( context.imagesToInsertInExport )
        {
            var footerRectWidth = 0;
            var footerRectHeight = 0;
            jQuery.each( context.imagesToInsertInExport.images, function( i, d )
            {
                footerRectWidth += d.width;
                footerRectHeight = Math.max( footerRectHeight, d.height );
            } );
            footerRectWidth += 20 * (context.imagesToInsertInExport.images.length - 1);

            var footerExport = d3.select( "#WPdivToCloneToExportGraph svg" ).append( "g" )
                    .attr( 'transform', 'translate(' + (context.plotSize.width - footerRectWidth + 50) + ',' + (context.plotSize.height + 20 + $( ".legend" ).size() * 20 / 2) + ')' );

            if( context.imagesToInsertInExport.displayBackground )
            {
                footerExport.append( "rect" ).attr( 'class', 'exportFooter' )
                        .attr( "width", footerRectWidth + "px" )
                        .attr( "height", footerRectHeight + "px" );
            }
            var footerExportImages = footerExport.selectAll( "image" ).data( context.imagesToInsertInExport.images );
            footerExportImages.enter().append( "svg:image" ).attr( "xlink:href", function( d )
            {
                return "data:image/jpeg;base64," + d.encodedImage
            } )
                    .attr( "width", function( d )
            {
                return d.width;
            } )
                    .attr( "height", function( d )
            {
                return d.height;
            } )
                    .attr( "x", function( d, i )
            {
                return 0 < i ? context.imagesToInsertInExport.images[i - 1].width + 20 : 0;
            } )
                    .attr( "y", function( d )
            {
                return (footerRectHeight - d.height) / 2;
            } );
        }

        context.submitDownloadForm( value );

        $( "#WPdivToCloneToExportGraph" ).empty();
    },

    /*
     Utility function: populates the <FORM> with the SVG data
     and the requested output format, and submits the form.
     Not ok with an ajax call, because of the size of data too heavy for a post
     */
    submitDownloadForm: function( output_format )
    {
        // Get the d3js SVG element
        var svg = $( "#WPdivToCloneToExportGraph svg" )[0];

        // Extract the data as SVG text string
        var svg_xml = (new XMLSerializer).serializeToString( svg );

        // Submit the <FORM> to the server.
        // The result will be an attachment file to download.
        var form = document.getElementById( "WPsvg-form" );
        form['WPoutput_format'].value = output_format;
        form['WPdata'].value = svg_xml;
        var exportDate = $.datepicker.formatDate( 'yy_mm_dd', new Date() );
        form['WPfileName'].value = "GCA_TimeSeries_" + exportDate + "." + output_format;
        form.submit();
    },


// **************************************************************
// ************* DIVS Color, Interpolation & Export *************
// **************************************************************
    createSimpleBox: function( id, text )
    {
        var div = $( '<div id="' + id + '" class="WPcontainer WPcontainerForOver"></div>' );
        var divTitle = $( '<div class="WPcontainerTitle">' );
        div.append( divTitle );
        divTitle.append( '<div class="WPcontainerTitleText">' + text + '</div>' );
        divTitle.append( '<div class="WPcontainerTitleClose"><img src="' + this.imgPath + '/close.png"></div>' );
        divTitle.append( '</div>' );
        return div;
    },

    /**
     * This method creates the needed div for the colorPicker, the interpolation, the axis and the exports
     * @param divContainer
     * @param title
     */
    createDivsForGraph: function( divContainer, title )
    {
        // Interpolation
        var divInterpolation = this.createSimpleBox( this.containerInterpolationTree, "Interpolation" );
        divInterpolation.append( '<div id="' + this.containerInterpolationTreeContent + '" class="WPcontainerContent"></div>' );
        $( divContainer ).append( divInterpolation );

        // Color
        this.containerColor = this.createSimpleBox( "WPcolor", "Color" );
        this.containerColor.append( '<div id="WPcolorContent" class="WPcontainerContent"><form><input type="text" id="WPcolor" name="color" value="#123456"/></form><div id="WPcolorpicker"></div></div>' );
        $( divContainer ).append( this.containerColor );
        this.containerColor = $( "#WPcolor" );
        this.containerColorPickerId = $( "#WPcolorpicker" );

        // Axis
        this.divAxis = this.createSimpleBox( "WPaxis", "Axis" );
        this.divAxis.append( '<div class="WPcontainerContent"><div class="WPaxisTitle">Date axis</div>Minimum : &nbsp;<input id="xMin" size="9"/><BR/>Maximum : <input id="xMax" size="9"/><BR/>' +
                '<div class="WPaxisTitle">Value axis</div>Minimum : &nbsp;<input id="yMin" size="9"/><BR/>Maximum : <input id="yMax" size="9"/><BR/>' +
                '<div id="axisButtonUpdate">Update Axis</div></div>' );
        $( divContainer ).append( this.divAxis );

        // Export
        var divExport = this.createSimpleBox( "WPExport", "Export" );
        divExport.append( '<div id="WPExportSVG"><img src="' + this.imgPath + '/exportSVG.png"><BR/>Export SVG</div><div id="WPExportPNG"><img src="' + this.imgPath + '/exportPNG.png"><BR/>Export PNG</div><div id="WPExportPDF"><img src="' + this.imgPath + '/exportPDF.png"><BR/>Export PDF</div>' );
        $( divContainer ).append( divExport );

        // Form for export
        var divFormExport = $( '<form id="WPsvg-form" method="post" action="/cgi-bin/export/download.pl"><input type="hidden" name="WPoutput_format"><input type="hidden" name="WPdata"><input type="hidden" name="WPfileName"></form>' );
        $( divContainer ).parent().append( divFormExport );
    },

    bindTools: function()
    {
        // Bind events on tools
        $( ".WPcontainerForOver" ).draggable();
        $( ".WPcontainerTitleClose" ).on( "click", function( elementClicked )
        {
            $( this.parentElement.parentElement ).fadeToggle();
            $( "#" + this.parentElement.parentElement.id + "Tool" ).removeClass( "selected" );
        } );

        $( "#axisButtonUpdate" ).on( "click", jQuery.proxy( function()
        {
            this.onClickUpdateAxis();
        }, this ) );

        $( "#WPExportSVG" ).on( "click", jQuery.proxy( this.onClickExportWithParameters, [this, "svg"] ) );
        $( "#WPExportPNG" ).on( "click", jQuery.proxy( this.onClickExportWithParameters, [this, "png"] ) );
        $( "#WPExportPDF" ).on( "click", jQuery.proxy( this.onClickExportWithParameters, [this, "pdf"] ) );
    }

} );


/*
 String.allIndexOf(searchstring, ignoreCase)
 String [String] - the string to search within for the searchstring
 searchstring [String] - the desired string with which to find starting indexes
 ignoreCase [Boolean] - set to true to make both the string and searchstring case insensitive
 */
(function()
{
    String.prototype.allIndexOf = function( string, ignoreCase )
    {
        if( null === this )
        {
            return [-1];
        }
        var t = (ignoreCase) ? this.toLowerCase() : this,
                s = (ignoreCase) ? string.toString().toLowerCase() : string.toString(),
                i = this.indexOf( s ),
                len = this.length,
                n,
                indx = 0,
                result = [];
        if( i === -1 || 0 === len )
        {
            return [i];
        } // "".indexOf("") is 0
        for( n = 0; n <= len; n++ )
        {
            i = t.indexOf( s, indx );
            if( i !== -1 )
            {
                indx = i + 1;
                result.push( i );
            }
            else
            {
                return result;
            }
        }
        return result;
    }
})();

/**
 * This function returns the width in pixel of a text (different to the text's length).
 * @param text
 */
function getTextWidth( wrapperId, text )
{
    var timeForId = new Date().getTime();
    var divTextToGetWidthId = "WPDivToGetWidth_" + timeForId;
    $( "#" + divTextToGetWidthId ).remove();
    var fontSize = getStyleSheetPropertyValue( "#WPgraphSvg text, #divToGetCss", "fontSize" );
    var fontWeight = getStyleSheetPropertyValue( "#WPgraphSvg text, #divToGetCss", "fontWeight" );
    if( null == fontSize )
        fontSize = "15px";
    if( null == fontWeight )
        fontWeight = "bold";
    var divTextToGetWidth = $( "<span id='" + divTextToGetWidthId + "' style='visibility:hidden; font-size:" + fontSize + ";font-weight:" + fontWeight + ";'>" + text + "</span>" );
    $( "#" + wrapperId ).append( divTextToGetWidth );
    var textWidth = divTextToGetWidth.width();
    $( "#" + divTextToGetWidthId ).remove();
    return textWidth;
}

function getStyleSheetPropertyValue( selectorText, propertyName )
{
    // search backwards because the last match is more likely the right one
    for( var s = document.styleSheets.length - 1; s >= 0; s-- )
    {
        var cssRules = document.styleSheets[s].cssRules ||
                document.styleSheets[s].rules || []; // IE support
        for( var c = 0; c < cssRules.length; c++ )
        {
            if( cssRules[c].selectorText === selectorText )
                return cssRules[c].style[propertyName];
        }
    }
    return null;
}

