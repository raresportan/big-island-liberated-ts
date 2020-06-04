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
import { SpeechBubble } from "./SpeechBubble";
import { Globals } from "./Globals";
import { GameObject } from "./GameObject";
import { SpawnPoint } from "./SpawnPoint";
import { Avatar } from "./Avatar";
import { Arrow } from "./Arrow";
import { Vec2 } from "./Vec2";
import { Notification } from "./Notification";
import { World } from "./World";
import { Intro } from "./Intro";
import { Dialog } from "./Dialog";
import { AvatarAnimation } from "./AvatarAnimation";
import { Item } from "./Item";
import { Weapon } from "./Weapon";
import { PathNode } from "./PathNode";
import { KEYS } from "./InputManager";
import { Resource } from "./Resource";

export class Game {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    world: World;
    niceFactor: number;
    hudDistanceFromEdge = 34;
    controlsOpen = true;
    paused = false;

    AGRO_DISTANCE = 256;
    ZOMBIE_WANDER_DISTANCE = 256;
    ZOMBIE_SPEED = .6;
    ZOMBIE_ARMOR = 1;
    ZOMBIE_DAMAGE = 25;

    intro = true;
    introPlayer: Intro;
    rapid_clicks = 0;

    friendlySpeech = [
        "Hi!",
        "Hiya!",
        "Hello!",
        "It's not so scary with you around!",
        "Thanks for the help!"
    ];

    meanSpeech = [
        "Why don't you just go?",
        "Get outta here!",
        "Get out!",
        "Why won't you help us?",
        "It's outsiders like you that caused this!"
    ];

    lostSpeech = [
        "Help!",
        "Where is everyone?",
        "Where do I go?",
        "Please help me!",
        "Where am I?"
    ];

    protips = [
        "You can switch weapons with NEXT_WEAPON",
        "Villagers tend to be meaner when you kill them",
        "Villagers will be nicer if you keep saving them",
        "Upgrades can be purchased for all weapons",
        "Zombies grow stronger every day, equip yourself accordingly",
        "You can press ADVANCE_TIME to speed up time",
        "Press the SHIFT key to sprint",
        "You can purchase patrol guards to help keep villagers safe",
        "Health upgrades can be found in the bottom left region of the map",
        "Weapons can be purchased in the bottom right region of the map",
        "All vendors are located in towns",
        "Weapon upgrades are in the top right region of the map"
    ];

    foundSpeech = [
        "Can you take me somewhere safe?",
        "Please help me!",
        "Please take me home!"
    ];

    scaredSpeech = [
        "Ahhhh!",
        "Look out!",
        "Run!",
        "AHHHH!",
        "Woah!"
    ];

    constructor(public showMenuFunction: Function, gameOptions = {}, worldOptions = {}) {
        this.niceFactor = 0;
        this.paused = false;
        Globals.randomPickFrameCount = (Math.random() * 64) | 0;

        GameObject.classMap = {
            "spawn": (p) => new SpawnPoint(p),
            "avatar": (p) => new Avatar(p),
            "node": (p) => new GameObject(p, 0, 0),
            "arrow": (p) => new Arrow(p),
            "floating_text": (p) => new SpeechBubble(p)
        };

        GameObject.tagEvents = new Map<string, Map<string, Function>>();

        ///////// Citizen ///////////

        const citizenTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("citizen", citizenTagEvents);

        citizenTagEvents.set("init", (avatar: Avatar) => {
            if (avatar.damage == null) {
                avatar.armor = 1;
                avatar.damage = 0;
            }
            avatar.speed = .5 + Math.random() * 1.5;
            avatar["destination"] = avatar.clone();//DIRTY FIX
            avatar["waitTime"] = 0;
            let r = Math.random() + this.niceFactor;
            if (r < .1) {
                GameObject.addTag(avatar, "mean");
            } else if (r > 1) {
                GameObject.addTag(avatar, "nice");
            }
            avatar["followOffset"] = new Vec2(Math.random() * 128 - 64, Math.random() * 128 - 64);
        });

        citizenTagEvents.set("update", (citizen: Avatar) => {
            if (!citizen.hasTag("scared")) {
                let zoms = GameObject.tags.get("zombie");
                for (let i = (Math.random() * zoms.length) | 0, iter = 0; iter < zoms.length / 16; iter++ , i++) {
                    let index = i % zoms.length;
                    if (zoms[index]['alive'] && zoms[index].distanceTo(citizen) < 96) {
                        ["wander", "traveler", "lost", "following", "homebound"].forEach((tag) => {
                            if (citizen.hasTag(tag)) {
                                GameObject.removeTag(citizen, tag);
                            }
                        });
                        citizen.say(this.scaredSpeech[(this.scaredSpeech.length * Math.random()) | 0], 100);
                        GameObject.addTag(citizen, "scared");
                        citizen["scaredOf"] = zoms[index];
                        GameObject.tagEvents.get("scared").get("init")(citizen);
                        return;
                    }
                }

                //Basically the exact same thing with corpses
                zoms = GameObject.tags.get("corpse");
                for (let i = (Math.random() * zoms.length) | 0, iter = 0; iter < zoms.length / 16; iter++ , i++) {
                    let index = i % zoms.length;
                    if (!zoms[index].hasTag("zombie") && zoms[index].distanceTo(citizen) < 96) {
                        ["wander", "traveler", "lost", "following", "homebound"].forEach((tag) => {
                            if (citizen.hasTag(tag)) {
                                GameObject.removeTag(citizen, tag);
                            }
                        });
                        citizen.say( Globals.randomPick(this.scaredSpeech));
                        GameObject.addTag(citizen, "scared");
                        citizen["scaredOf"] = zoms[index];
                        GameObject.tagEvents.get("scared").get("init")(citizen);
                        return;

                    }
                }
            }
        });


        citizenTagEvents.set("hit", (citizen: Avatar) => {
            if (citizen.distanceTo(this.world.player) < 256) {
                Globals.audio.play("hurt");
            }
            if (this.world.player.attacking) {
                this.niceFactor -= .005;
                ["wander", "traveler", "lost", "following", "homebound", "scared"].forEach((tag) => {
                    if (citizen.hasTag(tag)) {
                        GameObject.removeTag(citizen, tag);
                    }
                });
                citizen.say( Globals.randomPick(this.scaredSpeech));
                GameObject.addTag(citizen, "scared");
                citizen["scaredOf"] = this.world.player;
                GameObject.tagEvents.get("scared").get("init")(citizen);
            }
        });


        citizenTagEvents.set("die", (avatar: Avatar) => {
            this.world.state.totalPopulation--;
            this.world.state.awakePopulation--;
            this.world.state.zombie_max++;
            this.niceFactor -= .01;
            if (this.world.player.attacking && this.world.player.distanceTo(avatar) < 256) {
                this.niceFactor -= .05;
                this.giveCoin(this.world.player, (10 * Math.random() + 2) | 0);
            }
        });


        citizenTagEvents.set("collide", (citizen: Avatar) => {
            if (Globals.randomPickFrame(120)) {
                citizen.add(citizen.velocity);
            }
        });


        ///////// Player ///////////

        const playerTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("player", playerTagEvents);
        playerTagEvents.set("init", (player: Avatar) => {
            player.damage = 25;
            player.armor = .5;
            player.speed = 1;
        });

        playerTagEvents.set("die", (player: Avatar) => {
            Notification.notify("You have died, please wait");
            player["deadTime"] = 540;
            Globals.audio.playTheme();
        });

        playerTagEvents.set("decomposed", (player: Avatar) => {
            this.paused = true;
            this.gameOver(this.context);
        });

        playerTagEvents.set("update", (player: Avatar) => {
            player.health = (player.health < this.world.player.maxHealth) ? player.health + .2 : this.world.player.maxHealth;
            if (this.world.collisionMap.collisionAtVec2(player)) {
                player.add(player.velocity);
            }
        });


        /////////////// Scared ///////////////
        const scaredTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("scared", scaredTagEvents);

        scaredTagEvents.set("init", (citizen: Avatar) => {
            citizen["runDirection"] = citizen.clone().sub(citizen["scaredOf"]).normalize().multiplyScalar(citizen.speed);
        });

        scaredTagEvents.set("update", (citizen: Avatar) => {
            citizen.velocity.add(citizen["runDirection"]);
            if (Globals.randomPickFrame(8)) {
                const zom = citizen["scaredOf"];
                if (zom.distanceTo(citizen) > this.AGRO_DISTANCE + 32) {
                    GameObject.switchTag(citizen, "scared", "lost");
                    GameObject.addTag(citizen, "wander");
                }
            }
        });


        ///////// Traveler ///////////
        const travelerTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("traveler", travelerTagEvents);

        travelerTagEvents.set("init", (a: Avatar) => {
            const cnodes = this.world.getClosePathNodes(a);
            if (cnodes.length > 0) {
                let ni;
                if (this.world.state.time < 16) {
                    ni = (cnodes.length * Math.random()) | 0;
                    a["path"] = cnodes[ni].path;
                    a["pathDirection"] = cnodes[ni].start ? 1 : -1;
                    a["pathIndex"] = cnodes[ni].start ? 0 : cnodes[ni].path.points.length - 1;
                    a["pathPoint"] = cnodes[ni].clone();
                    a["pathMove"] = cnodes[ni].clone().sub(a).normalize().multiplyScalar(a.speed);
                } else {
                    for (let i = cnodes.length - 1; i >= 0; i--) {
                        if (cnodes[i].house) {
                            GameObject.tags.get("house").filter((house: GameObject) => {
                                if (house.distanceTo(a) < 256) {
                                    a["home"] = house;
                                    return true;
                                }
                                return false;
                            });
                            GameObject.switchTag(a, "traveler", "homebound");
                            GameObject.tagEvents.get("homebound").get("init")(a);
                            return;
                        }
                    }
                    GameObject.switchTag(a, "traveler", "wander");
                    GameObject.tagEvents.get("wander").get("init")(a);
                    return;
                }
            } else {
                GameObject.switchTag(a, "traveler", "wander");
                GameObject.tagEvents.get("wander").get("init")(a);
            }
        });

        travelerTagEvents.set("collide", (a: Avatar) => {
            a["pathPoint"] = a["path"].points[a["pathIndex"]];
            a["pathMove"] = a["pathPoint"].clone().sub(a).normalize().multiplyScalar(a.speed);
            a.add(a["pathMove"]);
        });

        travelerTagEvents.set("update", (a: Avatar) => {
            a.velocity.add(a["pathMove"]);
            if (a["pathPoint"].distanceTo(a) < 32) {
                a["pathIndex"] += a["pathDirection"];
                if (a["pathIndex"] < 0 || a["pathIndex"] >= a["path"].points.length) {
                    GameObject.tagEvents.get("traveler").get("init")(a);
                } else {
                    a["pathPoint"] = a["path"].points[a["pathIndex"]].clone();
                    const d = a.distanceTo(a["pathPoint"]) / 4;
                    a["pathPoint"].addTo(Math.random() * d - d / 2, Math.random() * d - d / 2);
                    a["pathMove"] = a["pathPoint"].clone().sub(a).normalize().multiplyScalar(a.speed);
                }
            }
        });


        ///////// Guard wander ///////////
        const guardWanderTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("guard-wander", guardWanderTagEvents);

        //LEFT guard will walk around and attack any hostile creatures he sees
        guardWanderTagEvents.set("init", (guard: Avatar) => {
            guard["positionOffset"] = new Vec2(Math.random() * 64 - 32, Math.random() * 64 - 32);
            this.setGuardPath(guard);
        });

        guardWanderTagEvents.set("update", (guard: Avatar) => {
            //Check for nearby zombies
            //TODO if there are other enemies change to evil
            const zombies = GameObject.tags.get("zombie");
            if (zombies && zombies.length > 0) {
                for (let i = (Math.random() * zombies.length) | 0, iter = 0; iter < zombies.length / 30 + 1; iter++ , i++) {
                    const zom: Avatar = (<Avatar>zombies[i % zombies.length]);
                    if (zom.distanceTo(guard) < Globals.GUARD_VIEW_DISTANCE) {
                        GameObject.switchTag(guard, "guard-wander", "guard-attack");
                        guard["target"] = zom;
                        return;
                    }
                }
            }
            guard.velocity.add(guard["destination"].clone().sub(guard).normalize().multiplyScalar(guard.speed));
            if (guard["destination"].distanceTo(guard) < 32) {
                guard["pathIndex"] += guard["pathDirection"];
                if (guard["pathIndex"] < 0 || guard["pathIndex"] >= guard["path"].points.length) {
                    if (Globals.randomPickFrame(2)) {
                        guard.currentFrame = 0;
                        guard["waitTime"] = 120 + (Math.random() * 360) | 0;
                        GameObject.switchTag(guard, "guard-wander", "guard-wait");
                        return;
                    } else {
                        this.setGuardPath(guard);
                        return;
                    }

                } else {
                    guard["destination"] = guard["path"].points[guard["pathIndex"]].clone().add(guard["positionOffset"]);
                }
            }

            if (guard.health < 100) {
                guard.health += .005;
            }
        });

        guardWanderTagEvents.set("collide", (guard: Avatar) => {
            if (guard["collideTime"]++ > 120) {
                guard["collideTime"] = 0;
                guard.set(guard["destination"].x, guard["destination"].y);
            }
        });

        guardWanderTagEvents.set("die", (guard: Avatar) => {

        });

        /////// Guard wait /////
        const guardWaitTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("guard-wait", guardWaitTagEvents);

        guardWaitTagEvents.set("update", (guard: Avatar) => {
            const zombies = GameObject.tags.get("zombie");
            if (zombies.length > 0) {
                for (let i = ((Math.random() * zombies.length) | 0), iter = 0; iter < zombies.length / 30 + 1; iter++ , i++) {
                    const zom: Avatar = (<Avatar>zombies[i % zombies.length]);
                    if (zom.distanceTo(guard) < Globals.GUARD_VIEW_DISTANCE) {
                        GameObject.switchTag(guard, "guard-wait", "guard-attack");
                        guard["target"] = zom;
                        return;
                    }
                }
            }
            guard["waitTime"]--;
            if (guard["waitTime"] <= 0) {
                this.setGuardPath(guard);
                GameObject.switchTag(guard, "guard-wait", "guard-wander");
            }
        });


        /////// Guard attack /////
        const guardAttackTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("guard-attack", guardAttackTagEvents);

        guardAttackTagEvents.set("init", (guard: Avatar) => {

        });

        guardAttackTagEvents.set("update", (guard: Avatar) => {
            const zom: Avatar = guard["target"];
            if (zom != null && zom.alive) {
                if (guard.distanceTo(zom) > guard.attackRadius) {
                    guard.velocity.add(zom.clone().sub(guard).normalize().multiplyScalar(guard.speed));
                    guard.attacking = false;
                } else {
                    guard.attacking = true;
                    guard.attackDirection = zom.clone().sub(guard).normalize();
                }
            } else {
                guard.attacking = false;
                GameObject.switchTag(guard, "guard-attack", "guard-wander");
            }
        });

        guardAttackTagEvents.set("die", (guard: Avatar) => {

        });


        /////// Guard  /////
        const guardTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("guard", guardTagEvents);

        guardTagEvents.set("init", (guard: Avatar) => {
            guard["collideTime"] = 0;
            guard.armor = .25;
            guard.speed = .8 + Math.random() * 1.2;
            Weapon.equipWeapon(guard);
        });

        guardTagEvents.set("die", (guard: Avatar) => {
            this.spawnGuard();
        });

        /////// Homebound  /////
        const homeboundTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("homebound", homeboundTagEvents);

        homeboundTagEvents.set("init", (avatar: Avatar) => {
            avatar["collisionCount"] = 0;
            //TODO SIMPLIFY
            const home: GameObject = avatar["home"];
            avatar["homeboundDirection"] = home.clone().sub(avatar).normalize().multiplyScalar(avatar.speed);
        });

        homeboundTagEvents.set("update", (avatar: Avatar) => {
            avatar.velocity.add(avatar["homeboundDirection"]);
            if (Globals.randomPickFrame(8)) {
                const d = avatar["home"].distanceTo(avatar);
                if (d > 256) {
                    let found = false;
                    GameObject.tags.get("house").filter((house: GameObject) => {
                        if (house.distanceTo(avatar) < 256) {
                            avatar["home"] = house;
                            found = true;
                            return true;
                        }
                        return false;
                    });

                    if (found) {
                        avatar["collisionCount"] = 0;
                        avatar["homeboundDirection"] = avatar["home"].clone().sub(avatar).normalize().multiplyScalar(avatar.speed);
                    } else {
                        GameObject.switchTag(avatar, "homebound", "lost");
                        GameObject.addTag(avatar, "wander");
                    }
                } else if (d < 32) {
                    avatar.markForRemoval();
                    this.world.state.awakePopulation--;
                }
            }
        });


        homeboundTagEvents.set("collide", (avatar: Avatar) => {
            avatar["collisionCount"]++;
            if (avatar["collisionCount"] > 120) {
                GameObject.switchTag(avatar, "homebound", "lost");
                GameObject.addTag(avatar, "wander");
            } else if (avatar.distanceTo(avatar["home"]) < 256) {
                avatar.markForRemoval();
                this.world.state.awakePopulation--;
            }
        });

        /////// Lost  /////
        const lostTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("lost", lostTagEvents);

        lostTagEvents.set("update", (avatar: Avatar) => {
            if (avatar.speaking) {
                avatar.sayTime--;
                if (avatar.sayTime < 0) {
                    avatar.speaking = false;
                }
            }
            if (Globals.randomPickFrame(8) && avatar.distanceTo(this.world.player) < 64) {
                avatar.say(this.foundSpeech[(this.foundSpeech.length * Math.random()) | 0], 120);
                GameObject.switchTag(avatar, "lost", "following");
                GameObject.removeTag(avatar, "wander");
            } else {
                for (let i = (Math.random() * GameObject.tags.get("house").length) | 0, iter = 0; iter < 4; iter++ , i++) {
                    let index = i % GameObject.tags.get("house").length;
                    if (GameObject.tags.get("house")[index].distanceTo(avatar) < 256) {
                        avatar["home"] = GameObject.tags.get("house")[index];
                        iter = 9999;
                        GameObject.switchTag(avatar, "lost", "homebound");
                        GameObject.tagEvents.get("homebound").get("init")(avatar);
                        GameObject.removeTag(avatar, "wander");
                    }
                }
            }
        });

        /**
         niceTagEvents.set("init", (avatar: Avatar) => {
            avatar.sayTime = Math.random() * 500;
        });

         niceTagEvents.set("update", (avatar: Avatar) => {
            if (avatar.sayTime < 0) {
                avatar.speaking = false;
                GameObject.tags.get("player").forEach((player: Avatar) => {
                    if (player.distanceTo(avatar) < 80) {
                        avatar.say(this.friendlySpeech[(Math.random() * this.friendlySpeech.length) | 0]);
                    }
                });
                avatar.sayTime = Math.random() * 500;
            } else {
                avatar.sayTime--;
            }
        });*/


        /////// Corpse  /////
        const corpseTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("corpse", corpseTagEvents);

        corpseTagEvents.set("init", (avatar: Avatar) => {
            avatar["deadTime"] = 0;
            avatar.speaking = false;
        });

        corpseTagEvents.set("update", (avatar: Avatar) => {
            avatar["deadTime"]++;
            if (avatar["deadTime"] > 600) {
                avatar.fireTagEvent("decomposed");
                avatar.markForRemoval();
            }
        });


        /////// Following  /////
        const followingTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("following", followingTagEvents);

        followingTagEvents.set("update", (avatar: Avatar) => {
            if (avatar.speaking) {
                avatar.sayTime--;
                if (avatar.sayTime < 0) {
                    avatar.speaking = false;
                }
            }
            if (avatar.distanceTo(this.world.player) > 64) {
                avatar.velocity.add(this.world.player.clone().add(avatar["followOffset"]).sub(avatar).normalize().multiplyScalar(2));
            }
            //Check if avatar is near any houses
            for (let i = (Math.random() * GameObject.tags.get("house").length) | 0, iter = 0; iter < 4; iter++ , i++) {
                let index = i % GameObject.tags.get("house").length;
                if (GameObject.tags.get("house")[index].distanceTo(avatar) < 256) {
                    avatar.say(Globals.randomPickFrame(2) ? "Thank you!" : "Thanks!", 100);
                    avatar["home"] = GameObject.tags.get("house")[index];
                    this.giveCoin(this.world.player, ((Math.random() * 20 + 5) * this.world.state.dayCount) | 0);
                    iter = 9999;
                    this.niceFactor += .05;
                    this.world.state.savedCitizens++;
                    GameObject.switchTag(avatar, "following", "homebound");
                    GameObject.tagEvents.get("homebound").get("init")(avatar);
                }
            }
        });

        /////// Wander  /////
        const wanderTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("wander", wanderTagEvents);

        wanderTagEvents.set("collide", (avatar: Avatar) => {
            avatar["destination"] = avatar.clone().addTo(Math.random() * 100 - 50, Math.random() * 100 - 50);
        });

        wanderTagEvents.set("init", (avatar: Avatar) => {
            avatar["destination"] = avatar.clone();
            avatar["waitTime"] = 0;
        });

        wanderTagEvents.set("update", (avatar: Avatar) => {
            if (avatar["waitTime"] > 0) {
                avatar["waitTime"]--;
            } else if (avatar["destination"] && avatar["destination"].distanceTo(avatar) > 2) {
                const destination: Vec2 = avatar["destination"];
                avatar.velocity.add(destination.clone().sub(avatar).normalize().multiplyScalar(avatar.speed));
            } else {
                if (Math.random() < .75) {
                    avatar["destination"] = avatar.clone().addTo(Math.random() * 400 - 200, Math.random() * 400 - 200);
                } else {
                    avatar["destination"] = avatar.clone();
                    avatar["waitTime"] = Math.random() * 200;
                    avatar.currentFrame = 0;
                    avatar.velocity.zero();
                }
            }
        });


        /////// Nice  /////
        const niceTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("nice", niceTagEvents);

        niceTagEvents.set("init", (avatar: Avatar) => {
            avatar.sayTime = Math.random() * 500;
        });

        niceTagEvents.set("update", (avatar: Avatar) => {
            if (avatar.sayTime < 0) {
                avatar.speaking = false;
                GameObject.tags.get("player").forEach((player: Avatar) => {
                    if (player.distanceTo(avatar) < 80) {
                        avatar.say(this.friendlySpeech[(Math.random() * this.friendlySpeech.length) | 0]);
                    }
                });
                avatar.sayTime = Math.random() * 500;
            } else {
                avatar.sayTime--;
            }
        });


        /////// Mean  /////
        const meanTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("mean", meanTagEvents);

        meanTagEvents.set("init", (avatar: Avatar) => {
            avatar.sayTime = Math.random() * 500;
        });

        meanTagEvents.set("update", (avatar: Avatar) => {
            if (avatar.sayTime < 0) {
                avatar.speaking = false;
                GameObject.tags.get("player").forEach((player: Avatar) => {
                    if (player.distanceTo(avatar) < 80) {
                        avatar.say( Globals.randomPick(this.meanSpeech));
                    }
                });
                avatar.sayTime = Math.random() * 500;
            } else {
                avatar.sayTime--;
            }
        });


        /////// Salesman  /////
        const salesmanTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("salesman", salesmanTagEvents);

        salesmanTagEvents.set("update", (avatar: Avatar) => {
            if (avatar.sayTime < 0) {
                avatar.speaking = false;
                if (Globals.randomPickFrame(2)) {
                    avatar.say( Globals.randomPick(avatar["calls"]));
                }
                avatar.sayTime = 100 + Math.random() * 200;
            } else {
                avatar.sayTime--;
            }
            if (this.world.player.distanceTo(avatar) < 128 && Notification.notifications.length == 0) {
                Notification.notify("Press Space to Interact");
            }
        });


        /////// Arrow  /////
        const arrowTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("arrow", arrowTagEvents);

        arrowTagEvents.set("update", (arrow: Arrow) => {
            arrow.add(arrow["direction"].divideScalar(1.5));
            if (this.damageBubble(arrow, 32, arrow["damage"], arrow["direction"].clone().normalize()).length > 0 || this.world.collisionMap.collisionAtVec2(arrow) || arrow.distance++ > 12) {
                arrow.markForRemoval();
            }
        });


        /////// Zombie  /////
        const zombieTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("zombie", zombieTagEvents);

        zombieTagEvents.set("init", (zom: Avatar) => {
            zom.speed = .5 + Math.random();
        });

        zombieTagEvents.set("die", (a: Avatar) => {
            if (this.world.player.distanceTo(a) < 256 && this.world.player.attacking) {
                this.world.state.zombies_killed++;
                this.world.state.zombie_out--;
                this.giveCoin(this.world.player, ((Math.random() * 7 + 3) * (1 + this.world.state.dayCount / 4)) | 0);
            }
        });


        /////// Hostile wander  /////
        const hostileWanderTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("hostile-wander", hostileWanderTagEvents);

        hostileWanderTagEvents.set("init", (zom: Avatar) => {
            zom["originalPosition"] = zom.clone();
            zom.damage = this.ZOMBIE_DAMAGE;
            zom.armor = this.ZOMBIE_ARMOR;
            GameObject.tagEvents.get("wander").get("init")(zom);
        });

        hostileWanderTagEvents.set("update", (zom: Avatar) => {
            //Check for nearby enemies
            if (zom["waitTime"] > 0) {
                zom["waitTime"]--;
            } else if (zom["destination"].distanceTo(zom) > 2) {
                const destination: Vec2 = zom["destination"];
                zom.velocity.add(destination.clone().sub(zom).normalize().multiplyScalar(zom.speed * this.ZOMBIE_SPEED));
            } else {
                if (Math.random() < .75) {
                    zom["destination"] = zom.clone().addTo(Math.random() * 400 - 200, Math.random() * 400 - 200);
                } else {
                    zom["destination"] = zom.clone();
                    zom["waitTime"] = Math.random() * 200;
                    zom.currentFrame = 0;
                    zom.velocity.zero();
                }
            }
            GameObject.tags.get("friendly").filter((avatar: Avatar) => {
                if (avatar.alive && avatar.distanceTo(zom) < this.AGRO_DISTANCE && !avatar.markedForRemoval) {
                    GameObject.removeTag(zom, "hostile-wander");
                    GameObject.addTag(zom, "hostile");
                    zom["target"] = avatar;
                    return true;
                }
                return false;
            });
        });

        hostileWanderTagEvents.set("collide", (zom: Avatar) => {
            zom["destination"] = zom.clone().addTo(Math.random() * 100 - 50, Math.random() * 100 - 50);
        });

        hostileWanderTagEvents.set("hit", (zom: Avatar) => {
            GameObject.tags.get("friendly").filter((avatar: Avatar) => {
                if (avatar.alive && avatar.attacking && !avatar.markedForRemoval && avatar.distanceTo(zom) < this.AGRO_DISTANCE * 2) {
                    GameObject.removeTag(zom, "hostile-wander");
                    GameObject.addTag(zom, "hostile");
                    zom["target"] = avatar;
                    return true;
                }
                return false;
            });
        });

        /////// Hostile   /////
        const hostileTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("hostile", hostileTagEvents);

        hostileTagEvents.set("update", (zom: Avatar) => {
            if (zom["target"] && zom["target"].alive && !zom["target"].markedForRemoval) {
                const target: Avatar = zom["target"];
                const distance = target.distanceTo(zom);

                if (distance < 32) {
                    zom.attacking = true;
                    zom.attackDirection = target.clone().sub(zom).normalize();
                } else if (distance < this.AGRO_DISTANCE * 2) {
                    zom.attacking = false;
                    zom.velocity.sub(zom.clone().sub(target).normalize().multiplyScalar(this.ZOMBIE_SPEED * zom.speed));
                } else {
                    GameObject.switchTag(zom, "hostile", "hostile-wander");
                    zom["target"] = null;
                }
            } else {
                GameObject.switchTag(zom, "hostile", "hostile-wander");
            }
        });

        hostileTagEvents.set("kill", (zom: Avatar) => {
            if (zom["target"] && !zom["target"].alive) {
                GameObject.addTag(zom, "hostile-wander");
                GameObject.removeTag(zom, "hostile");
                zom["target"] = null;
                zom.attacking = false;
            }
        });

        hostileTagEvents.set("hit", (zom: Avatar) => {
            GameObject.tags.get("friendly").filter((friend: Avatar) => {
                if (friend.attacking && friend.distanceTo(zom) < 96) {
                    zom["target"] = friend;
                    return true;
                }
                return false;
            });
        });

        /////// Nestbound   /////
        const nestboundTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("nestbound", nestboundTagEvents);

        nestboundTagEvents.set("init", (zom: Avatar) => {
            zom["nestDirection"] = zom["originalPosition"].clone().sub(zom).normalize();
            zom["collisionCount"] = 0;
        });

        nestboundTagEvents.set("update", (zom: Avatar) => {
            zom.velocity.add(zom["nestDirection"]);
            if (Globals.randomPickFrame(4) && zom.distanceTo(zom["originalPosition"]) < 32) {
                this.world.state.zombie_out--;
                zom.markForRemoval();
            }
        });

        nestboundTagEvents.set("collide", (zom: Avatar) => {
            zom["collisionCount"]++;
            if (zom["collisionCount"] > 120) {
                this.world.state.zombie_out--;
                zom.markForRemoval();
            }
        });


        /////// Floating text   /////
        const floatingTextTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("floating_text", floatingTextTagEvents);

        floatingTextTagEvents.set("update", (ftext: SpeechBubble) => {
            ftext.time++;
            ftext.y -= .5;
            if (ftext.time > 150) {
                ftext.markForRemoval();
            }
        });


        /////// Avatar /////
        const avatarTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("avatar", avatarTagEvents);

        /////// Actor /////
        const actorTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("actor", actorTagEvents);

        /////// Ai /////
        const aiTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("ai", aiTagEvents);

        /////// Friendly /////
        const friendlyTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("friendly", friendlyTagEvents);

        /////// uninit /////
        const uninitTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("uninit", uninitTagEvents);

        /////// house /////
        const houseTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("house", houseTagEvents);

        /////// node /////
        const nodeTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("node", nodeTagEvents);

        /////// zombie-spawn /////
        const zombieSpawnTagEvents = new Map<string, Function>();
        GameObject.tagEvents.set("zombie-spawn", zombieSpawnTagEvents);

        const tagEventIndex = ["init", "update", "collide", "die", "decomposed", "hit", "kill"];
        tagEventIndex.forEach((i: string) => {
            GameObject.tagEvents.forEach((value, key, map) => {
                if (!value.get(i)) {
                    value.set(i, (a) => {
                    });
                }
            });
        });

        GameObject.tags = new Map<string, Array<GameObject>>();
        GameObject.tags.set("zombie", []);
        GameObject.tags.set("corpse", []);
        GameObject.tags.set("wander", []);
        GameObject.tags.set("lost", []);
        GameObject.tags.set("item", []);
        GameObject.tags.set("salesman", []);
        GameObject.tags.set("zombie", []);
        GameObject.tags.set("uninit", []);
        GameObject.tags.set("actor", []);
        GameObject.tags.set("spawn", []);
        GameObject.tags.set("following", []);
        GameObject.tagMap = GameObject.tags;

        Globals.STATIC_WIDTH = (window.innerWidth/Globals.RESOLUTION) | 0;

        this.canvas = document.querySelector("#canvas");
        this.canvas.width = Globals.STATIC_WIDTH;
        this.canvas.height = Globals.STATIC_HEIGHT;

        // Uncomment for fullscreen
        // this.canvas.width = (window.innerWidth/Globals.RESOLUTION) | 0;
        //this.canvas.height = (window.innerHeight/Globals.RESOLUTION) | 0;
        this.context = this.canvas.getContext("2d");
        Globals.SCREEN_WIDTH = this.canvas.width;
        Globals.SCREEN_HEIGHT = this.canvas.height;

        console.log(this.canvas.width, this.canvas.height);


        Globals.RENDER_DISTANCE = ((Globals.SCREEN_WIDTH + Globals.SCREEN_HEIGHT) * 2 / 4) | 0;
        this.world = new World();

        const optionKeys = Object.keys(gameOptions);
        optionKeys.forEach(aKey => {
            this[aKey] = gameOptions[aKey];
        });

        const worldOptionKeys = Object.keys(worldOptions);
        worldOptionKeys.forEach(aKey => {
            this.world[aKey] = worldOptions[aKey];
        });

        console.log("Loading World");

        this.world.load(null, () => {
            console.log('World loaded..');
            this.startCycle(this.context);
        });
    }


    gameOver(c: CanvasRenderingContext2D) {
        this.paused = true;

        let menuHeight = 500;
        let goToMenu = false;
        const showMenuFunction = this.showMenuFunction;
        const menuPosition: Vec2 = new Vec2((Globals.SCREEN_WIDTH - 400) / 2, (Globals.SCREEN_HEIGHT - menuHeight) / 2);
        const img: HTMLImageElement = new Image();
        img.src = this.canvas.toDataURL('image/png');

        const gameOverInfo =[
            ["Village Population", `${this.world.state.totalPopulation}`],
            ["Zombie Population", `${this.world.state.zombie_max}`],
            ["Zombies Killed", `${this.world.state.zombies_killed}`],
            ["Villagers Saved", `${this.world.state.savedCitizens}`],
            ["Days Survived", `${this.world.state.dayCount}`]
        ]

        let timePass = 0;
        const gameOverDialog = new Dialog("gameOver", {
            "text": "Game Over",
            "info" : gameOverInfo,
            "func": () => {
            }
        });

        const rcycle = (a: number) => {
            timePass++;
            c.globalAlpha = 1;
            //world.render(c);
            c.drawImage(img, 0, 0);
            c.save();

            gameOverDialog.render(this.context);

            // // menuPosition.x -= (menuPosition.x - (Globals.SCREEN_WIDTH - 400)) / 10;
            // c.translate(menuPosition.x, menuPosition.y);
            // //Okay, draw all menu items
            // c.fillStyle = "#000";
            // c.globalAlpha = .75;
            // c.fillRect(0, 0, 400, menuHeight);
            //
            // //GAME OVER
            // c.globalAlpha = 1;
            // c.font = "48px Arial";
            // c.fillStyle = "#fff";
            // c.fillText("Game Over", 75, 75);
            //
            // //Stats
            // c.font = "18px Arial";
            // let ypos = 160;
            // [
            //     ["Village Population", `${this.world.state.totalPopulation}`],
            //     ["Zombie Population", `${this.world.state.zombie_max}`],
            //     ["Zombies Killed", `${this.world.state.zombies_killed}`],
            //     ["Villagers Saved", `${this.world.state.saved}`],
            //     ["Days Survived", `${this.world.state.dayCount}`],
            // ].forEach((not: Array<string>) => {
            //     c.textAlign = "left";
            //     c.fillText(not[0], 25, ypos);
            //     c.textAlign = "right";
            //     c.fillText(not[1], 400 - 50, ypos);
            //     ypos += 40;
            // });
            //
            // c.textAlign = "center";
            // c.fillText("Click anywhere to play again", 200, ypos + 50);
            // // c.fillText("Game by Rares Portan", 200, Globals.SCREEN_HEIGHT - 50);

            c.restore();
            if (!goToMenu) {
                window.requestAnimationFrame(rcycle);
            }
        };
        window.requestAnimationFrame(rcycle);

        Globals.events.bindClickHandler((e) => {
            if(gameOverDialog.clickAt(Globals.events.mousePosition.x, Globals.events.mousePosition.y)){
                if (timePass >= 120) {
                    goToMenu = true;
                    showMenuFunction();
                    return true;
                }
            }
        })
    }


    giveCoin(avatar: Avatar, amount: number) {
        avatar.coins += amount;
        this.world.spawnObject("floating_text", {"x": avatar.x, "y": avatar.y, "text": `+${amount}`});
        Globals.audio.play("coin");
    }


    spawnGuard() {
        const pn: PathNode = Globals.randomPick(this.world.pathNodes);
        this.world.spawnObject("guard", {"x": pn.x, "y": pn.y});
    }

    /**
     * Set a path for a guard
     * @param {Avatar} guard
     */
    setGuardPath(guard: Avatar) {
        let destinationNode: PathNode;
        //Get next path point
        const pathNodes: Array<PathNode> = this.world.getClosePathNodes(guard);
        if (pathNodes.length === 0) {
            //Find closest path node
            let closestDistance = 9999;
            let closest: PathNode;

            this.world.pathNodes.forEach((node: PathNode) => {
                if (node.distanceTo(guard) < closestDistance) {
                    closest = node;
                }
            });
            destinationNode = closest;
        }
        else {
            destinationNode = Globals.randomPick(pathNodes);
        }
        guard["path"] = destinationNode.path;
        guard["destination"] = destinationNode.clone().add(guard["positionOffset"]);
        guard["pathDirection"] = destinationNode.start ? 1 : -1;
        guard["pathIndex"] = destinationNode.start ? 0 : destinationNode.path.points.length - 1;
    }


    openMenu(type: string) {
        console.log(`Opening ${type} menu`);
        const player = this.world.player;
        const dialogs = this.world.dialogs;

        let optionMap = [];
        switch (type) {
            case "weapons":
                optionMap = [];
                for (let nci = 0; nci < Weapon.All_WEAPONS.length; nci++) {
                    let i = nci;//For closure
                    if (player.weapons.indexOf(Weapon.All_WEAPONS[i]) === -1) {
                        const weaponName = Weapon.All_WEAPONS[i].name;
                        const weaponCost = Weapon.All_WEAPONS[i].cost;

                        optionMap.push({
                            "name": `${weaponName.split('')[0].toUpperCase().concat(weaponName.substring(1))} ${weaponCost}c`,
                            "func": () => {
                                player.coins >= weaponCost ? dialogs.push(new Dialog("confirm", {
                                    "text": `Would you like to buy the ${weaponName} for ${weaponCost}c?`,
                                    "func": () =>  Weapon.purchaseWeapon(Weapon.All_WEAPONS[i], player)
                                })) : dialogs.push(new Dialog("broke", {"text": `You cannot afford the ${weaponName}, come back when you have ${weaponCost}c.`}))
                            }
                        });
                    }
                }

                dialogs.push(new Dialog("options", {
                    "options": optionMap
                }));
                break;
            case "upgrades":
                optionMap = [];
                for (let nci = 1; nci < player.weapons.length; nci++) {
                    let i = nci;//For closure
                    if (player.weapons[i]) {
                        const weaponName = Weapon.All_WEAPONS[i].name;
                        const weaponCost = Weapon.All_WEAPONS[i].cost;
                        const weaponCost2 = Weapon.All_WEAPONS[i].cost2;

                        optionMap.push({
                            "name": `${weaponName.split('')[0].toUpperCase().concat(weaponName.substring(1))} Damage ${weaponCost}c`,
                            "func": () => {
                                player.coins >=weaponCost ? dialogs.push(new Dialog("confirm", {
                                    "text": `Would you like to buy a ${weaponName} damage upgrade for ${weaponCost}c?`,
                                    "func": () => Weapon.purchaseUpgrade("damage", Weapon.All_WEAPONS[i], player)
                                })) : dialogs.push(new Dialog("broke", {"text": `You cannot afford a ${weaponName} damage upgrade, come back when you have ${weaponCost2}c.`}))
                            }
                        });
                        optionMap.push({
                            "name": `${weaponName.split('')[0].toUpperCase().concat(weaponName.substring(1))} Attack Rate ${weaponCost2}c`,
                            "func": () => player.coins >= weaponCost2 ? dialogs.push(new Dialog("confirm", {
                                "text": "Would you like to buy a ${weaponName[i]} damage upgrade for ${weaponCost2[i]}c?",
                                "func": () => Weapon.purchaseUpgrade("rate", Weapon.All_WEAPONS[i], player)
                            })) : dialogs.push(new Dialog("broke", {"text": `You cannot afford a ${weaponName} attack rate upgrade, come back when you have ${weaponCost2}c.`}))
                        });
                    }
                }

                dialogs.push(new Dialog("options", {
                    "options": optionMap
                }));
                break;
            case "health":
                if (player.coins >= 300) {
                    dialogs.push(new Dialog("confirm", {
                        "text": "Would you like to buy a health upgrade for 300c?",
                        "func": () => {
                            player.maxHealth += 50;
                            player.coins -= 300;
                        }
                    }));
                } else {
                    dialogs.push(new Dialog("broke", {
                        "text": "Would you like to buy a health upgrade for 300c?"
                    }));
                }
                break;
            case "guards":
                if (player.coins >= this.world.state.guard_price) {
                    dialogs.push(new Dialog("confirm", {
                        "text": `Would you like to buy an additional patrol guard for ${this.world.state.guard_price}c?`,
                        "func": () => {
                            this.world.state.guard_total++;
                            this.spawnGuard();
                            player.coins -= this.world.state.guard_price;
                            this.world.state.guard_price += 50;
                        }
                    }));
                } else {
                    dialogs.push(new Dialog("broke", {
                        "text": "You cannot afford an additional guard."
                    }));
                }
                break;
        }
    }


    introDoneCallback() {
        this.intro = false;
        Notification.notify(`Day ${this.world.state.dayCount}`);
        Notification.notify(`Total Population : ${this.world.state.totalPopulation}`);
        this.world.player.set(4793, 4342);

        // restore player animation
        this.world.player.animation = this.world.playerAnimation;
        Notification.notify("Explore the island while it's safe!");

        Globals.audio.stopTheme();
    }


    /**
     * Start game (update + render) cycle
     * @param context
     */
    startCycle(context) {
        //Set camera to player position
        this.world.player = (<Avatar>GameObject.tags.get("player")[0]);

        // Add fist
        this.world.player.weapons.push(Weapon.FIST);

        if (this.world.state.difficultyMode > 0) {
            this.increaseDifficulty(this.world.state.difficultyMode);
        }

        if (this.intro) {
            // hide player while intro is playing
            this.world.playerAnimation = this.world.player.animation;
            this.world.player.animation = new AvatarAnimation({});
            if(!this.introPlayer) this.introPlayer = new Intro(this.introDoneCallback.bind(this));
        }

        for (let i = 0; i < this.world.state.guard_total; i++) {
            this.spawnGuard();
        }

        this.world.player.removeTag("citizen");
        this.world.state.sortScreenObjects(this.world.player);
        this.world.camera.set(this.world.player.x, this.world.player.y);
        this.paused = false;


        ///////// Add Keyboard handlers ///////////////

        Globals.events.bindKeyHandler(KEYS.NEXT_WEAPON, () => {
            this.world.player.useNextWeapon();
        });


        Globals.events.bindKeyHandler(KEYS.PREVIOUS_WEAPON, () => {
            this.world.player.usePreviousWeapon();
        });


        Globals.events.bindKeyHandler(KEYS.CONTROLS, () => {
            this.controlsOpen = !this.controlsOpen;
        });


        Globals.events.bindKeyHandler(KEYS.SPACE, () => {
            GameObject.tags.get("salesman").forEach((a: Avatar) => {
                if (a.distanceTo(this.world.player) < 128) {
                    this.openMenu(a["menu"]);
                }
            });
        });


        Globals.events.bindKeyHandler(KEYS.FULL_SCREEN, () => {
            let fullScreenAPICall;
            const fullScreenElement = document['fullscreenElement'] ||
                document['webkitFullscreenElement'] ||
                document['mozFullScreenElement'] ||
                document['msFullScreenElement'];

            // if is not in full screen
            if (!fullScreenElement) {
                fullScreenAPICall =  document.body['requestFullScreen'] ||
                    document.body['webkitRequestFullScreen'] ||
                    document.body['mozRequestFullScreen'] ||
                    document.body['msRequestFullScreen'];
                if (fullScreenAPICall) { fullScreenAPICall.call(document.body);}
            } else {
                fullScreenAPICall = document['exitFullscreen'] ||
                    document['webkitExitFullscreen'] ||
                    document['mozCancelFullScreen'] ||
                    document['msExitFullscreen'];
                if (fullScreenAPICall) { fullScreenAPICall.call(document);}
            }
        });


        Globals.events.bindKeyHandler(KEYS.ADVANCE_TO_NIGHT, () => {
            // if daytime
            if(this.world.state.time > 7 && this.world.state.time < 21) {
                Notification.notify("Skipping right to night...");
                const max_iter = 10;
                const interval = setInterval(() => {
                    let i = 0;
                    while (this.world.state.time < 20 && i < max_iter) {
                        this.world.update();
                        i++;
                    }
                    if (this.world.state.time > 20) {
                        clearInterval(interval);
                    }
                }, 16);
            }
        });




        if (Globals.DEBUG) {
            let debugPathNodes: Array<Vec2> = [];

            Globals.events.bindKeyHandler(KEYS.SPACE, () => {
                if(this.world.dialogs.length === 0) {
                    const prompt = (s: string, def = "") => {
                        return window.prompt(s, def);
                    };

                    this.world.dialogs.push(new Dialog("options", {
                        "options": [{
                            "name": "Place Spawn",
                            "func": () => {
                                //What kind of spawn?
                                this.world.dialogs.push(new Dialog("options", {
                                    "options": [
                                        {
                                            "name": "Zombie Node",
                                            "func": () => {
                                                this.world.currentMapTree["objects"].push({
                                                    "type": "node",
                                                    "tag": ["zombie-spawn"],
                                                    "x": this.world.player.x,
                                                    "y": this.world.player.y
                                                });
                                            }
                                        },
                                        {
                                            "name": "Custom Emitter",
                                            "func": () => {
                                                this.world.currentMapTree["objects"].push({
                                                    "type": "spawn",
                                                    "emission": prompt("Emit Type"),
                                                    "emission-properties": {
                                                        "tag": prompt("Emit Properties (',' delimited)").split(",")
                                                    },
                                                    "freq": parseInt(prompt("Freq (60 = 1 second)")),
                                                    "limit": parseInt(prompt("Limit")),
                                                    "x": this.world.player.x | 0,
                                                    "y": this.world.player.y | 0
                                                })
                                            }
                                        }
                                    ]
                                }));

                            }
                        },
                            {
                                "name": "Place Object",
                                "func": () => {
                                    this.world.dialogs.push(new Dialog("options", {
                                        "options": [
                                            {
                                                "name": "Custom Object",
                                                "func": () => this.world.currentMapTree["objects"].push({
                                                    "type": prompt("Type"),
                                                    "tag": (prompt("Tags, delimit with ','") || '').split(","),
                                                    "x": this.world.player.x | 0,
                                                    "y": this.world.player.y | 0
                                                })
                                            }
                                        ]
                                    }));
                                }
                            },
                            {
                                "name": "Place Node",
                                "func": () => this.world.dialogs.push(new Dialog("options", {
                                    "options": [
                                        {
                                            "name": "House Node",
                                            "func": () => this.world.currentMapTree["objects"].push({
                                                "type": "node",
                                                "tag": ["house"],
                                                "x": this.world.player.x | 0,
                                                "y": this.world.player.y | 0
                                            })
                                        },
                                        {
                                            "name": "Path Node",
                                            "func": () => debugPathNodes.push(this.world.player.clone())
                                        },
                                        {
                                            "name": "End Path Node",
                                            "func": () => {
                                                debugPathNodes.push(this.world.player.clone());
                                                let ax = [];
                                                let ay = [];
                                                debugPathNodes.forEach((node: Vec2) => {
                                                    ax.push(node.x | 0);
                                                    ay.push(node.y | 0);
                                                });

                                                const end = debugPathNodes[debugPathNodes.length - 1];
                                                const start = debugPathNodes[0];

                                                let endHouse = false;
                                                let startHouse = false;

                                                GameObject.tags.get("house").forEach((house: GameObject) => {
                                                    if (house.distanceTo(end) < 256) {
                                                        endHouse = true;
                                                    }
                                                    if (house.distanceTo(start) < 256) {
                                                        startHouse = true;
                                                    }
                                                });

                                                this.world.currentMapTree["paths"].push({
                                                    "type": "path",
                                                    "point_x": ax,
                                                    "point_y": ay,
                                                    "endHouse": endHouse,
                                                    "startHouse": startHouse
                                                });
                                                debugPathNodes = [];
                                            }
                                        }]
                                }))
                            },
                            {
                                "name": "Advance time one hour",
                                "func": () => this.world.state.time += 1
                            },
                            {
                                "name": "Toggle Debug Mode",
                                "func": () => {
                                    Globals.DEBUG = !Globals.DEBUG;
                                }
                            },
                            {
                                "name": "Simulate 2 hours",
                                "func": () => {
                                    for (let i = 0; i < this.world.state.dayLength / 12; i++) {
                                        this.world.update();
                                    }
                                }
                            },
                            {
                                "name": "Dump Trace",
                                "func": () => {
                                    console.log(`Player : Health : ${this.world.player.health} : Damage : ${this.world.player.damage} : Armor : ${this.world.player.armor}`);
                                    console.log(`Mouse : ${Globals.events.mousePosition.toString()}`);
                                }
                            },
                            {
                                "name": "Game Over",
                                "func": () => this.gameOver(this.context)
                            },
                            {
                                "name": "Prosperity",
                                "func": () => {
                                    this.giveCoin(this.world.player, 2000);
                                    this.world.state.totalPopulation += 200;
                                }
                            },
                            {
                                "name": "Test Menu",
                                "func": () => this.world.dialogs.push(new Dialog("confirm", {
                                    "text": "Would you like to confirm?",
                                    "func": () => {
                                        console.log("Confirmed");
                                    }
                                }))
                            },
                            {
                                "name": "Get JSON",
                                "func": () => console.log(window.open(`javascript:document.body.innerHTML='${JSON.stringify(this.world.dataTree)}';`, "JSON Data", 'height=300,width=300'))
                            }]
                    }));
                }
            });
        }


        // Add mouse handler
        Globals.events.bindClickHandler((e) => {
            this.rapid_clicks++;
            if (this.rapid_clicks > 5) {
                Notification.notify("HOLD the mouse button to attack");
            }
            if (!this.intro) {
                this.controlsOpen = false;
            }
            //Do menu stuff
            if (this.world.dialogs.length != 0) {
                Globals.events.mouseDown = false;
            }
            for (let i = this.world.dialogs.length - 1; i >= 0; i--) {
                if (this.world.dialogs[i].clickAt(Globals.events.mousePosition.x, Globals.events.mousePosition.y)) {
                    this.world.dialogs.splice(i, 1);
                }
            }
            //Check if player is near items
            //TODO permatags
            GameObject.tags.get("item").filter((item: Item) => {
                if (this.world.player.distanceTo(item) < 32) {
                    Globals.events.mouseDown = false;
                    Notification.notify(`You found ${item['properName'] || item.type}`);
                    return true;
                }
                return false;
            });
        });



        const cycle = (a) => {
            if (!this.paused) {
                window.requestAnimationFrame(cycle);
                this.world.render(context);
                this.render(context);
            }
        };

        let interval = setInterval(() => {
            if (!this.paused) {
                this.update();
                this.world.update();
                if (Globals.events.key(KEYS.ADVANCE_TIME) == 1) {
                    this.update();
                    this.world.update();
                    this.update();
                    this.world.update();
                    this.update();
                    this.world.update();
                }
            } else {
                clearInterval(interval);
            }
        }, 16);
        cycle(0);
    }


    increaseDifficulty(times = 0) {
        this.ZOMBIE_WANDER_DISTANCE = (this.ZOMBIE_WANDER_DISTANCE * 1.5) | 0;
        this.ZOMBIE_SPEED *= 1.1;
        this.ZOMBIE_SPEED = this.ZOMBIE_SPEED < 2 ? this.ZOMBIE_SPEED : 2;
        this.ZOMBIE_DAMAGE += 10 * ((75 - this.ZOMBIE_DAMAGE) / 75);
        this.ZOMBIE_ARMOR -= (this.ZOMBIE_ARMOR - .25) / 10;
        this.AGRO_DISTANCE -= (this.AGRO_DISTANCE - 512) / 10;
        this.world.state.zombie_max += 20;
        return (times > 0) ? this.increaseDifficulty(times - 1) : null;
    }


    damageBubble(point: Vec2, radius: number, damage: number, direction: Vec2) {
        const attacked = [];
        GameObject.tags.get("actor").forEach((actor: Avatar) => {
            if (actor.alive && actor.distanceTo(point) < radius) {
                attacked.push(actor);
                actor.hurt(damage, direction);
            }
        });
        return attacked;
    }


    update(){
        if (!this.intro) {
            //Player Tag
            const inc = new Vec2(Globals.events.key(KEYS.RIGHT) - Globals.events.key(KEYS.LEFT), Globals.events.key(KEYS.DOWN) - Globals.events.key(KEYS.UP));
            inc.normalize().multiplyScalar(2 * (1 + Globals.events.key(KEYS.SHIFT)));
            this.world.player.velocity.add(inc);
        } else {
            this.introPlayer.update(this.world.player, this.world.camera);
        }

        if (this.rapid_clicks > 0 && Globals.randomPickFrame(30)) {
            this.rapid_clicks--;
        }

        //Day/Night Cycle Events
        if (this.world.night_mode && this.world.state.time > 6.5 && this.world.state.time < 21) {//6:30 is wake up time
            this.world.night_mode = false;
            this.world.state.dayCount++;
            this.world.state.zombie_out = 0;
            Notification.notify(`Day ${this.world.state.dayCount}`);
            Notification.notify(`Total Population : ${this.world.state.totalPopulation}`);

            if (this.world.state.totalPopulation < 100) {
                if (this.world.state.totalPopulation < 50) {
                    Notification.notify("The population has fallen below 50");
                    this.gameOver(this.context);
                } else {
                    Notification.notify("WARNING! If your population falls below 50 you lose!");
                }
            }

            if (this.world.state.dayCount > 1) {
                //ON DAY INCREMENT
                this.increaseDifficulty();
            }

            //Lost citizens become unlost during the day
            GameObject.tags.get("lost").forEach((a: Avatar) => {
                GameObject.removeTag(a, "lost");
            });

            GameObject.tags.get("following").forEach((a: Avatar) => {
                GameObject.switchTag(a, "following", "wander");
                a.say("Thank you!");
                GameObject.addTag(a, "nice");
            });

            GameObject.tags.get("zombie").forEach((a: Avatar) => {
                a.markForRemoval();
            });

        } else if (!this.world.night_mode && (this.world.state.time > 21 || this.world.state.time < 6.5)) {
            this.world.night_mode = true;
            //Send citizens into their houses
            GameObject.tags.get("wander").forEach((citizen: Avatar) => {
                if (citizen.hasTag("ai") && !citizen.hasTag("lost") && citizen.hasTag("citizen")) {
                    if (Math.random() < .9) {
                        GameObject.switchTag(citizen, "wander", "homebound");
                        GameObject.tagEvents.get("homebound").get("init")(citizen);
                    } else {
                        GameObject.addTag(citizen, "lost");
                    }
                }
            });
            Notification.notify(`Lost Citizens : ${GameObject.tags.get('lost').length}`);
            Notification.notify("Save as many as possible!");
        }

        if (!this.world.night_mode && this.world.state.time > 16 && Globals.randomPickFrame(5)) {
            const wanderers = GameObject.tags.get("wander");
            const citizen = Globals.randomPick(wanderers);
            if (citizen.hasTag("ai") && !citizen.hasTag("lost") && citizen.hasTag("citizen")) {
                if (Math.random() < .9) {
                    GameObject.switchTag(citizen, "wander", "homebound");
                    GameObject.tagEvents.get("homebound").get("init")(citizen);
                } else {
                    GameObject.addTag(citizen, "lost");
                }
            }
        }

        if (!this.world.night_mode && this.world.state.time < 12 && this.world.state.awakePopulation < this.world.state.totalPopulation) {
            // Get a random house
            const houses = GameObject.tags.get("house");
            const house = Globals.randomPick(houses);
            // Spawn a citizen at the house
            this.world.spawnObject("citizen", {
                "tag": ["friendly", (Math.random() < .5) ? "wander" : "traveler", "ai"],
                "x": house.x,
                "y": house.y,
                "home": house
            });
            this.world.state.awakePopulation++;
        }

        //Release Zombies (if night)
        if (this.world.night_mode) {
            if (this.world.state.time < 4 || this.world.state.time > 21) {
                if (this.world.state.zombie_out < this.world.state.zombie_max - 50 || (this.world.state.zombie_out < this.world.state.zombie_max && Globals.randomPickFrame(16))) {
                    this.world.state.zombie_out++;
                    const zombieSpawns = GameObject.tags.get("zombie-spawn");
                    const aZombieSpawn = Globals.randomPick(zombieSpawns);
                    const a = this.world.spawnObject("zombie", {"x": aZombieSpawn.x, "y": aZombieSpawn.y});
                }
            } else if (this.world.state.zombie_out > 0 && Globals.randomPickFrame(30)) {
                const zombie = Globals.randomPick(GameObject.tags.get("zombie"));
                if (!zombie.hasTag("nestbound")) {
                    GameObject.removeTag(zombie, "hostile");
                    GameObject.removeTag(zombie, "hostile-wander");
                    GameObject.addTag(zombie, "nestbound");
                    GameObject.tagEvents.get("nestbound").get("init")(zombie);
                }
            }
        }


        //Protips randomPickFrame
        if (Globals.randomPickFrame(2000)) {
            Notification.notify(`Tip : ${Globals.randomPick(this.protips)}`);
        }

        if (this.world.state.lastSavedCitizens != this.world.state.savedCitizens) {
            this.world.state.lastSavedCitizens = this.world.state.savedCitizens;
            Notification.notify(`Saved : ${this.world.state.savedCitizens}`);
        }

        //Tag events

        //The Lost
        if (!this.world.night_mode && Globals.randomPickFrame(60) && GameObject.tags.get("lost").length > 0) {
            (<Avatar> Globals.randomPick(GameObject.tags.get("lost"))).say( Globals.randomPick(this.lostSpeech));
        }



        //Check if player is trying to attack
        if (Globals.events.mouseDown) {
            if (this.world.player.currentAttackTime == 0) {
                this.world.player.currentFrame = this.world.player.currentWeapon.startFrame * 5;
            }
            this.world.player.attacking = true;
            this.world.player.attackDirection = Globals.events.mousePosition.clone().subTo(Globals.SCREEN_WIDTH / 2, Globals.SCREEN_HEIGHT / 2).normalize();
        } else {
            this.world.player.currentAttackTime = 0;
            this.world.player.attacking = false;
        }



        //Actor Tag
        GameObject.tags.get("actor").forEach((actor: Avatar) => {
            if (actor.alive) {
                if (actor.attacking) {
                    actor.currentAttackTime = actor.currentAttackTime + 1;
                    if (actor.currentAttackTime > actor.attackTime) {

                        actor.currentAttackTime = 0;

                        //TODO use switch here
                        if (actor.attackType == 0) {
                            //Melee Attack
                            const attacked = this.damageBubble(actor.clone().add(actor.attackDirection.clone().multiplyScalar(actor.attackRadius)), actor.attackRadius / 2, actor.damage, actor.attackDirection);
                            for (let i = 0; i < attacked.length; i++) {
                                if (!attacked[i].alive) {
                                    actor.fireTagEvent("kill");
                                }
                            }
                            if (actor.distanceTo(this.world.player) < 256) {
                                Globals.audio.play("bump");
                            }
                        } else if (actor.attackType == 1) {
                            //Ranged Attack
                            this.world.spawnObject("arrow", {
                                "direction": actor.attackDirection.clone().multiplyScalar(128),
                                "x": actor.x + actor.attackDirection.x * 32,
                                "y": actor.y + actor.attackDirection.y * 32,
                                "damage": actor.damage
                            });

                            if (actor.distanceTo(this.world.player) < 256) {
                                Globals.audio.play("shoot");
                            }
                        } else if (actor.attackType == 2) {
                            //Thrusting attack
                            const attacked = this.damageBubble(actor.clone().add(actor.attackDirection.clone().multiplyScalar(actor.attackRadius)), actor.attackRadius / 2, actor.damage, actor.attackDirection.clone().multiplyScalar(1.5));
                            for (let i = 0; i < attacked.length; i++) {
                                if (!attacked[i].alive) {
                                    actor.fireTagEvent("kill");
                                }
                            }
                        }
                    }
                    const timeToAttack = actor.currentAttackTime - actor.attackTime + AvatarAnimation.AnimationTime[actor.attackType];
                    actor.currentFrame += (timeToAttack > 0) ? timeToAttack : 0;
                    actor.currentOrientation = actor.attackDirection.getDirection();
                } else {
                    if (actor.velocity.length() > 0.1) {
                        actor.currentFrame += actor.velocity.length();
                        actor.currentOrientation = actor.velocity.getDirection();
                    }
                }

                actor.velocity.divideScalar(1.5 * (actor.attacking ? 2 : 1));
                if (this.world.collisionMap.collisionAtVec2(actor.clone().add(actor.velocity))) {
                    //Figure out if it's on the left or right side
                    if (this.world.collisionMap.collisionAtVec2(actor.clone().addTo(actor.velocity.x, 0))) {
                        actor.velocity.zeroX();
                    }
                    if (this.world.collisionMap.collisionAtVec2(actor.clone().addTo(0, actor.velocity.y))) {
                        actor.velocity.zeroY();
                    }
                    actor.add(actor.velocity);
                    actor.fireTagEvent("collide");
                } else if (this.world.collisionMap.collisionAtVec2(actor.clone().addTo(actor.velocity.x, 0))) {
                    actor.add(actor.velocity.zeroX());
                    actor.fireTagEvent("collide");
                } else if (this.world.collisionMap.collisionAtVec2(actor.clone().addTo(0, actor.velocity.y))) {
                    actor.add(actor.velocity.zeroY());
                    actor.fireTagEvent("collide");
                } else {
                    actor.add(actor.velocity);
                }
            } else {
                //If actor is dead
                if (actor.currentFrame < 25) {
                    actor.currentFrame++;
                }
            }
        });

        //Spawn Tag
        GameObject.tags.get("spawn").forEach((spawn: SpawnPoint) => {
            spawn.update(this.world.state.time, this.world.spawnObject);
        });
    }




    /**
     * Render how many coins the player has
     * @param {CanvasRenderingContext2D} c
     */
    renderCoins(c: CanvasRenderingContext2D) {
        c.fillStyle = "yellow";
        // c.strokeStyle = "rgba(0,0,0,0.3)";
        c.font = "18px Arial";
        c.globalAlpha = .75;
        // c.lineWidth   = 5;
        // c.strokeText(`${this.coin}c`, this.hudDistanceFromEdge, this.hudDistanceFromEdge + 18);

        c.fillText(`${this.world.player.coins}c`, this.hudDistanceFromEdge, this.hudDistanceFromEdge + 18);
        c.globalAlpha = 1;
    }


    render(c: CanvasRenderingContext2D){
        this.renderCoins(c);

        if (this.intro) {
            this.introPlayer.render(c);
        } else if (this.controlsOpen) {

            // render controls image
            c.globalAlpha = .9;
            c.drawImage(Resource.controlsImage, (Globals.SCREEN_WIDTH - Resource.controlsImage.width) / 2, (Globals.SCREEN_HEIGHT - Resource.controlsImage.height) / 2);
            c.globalAlpha = 1;
        }
    }

}
