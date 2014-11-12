<div id="pageWrapper">
    <div id="leftMenu">
        <div class="leftMenuUp">
            <div id="helpMenu"><img src="img/help_big_orange.png"></div>
            <div class="leftMenuUp">
                <div id="clearAll">Clear selections</div>
            </div>
        </div>
        <div class="leftMenu firstLeftMenu">
            <div id="submitAddToGraph" class="orangeButton">CREATE PLOT</div>
        </div>
        <div class="leftMenu">
            <h2 title="Select a region in the given list. A map helps you by showing the differents regions">
                <img src="img/1step.png">
                REGIONS
            </h2>

            <div>
                <input name="searchRegion" placeholder="Filter..." size="10">
                <button id="btnResetSearchRegion">&times;</button>

                <div id="regionSelect"></div>
            </div>

            <div id="regionMapDiv">
                <div id="regionMap"></div>
            </div>
        </div>

        <div class="leftMenu">
            <h2 title="Choose your period">
                <img src="img/2step.png">
                AVERAGING PERIOD
            </h2>

            <select id="periodSelect"></select>
        </div>

        <div class="leftMenu">
            <h2 title="Select one or several resources in the given list">
                <img src="img/3step.png">
                RESOURCES
            </h2>

            <div>
                <input name="searchResource" placeholder="Filter..." size="10">
                <button id="btnResetSearchResource">&times;</button>

                <div id="resourceSelect"></div>
            </div>
        </div>

        <div id="variables" class="leftMenu">
            <h2 title="Union of the variables available for each selected resources. Pick one, it will automatically display in the graph">
                <img src="img/4step.png">
                VARIABLE
            </h2>

            <div id="variableSelect"></div>
        </div>

        <div class="noticeLSCE leftMenu">
            Realised by <span title="Climate and Environment Sciences Laboratory" style="font-weight:bold;">LSCE</span> &nbsp;&nbsp;&nbsp; v1.2
        </div>

    </div>

    <div id="contentGraph">
        <div id="graph"></div>
        <div id="legends"></div>
    </div>

    <div id="errors" class="container containerForOver">
        <div class="containerTitle">
            <div class="containerTitleText">Warning</div>
            <div id="errorsClose" class="containerTitleClose">X</div>
        </div>
        <div id="contentErrors" class="containerContent"></div>
    </div>

</div>

<script type="text/javascript">

    $( document ).ready( function ()
    {
        // Load properties file
        jQuery.i18n.properties( {
            name:'woodpecker',
            path:'',
            language:null,
            mode:'both'
        } );

        testBrowser();

        var resourcesTreeData = [];
        var resourceList = JSON.parse( jQuery.i18n.prop( "resourceList" ) );
        var resourceValuesList = JSON.parse( jQuery.i18n.prop( "resourceValuesList" ) );
        var selectedResourceList = JSON.parse( jQuery.i18n.prop( "selectedResourceList" ) );
        var resourcePathList = JSON.parse( jQuery.i18n.prop( "resourcePathList" ) );

        addResource( 0 );

        function addElementToTree( element, elementChildren )
        {
            element.children = elementChildren;
            resourcesTreeData.push( element );
            i++;
            if( i >= resourceList.length )
            // The variable regionsTreeData comes from the file regions_categories.js
                new WPInterfaceW( resourcesTreeData, regionsTreeData );
            else
                addResource( i );
        }

        function addResource( i )
        {
            var element = new Object();
            element.title = resourceList[i];
            element.folder = true;
            element.expanded = selectedResourceList[i] ? "false" != selectedResourceList[i] : false;

            var resourcePath = jQuery.i18n.prop( resourcePathList[i] );

            if( resourcePathList[i] && resourceList[i] && resourceValuesList[i] && (selectedResourceList[i] || "boolean" === jQuery.type( selectedResourceList[i] )) && jQuery.i18n.prop( resourcePathList[i] ) )
                $.ajax( {
                    url: "fancyTreeBuildChildren.php",
                    method: "post",
                    dataType: "json",
                    data: {dirtoread: jQuery.i18n.prop( resourcePathList[i] ) , category : resourceValuesList[i] , elementToSelect : selectedResourceList[i]},
                    error: function( arguments )
                    {
                        // WARNING : JSON.parse is not possible because of some space text in .info --> element.children = JSON.parse( data ); is not working !
                        var childrenData = arguments[0].responseText.replace( "[", "" ).replace( "],", "" ).replace( /{/g, "" ).replace( /"/g, '' ).replace( /""/g, '' ).split( "}," );
                        var children = [];
                        $.each( childrenData, function( i, d )
                        {
                            var elementChildren = new Object();
                            var parameters = d.split( ", " );
                            $.each( parameters, function( ii, dd )
                            {
                                var parameter = dd.replace( '"', '' ).split( ":" );
                                elementChildren[parameter[0]] = parameter[1];
                            } );
                            children.push( elementChildren );
                        } );

                        addElementToTree( element, children );
                    },
                    success: function( data )
                    {
                        addElementToTree( element, data );
                    }
                } );
            else
            {
                i++;
                if( i >= resourceList.length )
                // The variable regionsTreeData comes from the file regions_categories.js
                    new WPInterfaceW( resourcesTreeData, regionsTreeData );
                else
                    addResource( i );
            }
        }

    } );

</script>


