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
import { GameObject } from "./GameObject";


/**
 * Arrow game object
 */
export class Arrow extends GameObject {
    distance = 0;


    constructor(properties: object) {
        super(properties, 0, 0)
    }


    /**
     * Renders the arrow as a line
     * @param {CanvasRenderingContext2D} c Canvas context
     */
    render(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        this.debugRender(c);
        c.globalAlpha = 1;
        c.strokeStyle = "#fff";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(this["direction"].x, this["direction"].y);
        c.stroke();
        c.closePath();
        c.restore();
    }
}
