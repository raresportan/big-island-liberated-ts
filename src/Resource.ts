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
import { HiddenCanvas } from "./HiddenCanvas";

/**
 * Provides functions to load resources from disk
 */
export class Resource {
    static readonly BLANK_IMAGE = new Image();

    // Keeps item images
    static itemImages: Array<HTMLImageElement> = [];

    // Keeps UI images
    static uiImages: Array<HTMLImageElement> = [];

    // Keeps control images
    static controlsImage: HTMLImageElement;


    /**
     * Load an image
     * @param {string} name The image name. Expected to be in 'resources' folder
     * @param {Function} callback The callback to invoke after the image is loaded
     * @returns {HTMLImageElement} Returns an HTMLImageElement for the loaded image
     */
    static loadImage(name: string, callback: Function = null) {
        const imageName = `resources/${name}`;
        const img = document.createElement("img");

        img.onload = (e) => {
            callback(img);
        };

        img.onerror = (e) => {
            console.log('Cannot load', imageName);
            callback(document.createElement("img"));
        };

        callback = callback || (() => {});

        img.src = imageName;
        return img;
    }


    /**
     * Load URL
     * Use this to load resources other then images
     * @param url The URL to load
     * @param callback The callback to invoke when the resource is loaded
     */
    static load(url: string, callback: Function) {
        console.log('Load ', url);
        fetch(url)
            .then(response => {
                response.text().then((content) => callback(content));
            })
    }


    /**
     * Load an image and split it in pieces of the provides size.
     *
     * @param name The image name to load. Is expected to be under 'resources' folder
     * @param callback The callback to invoke after the image pieces are available
     * @param {number} px The piece width
     * @param {number} py The piece height
     */
    static loadSplitImage(name, callback, px = 32, py = 32) {
        const imageName = `resources/${name}`;
        const img = document.createElement("img");

        img.onload = (e) => {
            HiddenCanvas.split(img, px, py, callback);
        };

        img.src = imageName;
    }
}
