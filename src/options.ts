import { Constants } from "./types";

export let VisualConstants: Constants.TVisualConstants = {
    arrowWidth: 10,
    arrowHeight: 10,
    fontSize: 30,
    strokeWidth: 3,
    blockWidth: 75,
    blockHeight: 75,
    strokeColor: '#ffffff',
    strokeOutlineWidth: 5,
    strokeOutlineColor: '#757575',
    flowDirection: 0,
}

export let GridConstants: Constants.TGridConstants = {
    gridSize: 75,
    scrollSpeed: 1,
    scaleBy: 1.1,
    maxScale: 3,
    minScale: 0.5,
    gridColor: 'rgba(0, 0, 0, 0.2)',
    gridAccentColor: 'rgba(0, 0, 0, 0.5)',      
    gridLineWidth: 2,
    gridDashAmnt: 8
}

export let ThemeConstants: Constants.TThemeConstants = {
    backgroundColor: '#2b2b2b',

    blockBarBorderRadius: 10,
    blockBarColor: "#2b2b2b",
    blockBarPadding: 10,
    blockColor: '#2b2b2b',

    promptColor: '#2b2b2b',    
    fontPrimarySize: 20,
    fontSecondarySize: 15,
    promptPadding: 5,
    promptBorderRadius: 5,
    fontFamily: 'Arial',
    fontColor: '#ffffff'
}

export let SelectionConstants: Constants.TSelectionConstants = {
    borderRadius: 5,
    borderWidth: 4,
    color: '#54afff',
    borderColor: '#36a1ff',
    transparency: 0.1
}