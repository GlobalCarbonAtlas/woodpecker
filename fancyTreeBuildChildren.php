<?php
/*********************************/
/* File to create resources tree */
/*********************************/

$files = glob( $_POST["dirtoread"] . "*.nc" );
$len = count( $files );
$counter = 0;
echo "[";
foreach( $files as $file )
{
    if( is_file( $file ) )
    {
        $counter++;
        $bfile = basename( $file );
        $pfile = explode( "_", $bfile );
        // $pfile[1] represent the title, character "-" replaced by " "
        $sfile = implode( "_", array_slice( $pfile, 0, 4 ) );
        $fileInfo = explode( '.nc', $file );
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
        $selectedElement = $_POST["elementToSelect"] && strpos( $sfile, $_POST["elementToSelect"] ) ? true : false;
        echo '{"title":"' . str_replace( "-", " ", $pfile[1] ) . '", "key":"' . $sfile . '", "selected": "' . $selectedElement . '", "icon":false, "url":"' . $_POST["category"] . '", "complexToolTip":"' . $fileInfoContent . '"}';
        if( $counter != $len )
            echo ',';
        else
            echo "]";
    }
}

?>