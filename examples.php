<HTML>
<HEAD>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title>GCA Time Series examples</title>
    <link rel="icon" href="img/globe.png" type="image/png">

    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="examples/styles.css">

    <?php include "Woodpecker/Woodpecker.html" ?>
    <script type="text/javascript" src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</HEAD>

<BODY>


<div class="container">

<div class="page-header title">
    <h1 style="float:left;">Woodpecker
        <small>D3-based reusable chart library for chart (time series by default)</small>
    </h1>
    <div id="link">
        <a target="_blank" href="https://github.com/GlobalCarbonAtlas/WoodpeckerObject"><img class="git-icon" src="examples/GitHub-64px.png"></a>
    </div>
    <div class="clearfix"></div>
</div>

<div id="message">
    <button class="btn btn-primary" onclick="startDemo();" type="button">Start Demo</button>
</div>

<div id="woodpeckerContainer" class="chart"></div>

<div class="page-header sub">
    <h2>Setup in php</h2>
</div>

<div class="sourcecode highlight">
    <pre><code class="html">
        &lt;<span class="tag">?php</span> <span class="attr">include</span> <span class="value">"Woodpecker/Woodpecker.html"</span> <span class="tag">?</span>&gt;
    </code></pre>
</div>

<div class="page-header sub">
    <h2>Setup in html</h2>
</div>
<div class="sourcecode highlight">
    <pre><code class="html">
        <span class="comment">&lt;!-- Load css for styles --&gt;</span>
        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span
            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span
            class="value">"Woodpecker/Tree.css"</span>&gt;
        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span
            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span
            class="value">"Woodpecker/farbtastic/farbtastic.css"</span>&gt;
        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span
            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span
            class="value">"Woodpecker/contextmenu.css"</span>&gt;
        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span
            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span
            class="value">"Woodpecker/d3.css"</span>&gt;
        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span
            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span
            class="value">"Woodpecker/Woodpecker.css"</span>&gt;

        <span class="comment">&lt;!-- Load javascript librairies--&gt;</span>
        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span
            class="value">"Woodpecker/js_library/jquery-1.9.1.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;
        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span
            class="value">"Woodpecker/js_library/jquery.class.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;
        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span
            class="value">"Woodpecker/js_library/jquery-ui-1.10.2.custom.min.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;
        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span
            class="value">"Woodpecker/js_library/jshashtable-2.1.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;
        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span
            class="value">"Woodpecker/d3.v3/d3.v3.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;

        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span
            class="value">"Woodpecker/Tree.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;
        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span class="value">"Woodpecker/farbtastic/farbtastic.js"</span>&gt;&lt;/<span
            class="tag">script</span>&gt;
        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span class="value">"Woodpecker/contextmenu.js"</span>&gt;&lt;/<span
            class="tag">script</span>&gt;
        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span
            class="value">"text/javascript"</span><span class="attr">src</span>=<span class="value">"Woodpecker/Woodpecker.js"</span>&gt;&lt;/<span
            class="tag">script</span>&gt;
    </code></pre>
</div>
<BR/>


<h4>Code</h4>

<div class="sourcecode">
        <pre><code class="html javascript">
            function generateData()
            {
                var today = new Date();
                var sin = [],
                sin2 = [],
                cos = [],
                cos2 = [],
                r1 = Math.random(),
                r2 = Math.random(),
                r3 = Math.random(),
                r4 = Math.random();

                for( var i = 0; 100 > i; i++ )
                {
                    sin.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r1 * Math.sin( r2 + i / (10 * (r4 + .5) ) )] );
                    cos.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r2 * Math.cos( r3 + i / (10 * (r3 + .5) ) )] );
                    sin2.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r3 * Math.sin( r1 + i / (10 * (r2 + .5) ) )] );
                }

                return [
                {
                    data: sin,
                    label: "Sine Wave"
                },
                {
                    data: cos,
                    label: "Cosine Wave"
                },
                {
                    data: sin2,
                    label: "Sine2 Wave"
                }];
            }

            var dataToDisplay = generateData();
    <span class="value">
            var options = {containerId: "woodpeckerContainer",
                height: 200,
                xAxisLabelText:'Date',
                yAxisLabelText: 'Values',
                data:dataToDisplay,
                displayContextualMenu: true,
                displayIconsMenu: true,
                activeKeys:true};

            new Woodpecker( options );</span>
        </code></pre>
</div>

<div class="page-header sub">
    <h2>Tips</h2>
</div>

<div class="section">
    <h3># Basic</h3>

    <div>
        <div class="row">
            <div class="col-md-4">
                <h4><a role="button" href="examples/simple.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Simple Line Chart</h4>

                <p>Create simple line chart for getting started.</p>
            </div>
            <div class="col-md-4">
                <h4><a role="button" href="examples/multiple.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Multiple Line Chart</h4>

                <p>Create multiple line chart with multiple data.</p>
            </div>
            <div class="col-md-4">
                <h4><a role="button" href="examples/linearXAxis.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Linear X axis</h4>

                <p>Create simple line chart with linear X axis.</p>
            </div>
        </div>
    </div>
</div>

<div class="section">
    <h3># Chart Options</h3>

    <div>
        <div class="row">
            <div class="col-md-4">
                <h4><a role="button" href="examples/points.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Chart with points</h4>

                <p>Create simple line chart with points.</p>
            </div>
            <div class="col-md-4">
                <h4><a role="button" href="examples/iconsMenu.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Icons menu</h4>

                <p>Show icons menu to access to functionalities.</p>
            </div>
            <div class="col-md-4">
                <h4><a role="button" href="examples/contextualMenu.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Contextual menu</h4>

                <p>Add a contextual menu to access to functionalities with the mouse right-click.</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <h4><a role="button" href="examples/interpolation.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Interpolation</h4>

                <p>Init interpolation.</p>
            </div>
            <div class="col-md-4">
                <h4><a role="button" href="examples/domains.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Axis domains</h4>

                <p>Init axis domains.</p>
            </div>
        </div>
    </div>
</div>

<div class="section">
    <h3># Interaction</h3>

    <div>
        <div class="row">
            <div class="col-md-4">
                <h4><a role="button" href="examples/hide.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Hide line</h4>

                <p>Hide or display line on live.</p>
            </div>
            <div class="col-md-4">
                <h4><a role="button" href="examples/color.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Line color</h4>

                <p>Change lines color on live.</p>
            </div>
            <div class="col-md-4">
                <h4><a role="button" href="examples/domainsIcon.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Axis domains</h4>

                <p>Change axis domains on live.</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <h4><a role="button" href="examples/interpolationIcon.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Interpolation</h4>

                <p>Change interpolation on live.</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <h4><a role="button" href="examples/zoomMouse.html" class="btn btn-default">view »</a>&nbsp;&nbsp;Zoom</h4>

                <p>Zoom by mouse wheel event on both axis.</p>
            </div>
            <div class="col-md-4">
                <h4>Zoom on X axis</h4>

                <p><a role="button" href="examples/zoomXMouse.html" class="btn btn-default">view »</a>&nbsp;&nbsp;- by mouse wheel event only on X axis.</p>

                <p><a role="button" href="examples/zoomXKey.html" class="btn btn-default">view »</a>&nbsp;&nbsp;- by X key only on X axis.</p>
            </div>
            <div class="col-md-4">
                <h4>Zoom on Y axis</h4>

                <p><a role="button" href="examples/zoomYMouse.html" class="btn btn-default">view »</a>&nbsp;&nbsp;- by mouse wheel event only on Y axis.</p>

                <p><a role="button" href="examples/zoomYKey.html" class="btn btn-default">view »</a>&nbsp;&nbsp;- by Y key only on Y axis.</p>
            </div>
        </div>
    </div>
</div>


<footer>
    <hr>
    <p><a target="_blank" href="http://www.globalcarbonatlas.org/?q=flux_ts">&copy; Global Carbon Atlas 2013</a></p>
</footer>
</div>

<script type="text/javascript">
var today = new Date();

function generateData()
{
    var sin = [],
            sin2 = [],
            cos = [],
            cos2 = [],
            r1 = Math.random(),
            r2 = Math.random(),
            r3 = Math.random(),
            r4 = Math.random();

    for( var i = 0; 100 > i; i++ )
    {
        sin.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r1 * Math.sin( r2 + i / (10 * (r4 + .5) ) )] );
        cos.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r2 * Math.cos( r3 + i / (10 * (r3 + .5) ) )] );
        sin2.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r3 * Math.sin( r1 + i / (10 * (r2 + .5) ) )] );
    }

    return [
        {
            data: sin,
            label: "Sine Wave"
        },
        {
            data: cos,
            label: "Cosine Wave"
        },
        {
            data: sin2,
            label: "Sine2 Wave"
        }
    ];
}

var dataToDisplay = generateData();

//  **********************************************************************
//  ******************************** DEMO ********************************
//  **********************************************************************
function zoom( message, zoomXAvailable, zoomYAvailable, isIn )
{
    setMessage( message );
    graph.setZoomXAvailable( zoomXAvailable );
    graph.setZoomYAvailable( zoomYAvailable );
    var xDomain = graph.getXDomain();
    var yDomain = graph.getYDomain();
    if( isIn )
    {
        var newXDomain = [new Date( xDomain[0].getTime() + stepZoom * 1000 * 60 * 60 * 24 ), new Date( xDomain[1].getTime() - stepZoom * 1000 * 60 * 60 * 24 )];
        var newYDomain = [yDomain[0] + stepZoom * 0.1,yDomain[1] - stepZoom * 0.1];
    }
    else
    {
        var newXDomain = [new Date( xDomain[0].getTime() - stepZoom * 1000 * 60 * 60 * 24 ), new Date( xDomain[1].getTime() + stepZoom * 1000 * 60 * 60 * 24 )];
        var newYDomain = [yDomain[0] - stepZoom * 0.1,yDomain[1] + stepZoom * 0.1];
    }
    if( zoomXAvailable && zoomYAvailable )
        graph.updateXYDomainsWithValues( newXDomain, newYDomain );
    else if( zoomXAvailable )
        graph.updateXYDomainsWithValues( newXDomain, yDomain );
    else
        graph.updateXYDomainsWithValues( xDomain, newYDomain );
    graph.updateZoomXY();
    graph.redraw();
}

var defaultMessage = $( '#message' ).html();
var currentIndex = 0;
var timer;
var stepZoom = 2;
var demos = [
        function ()
        {
            setMessage( 'Remove line 1 : Sine Wave' );
            graph.removeLine( 0 );
        },
        function ()
        {
            setMessage( 'Remove all lines' );
            graph.removeAllLines();
        },
        function ()
        {
            setMessage( 'Simple line chart' );
            graph.setInterpolation( "linear" );
            graph.setDisplayPoints( false );
            graph.setData( [dataToDisplay[0]] );
            graph.update();
        },
        function ()
        {
            setMessage( 'Multiple line chart' );
            graph.addData( dataToDisplay[1] );
            graph.update();
        },
        function ()
        {
            graph.addData( dataToDisplay[2] );
            graph.update();
        },
        function ()
        {
            setMessage( 'Reset zoom' );
            graph.initZoom();
        },
        function ()
        {
            zoom( 'Zoom in', true, true, true );
        },
        function ()
        {
            zoom( 'Zoom in', true, true, true );
        },
        function ()
        {
            zoom( 'Zoom in', true, true, true );
        },
        function ()
        {
            zoom( 'Zoom out', true, true, false );
        },
        function ()
        {
            zoom( 'Zoom out', true, true, false );
        },
        function ()
        {
            zoom( 'Zoom out', true, true, false );
        },
        function ()
        {
            zoom( 'Zoom in on X axis', true, false, true );
        },
        function ()
        {
            zoom( 'Zoom in on X axis', true, false, true );
        },
        function ()
        {
            zoom( 'Zoom in on X axis', true, false, true );
        },
        function ()
        {
            zoom( 'Zoom out on X axis', true, false, false );
        },
        function ()
        {
            zoom( 'Zoom out on X axis', true, false, false );
        },
        function ()
        {
            zoom( 'Zoom out on X axis', true, false, false );
        },
        function ()
        {
            zoom( 'Zoom in on Y axis', false, true, true );
        },
        function ()
        {
            zoom( 'Zoom in on Y axis', false, true, true );
        },
        function ()
        {
            zoom( 'Zoom in on Y axis', false, true, true );
        },
        function ()
        {
            zoom( 'Zoom in on Y axis', false, true, false );
        },
        function ()
        {
            zoom( 'Zoom in on Y axis', false, true, false );
        },
        function ()
        {
            zoom( 'Zoom in on Y axis', false, true, false );
        },
        function ()
        {
            setMessage( 'Change axis domains' );
            graph.updateXYDomainsWithValues( [new Date( today.getTime() + 20 * 1000 * 60 * 60 * 24 ), new Date( today.getTime() + 50 * 1000 * 60 * 60 * 24 )], [0,1] );
            graph.update();
        },
        function ()
        {
            setMessage( 'Reset zoom' );
            graph.initZoom();
        },
        function ()
        {
            setMessage( 'Change line color 2 : Cosine Wave' );
            graph.changeColor( 1, "red" );
        },
        function ()
        {
            setMessage( 'Display points' );
            graph.onClickPoint();
        },
        function ()
        {
            setMessage( 'Hide points' );
            graph.onClickPoint();
        },
        function ()
        {
            setMessage( 'Hide line 2 : Cosine Wave' );
            graph.hideOrDisplayLine( 1 );
        },
        function ()
        {
            setMessage( 'Show line 2 : Cosine Wave' );
            graph.hideOrDisplayLine( 1 );
        },
        function ()
        {
            setMessage( 'Interpolation : bundle' );
            graph.setInterpolation( "bundle" );
            graph.update();
        },
        function ()
        {
            setMessage( 'Interpolation : step-after' );
            graph.setInterpolation( "step-after" );
            graph.update();
        },
        function ()
        {
            setMessage( 'Hide icons menu' );
            graph.setDisplayIconsMenu( false );
            graph.update();
        },
        function ()
        {
            setMessage( 'Show icons menu' );
            graph.setDisplayIconsMenu( true );
            graph.update();
        },
        function ()
        {
            setMessage( 'End Demo' );
            stopDemo();
        }
];

function setMessage( message )
{
    $( "#message" ).html( '<button id="demoMessage" type="button" class="btn btn-default" onclick="stopDemo();" data-toggle="tooltip" data-animation="false" title="Stop Demo" onclick="stopDemo();">' + message + '</button>' );
}

function startDemo()
{
    setMessage( 'Starting Demo..' );
    timer = setInterval( function()
    {
        demos[currentIndex++]();
    }, 1000 );
}

function stopDemo()
{
    graph.init();
    clearInterval( timer );
    currentIndex = 0;
    $( '#message' ).html( defaultMessage );
}


//  **********************************************************************
//  ******************************** GRAPH *******************************
//  **********************************************************************
var options = {containerId: "woodpeckerContainer",
    height: 300,
    xAxisLabelText:'Date',
    yAxisLabelText: 'Values',
    data: jQuery.extend( true, new Array(), dataToDisplay ),
    displayContextualMenu: true,
    displayIconsMenu: true,
    activeKeys:true};

var graph = new Woodpecker( options );
startDemo();

</script>


</BODY>
</HTML>
