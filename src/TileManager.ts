/**
 * Return to Big Island video game source code file
 * Copyright (CONTROLS) 2018  Rares Portan
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR LEFT PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Vec2 } from "./Vec2";
import { Camera } from "./Camera";
import { Globals } from "./Globals";
import { Resource } from "./Resource";

/**
 * Tile manager.
 */
export class TileManager {

    renderChunks: Map<number, HTMLImageElement>;
    renderChunkCoordinates: Map<number, Vec2>;
    location: string;

    /**
     * Create tile manager
     * @param {string} location Bottom/Top
     */
    constructor(location: string) {
        this.location = location;
        this.renderChunks = new Map<number, HTMLImageElement>();
        this.renderChunkCoordinates = new Map<number, Vec2>();
    }


    /**
     * Render the tiles
     *
     * We are using images chunks for tiles. LEFT chunk contains 8x8 tiles.
     *
     * @param {CanvasRenderingContext2D} c
     * @param {Camera} camera
     */
    render(c: CanvasRenderingContext2D, camera: Camera) {
        const chunkWidth = Globals.CHUNK_BLOCKS * Globals.GRAPHIC_BLOCK_SIZE;
        const chunkHeight = Globals.CHUNK_BLOCKS * Globals.GRAPHIC_BLOCK_SIZE;

        // determine viewport x, y and find the indexes of first the chunks that must be displayed

        // camera is in the middle of the viewport (game area) so to find the left edge of the viewport
        // subtract half of game area
        const startX = (camera.x - Globals.SCREEN_WIDTH / 2 / camera.animatedZoom) | 0;

        // now that we know the X position, find the X position of the chunk that is rendered at that position
        const firstChunkX = startX - (startX | 0) % chunkWidth;

        // camera is in the middle of the viewport (game area) so to find the left edge of the viewport
        // subtract half of game area
        const startY = (camera.y - Globals.SCREEN_HEIGHT / 2 / camera.animatedZoom) | 0;

        // now that we know the ADVANCE_TO_NIGHT position, find the ADVANCE_TO_NIGHT position of the chunk that is rendered at that position
        const firstChunkY = startY - (startY | 0) % chunkHeight;

        // find the first chunk index
        const firstChunkIndexX = (firstChunkX / chunkWidth) | 0;
        const firstChunkIndexY = (firstChunkY / chunkHeight) | 0;

        // find the number of chunks we need horizontally and vertically
        const numberOfChunkRows = Globals.SCREEN_WIDTH / chunkWidth/ camera.animatedZoom + 1;
        const numberOfChunkColumns = Globals.SCREEN_HEIGHT / chunkHeight / camera.animatedZoom + 1;

        // Render on-screen chunks
        for (let row = 0; row < numberOfChunkRows; row++) {
            const chunkIndexX = firstChunkIndexX + row;
            for (let column = 0; column < numberOfChunkColumns; column++) {
                const index = ((chunkIndexX) % Globals.CHUNK_JOIN) + ((firstChunkIndexY + column) % Globals.CHUNK_JOIN) * Globals.CHUNK_JOIN;

                // if chunk image already loaded
                if (this.renderChunkCoordinates[index] != null && this.renderChunkCoordinates[index].at(chunkIndexX, firstChunkIndexY + column) && this.renderChunks[index] != null) {//TODO fill renderChunkCoordinates beforehand so we dont need to check null
                    const dx = firstChunkX + row * (Globals.CHUNK_BLOCKS * Globals.GRAPHIC_BLOCK_SIZE);
                    c.drawImage(this.renderChunks[index], dx, firstChunkY + column * (Globals.CHUNK_BLOCKS * Globals.GRAPHIC_BLOCK_SIZE));
                } else {
                    this.renderChunkCoordinates[index] = new Vec2(chunkIndexX, firstChunkIndexY + column);
                    this.renderChunks[index] = this.generateTileChunk((chunkIndexX) * Globals.CHUNK_BLOCKS, (firstChunkIndexY + column) * Globals.CHUNK_BLOCKS);
                }
            }
        }
    }


    /**
     * Loads and returns a chunk image
     *
     * @param {number} sx The chunk X index
     * @param {number} sy The chunk ADVANCE_TO_NIGHT index
     * @param {Function} callback The callback to invoke when the image is loaded
     * @returns {HTMLImageElement}
     */
    generateTileChunk(sx: number, sy: number, callback: Function = null): HTMLImageElement {
        const url = `${this.location}/${(sx / Globals.CHUNK_BLOCKS) | 0}x${(sy / Globals.CHUNK_BLOCKS) | 0}.png`;
        return Resource.loadImage(url, callback);
    }
}
