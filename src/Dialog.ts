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
import { DialogButton } from "./DialogButton";
import { Globals } from "./Globals";
import { Resource } from "./Resource";

export class Dialog {
    type: string;
    data: object;
    renderFunction: Function;
    buttons: Array<DialogButton>;
    ax: number;


    /**
     * Create a new dialog
     * @param {string} type
     * @param {object} data
     */
    constructor(type: string, data: object) {
        this.type = type;
        this.data = data;
        this.buttons = [];

        const centerX = Globals.SCREEN_WIDTH / 2;
        const centerY = Globals.SCREEN_HEIGHT / 2;
        this.ax = -Globals.SCREEN_WIDTH;

        switch (type) {
            case "options":
                this.renderFunction = this.renderOptionsMenu;
                const options = data["options"];
                for (let i = 0; i < options.length; i++) {
                    const name = options[i]["name"];
                    const func = options[i]["func"];
                    this.buttons.push(new DialogButton(name, func, Globals.SCREEN_WIDTH / 8 + (i % 2) * 200, Globals.SCREEN_HEIGHT / 8 + ((i / 2) | 0) * 50));
                }

                this.buttons.push(new DialogButton("Exit", () => {
                }, Globals.SCREEN_WIDTH / 8 + (options.length % 2) * 200, Globals.SCREEN_HEIGHT / 8 + ((options.length / 2) | 0) * 50));
                break;
            case "confirm":
                this.renderFunction = this.renderConfirmMenu;

                this.buttons.push(new DialogButton("Cancel", () => {}, centerX - 150, centerY + 100));
                this.buttons.push(new DialogButton("Confirm", data["func"], centerX + 150, centerY + 100));
                break;
            case "broke":
                this.renderFunction = this.renderConfirmMenu;

                this.buttons.push(new DialogButton("Cancel", () => {}, centerX - 150, centerY + 100));
                this.buttons.push(new DialogButton("Not Enough Coin", () => {}, centerX + 150, centerY + 100));
                break;
            case "gameOver":
                this.renderFunction = this.renderConfirmMenu;

                this.buttons.push(new DialogButton("Try again", data["func"], centerX , centerY + 100));
                break;
        }
    }


    /**
     * Execute button function if clicked in it
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    clickAt(x: number, y: number): boolean {
        let result = false;
        this.buttons.filter((button: DialogButton) => {
            if (button.clickAt(x, y)) {
                result = true;
                button.action();
                return true;
            }
            return false;
        });

        return result;
    }


    /**
     * Renders the dialog
     * @param {CanvasRenderingContext2D} c
     */
    render(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.ax, 0);
        this.ax /= 1.5;
        this.renderFunction(c);
        c.restore();
    }


    /**
     * Render options menu
     * @param {CanvasRenderingContext2D} c
     */
    renderOptionsMenu(c: CanvasRenderingContext2D) {
        this.buttons.forEach((button: DialogButton) => button.render(c));
    }


    /**
     * Renders a confirmation popup
     * @param {CanvasRenderingContext2D} c Canvas context
     */
    renderConfirmMenu(c: CanvasRenderingContext2D) {
        const cx = Globals.SCREEN_WIDTH / 2;
        const cy = Globals.SCREEN_HEIGHT / 2;
        const ui: Array<HTMLImageElement> = Resource.uiImages;

        const pattern = c.createPattern(ui[16], "repeat");
        c.beginPath();
        c.fillStyle = pattern;
        c.rect(cx - 300 + 32 + 10, cy - 200 + 32, 600 - 84, 400 - 88);
        c.fill();
        c.closePath();
        c.drawImage(ui[8], cx - 300 + 12, cy - 200);

        for (let i = 0; i < 16; i++) {
            c.drawImage(ui[9], cx - 300 + 12 + 32 + i * 32, cy - 200);
            c.drawImage(ui[23], cx - 300 + 12 + 32 + i * 32, cy + 200 - 64);
        }

        for (let i = 0; i < 10; i++) {
            c.drawImage(ui[15], cx - 300 + 12, cy - 200 + 32 + i * 32);
            c.drawImage(ui[17], cx + 300 - 12 - 32, cy - 200 + 32 + i * 32);
        }

        c.drawImage(ui[10], cx + 300 - 32 - 12, cy - 200);
        c.drawImage(ui[22], cx - 300 + 12, cy + 200 - 64);
        c.drawImage(ui[24], cx + 300 - 32 - 12, cy + 200 - 64);

        // Draw Text
        c.font = "18px Arial";
        c.fillStyle = "#444444";//"#ab7d10";
        c.textAlign = "center";

        const info = this.data["info"];
        let ypos = Globals.SCREEN_HEIGHT / 2 - 200 + 120;
        if(info) {
            c.font = "24px Arial";
            c.fillText(this.data["text"], Globals.SCREEN_WIDTH / 2, Globals.SCREEN_HEIGHT / 2 - 200 + 70);

            c.font = "18px Arial";
            info.forEach(anInfo => {
                c.textAlign = "left";
                c.fillText(anInfo[0], cx - 200, ypos);
                c.textAlign = "right";
                c.fillText(anInfo[1], cx + 200, ypos);
                ypos += 30;
            })

        } else {
            c.fillText(this.data["text"], cx, cy);
        }

        this.buttons.forEach((button: DialogButton) => button.render(c));
    }
}
