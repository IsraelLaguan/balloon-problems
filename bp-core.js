bp.balloons = [];
bp.globals = {};
bp.globals.spokenLines = [];
bp.globals.gameStarted = false;
bp.globals.finalVictory = false;
bp.globals.victoryFlag = null; //start out null, use checkVictory when false
bp.globals.startLevelFlag = null; //start out null, turn on false when 'seeking'
bp.globals.mI = 0;
bp.globals.timer = 0;
bp.globals.m = [
    //episode array of mission objects:
    //Z: will create episode builder! avoid having to write this out 20 times!
    //SAMPLE ONLY
    {
        timer: 10, //sec OR -1 = infinite
        //hardTime: false, // hardTime true will end the game if timer = 0
        balloons: 5,
        minPop: 5,  //pop at least this many 
        beaconDist: 15, //throw beacon forward (m), minium 0 = on top of you
        groundCol: [], //1+ ground values, will cycle through them if >1
        skyCol: [],
        fogCol: []
    }

];
bp.globals.score = 0;
bp.globals.nextBeacon = { x: 0, y: 0 }; //active beacon to trigger next level

AFRAME.registerComponent('startup', {
    init: function () {
        console.log("starting up.");
        $("scene").pause();
        $("scene").style.visibility = "hidden";
        //setupAlert();

        // we don't always make it here in time. 
        // this is the bug. 
        //$("shadowlight").setAttribute("light", "castShadow: false");

        setTimeout(
            function () {
                drawFloorTexture("lightgreen", "darkgreen");
                tapPlay();                
            }
        ), 1000;

        //refreshCustomCursor();

        addVRListeners();

        //startCamera();
        //tapBuildMusic();
        //songReady();
        

    }, tick: function (time, delta) {
        //console.log("tick");
        bp.globals.now = new Date().getTime();
        bp.checkBalloonCollisions();
        updateBalloons();
        bp.checkLevel();  //use this when "finding" next level
        bp.checkVictory();
        bp.checkHome();
    }
});

$ = function (id) {
    return document.getElementById(id);
}
$g = function (entity, attr) {
    entity.getAttribute(attr);
}
$s = function (entity, attr, val) {
    entity.setAttribute(attr, val);
}

// ------------------------------------------

var victoryPlayed = false;
bp.checkHome = function () {
    if (!bp.globals.finalVictory) return;
    var cam = $("camera");
    var loc = cam.getAttribute("position");
    if (loc.x < 1 && loc.x > -1 && loc.z < 1 && loc.z > -1) {
        if (!victoryPlayed) {
            console.log("we're home");
            drawTitle("victory.");
            $("maintitle").emit("fadein");
            victoryPlayed = true;
        }
    }
}

function speakLine(inputline) {
    su = new SpeechSynthesisUtterance();
    su.lang = 'en-au';
    su.rate = 1;
    su.pitch = 1.7;
    su.text = inputline;
    speechSynthesis.speak(su);
    setSubTitle(inputline);
}

function trySpeech(say, vol) {
    su = new SpeechSynthesisUtterance();
    su.lang = 'en-us';
    su.rate = 2.6;
    su.pitch = 3.6;
    su.text = say;
    if (vol !== undefined) {
        su.volume = vol;
    }
    speechSynthesis.speak(su);
}

function setSubTitle(chars) {
    drawSubtitle(chars);
    $("subtitle").emit("fadein");
    setTimeout(
        function () {
            $("subtitle").emit("fadeout");
        }, 3000
    );
}

function setTitle(chars) {
    drawTitle(chars);
    $("maintitle").emit("fadein");
    setTimeout(
        function () {
            $("maintitle").emit("fadeout");
        }, 2000
    );   
}

function drawSubtitle(chars) {
    console.log("drawSubtitle:", chars);
    var canvas = $("subtitle-canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(255,255,255,1)";
    context.font = '38px Arial';
    context.textAlign = "center";
    context.fillText(chars, canvas.width/2, 40, canvas.width - 10, 26);
}

function drawTitle(chars) {
    var canvas = $("title-canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    //context.fillStyle = "rgba(55,55,55,0.5)";
    //context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(255,255,255,1)";
    context.font = '72px Arial';
    context.textAlign = "center";
    context.fillText(chars, canvas.width/2, 90);
}

drawProblems = function (inputline) {
    var chars = inputline;
    var canvas = $("problems-canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(255,255,255,1)";
    context.font = '48px Arial';
    context.fillText(chars, 30, 40);
}

drawStart = function (inputline) {
    var chars = inputline;
    var canvas = $("problems-canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(255,255,255,1)";
    context.font = '48px Arial';
    context.fillText(chars, 30, 40);
}


// ------------------------------------------

addVRListeners = function () {
    scene.addEventListener("enter-vr", function () {
        $("dpad").style.visibility = "hidden";
    });
    scene.addEventListener("exit-vr", function () {
        $("dpad").style.visibility = "visible";
    });

}

updateBalloons = function () {
    var m = Math.floor(Math.random() * 10);
    if (tickCount % 1 === 0 && tickCount > 100) { // throttle and start timer 
        //console.log("balloon update tick:", this);
        var l = bp.balloons.length;
        for (i = 0; i < l; i++) {
            var b = bp.balloons[i];
            var e = b.aEntity; // get ahold of the aframe object 
            var p = b.aEntity.getAttribute("position");
            //console.log("i", i, "e", e);
            e.setAttribute("position", {
                x: p.x + b.dx,
                y: p.y + b.dy,
                z: p.z + b.dz,
            });
            var r = b.aEntity.getAttribute("rotation");
            e.setAttribute("rotation", {
                x: r.x + b.drx,
                y: r.y + b.dry,
                z: r.z + b.drz,
            });
        }
    }
}

restartBalloons = function () {
    console.log("restartBalloons");
    var l = bp.balloons.length;
    for (i = 0; i < l; i++) {
        var bo = basicBalloon();
        var b = bp.balloons[i];
        var e = b.aEntity; // get ahold of the aframe object 
        var p = b.aEntity.getAttribute("position");
        e.setAttribute("position", {
            x: bo.x,
            y: bo.y,
            z: bo.z,
        });
        var r = b.aEntity.getAttribute("rotation");
        e.setAttribute("rotation", {
            x: bo.rx,
            y: bo.ry,
            z: bo.rz,
        });
        e.setAttribute("visible", "true");
        var clickSphere = e.querySelector("a-sphere");
        console.log("clickSphere:", i, clickSphere);
        clickSphere.setAttribute("class", "clickable");
        var raycasterEl = AFRAME.scenes[0].querySelector('[raycaster]');
        raycasterEl.components.raycaster.refreshObjects();
        //e.setAttribute("clickable", "true");
    }
}

basicBalloon = function () {
    var bo = {
        x: mr() * 4 - 2,
        y: mr() * 2 + 1,
        z: mr() * 4 - 2,
        rx: 0,
        ry: mr() * 360 - 180,
        rz: 180,
        dx: mr() * 0.002 - 0.001,
        dy: mr() * 0.002 - 0.001,
        dz: mr() * 0.002 - 0.001,
        drx: mr() * 0.1 - 0.05,
        dry: mr() * 0.1 - 0.05,
        drz: mr() * 0.1 - 0.05,
        index: null,
        color: Math.random() * 0xffffff,
        aEntity: null
    }
    return bo;
}

mr = function () {
    return Math.random();
}

pick = function (ary) {
    var i = Math.floor(Math.random() * ary.length);
    //console.log("picked", i, ary[i]);
    return ary[i];
}

makeBalloon = function () {
    index = bp.balloons.length;

    //console.log("balloon init:", this.index);
    var bo = basicBalloon();
    var plist = [0.004, 0.106, 0.158, 0.14, 0.24, 0.236, 0.3, 0.402, 0.3, 0.548, 0.258, 0.648, 0.174, 0.762, 0.097, 0.816, 0.036, 0.852, 0.018, 0.872, 0.008, 0.88, 0.024, 0.884, 0.024, 0.894, 0.002, 0.894];
    var points = [];
    for (var i = 0; i < plist.length; i += 2) {
        points.push(new THREE.Vector2(plist[i], plist[i + 1]));
    }
    var geometry = new THREE.LatheGeometry(points);
    geometry.mergeVertices();
    geometry.computeVertexNormals();

    var colorInt = Math.floor(bo.color);
    var colorHex = colorInt.toString(16);
    console.log("colorHex:", colorHex);

    //material = new THREE.MeshBasicMaterial; 

    var cnv = document.createElement("canvas");
    cnv.width = 100;
    cnv.height = 100;
    var ctx = cnv.getContext("2d");
    /*
                var deg = 90;
                var rad = 2 * Math.PI - deg * Math.PI / 180;
                ctx.rotate(rad);
    */
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    ctx.fillStyle = "#" + colorHex;
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    ctx.font = '88px Arial';
    var ch = pick(emojis);
    ctx.fillText(ch, 1, 80);

    var texture = new THREE.Texture(cnv);
    // scale x2 proportional
    texture.repeat.set(2.5, 2.5);

    var material = new THREE.MeshPhongMaterial({
        specular: 0x555555,
        shininess: 30,
        opacity: 0.86,
        transparent: true,
        map: texture
    });

    // need to flag the map as needing updating.
    material.map.needsUpdate = true;

    var lathe = new THREE.Mesh(geometry, material);

    var scene = document.getElementById('balloonholder');
    var b = document.createElement("a-entity");
    var box = document.createElement("a-box");

    scene.appendChild(b);

    //var bal = document.getElementById('b1');
    lathe.position.y = -.74;
    var sc = 1.6;
    lathe.scale.set(sc, sc, sc);
    b.object3D.add(lathe);
    //b.setAttribute("balloon", "true");
    //b.setAttribute("position", {x: bo.x, y: bo.y, z: bo.z });
    $s(b, "position", { x: bo.x, y: bo.y, z: bo.z });
    b.setAttribute("rotation", { x: bo.xr, y: bo.ry, z: bo.rz });
    b.setAttribute("opacity", 0.5);
    b.setAttribute("shadow", "receive: true");
    b.setAttribute("index", index);
    //b.setAttribute("class", "clickable");
    //b.class = "clickable";

    bo.index = index;
    bo.aEntity = b;
    bp.balloons.push(bo);

}

bp.makeBalloons = function (count) {
    for (b = 0; b < count; b++) {
        makeBalloon();
    }
}

// physics ------------------------------------------

bp.addSpheres = function () {
    var l = bp.balloons.length;

    for (i = 0; i < l; i++) {
        var b = bp.balloons[i];
        var be = b.aEntity;
        var sphere = document.createElement('a-sphere');
        sphere.setAttribute("color", "red");
        //sphere.setAttribute("material", "transparent: true;");
        sphere.setAttribute("opacity", "0.0");
        sphere.setAttribute("segments-width", "8");
        sphere.setAttribute("segments-height", "6");
        sphere.setAttribute("radius", ".5");
        sphere.setAttribute("visible", "false");
        sphere.setAttribute("wireframe", "true");
        sphere.setAttribute("data-index", i);
        sphere.setAttribute("class", "clickable hitSphere");
        be.appendChild(sphere);
    }
}

var tickCount = 0;
bp.checkBalloonCollisions = function () {
    tickCount++;
    if (tickCount % 100 === 0 && tickCount > 100) { // throttle and start timer 
        var l = bp.balloons.length;
        for (i = 0; i < l; i++) {
            var b1 = bp.balloons[i];
            var pos1 = b1.aEntity.getAttribute("position");
            // check b against all other balloons. 
            for (u = 0; u < l; u++) {
                if (u !== i) {
                    var b2 = bp.balloons[u];
                    var pos2 = b2.aEntity.getAttribute("position");

                    //console.log("i:", i, "u:", u);
                    //console.log("pos1:", pos1, "pos2:", pos2);
                    var x1 = pos1.x, x2 = pos2.x,
                        y1 = pos1.y, y2 = pos2.y,
                        z1 = pos1.x, z2 = pos2.z;

                    var s1Radius = .5,
                        s2Radius = .5;

                    // could use THREE.js' sphereInterect() 
                    if (
                        Math.sqrt(
                            Math.pow(
                                (x1 - x2),
                                2) +
                            Math.pow(
                                (y1 - y2),
                                2) +
                            Math.pow(
                                (z1 - z2),
                                2)
                        ) < (s1Radius + s2Radius)) {
                        //do stuff when spheres collide
                        bp.collide(i, u);
                    }

                }
            }
        }
        // checkFloorBounces 
        for (i = 0; i < l; i++) {
            var b1 = bp.balloons[i];
            var pos1 = b1.aEntity.getAttribute("position");
            if (pos1.y < .5) {
                // bounce 
                if (b1.dy < 0) {
                    b1.dy *= -1;
                }
                console.log("floor balloon!");
            }
        }
    }
}

bp.collide = function (i, u) {
    var b1 = bp.balloons[i];
    var b2 = bp.balloons[u];
    var pos1 = b1.aEntity.getAttribute("position");
    var pos2 = b2.aEntity.getAttribute("position");

    //console.log("collided:", i, u);
    var vec = {
        x: pos1.x - pos2.x,
        y: pos1.y - pos2.y,
        z: pos1.z - pos2.z
    }
    var sc = 0.1;

    b1.aEntity.setAttribute("position", {
        x: pos1.x + vec.x * sc,
        y: pos1.y + vec.y * sc,
        z: pos1.z + vec.z * sc
    });

    b2.aEntity.setAttribute("position", {
        x: pos2.x - vec.x * sc,
        y: pos2.y - vec.y * sc,
        z: pos2.z - vec.z * sc
    });
}

//Z: this creates an approachable beacon and gets ready to drop poppable balloons from mission objects
bp.loadLevel = function (mIndex) {

    bp.globals.mI = mIndex;

    var m = bp.globals.m[mIndex];
    if (typeof m !== 'object') {
        console.log('final mission end --------------------- ', m);
        return;
    }
    console.log('loading mission: ', m);

    var cam = document.querySelector("[camera]");
    var loc = cam.getAttribute("position");
    var scene = $('scene');

    //grab newXYs based on beaconDistance

    //create a "random" vector that will charge forward between +/- 45 degrees from straight on            
    var a = 15 - Math.random() * 30; //random angle +/- 45
    var arad = a * Math.PI / 180;
    var xmod = Math.sin(arad),
        ymod = Math.cos(arad); //-1 is due to camera start directionality

    //var newXY = { x: (loc.x + 3 * (1 - Math.random())), y: -1 * (loc.z + m.beaconDist + 2 * Math.random()) };
    var newXY = { x: xmod * m.beaconDist + loc.x, y: loc.z - ymod * m.beaconDist };

    //pass loadLevel one missionobject  

    //bp.lL > create marker to approach at distance inside frustrum
    //take camera position
    //use camera rotation
    //project "forward" using m.beaconDist

    //      > test distance of marker once / sec (see tick() / b-collision)
    //aka start running bp.checkLevel()
    //      > if in range: eliminate marker, pop text, add balloons, start timer, flag victory checks 
    bp.globals.checkLevel = false; //false = searching for level
    bp.globals.timer = m.timer;  //start timer from mission obj
    bp.globals.timerStamp = bp.globals.now; //timer stamp
    bp.globals.nextBeacon = { x: newXY.x, y: newXY.y };  //this should actually use a facing vector!
    //add actual beacon
    var cvar = Math.floor(Math.random() * 120) + 80;
    var col = "rgb(" + cvar + "," + cvar + ", 240)";  //variable shade of blue


    var cyl = document.createElement('a-cylinder');
    var colint = Math.random() * 0xffffff;
    var col = "#" + colint.toString(16);
    col = col.split(".")[0];
    console.log("column color:", col);

    $s(cyl, "src", "#fluting");
    $s(cyl, "segments-height", 4);
    $s(cyl, "radius", .5);
    $s(cyl, "height", 40);
    $s(cyl, "position", { x: newXY.x, y: 0, z: newXY.y });
    $s(cyl, "class", "#beacon");
    $s(cyl, "color", col);
    $s(cyl, "material", "repeat: 10 10;");

    scene.appendChild(cyl);

    sayAnything();

    drawFloorTexture(
        bp.globals.m[mIndex].groundCol1,
        bp.globals.m[mIndex].groundCol2
    );

    // bp.globals.victoryFlag = false;  //resume checkVictory, relocated to levelLaunch

    //Q: should we destroy all previous balloons? clear balloon array?

    //add balloons
    //bp.makeBalloons(m.balloons);
    //bp.addSpheres();

    //      > run victory check 1 / sec, how many balloons left? eg. test miObj.threshold     
    //      > once time elapses OR victory achieved > pop new message

    //      > launch next level (after message) at distance N -- can launch multiple levels? clocks / conditions might getweird?

};

bp.addLevel = function (inObj) {
    //inObj could also be an array, assume order = timer, balloons, etc
    var newObj = {
        timer: 25, //sec OR -1 = infinite
        balloons: 20,
        minPop: 10,  //pop this many to win
        beaconDist: 20, //throw beacon forward (m), minium 0 = on top of you
        groundCol1: [], //1+ ground values, will cycle through them if >1
        groundCol2: [], //1+ ground values, will cycle through them if >1
        skyCol: [],
        fogCol: [],
        groundHt: 0,  //ground height in meters
        isBoss: false
    };
    //iterate over these property tags and copy anything meaningful
    var tags = ["timer", "balloons", "minPop"];
    tags.forEach(
        function (e) {
            if (inObj.hasOwnProperty(e)) {
                newObj[e] = inObj[e];
            }
        }
    );
    var q = 'adding mission: ' + newObj;

    bp.globals.m.push(newObj);
}

sayAnything = function () {
    var i = null;
    var unspoken = false;
    while (unspoken === false) {
        var i = Math.floor(Math.random() * lines.length);
        // console.log("rand i:", i);
        if (bp.globals.spokenLines.indexOf(i) === -1) {
            unspoken = true;
            speakLine(lines[i]);
            bp.globals.spokenLines.push(i);
        }
    }
}

bp.checkVictory = function () {
    //ignore existing victory
    if (tickCount % 20 !== 0) return;
    if (bp.globals.victoryFlag !== false) return;
    if (bp.globals.timer < 0) {
        var q = 'out of time.';
        setTitle(q);

        bp.globals.victoryFlag = null;
        document.querySelectorAll('.clickable.hitSphere').forEach(
            function (el) {
                el.setAttribute('class', 'timeout');
            }
        );
        return;
    }

    //once per sec...or 10 ticks?
    //timer? count down inside object
    var m = bp.globals.m[bp.globals.mI];
    var popped = document.querySelectorAll('.popped').length;

    //we need to clear the popped cache! otherwise condition is auto true
    //could use minPop if not all balloons need to be popped
    if (popped >= m.balloons) {
        var q = "wave defeated.";
        setTitle(q); 
        
        var spareTime = bp.globals.timer + 1; 
        bp.globals.score += spareTime * 100;
        setScore("Score: " + bp.globals.score); 

        bp.globals.victoryFlag = true;
        bp.globals.mI++;

        //clear hitSphere and balloon arrays (A-F entity + 3.JS Geometry)

        var p = document.querySelectorAll('.popped')
        p.forEach(function (o) { o.parentNode.removeChild(o) });

        var hS = document.querySelectorAll('.hitSphere');
        hS.forEach(function (el) { el.parentNode.removeChild(el) });

        var bH = document.querySelector('#balloonholder').childNodes;
        bH.forEach(function (o) { o.parentNode.removeChild(o); });

        if (bp.globals.mI < bp.globals.m.length) {
            bp.loadLevel(bp.globals.mI);
        } else {
            console.log("final victory!");
            speakLine("YOU DID IT! LET'S GO HOME!");
            setTitle("return to origin.");
            bp.globals.finalVictory = true;
        }

    } else {
        var tDelta = bp.globals.now - bp.globals.timerStamp;
        if (tDelta >= 1000) {
            bp.globals.timer--;
            bp.globals.timerStamp = bp.globals.now;
            //console.log("time remaining:" + bp.globals.timer);
            setTitle(bp.globals.timer);
        }

    }

}

bp.checkLevel = function () {
    if (bp.globals.gameStarted === false) return;

    if (tickCount % 20 !== 0) return;
    if (bp.globals.checkLevel !== false) return;

    var cam = document.querySelector("[camera]");
    var loc = cam.getAttribute("position");
    var r = cam.getAttribute("rotation");
    var m, newLoc;

    //distance calculation -- Math.sqrt(x^2 + y^2);
    //use bp.globals.nextBeacon = {x: , y: } to calculate against 
    var bx = bp.globals.nextBeacon.x,
        bz = bp.globals.nextBeacon.y;

    var dist = Math.sqrt(Math.pow((loc.x - bx), 2) + Math.pow((loc.z - bz), 2));
    //1.5 meter "approach" range
    if (dist > 3) {
        // console.log('approaching beacon...', dist);
    } else {
        console.log('beacon!');
        m = bp.globals.m[bp.globals.mI];
        bp.globals.checkLevel = true;

        //if bp.startLevel = true >> launch balloons, due timers, etc
        bp.globals.victoryFlag = false;  //resume checkVictory AND timer count

        //move balloon holder to wherever the camera is!
        newLoc = {
            x: loc.x,
            y: loc.y - 1.6,
            z: loc.z - 2
        };
        document.querySelector('#balloonholder').setAttribute('position', newLoc);
        //add balloons
        bp.makeBalloons(m.balloons);
        bp.addSpheres();

    }
}

// walkernoise floor 
function drawFloorTexture(color1, color2) {
    var groundResolution = 512;
    var texMeters = 2;
    var groundCanvas = document.getElementById("floortex");
    var groundctx = groundCanvas.getContext('2d');
    drawTexture(
        groundctx,
        groundResolution,
        texMeters,
        color1,
        color2
    );
    document.getElementById("floor").setAttribute("src", "#floortex");
    document.getElementById("floor").removeAttribute("color");
}

AFRAME.registerComponent('custom-cursor', {
    schema: {
        property: { default: 'scale' },
        dur: { default: '500' },
        to: { default: '2 2 2' },
        raycasterEls: { default: [] }
    },

    multiple: false,

    init: function () {
        const data = this.data;
        this.el.children[0].addEventListener('animationend', this.animationend);
    },

    animationend: function (evt) {
        const data = this.data;
        this.data.raycasterEls = this.el.sceneEl.querySelector('#cursor').components.raycaster.intersectedEls;
        console.log('cursor animation end event ');
        console.log(data.raycasterEls);
        var len = data.raycasterEls.length;
        for (var x = 0; x < len; x++) {
            var rex = data.raycasterEls[x];
            if (rex.states[0] === 'cursor-hovered') {
                gazeAtBalloon(rex);
            }
        };
    },
});

gazeAtBalloon = function (rex) {
    rex.emit('click');
    console.log("cursor click");

    var isBalloon = rex.attributes["data-index"] !== undefined;
    if (isBalloon) {
        trySpeech("pew");
    } else {
        trySpeech("cic", 0.1);
        if (rex.id === "type-problems") {
            clickStart();
        }
    }

    setTimeout(function () {
        var index = null;
        console.log("d-i:", rex.attributes["data-index"]);
        if (isBalloon) {
            index = rex.getAttribute("data-index");
            popBalloon(index);

        } else {
            console.log("non-balloon click:", rex);

        };
    }, 400); // must hold gaze for one half second 
}

clickStart = function () {
    if (bp.globals.gameStarted !== true) {
        bp.globals.gameStarted = true;
        console.log("start button click!");
        setTitle("begin.");
        clearTimeout(logoTimeout);
        vrStart();
    }
}

vrStart = function () {
    var lh = $("logoholder");
    lh.emit("zoomout");
    setTimeout(
        function () {
            lh.parentNode.removeChild(lh);
            sayAnything();
        }, 3000
    );
}

popBalloon = function (index) {
    index = parseInt(index);
    var bal = bp.balloons[index].aEntity;
    bal.setAttribute("visible", "false");
    bal.setAttribute("class", "popped");
    var raycasterEl = AFRAME.scenes[0].querySelector('[raycaster]');
    raycasterEl.components.raycaster.refreshObjects();
    trySpeech("op!");
    sceneFX("brightness(180%) saturate(500%)", 0.1);
}

sceneFX = function (filter, dur) {
    $("scene").style.filter = filter;
    setTimeout(
        function () {
            $("scene").style.filter = "none";
        }, dur * 1000
    );
}

setScore = function (quote) {
    setSubTitle(quote);
}

refreshCustomCursor = function () {
    var cursor = document.getElementById("cursor");
    cursor.setAttribute("raycaster", "objects: .clickable; recursive: true;");
    var raycasterEl = AFRAME.scenes[0].querySelector('[raycaster]');
    console.log("raycasterEl", raycasterEl);
    raycasterEl.components.raycaster.refreshObjects();
}

//---------------------------------------------------

playLogo = function () {
    var lh = $("logoholder");
    lh.emit("zoomin");
    drawProblems("P  R  O  B  L  E  M  S");
    logoTimeout = setInterval(
        function () {
            glitchProblems();
        }, 100
    );
}

glitchLetters = [
    "⬔", "⭅", "⬚", "ℜ", "ℍ", "𝕌", "𝓦", "⌁", "⌡"
];

glitchProblems = function () {
    // we're bring called 10 times a second. mostly we do nothing. 
    // we roll 1d10. if it comes up 10, we go through each of 
    // the real letters. 
    // there are always 8. 

    var basic = "PROBLEMS";
    var ba = basic.split("");
    var bl = basic.length;

    var roll = Math.floor(mr() * bl);
    if (roll === 1) {
        //console.log("glitch chance");
        for (i = 0; i < bl; i++) { // go through each letter 
            var roll2 = Math.floor(mr() * bl);
            if (roll2 === 1) { // if it's 1 in 8 
                ba[i] = pick(glitchLetters);
            }
        }
    }
    var bs = ba.join("  ");
    drawProblems(bs);
}


//----------------------------------------------------------------------------
// Demo program section
//----------------------------------------------------------------------------


var soundboxAudio = 0;
playAudio = function () {
    soundboxAudio.currentTime = 0;
    //soundboxAudio.play();
}

tapPlay = function () {
    trySpeech('e', 0.2);

    //$("sky").setAttribute("material-grid-glitch", "enabled: true");
    $("billboard").setAttribute("material-grid-glitch", "enabled: true");

    //bp.makeBalloons(17); //z: side effects? integrate with data function

    //add a bunch of levels quickly:
    for (var i = 0; i < 3; i++) {
        bp.addLevel({
            timer: (12 + i * 4),
            balloons: (i * 2 + 3),
            beaconDist: (i * 2 + 10)
        });
    }
    bp.globals.m[0].groundCol1 = "lightgreen";
    bp.globals.m[0].groundCol2 = "darkgreen";
    bp.globals.m[1].groundCol1 = "green";
    bp.globals.m[1].groundCol2 = "blue";
    bp.globals.m[2].groundCol1 = "red";
    bp.globals.m[2].groundCol2 = "purple";
    bp.globals.m[3].groundCol1 = "lightgray";
    bp.globals.m[3].groundCol2 = "darkgray";

    bp.loadLevel(0);
    //bp.addSpheres();     //z: relocated inside loadLevel
    $("scene").style.visibility = "visible";
    $("scene").play();

    //z: launch e1m1 here!

    playLogo();
    copyButton(); // copy svg area to button canvas 
}

copyButton = function () {
    var svg = $("button-svg");
    var canvas = $("button-canvas");
    var img = new Image();

    // get svg data
    var xml = new XMLSerializer().serializeToString(svg);

    // make it base64
    var svg64 = btoa(xml);
    var b64Start = 'data:image/svg+xml;base64,';

    // prepend a "header"
    var image64 = b64Start + svg64;
    //console.log(image64);

    // set it as the source of the img element
    img.onload = function () {
        canvas.getContext('2d').drawImage(img, 0, 0);
    }
    img.src = image64;

    img.width = 512;
    img.height = 128;

    // draw the image onto the canvas
    //var problems = $("problems-canvas"); 

    //$("start-button").src = img;

}