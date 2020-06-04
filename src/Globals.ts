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
import { InputManager } from "./InputManager";
import { SoundManager } from "./SoundManager";

/**
 * Keeps constants and managers
 */
export class Globals {
    static DEBUG = false;

    static SCREEN_WIDTH: number;
    static SCREEN_HEIGHT: number;

    static RENDER_DISTANCE: number;
    static RESOLUTION: number = 1;

    // a chunk is an tile image containing 8x8 tiles
    static readonly CHUNK_BLOCKS: number = 8;

    // a tile is 32x32
    static readonly GRAPHIC_BLOCK_SIZE: number = 32;

    static CHUNK_JOIN: number = 10;
    static STATIC_WIDTH: number = 1200;
    static STATIC_HEIGHT: number = 675;

    static readonly GUARD_VIEW_DISTANCE: number = 256;

    static events: InputManager = new InputManager();
    static audio: SoundManager = new SoundManager();

    static randomPickFrameCount = 0;

    static randomPickFrame(frequency: number) {
        return ((Globals.randomPickFrameCount++) % frequency === 0);
    }

    static randomPick(array: Array<any>) {
        return array[(array.length * Math.random()) | 0];
    }

}
