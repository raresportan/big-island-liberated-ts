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
import { PathNode } from "./PathNode";


/**
 * Path object
 */
export class Path {
    start: PathNode;
    end: PathNode;
    points: Array<Vec2>;

    /**
     * Create a new path
     * @param {Vec2} s
     * @param {Vec2} e
     * @param points
     * @param {boolean} houseStart
     * @param {boolean} houseEnd
     */
    constructor(s: Vec2, e: Vec2, points, houseStart: boolean, houseEnd: boolean) {
        this.points = points;
        this.start = PathNode.fromVec2(s, this, houseStart, true);
        this.end = PathNode.fromVec2(e, this, houseEnd, false);
    }
}