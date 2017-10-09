
// Interaction params
const changeColorClickCount = 10;
const idleTimeBeforeInteraction = 15000; // milis
const maxTimerInteraction = 15000; // 20 secs
const probabilityRowAnimation = 0.05;
const maxOneClickSlides = 10;

// Animation params
const rowTweenTime = 1;
const colTweenTime = 1;

const findSlideCountMax = 5;

let cols = 13;
let rows = 2;
let screenW = 960; 
let w = 936; // 960
let h = 144;
let leftOffset = Math.round((screenW - w) / 2);

let xMult = 3;
let yMult = 3;

let allCols = xMult * cols;
let allRows = yMult * rows;

let xOff = cols;
let yOff = rows;

let cw = w / cols;
let ch = h / rows; 
let combinations = [
    [1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17],
    [18, 19, 20],
    [21, 22, 13, 1, 2, 5, 6, 7, 8],
    [23, 24],
    [25, 26, 27, 28, 13],
    [29, 30, 31],
    [32, 33, 34, 13],
    [35, 36, 37],
    [55, 57, 58, 13],
    [59, 60, 61, 13],
    [62, 63, 64],
    [65, 66, 67],
    [68, 69],
    [70, 71]
];

/* original combinations let combinations = [
    [1, 2, 3, 4, 13],
    [5, 6, 7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 13],
    [18, 19, 20, 13],
    [21, 22, 13, 1, 2, 5, 6, 7, 8],
    [23, 24, 13],
    [25, 26, 27, 28, 13],
    [29, 30, 31, 13],
    [32, 33, 34, 13],
    [35, 36, 37, 13],
    [55, 57, 58, 13],
    [59, 60, 61, 13],
    [62, 63, 64],
    [65, 66, 67],
    [68, 69, 13],
    [70, 71, 13]
]; */

let green = "#2bfc98";
let blue = "#3540fa";
let red = "#fc0f40";

let moduleColors = [red, green, blue];

var modulesToLoad = [];
var moduleStrings = [];
var n = 71; // 71 normally
var modules = [];

var parser = new DOMParser();
// load the modules into memory
function setupModuleNames(){
    for (var i = 1; i <= n; i++){
        let name = "img/Forme-" + ("0" + i).slice(-2) + ".svg";
        modulesToLoad.push(name);
    }
}

function loadModules(){
    let name = modulesToLoad.pop();
    //console.log("loading " + name);
    fetch(name).then(function(res) {
        return res.text();
    }).then(function(res){
        moduleStrings.push(res);
        if (modulesToLoad.length > 0){
            loadModules();                
        } else {
            assetsLoaded();              
        }
    });
}

function assetsLoaded(){
    createDOMElements();
    loaded();
}

function createDOMElements() {
    while (moduleStrings.length > 0) {
        var moduleString = moduleStrings.pop();
        var svg = parser.parseFromString(moduleString, "image/svg+xml");
        //document.body.appendChild(svg.documentElement);
        var elem = svg.documentElement;
        elem.classList.add("module");
        elem.setAttribute("width", cw + "px");
        elem.setAttribute("height", ch + "px");
        elem.style.width = cw + "px";
        elem.style.height = ch + "px";
        modules.push(elem);
    } 
}

function standardizeData(){
    for (var i = 0; i < combinations.length; i++) {
        var combination = combinations[i];
        for (var j = 0; j < combination.length; j++) {
            combination[j] = combination[j] - 1;
        }
    }
}

standardizeData();
setupModuleNames();
loadModules();