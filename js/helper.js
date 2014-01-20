// **************************************************************
// ************************* EXPORT *****************************
// **************************************************************
function getBinaryy( file )
{
    var xhr = new XMLHttpRequest();
    xhr.open( "GET", file, false );
    xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
    xhr.send( null );
    return xhr.responseText;
}

function base64Encode( str )
{
    var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "", i = 0, len = str.length, c1, c2, c3;
    while( i < len )
    {
//        if( !str || !str.charCodeAt )
//            return;

        c1 = str.charCodeAt( i++ ) & 0xff;
        if( i == len )
        {
            out += CHARS.charAt( c1 >> 2 );
            out += CHARS.charAt( (c1 & 0x3) << 4 );
            out += "==";
            break;
        }
        c2 = str.charCodeAt( i++ );
        if( i == len )
        {
            out += CHARS.charAt( c1 >> 2 );
            out += CHARS.charAt( ((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4) );
            out += CHARS.charAt( (c2 & 0xF) << 2 );
            out += "=";
            break;
        }
        c3 = str.charCodeAt( i++ );
        out += CHARS.charAt( c1 >> 2 );
        out += CHARS.charAt( ((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4) );
        out += CHARS.charAt( ((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6) );
        out += CHARS.charAt( c3 & 0x3F );
    }
    return out;
}

// **************************************************************
// ************************* ARRAY ******************************
// **************************************************************
$.arrayIntersect = function( a, b )
{
    return $.grep( a, function( i )
    {
        return $.inArray( i, b ) > -1;
    } );
};


// **************************************************************
// ********************** HASH TABLE ****************************
// **************************************************************
function sortHashTable( hash )
{
    var result = new Hashtable();

    jQuery.each( hash.keys().sort().reverse(), function( i, key )
    {
        result.put( key, hash.get( key ) );
    } );

    return result;
}


// **************************************************************
// ************************* BROWSER ****************************
// **************************************************************
function getUserAgengt()
{
    return navigator.userAgent.toLowerCase();
}

function testBrowser()
{
    var userAgent = getUserAgengt();
    var isChrome = /chrome/.test( userAgent );
    var isFirefox = /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent );
    var isSafari = /safari/.test( userAgent );
    if( !isChrome && !isFirefox && !isSafari )
        alert( "This application was created for Google Chrome, Mozilla Firefox and Safari. If you use another browser some operations may not be working !" );
}

