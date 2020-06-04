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

/**
 * Camera
 *
 * Controls the map position and map zoom level
 * Zoom change works in Developer mode only
 */
export class Camera extends Vec2 {

    private readonly tweenSpeed: number = 10.0;
    private _targetZoom: number;
    private _actualZoom: number;


    constructor(x: number = 0.0, y: number = 0.0, zoom: number = 1) {
        super(x, y);
        this._targetZoom = this._actualZoom = zoom;
    }


    get zoom(): number {
        return this._targetZoom;
    }


    set zoom(value: number) {
        this._targetZoom = value;
    }


    get animatedZoom(): number {
        return this._actualZoom;
    }


    update() {
        this._actualZoom -= (this._actualZoom - this._targetZoom) / this.tweenSpeed;
    }
}