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
import { AvatarAnimation, AnimationType } from "./AvatarAnimation";
import { Orientation, Vec2 } from "./Vec2";
import { Weapon } from "./Weapon";
import { Notification } from "./Notification";
import { Globals } from "./Globals";


/**
 * LEFT special kind of game object that represents the player and NPCs.
 */
export class Avatar extends GameObject {

    private _attacking = false;

    // Avatar animation (e.g. resources/characters/citizen0/walkcycle.png)
    animation: AvatarAnimation;

    // Avatar weapon animation (e.g. resources/weapons/bow.png)
    weaponAnimation: AvatarAnimation;
    currentAnimation = AnimationType.WALK;
    //0 - up,1 - left, 2 - down, 3 - right
    currentOrientation = 2;

    // coins
    coins = 0;
    maxHealth = 100;
    weapons: Array<Weapon> = [];
    currentWeapon: Weapon = Weapon.FIST;

    currentFrame = 0;
    velocity: Vec2;
    attackDirection: Vec2;
    armor = 1;

    damage = 25;
    attackType = 0;
    attackTime = 12;
    attackRadius = 32;

    currentAttackTime = 0;
    timeSinceHealthChange = 0;
    health = 100;
    alive = true;
    speed = 1;
    speaking = false;
    sayTime = 0;
    speech = "";


    /**
     * Creates a new avatar
     * @param {object} properties
     */
    constructor(properties:object) {
        super(properties, 0, 0);
        this.velocity = new Vec2(0, 0);
    }

    get attacking() {
        return this._attacking;
    }
    set attacking(b: boolean) {
        this._attacking = b;
        this.currentAnimation = b ? AvatarAnimation.AnimationTypes[this.attackType] : AnimationType.WALK;
    }

    /**
     * Handles the avatar hurt logic
     * @param {number} damage
     * @param {Vec2} direction
     */
    hurt(damage: number, direction: Vec2) {
        this.fireTagEvent("hit");

        this.health -= this.damage * this.armor;
        if (this.damage > 10) {
            this.velocity.add(direction.multiplyScalar(damage / 2));
            if (this.velocity.lengthSq() > 8 * 8) {
                this.velocity.normalize().multiplyScalar(8);
            }
        }

        this.timeSinceHealthChange = 120;

        // if is dead
        if (this.alive && this.health <= 0) {
            this.currentFrame = 0;
            this.currentAnimation = AnimationType.DEATH;
            this.currentOrientation = Orientation.UP;
            GameObject.tagEvents.get("corpse").get("init")(this);
            GameObject.addTag(this, "corpse");
            this.fireTagEvent("die");
            GameObject.tagEvents.get("corpse").get("init")(this);
            this.alive = false;

            this.tags.forEach( tag => {
                if (GameObject.removalOnDeath[tag]) {
                    this.tags.delete(tag);
                    const objects:Array<GameObject> = GameObject.tagMap.get(tag);
                    for (let u = objects.length - 1; u >= 0; u--) {
                        if (objects[u] == this) {
                            objects.splice(u, 1);
                            break;
                        }
                    }
                }
            });
        }
    }


    /**
     * Avatar speak
     * @param {string} text
     * @param {number} time
     */
    say(text: string, time = 300) {
        this.speaking = true;
        this.speech = text;
        this.sayTime = time;
    }


    /**
     * Make avatar use previous weapon
     */
    usePreviousWeapon(){
        let currentWeaponIndex = this.weapons.indexOf(this.currentWeapon);
        if(currentWeaponIndex > 0) {
            currentWeaponIndex--;
            this.useWeapon(this.weapons[currentWeaponIndex]);
        }
    }

    /**
     * Make avatar use next weapon
     */
    useNextWeapon(){
        let currentWeaponIndex = this.weapons.indexOf(this.currentWeapon);
        if(currentWeaponIndex < this.weapons.length - 1) {
            currentWeaponIndex++;
            this.useWeapon(this.weapons[currentWeaponIndex]);
        }
    }


    /**
     * Make avatar use this weapon
     * @param {Weapon} weapon
     */
    useWeapon(weapon:Weapon) {
        let weaponIndex = this.weapons.indexOf(weapon);
        if(weaponIndex !== -1){
            this.currentWeapon = weapon;
            this.weaponAnimation = AvatarAnimation.animationMap[`weapon${weaponIndex}`];

            this.damage = this.currentWeapon.damage;
            this.attackTime = this.currentWeapon.attackTime;
            this.attackType = this.currentWeapon.attackType;
            Notification.notify(`Using ${this.currentWeapon.name}`);
        }
    }



    /**
     * Render the avatar
     * @param {CanvasRenderingContext2D} c Canvas context
     */
    render(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        this.debugRender(c);

        // 1. render avatar animation
        this.animation.render(c, this.currentAnimation, this.currentOrientation, (this.currentFrame / 5) | 0);

        // 2. render avatar weapon animation if available
        if (this.weaponAnimation) {
            this.weaponAnimation.render(c, this.currentAnimation, this.currentOrientation, (this.currentFrame / 5) | 0);
        }

        // 3. draw "Health Bar"
        if (this.timeSinceHealthChange >= 0) {
            this.timeSinceHealthChange--;
            c.globalAlpha = this.timeSinceHealthChange / 120;

            const healthBarSize = 50.0;
            c.fillStyle = "#f00";
            c.fillRect(-healthBarSize / 2, -25, healthBarSize, 5);
            c.fillStyle = "#0f0";
            c.fillRect(-healthBarSize / 2, -25, this.health / 100.0 * healthBarSize, 5);
        }

        // 4. render the avatar speech bubble
        if (this.speaking) {
            c.globalAlpha *= .75;
            c.font = "14px Arial";

            const bubbleWidth = c.measureText(this.speech).width + 20;
            c.strokeStyle = "#000";
            c.fillStyle = "#fff";
            c.fillRect(8, -12 - 30, bubbleWidth, 30);
            c.strokeRect(8, -12 - 30, bubbleWidth, 30);
            c.fillStyle = "#000";
            c.fillText(this.speech, bubbleWidth / 2 + 6, -22);
            c.globalAlpha /= .75;
        }
        c.restore();
    }
}
