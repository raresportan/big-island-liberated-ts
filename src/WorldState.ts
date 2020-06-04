import { GameObject } from "./GameObject";
import { Globals } from "./Globals";

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
export class WorldState {

    totalPopulation = 200;
    savedCitizens = 0;
    lastSavedCitizens = 0;

    awakePopulation = 0;
    dayCount = 1;
    zombie_max = 100;
    zombie_out = 0;
    zombies_killed = 0;
    guard_total = 2;//2
    guard_price = 100;
    difficultyMode = 0;

    time = 7;//24:00 clock (Start at 7)
    dayLength = 60 * 60 * 3; // 10800

    objects: Array<GameObject>;
    onscene: Array<GameObject>;
    offscene: Array<GameObject>;

    constructor() {
        this.objects = [];
        this.onscene = [];
        this.offscene = [];
    }


    /**
     * Move objects between offscene and onscene
     */
    sortScreenObjects(player) {
        //Find objects that are onscreen in offscene and switch
        if (this.offscene.length >= 1) {
            for (let iter = (Math.random() * this.offscene.length) | 0, times = 0; times < this.offscene.length / 16 + 1; iter++, times++) {
                let i = iter % this.offscene.length;
                if (this.offscene[i].distanceTo(player) < Globals.RENDER_DISTANCE) {
                    this.onscene.push(this.offscene[i]);
                    this.offscene.splice(i, 1);
                } else if (this.offscene[i].markedForRemoval) {
                    this.offscene.splice(i, 1);
                }
            }
        }

        //Find objects that are offscreen in onscene and switch
        for (let iter = (Math.random() * this.onscene.length) | 0, times = 0; times < this.onscene.length / 16; iter++, times++) {
            let i = iter % this.onscene.length;
            if (this.onscene[i].distanceTo(player) > Globals.RENDER_DISTANCE) {
                this.offscene.push(this.onscene[i]);
                this.onscene.splice(i, 1);
            } else if (this.onscene[i].markedForRemoval) {
                this.onscene.splice(i, 1);
            }
        }


        //Objects have to be in the correct order for rendering to work properly;
        //To avoid sorting all the objects every frame, we'll sort a few every frame,
        //and hope they eventually line up right
        //TODO revise this, maybe have a grid-based system
        if (this.onscene.length >= 1) {
            for (let iter = 0; iter < 1 + this.onscene.length / 4; iter++) {
                let i0 = (Math.random() * this.onscene.length) | 0;
                //It's more likely to switch places if i1 is near i0
                let i1 = Math.abs((i0 + Math.random() * 6 - 3) | 0) % this.onscene.length;

                if (i0 > i1) {
                    let a = i0;
                    i0 = i1;
                    i1 = a;
                }
                if (i0 !== i1) {
                    let a0 = this.onscene[i0];
                    let a1 = this.onscene[i1];
                    if (a0.y > a1.y) {
                        this.onscene[i0] = a1;
                        this.onscene[i1] = a0;
                    }
                }
            }
        }
    }
}