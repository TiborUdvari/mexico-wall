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

function getRow(n){
    // Get the rows
    // n
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
    // get all the ones in a layer
    // 0 bottom layer, 1 top layer
    return getColIdxs(n + xOff).map((idx) => groups[layer][idx]);
}

// Animation type
// slice: COL, ROW
// direction: LEFT, RIGHT, UP, DOWN
// size: how many modules are displaced
// type: full, partial

// todo - move both modules and update the datas

function getNewColor(){
    // find the colors
    let currentColors = _.map(layerSettings, (ls) => ls.fill);
    let allColors = moduleColors;
    return _.difference(allColors, currentColors)[0];
}

document.onclick = function(){

    let newColor = getNewColor();
    slideRow( [0, 1], -cols, [0, 1]);

    // Get last click time
    // Get the last 


    //slideColRandom();
    //slideInNewColor(newColor);
    
    //slideCol(1, 2, [0, 1]);
   // slideColRandom();
   //slideRowRandom();
    //slideRow(0, 5, [1]);
    // bug losing one module
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

    // visible modules
    //mods.forEach((m) => m.style.fill="blue" );
    
    // Create random animation
    // Create lock idx grid

    // Make only one animation at a time

    // When an animation in choosen it should add the good bricks
    // When an animation is finished it should update the positions of the data
    // model

    // todo - get rows
    // Choose modules to animate
    // Choose modules to animate - col or row or row part
    // Choose direction to animate in
    // Place modules in the right positions
    // Clean up extra things

    // Choose a random animation and animate it in place
    // Full group animations
    // One module top / bottom animations
    // Changing color animations


// Animate row of modules out
// Animate one row of modules out and other in


/*
function slideRow(r, displacement, arrLayers, finishedCallback) {
   // console.log("row " + r + " displacement " + displacement + " " + arrLayers );
    let moduleIdxs = getVisibleRowIdxs(r);
    // console.log(moduleIdxs);
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
                var newCol = (idx % allCols + displacement) % allCols;
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
            updateLocks(moduleIdxs, arrLayers, false);
            if (finishedCallback != null){
                finishedCallback();
            }
        }            
    } );
}

*/