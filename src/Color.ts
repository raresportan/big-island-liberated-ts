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

/**
 * Data for a RBG color
 */
export class Color {

    private _r: number;
    private _g: number;
    private _b: number;


    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }


    get r() {
        return this._r;
    }
    set r(x: number) {
        this._r = (x > 255) ? 255 : (x < 0) ? 0 : x;
    }


    get g() {
        return this._g;
    }
    set g(x: number) {
        this._g = (x > 255) ? 255 : (x < 0) ? 0 : x;
    }


    get b() {
        return this._b;
    }
    set b(x: number) {
        this._b = (x > 255) ? 255 : (x < 0) ? 0 : x;
    }


    static fromString(s: string) {
        const ar = s.split('');
        let r, g, b;
        if (s.length === 4) {
            r = parseInt(`0x${ar[1]}`);
            r = (r << 4) + r;

            g = parseInt(`0x${ar[2]}`);
            g = (g << 4) + g;

            b = parseInt(`0x${ar[3]}`);
            b = (b << 4) + b;

        } else if (s.length === 7) {
            r = parseInt(`0x${ar[1]}${ar[2]}`);
            g = parseInt(`0x${ar[3]}${ar[4]}`);
            b = parseInt(`0x${ar[5]}${ar[6]}`);
        }
        return new Color(r, g, b);
    }


    toString(): string {
        let rHex = this.r.toString(16);
        if (rHex.length === 1) rHex = '0' + rHex;
        let gHex = this.g.toString(16);
        if (gHex.length === 1) gHex = '0' + gHex;
        let bHex = this.b.toString(16);
        if (bHex.length === 1) bHex = '0' + bHex;

        let s = rHex + gHex + bHex;
        return `#${s}`;
    }


    subtract(x: number): Color {
        this.r -= x;
        this.g -= x;
        this.b -= x;
        return this;
    }


    blend(color: Color, w: number = .5) {
        this.r = (this.r * (1 - w) + color.r * w) | 0;
        this.g = (this.g * (1 - w) + color.g * w) | 0;
        this.b = (this.b * (1 - w) + color.b * w) | 0;
    }

}