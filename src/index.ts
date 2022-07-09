import Konva from 'Konva';
import ConnectionManager from './connectionManager';
import constructGrid from './stageManager/gridManager';
import movementManager from './stageManager/scrollManager';
import DragSelect from './stageManager/selectionBox';
import Register from './blockRegister';

// first we need to create a stage
let stage = new Konva.Stage({
    container: 'canvas',   // id of container <div>
    width: window.innerWidth,
    height: window.innerHeight,
});

// initialize the grid
let grid = constructGrid(stage);

// Instantiate the connection manager
const cm = ConnectionManager.getInstance(stage);

DragSelect.getInstance(stage);
DragSelect.setCanSelect(true);

// Manage movement
movementManager(stage, [grid, cm.connectionLayer, cm.layer]);

Register(stage);

function reDraw() {
    grid.remove();
    grid = constructGrid(stage);

    stage.width(window.innerWidth);
    stage.height(window.innerHeight);

    stage.draw();
}

stage.on('movementManager', () => {
    grid.remove();
    grid = constructGrid(stage);
});

// Add a window resize listener
window.addEventListener('resize', () => reDraw());