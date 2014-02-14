<div id="pageWrapper">
    <div id="leftMenu">
        <div class="leftMenuUp">
            <div id="helpMenu"><img src="img/help_big_orange.png"></div>
            <div class="leftMenuUp">
                <div id="clearAll">Clear all selections</div>
            </div>
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

            <div id="periodSelect">
                <input type="radio" name="period" id="MonthlyPeriod" value="monthlymean" title="Monthly mean" checked="checked"><label for="MonthlyPeriod"><span class="period">Monthly mean</span></label><BR/>
                <input type="radio" name="period" id="YearlyPeriod" value="yearlymean" title="Yearly mean"><label for="YearlyPeriod"><span
                    class="period">Yearly mean</span></label><BR/>
                <input type="radio" name="period" id="GlobalPeriod" value="longterm" title="Global mean"><label for="GlobalPeriod"><span
                    class="period">Global mean</span></label>
            </div>
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

            <div id="variablesBubble">Click on one variable to display in the graph</div>
            <div id="variableSelect"></div>
        </div>

        <div class="noticeLSCE leftMenu">
            Realised by <span title="Climate and Environment Sciences Laboratory" style="font-weight:bold;">LSCE</span> &nbsp;&nbsp;&nbsp; v1.0
        </div>

    </div>

    <div id="contentGraph">
        <div id="graph"></div>
    </div>

    <div id="errors" class="container containerForOver">
        <div class="containerTitle">
            <div class="containerTitleText">Warning</div>
            <div id="errorsClose" class="containerTitleClose">X</div>
        </div>
        <div id="contentErrors" class="containerContent"></div>
    </div>

</div>

<?php

// Load properties for resources file path
$properties = parse_ini_file( "woodpecker.properties" );

// Create resources tree
function fancytree_build_children( $dirtoread, $category, $elementToSelect )
{
    $files = glob( $dirtoread . "*.nc" );
    $len = count( $files );
    $counter = 0;
    echo "\n";
    foreach( $files as $file )
    {
        if( is_file( $file ) )
        {
            $counter++;
            $bfile = basename( $file );
            $pfile = explode( "_", $bfile );
            // $pfile[1] represent the title, character "-" replaced by " "
            $sfile = implode( "_", array_slice( $pfile, 0, 4 ) );
            $fileInfo = explode( '.', $file );
            $fileInfo = $fileInfo[0] . '.info';
            if( file_exists( $fileInfo ) )
            {
                $fileInfoContent = file_get_contents( $fileInfo );
                $fileInfoContent = str_replace( "\n", '<br>', $fileInfoContent );
                $fileInfoContent = str_replace( "Ref :", "<b>Ref :</b>", $fileInfoContent );
                $fileInfoContent = str_replace( "Contact :", "<b>Contact :</b>", $fileInfoContent );
            }
            else
                $fileInfoContent = "Not available";
            // If first element to be selected use next line and set true for elementToSelect argument
            //$selectedElement = $elementToSelect && ($counter == 1) ? true : false;
            // To select a specific element
            $selectedElement = $elementToSelect && strpos( $sfile, $elementToSelect ) ? true : false;
            echo '                    {title:"' . str_replace( "-", " ", $pfile[1] ) . '", key:"' . $sfile . '", selected: "' . $selectedElement . '", icon:false, url:"' . $category . '", complexToolTip:"' . $fileInfoContent . '",}';
            if( $counter != $len )
            {
                echo ',' . "\n";
            }
            else
            {
                // last line without ,
                echo "\n";
            }
        }
    }
    echo "\n";

}

?>

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

        var resourcesTreeData = [
            {title:"Inversions", folder:true, expanded: true,
                children: [
<?php
                        fancytree_build_children( $properties["inversionsResourcesPath"], "Inversions", "MACC-V2" );
                ?>
                ]
            },
            {title:"Land Models", folder:true,
                children: [
<?php
                        fancytree_build_children( $properties["landModelsResourcesPath"], "LandModels", false );
                ?>
                ]
            },
            {title:"Ocean Models", folder:true,
                children: [
<?php
                        fancytree_build_children( $properties["oceanModelsResourcesPath"], "OceanModels", false );
                ?>
                ]
            }
        ];

        var variablesToKeepArray = ["Terrestrial_flux", "Ocean_flux"];
        var variableNamesToKeepArray = ["Terrestrial flux", "Ocean flux"];
        // The variable regionsTreeData comes from the file regions_categories.js
        new WPInterfaceW( resourcesTreeData, regionsTreeData, variablesToKeepArray, variableNamesToKeepArray );
    } );

</script>


