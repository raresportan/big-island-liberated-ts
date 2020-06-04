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

import { Globals } from "./Globals";
import { Camera } from "./Camera";
import { Avatar } from "./Avatar";
import { KEYS } from "./InputManager";


/**
 * Renders the game intro
 */
export class Intro{

    slideTime = 0;
    currentSlide = 0;
    slides = [
        "This is Big Island",
        "At day, all is peaceful",
        "But come night, horrific monsters of the black appear",
        "The ever-curious villagers often stray into the darkness",
        "Do you have what it takes to defend them?"
    ];
    slidex_pos = [2400, 4581, 4329, 2324, 8221];
    slidey_pos = [1000, 5251, 6819, 8114, 6860];
    slide_dir = [2, 2, 3, -2, -2];


    constructor(private introDoneCallback:Function){

    }


    /**
     * Update state
     * @param {Avatar} player
     * @param {Camera} camera
     */
    update(player: Avatar, camera: Camera) {
        if(Globals.events.key(KEYS.ESCAPE)){
            this.introDoneCallback();
        } else {
            this.slideTime++;
            camera.x = this.slidex_pos[this.currentSlide] + this.slideTime * this.slide_dir[this.currentSlide];
            camera.y = this.slidey_pos[this.currentSlide];
            player.set(camera.x, camera.y);

            if (this.slideTime >= 300) {
                this.slideTime = 0;
                this.currentSlide++;
                if (this.currentSlide >= this.slides.length) {
                    this.introDoneCallback();
                }
            }
        }
    }


    /**
     * Render current state
     * @param {CanvasRenderingContext2D} c
     */
    render(c: CanvasRenderingContext2D) {
        c.globalAlpha = 1;
        c.fillStyle = "#000";
        c.fillRect(0, Globals.SCREEN_HEIGHT - 50, Globals.SCREEN_WIDTH, 50);
        c.fillStyle = "#fff";
        c.font = "24px Arial";
        c.fillText(this.slides[this.currentSlide], 10, Globals.SCREEN_HEIGHT - 20);
        c.fillStyle = "#000";
        c.globalAlpha = Math.pow((this.slideTime - 150) / 150, 2);
        c.fillRect(0, 0, Globals.SCREEN_WIDTH, Globals.SCREEN_HEIGHT);
        c.globalAlpha = 1;
    }
}