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
import { Orientation } from "./Vec2";


/**
 * The collection of frames for an animation type
 * (e.g. all frames for walk animations, in all 4 directions, that is all frames for resource/characters/citizen0/walkcycle.png)
 *
 * Used by Animations.ts
 */
export class AvatarAnimationFrames {

    // orientations from sprite sheet (rows)
    readonly orientations: number;

    // positions for a animation in sprite sheet (columns)
    readonly positions: number;

    // array of frames in map
    readonly frames: Array<HTMLImageElement>;

    constructor(orientations: number, positions: number, frames: Array<HTMLImageElement>) {
        this.orientations = orientations;
        this.positions = positions;
        this.frames = frames;
    }


    /**
     * Return image for the orientation from position
     *
      *@param {Orientation} orientation The orientation (row)
     * @param {number} position The position (column)
     * @returns {HTMLImageElement}
     */
    getImage(orientation: Orientation, position: number) {
        return this.frames[this.positions * orientation + (position % this.positions)]
    }


    /**
     * Renders a frame
     * @param {CanvasRenderingContext2D} c
     * @param {number} orientation
     * @param {number} position
     */
    render(c: CanvasRenderingContext2D, orientation: Orientation, position: number) {
        c.drawImage(this.getImage(orientation, position), 0, 0);
    }
}
