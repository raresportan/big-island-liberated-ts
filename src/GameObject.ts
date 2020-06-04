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
import { AvatarAnimation } from "./AvatarAnimation";
import { Resource } from "./Resource";


/**
 * Game object
 */
export class GameObject extends Vec2 {

    static removalOnDeath = {
        "wander": true,
        "nice": true,
        "hostile": true,
        "hostile-wander": true,
        "mean": true,
        "scared": true,
        "citizen": true,
        "guard-attack": true,
        "guard-wander": true,
        "guard": true
    };

    static tagEvents: Map<string, Map<string, Function>> = new Map<string, Map<string, Function>>();
    static tags: Map<string, Array<GameObject>> = new Map<string, Array<GameObject>>(); //These are the same thing (dirty work around)
    static tagMap: Map<string, Array<GameObject>> = new Map<string, Array<GameObject>>();// <<<<<
    static classMap: object = new Map<string, GameObject>();

    static addTag(object: GameObject, tag: string) {
        object.tags.add(tag);
        GameObject.tags.get(tag) == null ? GameObject.tags.set(tag, [object]) : GameObject.tags.get(tag).push(object);
    }

    static switchTag(o: GameObject, oldTag: string, newTag: string) {
        GameObject.removeTag(o, oldTag);
        GameObject.addTag(o, newTag);
    }

    static removeTag(object: GameObject, tag: string) {
        object.removeTag(tag);
        let index = GameObject.tags.get(tag).indexOf(object);
        if (index != -1) {
            GameObject.tags.get(tag).splice(index, 1);
        }
    }



    tags: Set<string>;
    type = "";
    markedForRemoval = false;


    /**
     * Create a new game object
     * @param {object} a Properties
     * @param {number} x Position on X
     * @param {number} y Position on ADVANCE_TO_NIGHT
     */
    constructor(a: object, x: number, y: number) {
        super(x, y);

        this.tags = new Set<string>();
        this.loadProperties(a);
    }


    /**
     * Load properties
     * @param {{}} properties object
     */
    loadProperties(properties: {}) {
        const keys = Object.keys(properties);
        keys.forEach(k => {
             let v = properties[k];
             this.setProperty(k, v);
        });
    }

    /**
     * Special properties handler
     * Regular properties are set as properties of this object
     * @param {string} k
     * @param v
     */
    setProperty(k: string, v: any) {
        switch (k) {
            case "animation":
                if (v.endsWith("]")) {
                    const vparts = v.split("[");
                    const nparts = vparts[1].split("-");
                    const lowest = parseInt(nparts[0]);
                    const highest = parseInt(nparts[1].substring(0, nparts[1].length - 1)) + 1;
                    v = `${vparts[0]}${(Math.random() * ((highest - lowest) + lowest) | 0) }`
                }
                this['animation'] = AvatarAnimation.animationMap[v];
                break;
            case "type":
                break;
            case "imageIndex":
                this['image'] = Resource.itemImages[v] || Resource.BLANK_IMAGE;
                break;
            case "tag":
                v.forEach((v) => {
                    GameObject.addTag(this, v);
                });
                break;
            default:
                // night-only -> nightOnly
                if(k.indexOf('-') !== -1) {
                   k =k.split('-').map(part => part.toUpperCase()).join().toLowerCase();
                }
                this[k] = v;
                break;
        }
    }


    /**
     * Render this
     * @param {CanvasRenderingContext2D} c
     */
    render(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        this.debugRender(c);
        c.restore();
    }


    /**
     * Debug mode renderer
     * @param {CanvasRenderingContext2D} c
     * @param {number} sep
     */
    debugRender(c: CanvasRenderingContext2D, sep = 80) {
        if (Globals.DEBUG) {
            c.fillStyle = "#fff";
            const string = `(${((this.x * 10) | 0) / 10.0},${((this.y * 10) | 0) / 10.0})`;
            c.fillText(string, 0, -.5 * sep + 10);

            let values=[];
            this.tags.forEach( (value)=> values.push(value));
            const tags = values.join(', ');
            c.fillText(tags, 0, .5 * sep + 10);
        }
    }


    /**
     * Execute the handlers for the event
     * @param {string} event
     */
    fireTagEvent(event: string) {
        this.tags.forEach(tag => {
            let tagEvent = GameObject.tagEvents.get(tag);
            let eventFunction = tagEvent.get(event);
            eventFunction(this);
        });
    }


    /**
     * Mark object for removal from game
     */
    markForRemoval() {
        this.markedForRemoval = true;
        this.tags = new Set<string>();
    }


    /**
     * Check if has the tag
     * @param {string} tag
     * @returns {boolean}
     */
    hasTag(tag: string): boolean {
        return this.tags.has(tag);
    }


    /**
     * Remove the tag
     * @param {string} tag
     */
    removeTag(tag: string) {
        this.tags.delete(tag);
    }
}
