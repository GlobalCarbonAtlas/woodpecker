/*
 ##########################################################################
 Vanessa.Maigne@ipsl.jussieu.fr      for Global Carbon Atlas

 PLEASE DO NOT COPY OR DISTRIBUTE WITHOUT PERMISSION

 ##########################################################################
 This class create a help in superposition of the body.

It takes as argument an array of fields to set the helps :

 - linkType : the nature of the svg link. 5 choices :
 - simple : a horizontal line from left to right. the text is display at the right of the line.
 - simpleLeft : a horizontal line from right to left. the text is display at the left of the line.
 - right : a corner from top left to bottom right. The text is display at the right of the end point.
 - left : a corner from top right to bottom left. The text is display at the left of the end point.
 - middle : a vertical line from top to bottom. The text is display below this line. The end point is near the middle of the text.
 For each link, we draw two circles at the begin and end points.

 - divToHelpId : the id of the div we want to help. Each div MUST HAVE an id to create the corresponded help.
 - text : the text we want to display for the help. This one will be splited if there's a field textLengthByLine.
 - textLengthByLine : the number of char by line we want to display. No entire word will be cuted, the line feed will respect the content.
 - marginTop : a gap to move the help from top.
 - marginLeft : a gap to move the help from left.
 - linkedHelp: the array of other helps wich could depend or launch the actual help. The array must content the id of these other helps.
 - stage : this field is useful for the 3 linkTypes : left, right and middle. It gives the height of the vertical line we need to display before create the corner.

 Example :
 var parameters = new Object();
 parameters.helpArray = [
 {linkType:"left", divToHelpId:"WPaxisIcone", text:"Change your bounds", linkedHelp: ["WPaxis"], marginTop:36, marginLeft: 20, stage:4},
 {linkType:"simple", divToHelpId:"WPaxis", text:"Put the axis bounds you want.", linkedHelp: ["WPYaxisImage", "WPXaxisImage"], textLengthByLine:38, marginTop:$( "#WPaxis" ).height() / 2 - 50},
 {linkType:"left", divToHelpId:"WPpointIcone", text:"Hide or display data points. Move your mouse over a point to get data value", textLengthByLine:40, marginTop:36, marginLeft: 20, stage:7},
 {linkType:"right", divToHelpId:"WPXaxisImage", text:"Block the pan and zoom on the X axis", marginTop:36, marginLeft: 20, stage:6},
 {linkType:"right", divToHelpId:"WPYaxisImage", text:"Block the pan and zoom on the Y axis", marginTop:36, marginLeft: 20, stage:5},
 ];
 var help = new Help( parameters );
 */

var Help = Class.create( {
    initialize: function( parameters )
    {
        // Parameters
        this.helpArray = parameters.helpArray;
	this.parentContainerId = parameters.parentContainerId ? parameters.parentContainerId : "body";
	this.globalMarginTop = parameters.globalMarginTop ? parameters.globalMarginTop : 0;
        this.globalMarginLeft = parameters.globalMarginLeft ? parameters.globalMarginLeft : 0;

        // Variables
        this.timeForId = new Date().getTime();
        this.wrapper = this.createWrapper();
        this.rightStage = 1;
        this.leftStage = 1;
        this.middleStage = 1;
        this.number = 0;
        this.circleRadius = 5;
        this.heightPath = 30;
        this.textGap = 10;
	this.fontSize = "14px";

        // Update wrapper size
        this.wrapper.height( Math.max( this.wrapper.height(), $( this.parentContainerId ).height() ) );
        this.wrapper.width( Math.max( this.wrapper.width(), $( this.parentContainerId ).width() ) );
/*        window.onscroll = jQuery.proxy( function( event )
        {
            if( "none" != this.wrapper.css( "display" ) )
            {
                this.wrapper.height( Math.max( this.wrapper.height(), $( document ).height() ) );
                this.wrapper.width( Math.max( this.wrapper.width(), $( document ).width() ) );
            }
        }, this );
*/
        // Bind wrapper
        this.wrapper.on( "click", jQuery.proxy( function()
        {
            this.remove();
        }, this ) );

        this.create();
    },

    remove: function()
    {
        this.wrapper.slideToggle( function()
        {
            $( this ).remove();
        } );
    },

    /**
     * This function creates the main div with the maxIndex and opacity
     */
    createWrapper: function()
    {
        var wrapperId = "helpWrapper_" + this.timeForId;
        this.maxIndex = this.getMaxIndex() + 1;
        var wrapperDiv = $( '<div id="' + wrapperId + '" style="' +
            'background: none repeat scroll 0 0 rgba(0, 0, 0, 0.7);' +
            'position: absolute; display: none; z-index: ' + this.maxIndex +
            '"></div>' );
        $( this.parentContainerId ).append( wrapperDiv );
        return wrapperDiv;
    },

    createTitle: function()
    {
        var titleDiv = $( '<div style="color:#CCCCCC; font:bold; font-size:50px; text-align:center; margin-top:25px;"> HELP </div>' );
        this.wrapper.append( titleDiv );
    },

    /**
     * This function create for each element the div help in function of the help to div (width, height, position, text, ...)
     */
    create: function()
    {
        this.wrapper.slideToggle();
        this.createTitle();

        jQuery.each( this.helpArray, jQuery.proxy( function( i, element )
        {
            // Div to help
            var divToHelp = $( "#" + element.divToHelpId );
            if( !divToHelp.offset() )
                return;
            var positions = this.findPosition( divToHelp );
            var divTop = positions.posY;
            var divLeft = positions.posX;
            var divToHelpWidth = divToHelp.width();

            // Help div
            var textArray = this.getTextsArray( element.text, element.textLengthByLine );
            var textMaxWidth = this.getMaxWidthForTexts( textArray );
            var simpleLinkWidth = element.linkLength ? element.linkLength : 50;
            var complexLinkWidth = element.linkLength ? element.linkLength : 40;
            var svgWidth = textMaxWidth + this.textGap + this.circleRadius * 4 + 20;
            var svgHeight = textArray.length * 20;

            switch( element.linkType )
            {
                case "simple" :
                    svgWidth += simpleLinkWidth;
                    divLeft += divToHelpWidth - 10;
                    var x1 = 5;
                    var y1 = 5;
                    var x2 = x1 + simpleLinkWidth;
                    var y2 = y1;
                    var dValue = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
                    break;
                case "simpleLeft" :
                    svgWidth += simpleLinkWidth;
                    divLeft -= svgWidth;
                    var x1 = textMaxWidth + this.textGap;
                    var y1 = 5;
                    var x2 = x1 + simpleLinkWidth;
                    var y2 = y1;
                    var dValue = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
                    break;
                case "left" :
                    svgWidth += complexLinkWidth;
                    divLeft -= svgWidth;
                    var stage = element.stage ? element.stage : this.leftStage;
                    this.leftStage++;
                    var x1 = svgWidth - 5;
                    var y1 = 5;
                    var x2 = x1 - complexLinkWidth;
                    var y2 = y1 + this.heightPath * stage;
                    var dValue = "M" + x1 + "," + y1 + "L" + x1 + "," + y2 + "L" + x2 + "," + y2;
                    svgHeight += y2 + this.circleRadius * 2;
                    break;
                case "right" :
                    svgWidth += complexLinkWidth;// + this.circleRadius * 2;
                    var stage = element.stage ? element.stage : this.rightStage;
                    this.rightStage++;
                    var x1 = 5;
                    var y1 = 5;
                    var x2 = x1 + complexLinkWidth;
                    var y2 = y1 + this.heightPath * stage;
                    var dValue = "M" + x1 + "," + y1 + "L" + x1 + "," + y2 + "L" + x2 + "," + y2;
                    svgHeight += y2 + this.circleRadius * 2;
                    break;
                case "middle" :
                    divLeft -= svgWidth / 2;
                    var stage = element.stage ? element.stage : this.middleStage;
                    this.middleStage++;
                    var x1 = svgWidth / 2 - 5;
                    var y1 = 5;
                    var x2 = x1;
                    var y2 = y1 + this.heightPath * stage;
                    var dValue = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
                    svgHeight += y2 + this.circleRadius * 2;
                    break;
            }

            var helpId = this.createDivHelp( element, divTop, divLeft );
	    svgWidth += 20;
            this.addSvgAndText( helpId, element, textArray, x1, y1, x2, y2, dValue, svgWidth, svgHeight );

        }, this ) );
    },

    /**
     * This function create the help div in function of the positions of the div to help
     * @param element
     * @param divTop
     * @param divLeft
     */
    createDivHelp: function( element, divTop, divLeft )
    {
        if( element.marginTop )
            divTop += element.marginTop;
        if( element.marginLeft )
            divLeft += element.marginLeft;

	divTop += this.globalMarginTop;
        divLeft += this.globalMarginLeft;

        var helpId = "help_" + this.timeForId + "_" + this.number;
        this.number++;
        var helpDiv = $( "<div id='" + helpId + "' name='" + element.divToHelpId + "'></div>" ).css( {position:"absolute", top:divTop + "px", left:divLeft + "px" } );
        this.wrapper.append( helpDiv );

        return helpId;
    },

    /**
     * This function add the svg elements :
     *   - path and circle to create a link between the div to help and the comment's help
     * @param helpId
     * @param element
     * @param x1, y1 : position of the svg first element (first circle and begin of the path)
     * @param x2, y2 : position of the svg last element (second circle and end of the path)
     * @param dValue : definition of the svg path
     * @param linkWidth : width of the link. Depends on the direction (right, left, simple, middle)
     * @param svgHeight : height of the svg. Depends on the number of lines
     */
    addSvgAndText: function( helpId, element, textArray, x1, y1, x2, y2, dValue, svgWidth, svgHeight )
    {
        var helpSvg = d3.select( "#" + helpId )
            .append( 'svg' )
            .attr( "height", svgHeight )
            .attr( "width", svgWidth );
        helpSvg.append( 'path' )
            .style( "fill", "none" )
            .style( "stroke", "#CCCCCC" )
            .style( "stroke-width", "1.5px" )
            .attr( "d", dValue );
        helpSvg.append( "circle" )
            .style( 'fill', "white" )
            .attr( "cx", x1 )
            .attr( "cy", y1 )
            .attr( "r", this.circleRadius );
        helpSvg.append( "circle" )
            .style( 'fill', "white" )
            .attr( "cx", x2 )
            .attr( "cy", y2 )
            .attr( "r", this.circleRadius );

        // Add a small "i" in the circle to inform linkedHelp
        if( element.linkedHelp )
        {
            var xx = "simpleLeft" != element.linkType ? x2 - 2 : x1 - 2;
            var yy = "simpleLeft" != element.linkType ? y2 + 3 : y2 + 3;
            helpSvg.append( "text" )
                .style( 'fill', "black" )
                .style( 'font-size', "9px" )
                .style( 'font-weight', "bold" )
                .attr( "class", "helpInfo" )
                .attr( 'x', xx )
                .attr( 'y', yy )
                .text( "i" );
        }

        jQuery.each( textArray, jQuery.proxy( function( linesNumber, text )
        {
            var color = "white";
            var helpSvgText = helpSvg.append( 'text' )
                .style( "fill", color )
                .style( 'font-size', this.fontSize )
                .text( text );

            switch( element.linkType )
            {
                case "simple":
                    helpSvgText.attr( 'x', x2 + this.textGap )
                        .attr( 'y', y2 + 5 + 15 * linesNumber );
                    break;
                case "simpleLeft":
                    helpSvgText.attr( "text-anchor", "end" )
                        .attr( 'x', x1 - this.textGap )
                        .attr( 'y', y1 + 5 + 15 * linesNumber );
                    break;
                case "left":
                    helpSvgText.attr( "text-anchor", "end" )
                        .attr( 'x', x2 - this.textGap )
                        .attr( 'y', y2 + 3 + 15 * linesNumber );
                    break;
                case "right":
                    helpSvgText.attr( 'x', x2 + this.textGap )
                        .attr( 'y', y2 + 3 + 15 * linesNumber );
                    break;
                case "middle" :
                    helpSvgText.attr( 'x', 0 )
                        .attr( 'y', y2 + 20 + 20 * linesNumber );
                    break;
            }
        }, this ) );

        // Highlight the children helps
        this.highlightHelps( helpSvg, element );
    },

    /**
     * This method hightlight the helps and the related children if they are by changing the opacity and the index
     * @param helpSvg
     * @param element
     */
    highlightHelps: function( helpSvg, element )
    {
        helpSvg.on( "mouseover", jQuery.proxy( function()
        {
            element.style = $( "#" + element.divToHelpId ).attr( "style" );
            this.hightlightHelp( element.divToHelpId, this.maxIndex + 4 );

            if( element.linkedHelp )
            {
                jQuery.each( element.linkedHelp, jQuery.proxy( function( i, link )
                {
                    element.styleChildren = new Array();
                    element.styleChildren[i] = $( "#" + link ).attr( "style" );

                    this.hightlightHelp( link, this.maxIndex + 4 );
                }, this ) );
            }
        }, this ) );

        helpSvg.on( "mouseout", jQuery.proxy( function()
        {
            this.turnOffHelp( element.divToHelpId, element.style );

            if( element.linkedHelp )
            {
                jQuery.each( element.linkedHelp, jQuery.proxy( function( i, link )
                {
                    this.turnOffHelp( link, element.styleChildren[i] );
                }, this ) );
            }
        }, this ) );
    },

    hightlightHelp: function( divToHelpId, index )
    {
        if( "absolute" != $( "#" + divToHelpId ).css( "position" ) )
            $( "#" + divToHelpId ).css( {"opacity":1, "z-index":index, "position":"relative"} );
        else
            $( "#" + divToHelpId ).css( {"opacity":1, "z-index":index} );
        if( 0 < $( "#" + divToHelpId ).children( "img" ).size() )
            $( "#" + divToHelpId ).css( {"background-color":"white"} );

        d3.selectAll( "div[name=" + divToHelpId + "]" ).selectAll( "text" ).style( "fill", "#faa62e" );
        d3.selectAll( "div[name=" + divToHelpId + "]" ).selectAll( "circle" ).style( "fill", "#faa62e" );
        d3.selectAll( "div[name=" + divToHelpId + "]" ).selectAll( "path" ).style( "stroke", "#faa62e" );
    },

    turnOffHelp: function( divToHelpId, style )
    {
        if( style )
            $( "#" + divToHelpId ).attr( "style", style );
        else
            $( "#" + divToHelpId ).attr( "style", "" );

        d3.selectAll( "div[name=" + divToHelpId + "]" ).selectAll( "text" ).style( "fill", "white" );
        d3.selectAll( "div[name=" + divToHelpId + "]" ).selectAll( "text.helpInfo" ).style( "fill", "black" );
        d3.selectAll( "div[name=" + divToHelpId + "]" ).selectAll( "circle" ).style( "fill", "white" );
        d3.selectAll( "div[name=" + divToHelpId + "]" ).selectAll( "path" ).style( "stroke", "white" );
    },

    /**
     * This function returns the div to help.
     *   - If it's a simple DOM element like a div or a span, the identifiant is enough.
     *   - Otherwise, if it's a svg element, we looks for the last one.
     * @param element
     */
//    getDiv: function( element )
//    {
//        DOM element
//        if( element.divToHelpId )
//            return $( "#" + element.divToHelpId );
//        else
//        {
//            SVG element
//            var numberSameElement = $( "." + element.class ).length;
//            return $( $( "." + element.class + " " + element.tag )[numberSameElement - 1] );
//        }
//    },

    /**
     * This function returns the absolute positions of an element.
     * If it's an image, be sure this one is full loaded !
     * @param div
     */
    findPosition: function( div )
    {
        var posX = div.offset().left;
        var posY = div.offset().top;
        return { posX:posX, posY:posY };
    },

    /**
     * This function returns the width in pixel of a text (different to the text's length).
     * @param text
     */
    getTextWidth: function( text )
    {
        var divTextToGetWidthId = "helpWrapperToGetWidth_" + this.timeForId;
        $( "#" + divTextToGetWidthId ).remove();
        var divTextToGetWidth = $( "<span id='" + divTextToGetWidthId + "' style='visibility:hidden; font-size:" + this.fontSize + ";'>" + text + "</span>" );
        this.wrapper.append( divTextToGetWidth );
        return divTextToGetWidth.width();
    },

    /**
     * This function returns the max width of the texts of the array
     * @param textArray
     */
    getMaxWidthForTexts: function( textArray )
    {
        var result = 0;
        jQuery.each( textArray, jQuery.proxy( function( i, element )
        {
            var textWidth = this.getTextWidth( element );
            result = Math.max( result, textWidth );
        }, this ) );
        return result;
    },

    /**
     * This function returns the shortest substring with the given length and complete words
     * @param text
     * @param length
     */
    getCompleteSubText: function( text, length )
    {
        // TODO : do it with a regular expression ?
//        return text.replace( /^(.{length}[^\s]*).*/, "$1" );

        var strLength = text.length;
        var shortenedStr = text.substr( 0, length );
        var lastSpace = shortenedStr.lastIndexOf( " " );

        // If the last word is cut, we go back until the last space
        if( length < strLength && " " != text.substr( length, 1 ) )
            shortenedStr = text.substr( 0, lastSpace );

        return shortenedStr;
    },

    /**
     * This function returns the array of splited text depends of the number of char by line
     * @param text
     * @param length
     */
    getTextsArray: function( text, length )
    {
        var textArray = new Array();
        var index = 0;
        var subText = this.getCompleteSubText( text, length );
        while( subText )
        {
            textArray.push( subText );
            index += subText.length;
            var newText = text.substring( index, text.length );
            subText = this.getCompleteSubText( newText, length );
        }
        return textArray;
    },

    /**
     * This function returns the max index of all elements in the document
     */
    getMaxIndex: function()
    {
        var index = 0;
        $( "*" ).each( function( i, e )
        {
            var elementIndex = $( e ).css( "z-index" );
            index = $.isNumeric( elementIndex ) ? Math.max( index, elementIndex ) : index;
        } );
        return index;
    }

} );

