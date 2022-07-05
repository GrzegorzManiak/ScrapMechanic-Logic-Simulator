import Konva from "konva";
import { GridConstants } from "../consts";
import { getPos, getScale } from "./scrollManager";

import lines from './gridStyles/lines';
import checker from './gridStyles/checker';

export type IGridDetails = {
    horizontalLines: number,
    verticalLines: number,
    stepSize: number,
    gridOffsetX: number,
    gridOffsetY: number,
    gridWidth: number,
    gridHeight: number,
}

function constructGrid(stage: Konva.Stage, style: 1 | 2 = 2): Konva.Layer {
    const stepSize = GridConstants.gridSize * getScale(),
        gridLayer = new Konva.Layer();

    gridLayer.listening(false);

    // How many lines to draw on each axis
    const horizontalLines = Math.ceil((stage.height() / getScale()) / stepSize) * 2,
        verticalLines = Math.ceil((stage.width() / getScale()) / stepSize) * 2;

    const gridDetails: IGridDetails = {
        horizontalLines, verticalLines,

        // stepSize is the distance between each line
        stepSize: GridConstants.gridSize * getScale(),

        // Currently the grid starts at 0,0, but thats incorrect
        // when the stage is zoomed into or moved.
        // So we need to offset the grid to account for this.
        gridOffsetX: getPos().x,
        gridOffsetY: getPos().y,

        // Make sure to account for the fact that the grid has to align
        // with the edges of the blocks
        gridWidth: (verticalLines * stepSize),
        gridHeight: (horizontalLines * stepSize),
    }

    switch (style) {
        case 1: lines(gridLayer, gridDetails); break;   
        case 2: checker(gridLayer, gridDetails); break;
    }

    gridLayer.draw();

    return gridLayer;
}

export default constructGrid;