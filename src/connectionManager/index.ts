import Konva from 'Konva';
import Global from '../global';
import constructArrow from './src/constructArrow';
import calculateCords from './src/calculateCords';
import constructBezier from './src/constructBezier';
import PlaceableObject from '../interactableObject';

import { BlockTypes } from '../types';

class ConnectionManager {
    private static instance: ConnectionManager;

    public dragSelect: boolean = true;
    public clickSelect: boolean = true;

    public readonly stage: Konva.Stage;
    public readonly connectionLayer: Konva.Layer;
    public readonly global: Global = Global.getInstance();

    public blocks: PlaceableObject[] = [];

    public conections: Map<string, {
        block1: PlaceableObject,
        block2: PlaceableObject,
        removeConnection: () => void
    }> = new Map();

    public selectedBlock1: PlaceableObject;
    public selectedBlock2: PlaceableObject;

    private constructor(stage: Konva.Stage) {
        this.connectionLayer = new Konva.Layer();
        this.connectionLayer.listening(false);  
        this.stage = stage;
        this.stage.add(this.connectionLayer);
    }

    public static getInstance(stage: Konva.Stage): ConnectionManager {
        if(!ConnectionManager.instance)
            ConnectionManager.instance = new ConnectionManager(stage);
        
        return ConnectionManager.instance;
    }

    public getBlock(uuid: string): PlaceableObject {
        return this.blocks.find(block => block.uuid === uuid);
    }

    public snapToGrid(force: boolean = true): void {
        this.blocks.forEach(block => {
            // If force is true, make sure the block
            // is allowed to snap to the grid
            if(force === true)
                block.blockOpts.snapToGrid = true;
            
            // Snap the block to the grid
            block.snapToGrid();
        });
    }

    private clickHandler(block: PlaceableObject): void {
        if (this.selectedBlock1 === undefined) {
            // Set the first selected block
            this.selectedBlock1 = block;
            
            // Visualize the connection
            return block.selectBlock();
        }

        else if (this.selectedBlock2 === undefined)
            // Set the second selected block
            this.selectedBlock2 = block;


        // Check if the blocks are the same
        if(this.selectedBlock1.uuid === this.selectedBlock2.uuid)
            return this.deselectAll();



        // check if Block 1 can have connections
        if(this.selectedBlock1.canConntect === false)
            return this.deselectAll();

        // check if Block 2 can have connections
        if(this.selectedBlock2.canBeConnected === false)
            return this.deselectAll();


        // Check if the blocks are already connected
        const UUID_12 = this.selectedBlock1.uuid + this.selectedBlock2.uuid,
            UUID_21 = this.selectedBlock2.uuid + this.selectedBlock1.uuid;

            
        if(this.conections.has(UUID_12)) {
            this.conections.get(UUID_12).removeConnection();
            this.conections.delete(UUID_12);
            return this.deselectAll();
        }
            
        else if(this.conections.has(UUID_21)) {
            this.conections.get(UUID_21).removeConnection();
            this.conections.delete(UUID_21);
            return this.deselectAll();
        }


        // Create a new connection
        const removeConnection 
            = this.drawConnection(this.selectedBlock1, this.selectedBlock2);


        // Add the connection to the map
        this.conections.set(UUID_12, {
            block1: this.selectedBlock1,
            block2: this.selectedBlock2,
            removeConnection
        });


        // Remove the selected blocks
        this.deselectAll();
    }

    private deselectAll(): void {
        if(this.selectedBlock1 !== undefined)
            this.selectedBlock1.deselectBlock();

        if(this.selectedBlock2 !== undefined)
            this.selectedBlock2.deselectBlock();

        this.selectedBlock1 = undefined;
        this.selectedBlock2 = undefined;
    }

    private drawConnection(block1: PlaceableObject, block2: PlaceableObject): () => void {
        const getBlockInfo = (block: PlaceableObject): BlockTypes.IBlockInfo => {
            return { x: block.block.position().x, y: block.block.position().y, w: block.block.width(), h: block.block.height() };
        }

        let cords = calculateCords(getBlockInfo(block1), getBlockInfo(block2)),
            [x1, y1, x2, y2] = cords.pos,
            direction = cords.dir;

        let line = constructBezier([x1, y1, x2, y2], true, block1, direction),
            arrow = constructArrow([x2, y2], direction);


        const reRender = () => {
            let selected = false;

            // Check if the block is currently selected
            if(block1.uuid === this.selectedBlock1?.uuid || block1.uuid === this.selectedBlock2?.uuid)
                selected = true;

            if(block2.uuid === this.selectedBlock1?.uuid || block2.uuid === this.selectedBlock2?.uuid)
                selected = true;

            // Calculate the new coordinates
            cords = calculateCords(getBlockInfo(block1), getBlockInfo(block2)),
                [x1, y1, x2, y2] = cords.pos,
                direction = cords.dir;

            // Remove the old line
            line.remove();
            
            // Construct a new line
            line = constructBezier([x1, y1, x2, y2], selected, block1, direction);

            // Add the new line back
            this.connectionLayer.add(line);

            // Remove the old arrow
            arrow.remove();

            // Construct a new arrow
            arrow = constructArrow([x2, y2], direction);

            // Add the new arrow back
            this.connectionLayer.add(arrow);

            // Re-render the stage
            this.connectionLayer.batchDraw();

            // Set the connection face
            block1.connectionFace = direction;
        }   

        reRender();
        
        // Draw a line between the two blocks on  update
        block1.block.on('dragmove', reRender);
        block2.block.on('dragmove', reRender);
        
        // We cant directly just use 'block.off' as we need
        // that event lister for other things.
        let clickable = true;
        block2.block.on('click', () => clickable === true ? reRender() : null);

        // Return a function to remove the connection
        return () => {
            line.remove();
            arrow.remove();

            clickable = false;
            block1.connectionFace = 0;

            block1.block.off('dragmove', reRender);
            block2.block.off('dragmove', reRender);

            this.connectionLayer.batchDraw();
        }
    }

    addBlock(block: PlaceableObject): void {
        this.blocks.push(block);

        block.block.on('click', () => {
            this.clickHandler(block);
        });

        // Add a listener to the block
        // when the user hovers over it
        block.block.on('mouseover', () => {
            this.global.hoveringOverBlock = true;
        });

        // Add a listener to the block
        // when the user stops hovering over it
        block.block.on('mouseout', () => {
            this.global.hoveringOverBlock = false;
        });
    }

    findInCords(xy1: BlockTypes.ICords, xy2: BlockTypes.ICords): PlaceableObject[] {
        let blocks: PlaceableObject[] = [];

        this.blocks.forEach(block => {
            if(block.block.position().x + block.block.width() >= xy1.x &&
                block.block.position().x <= xy2.x &&
                block.block.position().y + block.block.height() >= xy1.y &&
                block.block.position().y <= xy2.y)
                blocks.push(block);
        });

        return blocks;
    }
}

export default ConnectionManager;