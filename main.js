var groups = []; // Make it a 2d array
var locks = []; // col or row and number and layer

var layerSettings = [
    {
        "fill": red, 
        "zIndex": 0
    },
    {   
        "fill": green, 
        "zIndex": 1
    }
];

function applyLayerSettings(module, layerIdx){
    let options = layerSettings[layerIdx];
    Object.keys(options).forEach((option) => {
        module.style[option] = options[option];
    });
}

// Object.keys(arr)

// Refactor into grid system

// top color should be global
// Maybe just add a grid class instead

function generateRandomCombination(){
    let combination = _.sample(combinations);
    let combo = _.sample(combination, 2).map((i) => modules[i]);
    return [combo[0].cloneNode(true), combo[1].cloneNode(true)];
}

class Group {

    constructor(col, row, topCol, botCol, topIdx, bottomIdx) {
        this.modules = [];        
        this.modules[0] = modules[bottomIdx].cloneNode(true);
        this.modules[1] = modules[topIdx].cloneNode(true);
        this.col = col;
        this.row = row;
        this.topColor = topCol;
        this.bottomColor = botCol;
    }

    set bottomColor(newColor){ 
        this.modules[0].style.fill = newColor;    
    }

    set topColor(newColor){
        this.modules[1].style.fill = newColor;
    }

    set col(newCol){
       // console.log("set col");
        this.modules.forEach((m) => m.style.left = leftOffset + (newCol * cw) + "px" ); 
    }

    set row(newRow){
        this.modules.forEach((m) => m.style.top = (newRow * ch) + "px" );
    } 
}

function setupCompartments(){
    for (var i = 0; i < cols * rows; i++) {
        comparments.push([]);
    }
}

function loaded(){
    console.log("Loaded elements");
    setup();
    layout();
}

function setup(){
    locks = [];
    for (var j = 0; j < 2; j++){
        groups.push([]);
        locks.push([]);
        
        for (var i = 0; i < allRows * allCols; i++){
            groups[j].push([]);
            locks[j].push([]);
        }
    }
}

function layoutModule(m, i, layerIdx){
    var c = (i % allCols);
    var r = (i - c) / allCols;
    c -= xOff;
    r -= yOff;
    m.style.left = leftOffset + cw * c + "px";
    m.style.top = ch * r + "px";

    // todo
    //applyLayerSettings(m, i);
} 

// Should create them in memory with the css classes?
function layout() {
    // 3 times rows 3 times cols
    var cm = 3;
    var rm = 3;

        for (var i = 0; i < allCols * allRows; i++) {
            var c = (i % allCols);
            var r = (i - c) / allCols;
            c -= xOff;
            r -= yOff;
            console.log(r);
            // Just create the modules directly
            // modules[bottomIdx].cloneNode(true);
            // this.modules[1] = modules[topIdx].cloneNode(true);
            // colors
    
            let mods = generateRandomCombination();
            mods.forEach((m, idx) => {
                applyLayerSettings(m, idx);
                m.style.left = leftOffset + cw * c + "px";
                m.style.top = ch * r + "px";
                document.body.appendChild(m);
                groups[idx][i] = m;
            });
        }
}

function getColIdxs(n){
    return _.range(allRows).map( (i) => n + i * allCols );
}

function getRowIdxs(n){
    return _.range(allCols).map( (col) => col + allCols * n ); 
}

function getVisibleRowIdxs(n){
    return _.range(allCols).map( (col) => col + allCols * (n + yOff) ); 
}

function getVisibleColIdxs(n){
    return _.range(allRows).map( (i) => n + i * allCols + xOff );    
}

function getModulesFromIndexes(idxs, layers){
    let deepArray = _.map(layers, (layer) => _.map(idxs, (idx) => groups[layer][idx] ) )
    return _.flatten(deepArray);
}

function getVisibleColModules(n, layers) { // layers is an array
    // Get one col modules
    let idxs = getVisibleColIdxs(n);

    let deepArray = _.map(layers, (layer) => _.map(idxs, (idx) => groups[layer][idx] ) )
    return _.flatten(deepArray);
} 

function getColModules(n, layer){
    let colIdxs = getVisibleColIdxs(n, 0);
    return getColIdxs(n + xOff).map((idx) => groups[layer][idx]);
}

function getNewColor(){
    // find the colors
    let currentColors = _.map(layerSettings, (ls) => ls.fill);
    let allColors = moduleColors;
    return _.difference(allColors, currentColors)[0];
}


var clickCount = 0;
var lastClickTime = Date.now();

function randomInteract(pct){
    var rowVsCol = Math.random() < probabilityRowAnimation;

    var slideCount = Math.floor(pct * maxOneClickSlides);
    console.log("pct is " + pct);
    console.log("slidecount it " + slideCount);
    slideCount = Math.max(slideCount, 1);
    console.log()
    for (var i = 0; i < slideCount; i++) {
        var tries = 0;
        do {
            var goodSlide = slideColRandomParams();            
            tries++;
        } while (!goodSlide && findSlideCountMax > tries);
    }
} 

function handleClick() {
    clickCount++;

    let clickDelta = Date.now() - lastClickTime ;

    console.log("click delta " + clickDelta );

    if (clickCount >= changeColorClickCount) {
        let newColor = getNewColor();
        
        slideInNewColor(newColor);
        clickCount = 0;
    } else {
        var pct = clickDelta / maxTimerInteraction;
        pct = Math.min(1, pct);
        randomInteract(pct)
    }

    lastClickTime = Date.now();
}

function interactWhenNotTouching(){
    if (Date.now() > lastClickTime + idleTimeBeforeInteraction){
        // todo random animation thing
    }
}

setInterval(interactWhenNotTouching, idleTimeBeforeInteraction);

document.onclick = function(){
    handleClick();
}

function slideColRandomParams(){
    var c, delta, layerChoices, arrLayers;
    
    var locked = true;    
    c = _.random(0, cols - 1);
    delta = _.sample([-2, -1, 1, 2]);
    layerChoices = [[0], [1]];
    arrLayers = _.sample(layerChoices, 1);

    let indexes = getVisibleColIdxs(c);
    locked = checkLock(indexes, arrLayers);
    
    if (locked) {
        return false;
    }

    slideCol(c, delta, arrLayers);
    return true;
}

function slideColRandom(){
    var locked = true;
    var iters = 0;
    var c, delta, layerChoices, arrLayers;
    while (locked){
        c = _.random(0, cols - 1);
        delta = _.sample([-2, -1, 1, 2]);
        delta = -2;
        // peut être negatif????
        layerChoices = [[0], [1]];
        arrLayers = _.sample(layerChoices, 1);
    
        let indexes = getVisibleColIdxs(c);
        locked = checkLock(indexes, arrLayers);
        console.log(locked);
        if (iters > 10){
            break;
        } 
    }

    slideCol(c, delta, arrLayers);
}

function checkLock(indexes, layerIndexes){
    for (var i = 0; i < indexes.length; i++){
        let idx = indexes[i];
        for (var j= 0; j < layerIndexes; j++){
            let layerIdx = layerIndexes[j];
            let locked = locks[layerIdx][idx];
            if (locked === "lock"){
                return true;
            } 
        }
    } 
    return false;
}

function updateLocks(indexes, layerIndexes, locked){
    console.log("layer indexes " + layerIndexes);

    let lockedString = locked ? "lock" : "";
    indexes.forEach((idx) => {
        layerIndexes.forEach((lidx) => {
            // console.log(lidx + " " + idx);
            
            locks[lidx][idx] = lockedString;
        });
    }); 
}

function slideRowRandom(){
    var locked = true;
    var iters = 0;
    var r, delta, arrLayers;
    while (locked){
        r = _.random(0, 1);
        do {        
            delta = _.random(1, cols);
            
        } while (delta == 0);
        // peut être negatif????
        arrLayers = _.sample([[0], [1]]);
    
        let indexes = getVisibleRowIdxs(r);
        locked = checkLock(indexes, arrLayers);
        // console.log(locked);
        if (iters > 10){
            break;
        } 
    }

    slideRow([r], delta, arrLayers);
}

function getVerticalOffscreenModules(layer){
    let idxs =  getVerticalOffscreenModuleIdxs();
    return _.map(idxs, (idx) => groups[layer][idx]); 
}

function getVerticalOffscreenModuleIdxs() { // indexes or modules
    let leftColIdxs = _.range(0, xOff);
    let rightColIdxs = _.range(xOff + cols, allCols);
    
    let colIdxs = _.union(leftColIdxs, rightColIdxs);
    let rowIdxs = _.range(yOff, yOff + rows);
    
    console.log("rowidx length " + rowIdxs.length);
    console.log("colidxs width " + colIdxs.length);

    let offscreenIdxs = [];

    for (var i = 0; i < colIdxs.length; i++){
        let c = colIdxs[i];
        for (var j = 0; j < rowIdxs.length; j++){
            let r = rowIdxs[j];
            offscreenIdxs.push( r * allCols + c );
            console.log("push");
        }
    } 

    return offscreenIdxs;
}

function slideInNewColor(newColor){
    // make offscreen things 
    // Simple one direction
    let mods = getVerticalOffscreenModules(0);
    mods.forEach(function(mod) {
        console.log("mod " + mod);
        mod.style.fill = newColor;
        mod.style.zIndex = 999999;
    }, this);

    slideRow([0, 1], cols, [0], function() {
        // Switch the layers
        let temp = groups[0];
        groups[0] = groups[1];
        groups[1] = temp;

        // Update the layer settings
        layerSettings[0].fill = layerSettings[1].fill;
        layerSettings[1].fill = newColor;

        _.each(groups, (groupLayer, idx) => {
            _.each(groupLayer, (module) => {
                applyLayerSettings(module, idx);
            });
        })

    });
} 

function slideRow(rowArray, displacement, arrLayers, finishedCallback) {
    
    let moduleIdxs = _.flatten(_.map(rowArray, (r) => getVisibleRowIdxs(r)));
        
    console.log("arr layers " + arrLayers);
    
    updateLocks(moduleIdxs, arrLayers, true);
    let movingModules = getModulesFromIndexes(moduleIdxs, arrLayers);

    TweenMax.to(movingModules, 1,
    {   
        ease: Cubic.easeInOut, 
        left: "+=" + displacement * cw,
        onCompleteParams: [displacement, moduleIdxs, arrLayers], 
        onComplete: function(displacement, idxs, layers) {   
            let newIdxs = _.map(idxs, (idx) => {
                var row = Math.floor( idx / allCols );
                var newCol = (allCols + idx + displacement) % allCols;
                return row * allCols + newCol; 
            });
            
            // Do this for each layer
            layers.forEach(function(layerIdx) {
                // Get modules in the right order
                let moduleElems = _.map(idxs, (idx) => groups[layerIdx][idx] );
                _.each(newIdxs, (newIdx, i) => {
                    let m = moduleElems[i];
                    groups[layerIdx][newIdx] = m; 
                    // add to good pos
                    layoutModule(m, newIdx, layerIdx);
                });
            }, this);

            // Unlock
            console.log("arr layers " + arrLayers);
            
            updateLocks(moduleIdxs, arrLayers, false);
            if (finishedCallback != null){
                finishedCallback();
            }
        }            
    } );
}

function slideCol(c, displacement, arrLayers){
    console.log("slide cols " + c + " " + displacement + " " + arrLayers);
    let moduleIdxs = getVisibleColIdxs(c);

    updateLocks(moduleIdxs, arrLayers, true);

   // let moduleLayer = 1;
    let movingModules = getVisibleColModules(c, arrLayers);

   TweenMax.to( movingModules, 1, 
    { ease: Cubic.easeInOut, 
        top: "+=" + displacement * ch, 
        onCompleteParams: [displacement, moduleIdxs, arrLayers], 
        onComplete: function(displacement, idxs, layers) {   
            // todo - create lock        
            let newIdxs = _.map(idxs, (idx) => (allRows * allCols + idx + displacement * allCols) % (allRows * allCols) );

            // Do this for each layer
            layers.forEach(function(layerIdx) {
                // Get modules in the right order
                let moduleElems = _.map(idxs, (idx) => groups[layerIdx][idx] );
                _.each(newIdxs, (newIdx, i) => {
                    let m = moduleElems[i];
                    groups[layerIdx][newIdx] = m; 
                    // add to good pos
                    layoutModule(m, newIdx, layerIdx);
                });
            }, this);

            // Unlock
            updateLocks(moduleIdxs, arrLayers, false);
            
    }
});
} 