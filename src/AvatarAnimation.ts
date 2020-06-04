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
import { AvatarAnimationFrames } from "./AvatarAnimationFrames";
import { Resource } from "./Resource";
import { Orientation } from "./Vec2";


export enum AnimationType {
    WALK = 1,
    SLASH = 2,
    DEATH = 3,
    SHOOT = 4,
    THRUST = 5
}

/**
 * Manages the animations of the player and NPCs
 *
 * Five animations are supported: walk, slash, death, shoot, thrust. (There is another animation, "spellcast" that is
 * not used at the moment.
 *
 * Not all the NPCs have all the animations.
 *
 */
export class AvatarAnimation {

    // Keeps all the avatar animations from game
    static animationMap: Map<String, AvatarAnimation> = new Map<String, AvatarAnimation>();

    static readonly AnimationTypes = [AnimationType.SLASH, AnimationType.SHOOT, AnimationType.THRUST];
    static readonly AnimationTime = [6, 12, 8];

    // Animations for an avatar, all animation types (e.g. animation frames for walk, slash, death, shoot, thrust)
    animationFrames: Array<AvatarAnimationFrames>;

    size: number;
    middle: number;


    /**
     * Creates a new animation bases on a properties object.
     * @param properties
     */
    constructor(properties: any) {
        this.size = (properties["size"] == null) ? 64 : parseInt(properties["size"]);
        this.middle = (this.size / 2) | 0;
        this.animationFrames = new Array<AvatarAnimationFrames>(8);
        this.loadProperties(properties);
    }

    /**
     * Load animation properties
     *
     * ```
     * Example of properties:
     * {
     *   "type": "animation",
     *   "name": "guard2",
     *   "walk": "characters/guard2/walkcycle.png",
     *   "slash": "characters/guard2/slash.png",
     *   "death": "characters/guard2/hurt.png",
     *   "shoot": "characters/guard2/bow.png",
     *   "thrust": "characters/guard2/thrust.png"
     *  }
     * ```
     */
    loadProperties(properties: any) {
        const keys = Object.keys(properties);
        keys.forEach((aKey) => {
            const v = properties[aKey];
            switch (aKey) {
                case "walk":
                    this.loadWalkAnimation(v, (animation: AvatarAnimationFrames) => {
                        this.animationFrames[AnimationType.WALK] = animation;
                    });
                    break;
                case "slash":
                    this.loadSlashAnimation(v, (animation: AvatarAnimationFrames) => {
                        this.animationFrames[AnimationType.SLASH] = animation;
                    });
                    break;
                case "death":
                    this.loadDeathAnimation(v, (animation: AvatarAnimationFrames) => {
                        this.animationFrames[AnimationType.DEATH] = animation;
                    });
                    break;
                case "shoot":
                    this.loadShootAnimation(v, (animation: AvatarAnimationFrames) => {
                        this.animationFrames[AnimationType.SHOOT] = animation;
                    });
                    break;
                case "thrust":
                    this.loadThrustAnimation(v, (animation: AvatarAnimationFrames) => {
                        this.animationFrames[AnimationType.THRUST] = animation;
                    });
                    break;
            }
        });
    }


    /**
     * Loads the images(frames) of an animation.
     * All the frames for a animation are inside a single file.
     *
     * For each orientation (north/east/south/west) the animation frames are on single row.
     * Most animations have 4 rows (one for each orientation), but there are some animations with fewer rows
     * (e.g. death animations is a single row).
     *
     * The number of frames for a animation is given by the number of columns of the image file.
     *
     * @param {string} path The path to image.
     * @param {number} rows The number of animation orientations
     * @param {number} cols The number of animation frames
     * @param {Function} callback The callback to invoke when the frame animations are loaded.
     */
    loadAnimation(path: string, rows: number, cols: number, callback: Function) {
        //Load image, split into many images, save groups of images into FrameMaps
        Resource.loadSplitImage(path, (imageElements: Array<HTMLImageElement>) => {
            callback(new AvatarAnimationFrames(rows, cols, imageElements));
        }, this.size, this.size);
    }


    loadWalkAnimation(path: string, callback: Function) {
        this.loadAnimation(path, 4, 9, callback);
    }

    loadSlashAnimation(path: string, callback: Function) {
        this.loadAnimation(path, 4, 6, callback);
    }

    loadDeathAnimation(path: string, callback: Function) {
        this.loadAnimation(path, 1, 6, callback);
    }

    loadShootAnimation(path: string, callback: Function) {
        this.loadAnimation(path, 4, 13, callback);
    }

    loadThrustAnimation(path: string, callback: Function) {
        this.loadAnimation(path, 4, 8, callback);
    }


    /**
     * Renders the animation.
     * More exactly, renders one of the frames of one of the available animations.
     *
     * @param {CanvasRenderingContext2D} c Canvas context
     * @param {number} animation The animation index (WALK = 1, SLASH = 2, DEATH = 3, SHOOT = 4, THRUST = 5)
     * @param {number} orientation The animation orientation (UP = 0, LEFT = 1, DOWN = 2, RIGHT = 3)
     * @param {number} frame The animation frame index
     */
    render(c: CanvasRenderingContext2D, animation: number, orientation: Orientation, frame: number) {
        c.save();
        c.translate(-this.middle, -this.middle);
        const frameMap:AvatarAnimationFrames = this.animationFrames[animation];
        if (frameMap) {
            frameMap.render(c, orientation, frame);
        }
        c.restore();
    }

}
