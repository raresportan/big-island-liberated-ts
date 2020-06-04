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


export enum KEYS  {
    UP = "W",
    LEFT = "A",
    DOWN = "S",
    RIGHT = "D",
    ESCAPE = "ESCAPE",
    SPACE = " ",
    SHIFT = "SHIFT",
    FULL_SCREEN = "F",
    NEXT_WEAPON = "E",
    PREVIOUS_WEAPON = "Q",
    CONTROLS = "C",
    ADVANCE_TIME = "T",
    ADVANCE_TO_NIGHT = "Y",
    ZOOM_IN = "ArrowUp",
    ZOOM_OUT = "ArrowDown"
}

export class InputManager {
    mouseDown = false;
    keyBindings: Map<string, Array<Function>> = new Map<string, Array<Function>>();
    clickBindings:Array<Function> = [];
    mousePosition = new Vec2();
    activeKeys = {};


    constructor() {
        let touches;

        window.onkeydown = (e) => {
            this.setKey(e.key, 1);

            const keyBindings:Array<Function> = this.keyBindings.get(e.key.toUpperCase());
            if(keyBindings) {
                keyBindings.forEach( (functionToCall:Function) => functionToCall.call(null) );
            }
        };


        window.onkeyup = (e) => {
            this.setKey(e.key, 0);
        };


        window.onmousedown = (e) => {
            if (touches == null) {
                this.mouseDownAt((e.offsetX) / Globals.RESOLUTION, (e.offsetY) / Globals.RESOLUTION);
                this.clickBindings.forEach( (functionToCall:Function) => functionToCall.call(null) );
            }
        };


        window.onmouseup = (e) => {
            if (touches == null) {
                this.mouseUpAt((e.offsetX) / Globals.RESOLUTION, (e.offsetY) / Globals.RESOLUTION);
            }
        };


        window.onmousemove = (e) => {
            if (touches == null) {
                this.mouseAt((e.offsetX) / Globals.RESOLUTION, (e.offsetY) / Globals.RESOLUTION);
            }
        };


        window.ontouchstart = (e) => {
            for (let i = e.changedTouches.length - 1; i >= 0; i--) {
                const touch = e.changedTouches[i];
                const boundingBox = (<HTMLCanvasElement>e.target).getBoundingClientRect();
                this.mouseDownAt((touch.pageX - boundingBox.left) / Globals.RESOLUTION, (touch.pageY - boundingBox.top) / Globals.RESOLUTION);
            }
            e.preventDefault();
        };


        window.ontouchmove = (e) => {
            touches = e.touches;
            const boundingBox = (<HTMLCanvasElement>e.target).getBoundingClientRect();
            this.mouseAt((touches[0].pageX - boundingBox.left) / Globals.RESOLUTION, (touches[0].pageY - boundingBox.top) / Globals.RESOLUTION);
            e.preventDefault();
        };


        window.ontouchend = (e) => {
            e.preventDefault();
        };
    }


    setKey(key: string, value: number) {
        this.activeKeys[key.toUpperCase()] = value;
    }


    key(identifier: string): number {
        return this.activeKeys[identifier] || 0;
    }


    bindKeyHandler(key: string, callback: Function) {
        let keyBindings = this.keyBindings.get(key) || [];
        keyBindings.push(callback);
        this.keyBindings.set(key, keyBindings);
    }


    bindClickHandler(callback: Function) {
        this.clickBindings.push(callback);
    }


    mouseDownAt(x: number, y: number) {
        this.mouseDown = true;
        x = (x < 0) ? 0 : (x > Globals.STATIC_WIDTH) ? Globals.STATIC_WIDTH : x;
        y = (y < 0) ? 0 : (y > Globals.STATIC_HEIGHT) ? Globals.STATIC_HEIGHT : y;
        this.mouseAt(x, y);
    }


    mouseUpAt(x: number, y: number) {
        this.mouseDown = false;
        x = (x < 0) ? 0 : (x > Globals.STATIC_WIDTH) ? Globals.STATIC_WIDTH : x;
        y = (y < 0) ? 0 : (y > Globals.STATIC_HEIGHT) ? Globals.STATIC_HEIGHT : y;
        this.mouseAt(x, y);
    }


    mouseAt(x: number, y: number) {
        x = (x < 0) ? 0 : (x > Globals.STATIC_WIDTH) ? Globals.STATIC_WIDTH : x;
        y = (y < 0) ? 0 : (y > Globals.STATIC_HEIGHT) ? Globals.STATIC_HEIGHT : y;
        this.mousePosition.set(x, y);
    }
}