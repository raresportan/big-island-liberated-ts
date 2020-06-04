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
import { Globals } from "./Globals";


/**
 * Keeps data about map collisions.
 * For example zones with water, trees, houses, etc
 */
export class MapCollisions {

    readonly binaryHexMap = {
        "0": [0, 0, 0, 0], "1": [0, 0, 0, 1], "2": [0, 0, 1, 0], "3": [0, 0, 1, 1],
        "4": [0, 1, 0, 0], "5": [0, 1, 0, 1], "6": [0, 1, 1, 0], "7": [0, 1, 1, 1],
        "8": [1, 0, 0, 0], "9": [1, 0, 0, 1], "a": [1, 0, 1, 0], "b": [1, 0, 1, 1],
        "c": [1, 1, 0, 0], "d": [1, 1, 0, 1], "e": [1, 1, 1, 0], "f": [1, 1, 1, 1]
    };

    collisions = [];
    mapWidth: number;


    constructor(data: string) {
        const chars = data.split('');

        for (let cir = 0; cir < data.length * 4; cir++) {
            const ci = (cir / 4) | 0;
            const bseq = cir % 4;
            const hexMap = this.binaryHexMap[chars[ci]];
            if (hexMap != null) {
                this.collisions.push((hexMap[bseq] == 1));
            }
        }
        this.mapWidth = Math.sqrt(Math.ceil(this.collisions.length));
        console.log(`Collision Map Loaded, Size : ${this.collisions.length}`);
    }


    collisionAt(x: number, y: number) {
        x = (x / Globals.GRAPHIC_BLOCK_SIZE) | 0;
        y = (y / Globals.GRAPHIC_BLOCK_SIZE + .5) | 0;
        return this.collisions[x + y * this.mapWidth];
    }


    collisionAtVec2(v: Vec2) {
        return this.collisionAt(v.x, v.y);
    }

}