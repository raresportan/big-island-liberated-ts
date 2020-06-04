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
import { Path } from "./Path";

export class PathNode extends Vec2 {
    path: Path;
    house: boolean;
    start: boolean;

    constructor(x: number, y: number, path, house, start) {
        super(x, y);
        this.path = path;
        this.house = house;
        this.start = start;
    }

    static fromVec2(v: Vec2, path, house, start): PathNode {
        return new PathNode(v.x, v.y, path, house, start);
    }
}