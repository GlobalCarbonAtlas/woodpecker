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
        <small>D3-based reusable chart library for time series</small>
    </h1>
    <div id="link">
        <a target="_blank" href="https://github.com/GlobalCarbonAtlas/woodpecker/tree/master/Woodpecker"><img class="git-icon" src="examples/GitHub-64px.png"></a>
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

<!--<div class="page-header sub">-->
<!--    <h2>Setup in html</h2>-->
<!--</div>-->
<!--<div class="sourcecode highlight">-->
<!--    <pre><code class="html">-->
<!--        <span class="comment">&lt;!-- Load css for styles --&gt;</span>-->
<!--        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span-->
<!--            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span-->
<!--            class="value">"Woodpecker/Tree.css"</span>&gt;-->
<!--        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span-->
<!--            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span-->
<!--            class="value">"Woodpecker/farbtastic/farbtastic.css"</span>&gt;-->
<!--        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span-->
<!--            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span-->
<!--            class="value">"Woodpecker/contextmenu.css"</span>&gt;-->
<!--        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span-->
<!--            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span-->
<!--            class="value">"Woodpecker/d3.css"</span>&gt;-->
<!--        &lt;<span class="tag">link</span> <span class="attr">rel</span>=<span class="value">"stylesheet"</span><span-->
<!--            class="attr">type</span>=<span class="value">"text/css"</span> <span class="attr">href</span>=<span-->
<!--            class="value">"Woodpecker/Woodpecker.css"</span>&gt;-->
<!---->
<!--        <span class="comment">&lt;!-- Load javascript librairies--&gt;</span>-->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span-->
<!--            class="value">"Woodpecker/js_library/jquery-1.9.1.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;-->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span-->
<!--            class="value">"Woodpecker/js_library/jquery.class.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;-->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span-->
<!--            class="value">"Woodpecker/js_library/jquery-ui-1.10.2.custom.min.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;-->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span-->
<!--            class="value">"Woodpecker/js_library/jshashtable-2.1.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;-->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span-->
<!--            class="value">"Woodpecker/d3.v3/d3.v3.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;-->
<!---->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span-->
<!--            class="value">"Woodpecker/Tree.js"</span>&gt;&lt;/<span class="tag">script</span>&gt;-->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span class="value">"Woodpecker/farbtastic/farbtastic.js"</span>&gt;&lt;/<span-->
<!--            class="tag">script</span>&gt;-->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span class="value">"Woodpecker/contextmenu.js"</span>&gt;&lt;/<span-->
<!--            class="tag">script</span>&gt;-->
<!--        &lt;<span class="tag">script</span> <span class="attr">type</span>=<span-->
<!--            class="value">"text/javascript"</span><span class="attr">src</span>=<span class="value">"Woodpecker/Woodpecker.js"</span>&gt;&lt;/<span-->
<!--            class="tag">script</span>&gt;-->
<!--    </code></pre>-->
<!--</div>-->
<BR/>


<!--<h4>Code</h4>-->
<!---->
<!--<div class="sourcecode">-->
<!--        <pre><code class="html javascript">-->
<!--            function generateData()-->
<!--            {-->
<!--            var today = new Date();-->
<!--            var sin = [],-->
<!--            sin2 = [],-->
<!--            cos = [],-->
<!--            cos2 = [],-->
<!--            r1 = Math.random(),-->
<!--            r2 = Math.random(),-->
<!--            r3 = Math.random(),-->
<!--            r4 = Math.random();-->
<!---->
<!--            for( var i = 0; 100 > i; i++ )-->
<!--            {-->
<!--            sin.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r1 * Math.sin( r2 + i / (10 * (r4 + .5) ) )] );-->
<!--            cos.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r2 * Math.cos( r3 + i / (10 * (r3 + .5) ) )] );-->
<!--            sin2.push( [ new Date( today.getTime() + i * 1000 * 60 * 60 * 24 ), r3 * Math.sin( r1 + i / (10 * (r2 + .5) ) )] );-->
<!--            }-->
<!---->
<!--            return [-->
<!--            {-->
<!--            data: sin,-->
<!--            label: "Sine Wave"-->
<!--            },-->
<!--            {-->
<!--            data: cos,-->
<!--            label: "Cosine Wave"-->
<!--            },-->
<!--            {-->
<!--            data: sin2,-->
<!--            label: "Sine2 Wave"-->
<!--            }-->
<!--            ];-->
<!--            }-->
<!---->
<!--            var dataToDisplay = generateData();-->
<!--    <span class="value">-->
<!--    var options = {containerId: "woodpeckerContainer",-->
<!--        height: 200,-->
<!--        xAxisLabelText:'Date',-->
<!--        yAxisLabelText: 'Values',-->
<!--        data:dataToDisplay,-->
<!--        displayContextuelMenu: true,-->
<!--        displayIconesMenu: true,-->
<!--        activeKeys:true};-->
<!---->
<!--    new Woodpecker( options );</span>-->
<!--        </code></pre>-->
<!--</div>-->

<div class="page-header sub">
    <h2>Tips</h2>
</div>

<div class="section">
    <h3># Basic</h3>

    <div>
        <div class="row">
            <div class="col-md-4">
                <h4>Simple Line Chart &nbsp;&nbsp;<a role="button" href="examples/simple.html" class="btn btn-default">view »</a></h4>

                <p>Create simple line chart for getting started.</p>
            </div>
            <div class="col-md-4">
                <h4>Multiple Line Chart &nbsp;&nbsp;<a role="button" href="examples/multiple.html" class="btn btn-default">view »</a></h4>

                <p>Create multiple line chart with multiple data.</p>
            </div>
        </div>
    </div>
</div>

<div class="section">
    <h3># Chart Options</h3>

    <div>
        <div class="row">
            <div class="col-md-4">
                <h4>Chart with points&nbsp;&nbsp;<a role="button" href="examples/points.html" class="btn btn-default">view »</a></h4>

                <p>Create simple line chart with points.</p>
            </div>
            <div class="col-md-4">
                <h4>Icones menu &nbsp;&nbsp;<a role="button" href="examples/iconesMenu.html" class="btn btn-default">view »</a></h4>

                <p>Show icones menu to access to functionalities.</p>
            </div>
            <div class="col-md-4">
                <h4>Contextual menu &nbsp;&nbsp;<a role="button" href="examples/contextualMenu.html" class="btn btn-default">view »</a></h4>

                <p>Add a contextual menu to access to functionalities with the mouse right-click.</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <h4>Interpolation&nbsp;&nbsp;<a role="button" href="examples/interpolation.html" class="btn btn-default">view »</a></h4>

                <p>Init interpolation.</p>
            </div>
            <div class="col-md-4">
                <h4>Axis domains&nbsp;&nbsp;<a role="button" href="examples/domains.html" class="btn btn-default">view »</a></h4>

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
                <h4>Zoom on X axis</h4>

                <p>- by mouse wheel event only on X axis.&nbsp;&nbsp;<a role="button" href="examples/zoomXMouse.html" class="btn btn-default">view »</a></p>

                <p>- by X key only on X axis.&nbsp;&nbsp;<a role="button" href="examples/zoomXKey.html" class="btn btn-default">view »</a></p>
            </div>
            <div class="col-md-4">
                <h4>Zoom on Y axis</h4>

                <p>- by mouse wheel event only on Y axis.&nbsp;&nbsp;<a role="button" href="examples/zoomYMouse.html" class="btn btn-default">view »</a></p>

                <p>- by Y key only on Y axis.&nbsp;&nbsp;<a role="button" href="examples/zoomYKey.html" class="btn btn-default">view »</a></p>
            </div>
            <div class="col-md-4">
                <h4>Interpolation&nbsp;&nbsp;<a role="button" href="examples/interpolationIcone.html" class="btn btn-default">view »</a></h4>

                <p>Change interpolation on live.</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <h4>Hide line&nbsp;&nbsp;<a role="button" href="examples/hide.html" class="btn btn-default">view »</a></h4>

                <p>Hide or display line on live.</p>
            </div>
            <div class="col-md-4">
                <h4>Line color&nbsp;&nbsp;<a role="button" href="examples/color.html" class="btn btn-default">view »</a></h4>

                <p>Change lines color on live.</p>
            </div>
            <div class="col-md-4">
                <h4>Axis domains&nbsp;&nbsp;<a role="button" href="examples/domainsIcone.html" class="btn btn-default">view »</a></h4>

                <p>Change axis domains on live.</p>
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
            }
        ];
    }

    var dataToDisplay = generateData();
    var bob = generateData();


    //  **********************************************************************
    //  ******************************** DEMO ********************************
    //  **********************************************************************
    var defaultMessage = $( '#message' ).html();
    var currentIndex = 0;
    var timer;
    var demos = [
            function ()
            {
                setMessage( 'Remove all lines' );
                graph.removeAllLines();
            },
            function ()
            {
                setMessage( 'Simple line chart' );
                graph.setInterpolation( "linear" );
                graph.setDisplayPoints(false);
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
                setMessage( 'End Demo' );
            },
            function ()
            {
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
        currentIndex = 0;
        timer = setInterval( function()
        {
//            if( currentIndex == demos.length ) currentIndex = 0;
            demos[currentIndex++]();
        }, 2000 );
    }

    function stopDemo()
    {
        clearInterval( timer );
        document.getElementById( 'message' ).innerHTML = defaultMessage;
    }


    //  **********************************************************************
    //  ******************************** GRAPH *******************************
    //  **********************************************************************
    var options = {containerId: "woodpeckerContainer",
        height: 200,
        xAxisLabelText:'Date',
        yAxisLabelText: 'Values',
        data:generateData(),
        displayContextuelMenu: true,
        displayIconesMenu: true,
        activeKeys:true};

    var graph = new Woodpecker( options );
    startDemo();


</script>


</BODY>
</HTML>
