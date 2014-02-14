/*
 ##########################################################################

 Patrick.Brockmann@lsce.ipsl.fr for Global Carbon Atlas
 Vanessa.Maigne@ipsl.jussieu.fr      for Global Carbon Atlas

 PLEASE DO NOT COPY OR DISTRIBUTE WITHOUT PERMISSION

 ##########################################################################
 */
var WPInterfaceW = Class.create( {

    initialize: function( resourcesTreeData, regionsTreeData, variablesToKeepArray, variableNamesToKeepArray )
    {

        // Param
        this.containerErrors = $( "#errors" );
        this.containerContentErrors = $( "#contentErrors" );
        this.variable = false;
        this.dataToDisplay = new Array();
        this.graph = false;
        this.displayFirstVariable = true;
        this.isAvailableSubmit = false;

        this.threddsPath = jQuery.i18n.prop( "threddsPath" ) != "[threddsPath]" ? jQuery.i18n.prop( "threddsPath" ) : "Atlas/Flux";
        this.imgPath = "img";

        /**
         * This hash contains :
         *   - key : the region key
         *   - values : [the region name to display, the title of region parent] */
        this.selectedRegionKeys = new Array();
        this.hashRegions = new Hashtable();
        this.fillHash( this.hashRegions, regionsTreeData, false );

        /**
         * This hash contains :
         *   - key : the file name
         *   - values : [the file name to display, the url, the title of resource parent] */
        this.selectedResourceKeys = new Array();
        this.hashResources = new Hashtable();
        this.fillHash( this.hashResources, resourcesTreeData, false );

        /** This hashVariables contains :
         *   - key : the variable name
         *   - values : the name to display */
        this.hashVariables = new Hashtable();
        this.variablesToDisplay = variablesToKeepArray;
        this.variableNamesToDisplay = variableNamesToKeepArray;

        // Keys
        this.isShiftKeyPressed = false;
        this.isCtrlKeyPressed = false;
        $( document ).keydown( jQuery.proxy( function( event )
        {
            this.isShiftKeyPressed = (16 == event.keyCode);
            this.isCtrlKeyPressed = (17 == event.keyCode);
            if( 112 == event.keyCode )
            {
                if( this.help )
                    this.removeHelp();
                else
                    this.createHelp();
            }
        }, this ) );
        $( document ).keyup( jQuery.proxy( function( event )
        {
            this.isShiftKeyPressed = false;
            this.isCtrlKeyPressed = false;
        }, this ) );

        this.createOrUpdateSelectedPeriod();
        this.bindActions();
        this.createRegionSelect( regionsTreeData );
        this.mapregion1 = this.createRegionMap();
        this.createResourceSelect( resourcesTreeData );
    },

    initInterface: function()
    {
        $( "#regionSelect" ).fancytree().init();
        $( "button#btnResetSearchRegion" ).click();
        $( "#MonthlyPeriod" ).click();
        this.createOrUpdateSelectedPeriod();
        $( "#resourceSelect" ).fancytree().init();
        $( "button#btnResetSearchResource" ).click();
    },


// **************************************************************
// ************************* REGIONS ****************************
// **************************************************************
    createRegionSelect: function( regionsTreeData )
    {
        $( "#regionSelect" ).fancytree( {
            extensions: ["filter"],
            checkbox: true,
            selectMode: 3,
            debugLevel: 0,
            autoCollapse: true,
            source: regionsTreeData,
            init: jQuery.proxy( function( event, data )
            {
                var selectedNode = data.tree.getSelectedNodes()[0];
                if( !selectedNode )
                    return;
                this.selectedRegionKeys = [selectedNode.key];
            }, this ),
            select: jQuery.proxy( function( event, data )
            {
                this.onSelectRegion( false, data );
            }, this ),
            activate: function( event, data )
            {
                data.node.setSelected( !data.node.isSelected() );
                data.node.setActive( false );
            },
            expand: jQuery.proxy( function()
            {
                this.activateTitleForRegionMap();
            }, this )
        } );

        // Filter
        var tree = $( "#regionSelect" ).fancytree( "getTree" );
        $( "input[name=searchRegion]" ).keyup(
                function( e )
                {
                    tree.options.filter.mode = "hide";
                    var match = $( this ).val();
                    if( e && e.which === $.ui.keyCode.ESCAPE || "" === $.trim( match ) )
                    {
                        $( "button#btnResetSearchRegion" ).click();
                        return;
                    }
                    // Pass text as filter string (will be matched as substring in the node title)
                    var n = tree.applyFilter( match );
                    $( "button#btnResetSearchRegion" ).attr( "disabled", false );
                } );

        $( "button#btnResetSearchRegion" ).click(
                function( e )
                {
                    $( "input[name=searchRegion]" ).val( "" );
                    tree.clearFilter();
                } ).attr( "disabled", true );

        this.activateTitleForRegionMap();
    },

    activateTitleForRegionMap: function()
    {
        $( ".fancytree-title" ).on( "mouseover", jQuery.proxy( function( d, i )
        {
            var currentregion = d.currentTarget.innerHTML.split( " " )[0];
            if( jQuery.isNumeric( currentregion ) )
            {
                $( "#regionMapDiv" ).show();
                this.updateRegionMap( currentregion );
            }
        }, this ) )
                .on( "mouseout", function( d, i )
        {
            $( "#regionMapDiv" ).hide();
        } )
    },

    onSelectRegion: function( isInit, data )
    {
        if( !isInit )
            this.selectedRegionKeys = $.map( data.tree.getSelectedNodes(), function( node )
            {
                if( !node.folder )
                    return node.key;
            } );
        this.activateTitleForRegionMap();
        this.createVariables();
    },

    createRegionMap: function( region )
    {
        $( "#regionMapDiv" ).show();
        var mapland = new OpenLayers.Layer.WMS(
                "Land mask",
                "http://www.globalcarbonatlas.org:8080/geoserver/GCA/wms",
        {
            VERSION: '1.1.1',
            LAYERS: "GCA:GCA_landMask",
            transparent: true,
            FORMAT: 'image/png'
        }, {
            isBaseLayer: true,
            wrapDateLine: true
        } );

        var mapregion1 = new OpenLayers.Layer.WMS(
                "Region",
                "http://www.globalcarbonatlas.org:8080/thredds/wms/Atlas/Flux/Inversions/yearlymean/regions/regions_mask.nc",
        {
            VERSION: '1.3.0',
            LAYERS: 'mask_region',
            ELEVATION: region,
            NUMCOLORBANDS: 1,
            STYLES: 'boxfill/orange' ,
            COLORSCALERANGE: '1,1',
            TRANSPARENT: 'true',
            ABOVEMAXCOLOR: 'transparent',
            BELOWMINCOLOR: 'transparent',
            FORMAT: 'image/png'
        }, {
            opacity: 0.75
        } );

        var map1 = new OpenLayers.Map( 'regionMap',
        {
            controls: [],         // to remove zoom control (select2 is modal so disable other actions elsewhere)
            projection: new OpenLayers.Projection( "EPSG:3857" ),
            tileSize:  new OpenLayers.Size( 128, 128 )
        } );
        map1.addLayers( [mapland, mapregion1] );
        map1.zoomToMaxExtent();
        $( "#regionMapDiv" ).hide();

        return mapregion1;
    },

    updateRegionMap: function( newregion )
    {
        this.mapregion1.mergeNewParams( { ELEVATION: newregion } );
    },


// **************************************************************
// ************************ PERIODS *****************************
// **************************************************************
    createOrUpdateSelectedPeriod: function()
    {
        this.selectedPeriod = new Object();
        this.selectedPeriod.value = $( "input[name='period']:checked" ).val();
        this.selectedPeriod.title = $( "input[name='period']:checked" )[0].title;
    },

    /**
     * This method manage the difference between the period for resource Inversions and the others
     * For Inversions : period = longterm-2001-2004, and 2001-2004 in the file name
     * For the others : period = longterm-2000-2009, and 2000-2009 in the file name
     * @param resourceKey
     */
    getSelectedPeriodValue: function( resourceKey )
    {
        if( "longterm" == this.selectedPeriod.value )
            if( "Inversions" == resourceKey )
                return "longterm-2001-2004";
            else
                return "longterm-2000-2009";
        else
            return this.selectedPeriod.value;
    },


// **************************************************************
// ************************ RESOURCES ***************************
// **************************************************************
    createResourceSelect: function( resourcesTreeData )
    {
        $( "#resourceSelect" ).fancytree( {
            extensions: ["filter"],
            checkbox: true,
            selectMode: 3,
            debugLevel: 0,
            autoCollapse: true,
            source: resourcesTreeData,
            init: jQuery.proxy( function( event, data )
            {
                var selectedNode = data.tree.getSelectedNodes()[0];
                if( !selectedNode )
                    return;
                this.selectedResourceKeys = [selectedNode.key];
                this.onSelectResource( true, false );
            }, this ),
            select: jQuery.proxy( function( event, data )
            {
                this.onSelectResource( false, data );
            }, this ),
            activate: function( event, data )
            {
                data.node.setSelected( !data.node.isSelected() );
                data.node.setActive( false );
            }
        } );

        // Sort tree
        var node = $( "#resourceSelect" ).fancytree( "getRootNode" );
        node.sortChildren( null, true );

        // Filter
        var tree = $( "#resourceSelect" ).fancytree( "getTree" );
        $( "input[name=searchResource]" ).keyup(
                function( e )
                {
                    tree.options.filter.mode = "hide";
                    var match = $( this ).val();
                    if( e && e.which === $.ui.keyCode.ESCAPE || "" === $.trim( match ) )
                    {
                        $( "button#btnResetSearchResource" ).click();
                        return;
                    }
                    // Pass text as filter string (will be matched as substring in the node title)
                    var n = tree.applyFilter( match );
                    $( "button#btnResetSearchResource" ).attr( "disabled", false );
                } );

        $( "button#btnResetSearchResource" ).click(
                function( e )
                {
                    $( "input[name=searchResource]" ).val( "" );
                    tree.clearFilter();
                } ).attr( "disabled", true );
    },

    onSelectResource: function( isInit, data )
    {
        if( !isInit )
            this.selectedResourceKeys = $.map( data.tree.getSelectedNodes(), function( node )
            {
                if( !node.folder )
                    return node.key;
            } );

        this.createVariables();
    },


// **************************************************************
// ************************ VARIABLES ***************************
// **************************************************************
    createVariables: function()
    {
        $( "#variableSelect" ).html( 'Updating...' );
        $( "#submitAddToGraph" ).addClass( "disabled" );
        this.isAvailableSubmit = false;
        this.hashVariables = new Hashtable();
        this.createAllVariables( 0 );
    },

    /**
     * We take only the first region to get variables because they are the same between each regions
     */
    createAllVariables: function( i )
    {
        if( i < this.selectedResourceKeys.length )
        {
            var selectedPeriod = this.getSelectedPeriodValue( this.hashResources.get( this.selectedResourceKeys[i] )[1] );
            // ajax communication need exact same domain so without 8080 (need a connector for that : AJP JKMount)
            var url = "http://" + location.hostname + "/thredds/wms/" + this.threddsPath + "/" +
                    this.hashResources.get( this.selectedResourceKeys[i] )[1] + "/" + selectedPeriod + "/" +
                    this.selectedResourceKeys[i] + "_" + selectedPeriod + "_XYT.nc" + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities";

            this.getVariables( url, i );
        }
        else
        {
            $( "#variableSelect" ).empty();
            if( 0 == this.hashVariables.keys().length )
            {
                $( "#variableSelect" ).html( 'No variable' );
                $( "#submitAddToGraph" ).addClass( "disabled" );
                this.isAvailableSubmit = false;
                return;
            }

            if( !this.variable )
                this.variable = this.hashVariables.keys()[0];
            this.hashVariables = sortHashTable( this.hashVariables );
            jQuery.each( this.hashVariables.keys(), jQuery.proxy( function( i, d )
            {
                var divVariable = $( '<input type="radio" name="variableRadio" id="' + d + '"><label for="' + d + '"><span class="variable">' + this.hashVariables.get( d ) + '</span></label><BR/>' );
                divVariable.on( "click", jQuery.proxy( function( element )
                {
                    if( "input" != element.currentTarget.localName )
                        return;
                    this.variable = element.currentTarget.id;
                }, this ) );
                $( "#variableSelect" ).append( divVariable );
                if( d == this.variable )
                    divVariable.click();
            }, this ) );

            $( "#submitAddToGraph" ).removeClass( "disabled" );
            this.isAvailableSubmit = true;

            if( this.displayFirstVariable )
            {
                $( "#" + this.hashVariables.keys()[0] ).click();
                this.displayFirstVariable = false;
                $( "#submitAddToGraph" ).click();
            }
        }
    },

    getVariables: function( url, i )
    {
        $.ajax( {
            type: "GET",
            url: url,
            dataType: "xml",
            success: jQuery.proxy( function( xml )
            {
                this.getVariablesSuccess( xml, i );
            }, this ),
            error: jQuery.proxy( function( argument )
            {
                this.getVariablesError( i );
            }, this )
        } );
    },

    getVariablesSuccess: function( data, i )
    {
        $( data ).find( 'Layer' ).each( jQuery.proxy( function( i, element )
        {
            if( '1' == $( element ).attr( 'queryable' ) )
            {
                var nameValue = $( element ).children( "Name" ).text();
                var index = this.variablesToDisplay.indexOf( nameValue );
                if( nameValue && -1 != index )
                    this.hashVariables.put( nameValue, this.variableNamesToDisplay[index] );
            }
        }, this ) );
        this.reduceVariablesByRegionByResource();
        i++;
        this.createAllVariables( i );
    },

    reduceVariablesByRegionByResource: function()
    {
        var hashResult = new Hashtable();
        var selectedParentRegions = new Array();
        jQuery.each( this.selectedRegionKeys, jQuery.proxy( function( i, d )
        {
            if( jQuery.inArray( this.hashRegions.get( d )[1], selectedParentRegions ) == -1 )
                selectedParentRegions.push( this.hashRegions.get( d )[1] );
        }, this ) );
        var selectedParentResources = new Array();
        jQuery.each( this.selectedResourceKeys, jQuery.proxy( function( i, d )
        {
            if( jQuery.inArray( this.hashResources.get( d )[2], selectedParentResources ) == -1 )
                selectedParentResources.push( this.hashResources.get( d )[2] );
        }, this ) );

        jQuery.each( this.hashVariables.keys(), jQuery.proxy( function( i, key )
        {
            if( ("Terrestrial_flux" == key && 0 < $.arrayIntersect( selectedParentRegions, ["Global", "Land + Ocean", "Land", "TransCom"] ).length && 0 < $.arrayIntersect( selectedParentResources, ["Inversions", "Land Models"] ).length)
                    || ("Ocean_flux" == key && 0 < $.arrayIntersect( selectedParentRegions, ["Global", "Land + Ocean", "Ocean"] ).length && 0 < $.arrayIntersect( selectedParentResources, ["Inversions", "Ocean Models"] ).length) )
            {
                var index = this.variablesToDisplay.indexOf( key );
                hashResult.put( key, this.variableNamesToDisplay[index] );
            }
        }, this ) );

        this.hashVariables = new Hashtable();
        this.hashVariables = hashResult;
    },

    getVariablesError: function( i )
    {
        i++;
        this.createAllVariables( i );
    },


// **************************************************************
// *************************** DATA *****************************
// **************************************************************
    /**
     * @param regionIndex : index of regions
     * @param resourceIndex : index of resources
     */
    extractDataFromCSVAndDisplayGraph: function ( regionIndex, resourceIndex )
    {
        if( regionIndex < this.selectedRegionKeys.length )
        {
            if( resourceIndex < this.selectedResourceKeys.length )
            {
                var selectedPeriod = this.getSelectedPeriodValue( this.hashResources.get( this.selectedResourceKeys[resourceIndex] )[1] );

                // ajax communication need exact same domain so without 8080 (need a connector for that : AJP JKMount)
                var request = "http://" + location.hostname + "/thredds/ncss/grid/" + this.threddsPath + "/" +
                        this.hashResources.get( this.selectedResourceKeys[resourceIndex] )[1] + "/" + selectedPeriod + "/" +
                        "regions/region" + this.selectedRegionKeys[regionIndex] + "/" +
                        this.selectedResourceKeys[resourceIndex] + "_" + selectedPeriod + "_region" + this.selectedRegionKeys[regionIndex] + ".nc"
                        + "?var=" + this.variable
                        + "&latitude=0&longitude=0&temporal=all&accept=csv";

                d3.text( request, jQuery.proxy( this.extractDataFromCSV, [this.hashResources.get( this.selectedResourceKeys[resourceIndex] )[0], regionIndex, resourceIndex, this] ) );
            }
            else
            {
                resourceIndex = 0;
                regionIndex++;
                this.extractDataFromCSVAndDisplayGraph( regionIndex, resourceIndex );
            }
        }
        else
        {
            if( !this.graph )
            {
                var options = {containerId: "graph",
                    height: $( "#leftMenu" ).height() * 2 / 3,
                    xAxisLabelText:'Date',
                    yAxisLabelText: this.yLabel,
                    interpolation:$( "#interpolationValue" ).html(),
                    data:this.dataToDisplay,
                    displayContextualMenu: true,
                    displayIconsMenu: true,
                    toolsContainer: "#pageWrapper",
                    activeKeys:true,
                    imagesToInsertInExport:this.getFooterToExport()};

                $( "#graph" ).removeAttr( "style" );
                $( "#graph" ).empty();
                this.graph = new Woodpecker( options );
            }
            else
            {
                this.graph.setData( this.dataToDisplay );
                this.graph.update();
            }
        }
    },

    extractDataFromCSV:function()
    {
        var resourceLabel = this[0];
        var regionIndex = this[1];
        var resourceIndex = this[2];
        var context = this[3];

        // Extract data from csv
        var data = arguments[1];
        if( data )
        {
            var dataArray = d3.csv.parseRows( data );
            // Remove last line to manage NCSS extract                ---> to check
            // dataArray.pop();
            var dateIndex = context.getRowIndex( dataArray[0], "date" );
            var variableIndex = context.getRowIndex( dataArray[0], context.variable );
            var extractedData = context.extractData( dataArray.slice( 1, dataArray.size ), dateIndex, variableIndex );
            var dataToDisplay =
            {
                data:extractedData,
                label: resourceLabel + " / " + context.hashVariables.get( context.variable ) + " / " + context.hashRegions.get( context.selectedRegionKeys[regionIndex] )[0] + " / " + context.selectedPeriod.title,
                shortLabel: resourceLabel + " / " + context.hashVariables.get( context.variable ) + " / " + context.getShortRegionTitle( context.hashRegions.get( context.selectedRegionKeys[regionIndex] )[0] ) + " / " + context.getShortPeriodTitle( context.selectedPeriod.title )
            };
            context.dataToDisplay.push( dataToDisplay );

            context.yLabel = 'Flux (' + dataArray[0][variableIndex].replace( context.variable, "" ).replace( "[unit=\"", "" ).replace( "\"]", "" ) + ')';
            if( context.graph && context.graph.yAxisLabelText != context.yLabel )
            {
                if( 1 >= context.graph.data.length )
                    context.graph.setYAxisLabelText( context.yLabel );
                else
                {
                    context.containerContentErrors.empty();
                    context.containerContentErrors.html( "- Differents units, we display the first one<BR/>" );
                    context.containerErrors.show();
                }
            }
        }
        else
        {
            context.containerContentErrors.empty();
            context.containerContentErrors.html( "- No data for " + resourceLabel + ", " + context.hashVariables.get( context.variable ) + ", " + context.hashRegions.get( context.selectedRegionKeys[regionIndex] )[0] + ", " + context.selectedPeriod.title + "<BR/>" );
            context.containerErrors.show();
        }
        resourceIndex++;
        context.extractDataFromCSVAndDisplayGraph( regionIndex, resourceIndex );
    },

    getRowIndex: function( rowData, stringToFind )
    {
        var result = false;
        jQuery.each( rowData, function( i, data )
        {
            if( data.indexOf( stringToFind ) != -1 )
                result = i;
        } );
        return result;
    },

    extractData: function( dataArray, dateIndex, variableIndex )
    {
        var extractedData = [];
        jQuery.each( dataArray, function( i, data )
        {
            extractedData.push( [new Date( data[dateIndex] ), parseFloat( data[variableIndex] )] );
        } );
        return extractedData;
    },


// **************************************************************
// ************************* HELP *******************************
// **************************************************************
    createHelp: function()
    {
        this.displayElementsForHelp();
        var lastIdForLegend = 0 < $( ".legend" ).size() ? $( ".legend" ).size() - 1 : false;

        var parameters = new Object();

        parameters.helpArray = [
            {linkType:"simple", divToHelpId:"clearAll", text:"Init all the selected fields", marginTop:5, marginLeft:31},
            {linkType:"simple", divToHelpId:"submitAddToGraph", text:"Display the data corresponded to the selected fields in the graph", textLengthByLine:35, marginTop:11, marginLeft:20},
            {linkType:"simple", divToHelpId:"regionSelect", text:"Select a region in the given list. A map helps you by showing the differents regions", textLengthByLine:35, marginTop:8, marginLeft:-40},
            {linkType:"simple", divToHelpId:"periodSelect", text:"Choose your period", textLengthByLine:35, marginTop:8, marginLeft:-40},
            {linkType:"simple", divToHelpId:"resourceSelect", text:"Select one or several resources in the given list", textLengthByLine:30, marginTop:10, marginLeft:-40},
            {linkType:"simple", divToHelpId:"variableSelect", text:"Union of the variables available for each selected resources", textLengthByLine:65, marginTop:6, marginLeft:-60},

            {linkType:"left", divToHelpId:"WPlineIcon", text:"Remove all lines", marginTop:36, marginLeft: 20, stage:9},
            {linkType:"left", divToHelpId:"WPexportIcon", text:"Export your graph",  linkedHelp: ["WPExport"], marginTop:36, marginLeft: 20, stage:8},
            {linkType:"left", divToHelpId:"WPpointIcon", text:"Hide or display data points. Move your mouse over a point to get data value", textLengthByLine:40, marginTop:36, marginLeft: 20, stage:7},
            {linkType:"left", divToHelpId:"WPXaxisImage", text:"Block the pan and zoom on the X axis", marginTop:36, marginLeft: 20, stage:6},
            {linkType:"left", divToHelpId:"WPYaxisImage", text:"Block the pan and zoom on the Y axis", marginTop:36, marginLeft: 20, stage:5},
            {linkType:"left", divToHelpId:"WPaxisIcon", text:"Change your bounds", linkedHelp: ["WPaxis"], marginTop:36, marginLeft: 20, stage:4},
            {linkType:"left", divToHelpId:"WPinterpolationIcon", text:"Change your graph interpolation", linkedHelp: ["WPinterpolationTree"], marginTop:36, marginLeft: 20, stage:3},
            {linkType:"left", divToHelpId:"WPzoomIcon", text:"Initialize your graph with the best zoom and pan you can get", textLengthByLine:30, marginTop:36, marginLeft: 20, stage:1},

            {linkType:"right", divToHelpId:"WPLegendImage" + lastIdForLegend, text:"You can remove a line by clicking on this icon", marginTop:25, marginLeft:5, stage:1},
            {linkType:"right", divToHelpId:"WPLegendCircle" + lastIdForLegend, text:"You can change the color of a line by clicking on this icon or directly on the line in the graph. Then use the color picker", linkedHelp: ["WPcolor"], textLengthByLine:72, marginTop:19, stage:3},

            {linkType:"middle", divToHelpId:"WPcolor", text:"You can change the color of a line by clicking on the circle to select a new color palette. Then use the square to pick a specific gradation", textLengthByLine:25, marginTop:$( "#WPcolor" ).height() - 15, marginLeft:$( "#WPcolor" ).width() / 2, stage:1},
            {linkType:"right", divToHelpId:"WPinterpolationTree", text:"Select a new interpolation. It will automatically update your graph", textLengthByLine:36, marginTop:$( "#WPinterpolationTree" ).height() - 15, marginLeft:$( "#WPinterpolationTree" ).width() / 2, stage:2},
            {linkType:"simple", divToHelpId:"WPaxis", text:"Put the axis bounds you want. This will block zoom and pan at the same time. You can undo these blocks by clicking on the related icons", linkedHelp: ["WPYaxisImage", "WPXaxisImage"], textLengthByLine:38, marginTop:$( "#WPaxis" ).height() / 2 - 50},
            {linkType:"simple", divToHelpId:"WPExport", text:"Choose svg or png to export your graph in a new tab", textLengthByLine:20, marginTop:$( "#WPExport" ).height() / 2}
        ];

        parameters.parentContainerId = "#pageWrapper";
        //parameters.globalMarginTop = -110;
        //parameters.globalMarginLeft = -110;		// TODO: do not handle width resizing

        this.help = new Help( parameters );

        // Remove added elements
        this.help.wrapper.on( "click", jQuery.proxy( function()
        {
            this.hideElementsForHelp();
        }, this ) );

        this.addFooter();
    },

    removeHelp: function()
    {
        this.hideElementsForHelp();
        this.help.remove();
        this.help = false;
    },

    displayElementsForHelp: function()
    {
        this.helpElements = new Object();
        this.helpElements.topPosition = $( "#graph" ).offset().top + $( "#graph" ).height();
        this.helpElements.leftPosition = $( "#graph" ).offset().left + $( "#graph" ).width();
        this.helpElements.isColorDisplay = "none" == $( "#WPcolor" ).css( "display" );
        this.helpElements.isInterpolationDisplay = "none" == $( "#WPinterpolationTree" ).css( "display" );
        this.helpElements.isAxisDisplay = "none" == $( "#WPaxis" ).css( "display" );
        this.helpElements.isExportDisplay = "none" == $( "#WPExport" ).css( "display" );

        // Display color
        if( this.helpElements.isColorDisplay )
        {
            var lastLineIndex = this.dataToDisplay.length - 1;
            this.graph.onClickLine( lastLineIndex, this.dataToDisplay[lastLineIndex] );
            this.graph.containerColor.css( {position:"absolute", top:this.helpElements.topPosition - $( "#WPcolor" ).height() + "px", left : this.helpElements.leftPosition - $( "#WPcolor" ).width() - 50 + "px"} );
        }

        // Display interpolation
        if( this.helpElements.isInterpolationDisplay )
        {
            $( "#WPinterpolationTree" ).show();
            $( "#WPinterpolationTree" ).css( {position:"absolute", top:this.helpElements.topPosition - $( "#WPinterpolationTree" ).height() - 50 + "px", left : $( "#graph" ).offset().left + 10 + "px"} );
        }

        // Display axis
        if( this.helpElements.isAxisDisplay )
        {
            $( "#WPaxis" ).show();
            $( "#WPaxis" ).css( {position:"absolute", top:this.helpElements.topPosition - $( "#WPaxis" ).height() - 20 + "px", left : $( "#graph" ).offset().left + $( "#WPinterpolationTree" ).width() + 20 + "px"} );
        }

        // Display export
        if( this.helpElements.isExportDisplay )
        {
            $( "#WPExport" ).show();
            $( "#WPExport" ).css( {position:"absolute", top:this.helpElements.topPosition - $( "#WPExport" ).height() - 20 + "px", left : $( "#graph" ).offset().left + $( "#WPinterpolationTree" ).width() + $( "#WPaxis" ).width() + 30 + "px"} );
        }
    },

    hideElementsForHelp: function()
    {
        if( this.helpElements.isColorDisplay )
        {
            $( "#WPcolor .WPcontainerTitleClose" ).click();
            this.helpElements.isColorDisplay = false;
        }
        if( this.helpElements.isInterpolationDisplay )
        {
            $( "#WPinterpolationTree" ).hide();
            this.helpElements.isInterpolationDisplay = false;
        }
        if( this.helpElements.isAxisDisplay )
        {
            $( "#WPaxis" ).hide();
            this.helpElements.isAxisDisplay = false;
        }
        if( this.helpElements.isExportDisplay )
        {
            $( "#WPExport" ).hide();
            this.helpElements.isExportDisplay = false;
        }
    },

    addFooter: function()
    {
        var divFooter = $( '<p class="helpFooter"></p>' );
        this.help.wrapper.append( divFooter );

        var divContentFooter = $( '' +
                '<div class="helpFooterContentRight">' +
                '<div class="helpFooterContentFloat">A project realised by</div>' +
                '<div class="helpFooterContentFloat" title="Climate and Environment Sciences Laboratory"><div><img src="' + this.imgPath + '/logo_lsce_small.png"/></div><div><img src="' + this.imgPath + '/logo_LSCE_text_2_small.png"/></div></div>' +
                '</div>' );

        divFooter.append( divContentFooter );
    },


// **************************************************************
// ************************* OTHER ******************************
// **************************************************************
    bindActions: function()
    {
        // Help
        $( "#helpMenu" ).on( "click", jQuery.proxy( function()
        {
            this.createHelp();
        }, this ) );

        $( "input[name='period']" ).on( 'click', jQuery.proxy( function()
        {
            this.createOrUpdateSelectedPeriod();
        }, this ) );

        $( "#submitAddToGraph" ).on( "click", jQuery.proxy( function()
        {
            if( this.isAvailableSubmit )
                this.extractDataFromCSVAndDisplayGraph( 0, 0 );
        }, this ) );

        this.containerErrors.draggable();
        $( "#errorsClose" ).on( "click", function()
        {
            $( "#errors" ).hide();
        } );

        $( "#clearAll" ).on( "click", jQuery.proxy( function()
        {
            this.initInterface();
        }, this ) );
    },

    /**
     * This hash contains :
     *   - key : the value
     *   - values : [the name to display, the url if exist, the name of the parent element]
     */
    fillHash: function( hash, treeData, parentName )
    {
        jQuery.each( treeData, jQuery.proxy( function( i, element )
        {
            if( element.children )
                this.fillHash( hash, element.children, element.title );
            else
            {
                var value = element.url ? [element.title, element.url, parentName] : [element.title, parentName];
                hash.put( element.key, value );
            }
        }, this ) );

        return hash;
    },

    getFooterToExport: function()
    {
        var logoGCA = this.getEncodedImageToExport( this.imgPath + "/GCA_logo_white.png" );
        return {"displayBackground":false,
            "images":[
                {"encodedImage":logoGCA, "width":218, "height":93}
            ]};
    },

    getEncodedImageToExport: function( imagePath )
    {
        var binImage = getBinaryy( imagePath );
        return base64Encode( binImage );
    },

    getShortRegionTitle: function( regionTitle )
    {
        var splitedRegion = regionTitle.split( " " );
        var shortTitle = splitedRegion[0] + " ";
        splitedRegion.shift();
        jQuery.each( splitedRegion, function( i, d )
        {
            shortTitle += d.substring( 0, 1 );
        } );
        return shortTitle;
    },

    getShortPeriodTitle: function( periodTitle )
    {
        var splitedPeriod = periodTitle.split( " " );
        var shortTitle = "";
        jQuery.each( splitedPeriod, function( i, d )
        {
            shortTitle += d.substring( 0, 1 );
        } );
        return shortTitle;
    }


} );
