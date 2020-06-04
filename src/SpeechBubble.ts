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
 * Used to render a speech bubble.
 *
 * Can be rendered.
 */
export class SpeechBubble extends GameObject {
    time = 0;

    constructor(properties:object) {
        super(properties, 0, 0)
    }

    render(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        this.debugRender(c);
        c.globalAlpha = 1 - this.time / 150;
        c.font = "14px Arial";
        c.fillStyle = "yellow";
        c.textAlign = "center";
        c.fillText(this['text'], 0, 0);
        c.restore();
    }

}
