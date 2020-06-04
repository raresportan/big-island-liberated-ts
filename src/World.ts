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
import { TileManager } from "./TileManager";
import { Dialog } from "./Dialog";
import { Overlay } from "./Overlay";
import { GameObject } from "./GameObject";
import { Camera } from "./Camera";
import { Path } from "./Path";
import { PathNode } from "./PathNode";
import { AvatarAnimation } from "./AvatarAnimation";
import { Avatar } from "./Avatar";
import { Resource } from "./Resource";
import { Vec2 } from "./Vec2";
import { Item } from "./Item";
import { Globals } from "./Globals";
import { Notification } from "./Notification";
import { GAME_DATA } from "./GameData";
import { WorldState } from "./WorldState";
import { MapCollisions } from "./MapCollisions";
import { KEYS } from "./InputManager";


/**
 * Game world
 * Manages the player and game objects, collision map, state and time
 * It should be as independent as possible from the game so multiple games can be implemented without changing the world.
 */
export class World {

    dataTree: object;
    mapsTree;
    currentMapTree;
    bottomTileManager: TileManager;
    topTileManager: TileManager;

    dialogs: Array<Dialog>;
    overlay: Overlay;
    camera: Camera;
    mapWidth: number;
    collisionMap: MapCollisions;

    state: WorldState;
    night_mode = false;

    paths: Array<Path>;
    pathNodes: Array<PathNode>;

    playerAnimation: AvatarAnimation;
    player: Avatar;


    /**
     * Create a new world
     */
    constructor() {
        this.state = new WorldState();
        this.camera = new Camera(0, 0, 1);
        this.overlay = new Overlay();
        this.dialogs = [];
        this.paths = [];
        this.pathNodes = [];
    }


    /**
     * Load world data
     * @param {string} json
     * @param callback
     */
    load(json: string, callback) {
        console.log("Beginning Parse");
        this.dataTree = GAME_DATA;// JSON.parse(json);

        const objectList = this.dataTree["objects"];
        this.mapsTree = this.dataTree["maps"];

        console.log("Unpacking Game");
        this.unpackObjects(objectList);

        console.log("Data Parsed");

        Resource.loadSplitImage("items.png", (imgs: Array<HTMLImageElement>) => {
            Resource.itemImages = imgs;
            console.log("Items loaded");

            Resource.loadSplitImage("ui.png", (ui_imgs: Array<HTMLImageElement>) => {
                Resource.uiImages = ui_imgs;

                Resource.loadImage("controls.png", (img: HTMLImageElement) => {
                    Resource.controlsImage = img;
                    console.log("Loading 'test' map");
                    this.loadMap("test", callback); //TODO 'test' should be variable
                });
            });
        });
    }


    /**
     * Load the world map
     * @param name
     * @param callback
     */
    loadMap(name, callback) {
        const map = this.currentMapTree = this.mapsTree[name];
        this.unpackMapObjects(map["objects"]);
        this.unpackMapPaths(map['paths']);
        this.bottomTileManager = new TileManager("map_bottom");
        this.topTileManager = new TileManager("map_top");

        this.collisionMap = new MapCollisions(map["collision-map"]);
        callback();
    }


    /**
     * Spawn a new object of the provided type using provided properties
     * @param {string} type
     * @param {object} props
     * @returns {GameObject}
     */
    spawnObject(type: string, props: object): GameObject {
        const ob: GameObject = GameObject.classMap[type](props);
        ob.type = type;

        GameObject.addTag(ob, type);
        GameObject.addTag(ob, "uninit");
        this.addObject(ob);
        return ob;
    }


    /**
     * Unpack map objects
     * @param list Raw object list
     */
    unpackMapObjects(list) {
        for (let i = 0; i < list.length; i++) {
            this.spawnObject(list[i]["type"], list[i]);
        }
    }


    /**
     * Unpack map paths
     * @param {Array<object>} list
     */
    unpackMapPaths(list: Array<object>) {
        list.forEach((raw: object) => {
            //Make vec2
            const points: Array<Vec2> = [];
            for (let i = 0; i < raw["point_x"].length; i++) {
                points.push(new Vec2(raw["point_x"][i], raw["point_y"][i]));
            }

            const path = new Path(points[0], points[points.length - 1], points, raw["startHouse"], raw["endHouse"]);
            this.paths.push(path);
            this.pathNodes.push(path.start);
            this.pathNodes.push(path.end);
        });
    }


    /**
     * Unpack object types
     * @param {Array<any>} list
     */
    unpackObjects(list: Array<any>) {
        for (let i = 0; i < list.length; i++) {
            switch (list[i]["type"]) {
                case "animation":
                    AvatarAnimation.animationMap[list[i]["name"]] = new AvatarAnimation(list[i]);
                    break;
                case "avatar":
                    GameObject.classMap[list[i]['name']] = (p) => {
                        const a = new Avatar(list[i]["properties"]);
                        a.loadProperties(p);
                        return a;
                    };
                    break;
                case "item":
                    GameObject.classMap[list[i]['name']] = (p) => {
                        const a = new Item(list[i]["properties"]);
                        a.loadProperties(p);
                        return a;
                    };
                    break;
                case "node":
                    GameObject.classMap[list[i]['name']] = (p) => {
                        const a = new GameObject(list[i]["properties"], 0, 0);
                        a.loadProperties(p);
                        return a;
                    };
                    break;
                default:
                    console.log(`Type not found: ${list[i]['type']}`);
                    break;
            }
        }
    }


    /**
     * Add object
     * @param {GameObject} instance
     */
    addObject(instance: GameObject) {
        if (instance) {
            this.state.objects.push(instance);
            this.state.onscene.push(instance);
        }
    }


    getClosePathNodes(v: Vec2): Array<PathNode> {
        const closeNodes: Array<PathNode> = [];
        this.pathNodes.forEach((node: PathNode) => {
            if (node.distanceTo(v) < 256) {
                closeNodes.push(node);
            }
        });
        return closeNodes;
    }


    /**
     * Update world logic
     */
    update() {
        Globals.randomPickFrameCount += (Math.random() * 64) | 0;

        // update camera to follow player
        this.camera.x -= (this.camera.x - (this.player.x + this.player.velocity.x * 5)) / 5;
        this.camera.y -= (this.camera.y - (this.player.y + this.player.velocity.y * 5)) / 5;

        if (Globals.DEBUG) {
            this.camera.zoom += (Globals.events.key(KEYS.ZOOM_IN) - Globals.events.key(KEYS.ZOOM_OUT)) / 10.0;
        }
        this.camera.update();

        // remove objects
        for (let tag in GameObject.tags.keys()) {
            const lst = GameObject.tags.get(tag);
            for (let i = (Math.random() * lst.length) | 0, iter = 0; iter < lst.length / 16; iter++, i++) {
                let index = i % lst.length;
                if (lst[index].markedForRemoval) {
                    lst.splice(index, 1);
                }
            }
        }

        for (let i = (this.state.objects.length * Math.random()) | 0, iter = 0; iter < this.state.objects.length / 16; iter++, i++) {
            let index = i % this.state.objects.length;
            if (this.state.objects[index].markedForRemoval) {
                this.state.objects.splice(index, 1);
            }
        }

        //Uninit Tag (newly spawns)
        GameObject.tags.get("uninit").forEach((ob: GameObject) => {
            ob.fireTagEvent("init");
            ob.removeTag("uninit");
        });
        GameObject.tags.set("uninit", []);

        // call update on all objects
        this.state.objects.forEach((g: GameObject) => g.fireTagEvent("update"));

        // sort objects
        this.state.sortScreenObjects(this.player);

        // update world time
        this.state.time += 24 / this.state.dayLength;
        if (this.state.time > 24) {
            this.state.time = 0;
        }
    }


    /**
     * Renders the entire world, the entire game
     * @param {CanvasRenderingContext2D} c
     */
    render(c: CanvasRenderingContext2D) {

        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, Globals.SCREEN_WIDTH, Globals.SCREEN_HEIGHT);
        c.save();
        c.translate(Globals.SCREEN_WIDTH / 2, Globals.SCREEN_HEIGHT / 2);
        c.scale(this.camera.animatedZoom, this.camera.animatedZoom);

        if (this.camera.x - Globals.SCREEN_WIDTH / 2 < 0) {
            this.camera.x = Globals.SCREEN_WIDTH / 2;
        } else if (this.camera.x + Globals.SCREEN_WIDTH / 2 > this.mapWidth * 32) {
            this.camera.x = this.mapWidth * 32 - Globals.SCREEN_WIDTH / 2;
        }

        // Note that the map is square, map_width = map_height
        if (this.camera.y - Globals.SCREEN_HEIGHT / 2 < 0) {
            this.camera.y = Globals.SCREEN_HEIGHT / 2;
        } else if (this.camera.y + Globals.SCREEN_HEIGHT / 2 > this.mapWidth * 32) {
            this.camera.y = this.mapWidth * 32 - Globals.SCREEN_HEIGHT / 2;
        }
        c.translate(-this.camera.x, -this.camera.y);
        c.font = "12px Arial";
        c.textAlign = "center";


        //////////////// GAME AREA ///////////////

        // 1. render the bottom tiles
        this.bottomTileManager.render(c, this.camera);


        // 2. render each on scene game object
        this.state.onscene.forEach((object) => {
            object.render(c);
        });

        // change alpha before top tiles are rendered
        c.globalAlpha = .5;

        this.debugRender(c);

        // 3. render top tiles with a lower alpha so that the player can be seen "behind things"
        this.topTileManager.render(c, this.camera);
        c.restore();

        // 4. render the overlay to simulate night
        this.overlay.render(c, this.state.time);


        //////////////// HUD //////////////

        // 1. render any dialogs
        this.dialogs.forEach((mi: Dialog) => {
            mi.render(c);
        });

        // 2. render notifications
        Notification.renderNotifications(c);
    }


    /**
     * Render paths in debug mode
     * @param {CanvasRenderingContext2D} c
     */
    debugRender(c: CanvasRenderingContext2D) {
        if (Globals.DEBUG) {
            this.paths.forEach((path: Path) => {
                c.beginPath();
                c.strokeStyle = "#fff";
                c.lineWidth = 5;
                c.lineCap = "round";
                c.fillStyle = "#fff";
                c.moveTo(path.start.x, path.start.y);
                path.points.forEach((point: Vec2) => {
                    c.lineTo(point.x, point.y);
                    c.fillText(point.toString(), point.x, point.y);
                });
                c.stroke();
                c.closePath();
            });
        }
    }
}
