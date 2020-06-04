/**
 * Big Island video game source code file
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


import { AvatarAnimation } from "./AvatarAnimation";
import { Avatar } from "./Avatar";
import { Notification } from "./Notification";
import { Globals } from "./Globals";

/**
 * Weapon data structure
 */
export class Weapon {

    damage: number;
    attackType: number;
    attackTime: number;
    attackRadius: number;
    cost: number;
    cost2: number;
    startFrame: number;
    name: string;

    constructor(damage = 0, attackType = 0, attackTime = 0, attackRadius = 0, cost = 0, cost2 = 0, startFrame = 0, name = 'no name') {
        this.damage = damage;
        this.attackType = attackType;
        this.attackTime = attackTime;
        this.attackRadius = attackRadius;
        this.cost = cost;
        this.cost2 = cost2;
        this.startFrame = startFrame;
        this.name = name;
    }


    static FIST = new Weapon(25, 0, 12, 64, 0, 0, 0, "fist");
    static DAGGER = new Weapon(34, 0, 10, 64, 120, 120, 0, "dagger");
    static BOW = new Weapon(20, 1, 24, 256, 240, 240, 25, "bow");
    static STAFF = new Weapon(34, 2, 15, 64, 150, 150, 0, "staff");
    static SPEAR = new Weapon(75, 2, 20, 64, 150, 150, 0, "spear");
    static RAPIER = new Weapon(45, 0, 12, 64, 300, 300, 0 , "rapier");
    static LONGSWORD = new Weapon(70, 0, 18, 64, 500, 500, 0, "longsword");
    static All_WEAPONS = [Weapon.FIST, Weapon.DAGGER, Weapon.BOW, Weapon.STAFF, Weapon.SPEAR, Weapon.RAPIER, Weapon.LONGSWORD];


    /**
     * Equip weapon
     * @param {Avatar} avatar
     * @param {Weapon} weapon
     */
    static equipWeapon(avatar: Avatar, weapon: Weapon = null) {
        if(!weapon) {
            weapon = Globals.randomPick(Weapon.All_WEAPONS);
        }
        const weaponIndex = Weapon.All_WEAPONS.indexOf(weapon);
        if (weaponIndex) {
            avatar.weaponAnimation = AvatarAnimation.animationMap[`weapon${weaponIndex}`];
        } else {
            avatar.weaponAnimation = null;
        }
        avatar.damage = weapon.damage;
        avatar.attackTime = weapon.attackTime;
        avatar.attackType = weapon.attackType;
        avatar.attackRadius = weapon.attackRadius / 2;
    }


    /**
     * Purchase a weapon
     * @param {Weapon} weapon
     * @param {Avatar} avatar
     */
    static purchaseWeapon(weapon: Weapon, avatar: Avatar){
        avatar.coins -= weapon.cost;
        avatar.weapons.push(weapon);
        weapon.cost = (weapon.cost / 2) | 0;
        weapon.cost2 = weapon.cost;
        Notification.notify("Press NEXT_WEAPON to change weapons");
    }


    /**
     * Upgrade a player's weapon
     * @param {string} type
     * @param {Weapon} weapon
     * @param {Avatar} avatar
     */
    static purchaseUpgrade(type: string, weapon: Weapon, avatar: Avatar) {
        switch (type) {
            case "damage":
                weapon.damage *= 1.5;
                avatar.coins -= weapon.cost;
                weapon.cost *= 2;
                break;
            case "rate":
                weapon.attackTime -= 2;
                avatar.coins -= weapon.cost2;
                weapon.cost2 *= 2;
                break;
        }
    }
}