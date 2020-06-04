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
import { Vec2 } from "./Vec2";


/**
 * Spawn point for NPCs
 */
export class SpawnPoint extends GameObject {
    freq = -1;

    // how many NPCs to spawn
    limit = 5;

    // how many NPCs were spawned so far
    amountSpawned = 0;

    // time until next spawn
    timeToSpawn = 0;

    // spawn only at night?
    nightOnly = false;

    // type name of object you want to spawn
    emission: string;

    // spawned object properties
    emissionProperties: Map<String, any>;


    /**
     * Creates a new spawn point
     * @param {object} properties
     */
    constructor(properties: object) {
        super(properties, 0, 0);
        this.timeToSpawn = this.freq;
    }


    /**
     * Update the spawn point logic
     */
    update(time: number, spawnFunction: Function) {
        console.log('Update spawn point');
        if ((!this.nightOnly || (this.nightOnly && (time > 21 || time < 5))) && this.freq > 0 && this.amountSpawned < this.limit) {
            this.timeToSpawn--;

            if (this.timeToSpawn <= 0) {
                const ob: Vec2 = spawnFunction(this.emission, (this.emissionProperties != null) ? this.emissionProperties : {});
                ob.x = this.x;
                ob.y = this.y;
                this.timeToSpawn = this.freq;
                this.amountSpawned++;
            }
        }
    }


    /**
     * Render the spawn point
     * For now this a NOP
     * @param {CanvasRenderingContext2D} c
     */
    render(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        this.debugRender(c, 20);
        c.restore();
    }
}