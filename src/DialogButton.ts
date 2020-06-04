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
import { Resource } from "./Resource";


/**
 * Dialog button
 */
export class DialogButton extends Vec2 {

    static readonly scale = 1.5;
    readonly width = 128 * DialogButton.scale;
    readonly height = 32 * DialogButton.scale;

    text: string;
    action: Function;


    constructor(text, action, x: number, y: number) {
        super(x, y);
        this.text = text;
        this.action = action;
    }


    /**
     * Check if the button was clicked
     * @param {number} px
     * @param {number} py
     * @returns {boolean}
     */
    clickAt(px: number, py: number): boolean {
        return Math.abs(px - this.x) < this.width / 2 && Math.abs(py - this.y) < this.height / 2;
    }


    /**
     * Renders the button
     * @param {CanvasRenderingContext2D} c Canvas context
     */
    render(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        c.scale(1.5, 1.5);
        c.drawImage(Resource.uiImages[25], -64, -16);
        c.drawImage(Resource.uiImages[26], -32, -16);
        c.drawImage(Resource.uiImages[26], 0, -16);
        c.drawImage(Resource.uiImages[27], 32, -16);

        c.globalAlpha = .75;
        c.font = "12px Arial";
        c.textAlign = "center";
        c.fillStyle = "#fff";
        c.fillText(this.text, 0, 4);
        c.restore();
    }
}