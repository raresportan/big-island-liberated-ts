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
import { Globals } from "./Globals";
import { Resource } from "./Resource";
import { InputManager } from "./InputManager";


/**
 * Renders the main menu
 */
export class MainMenu {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    title: HTMLImageElement;
    background: HTMLImageElement;
    creditsImage: HTMLImageElement;
    fin: Function;
    active = true;
    dx = 0;
    dy = 0;
    anim: Array<number>;
    credits = false;


    constructor(private startGame: Function) {

        // Draw loading screen
        this.canvas = document.querySelector("#canvas");
        this.canvas.width = Globals.STATIC_WIDTH;
        this.canvas.height = Globals.STATIC_HEIGHT;
        this.context = this.canvas.getContext('2d');
        this.context.save();
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "#fff";
        this.context.font = "36px Arial";
        this.context.textAlign = "center";
        this.context.fillText("Loading Big Island", this.canvas.width / 2, this.canvas.height / 2);
        this.context.restore();

        // Load Main menu assets
        this.title = Resource.loadImage("big_island_lpc.png", (img) => {
            this.background = Resource.loadImage("mainMenuBackground2.png", (img) => {
                this.creditsImage = Resource.loadImage("attribution.png", (img) => {
                    Globals.events = new InputManager();
                    this.anim = [0, 0, 0, 0, 0];
                    this.cycle();
                });
            });
        });
    }


    /**
     * Draw main menu til this.active.
     * Otherwise call fin();
     */
    cycle() {
        if (this.active) {
            window.requestAnimationFrame(this.cycle.bind(this));
            this.render();
        } else {
            this.fin();
        }
    }


    /**
     * Render main menu
     */
    render() {
        const buttonWidth = 240;
        const buttonHeight = 50;
        const totalHeight = this.title.height + 80 + (buttonHeight + 10) * 4;
        const startY = (this.canvas.height - totalHeight) / 2;
        let ratio = 1;
        if (this.background.width < this.canvas.width) {
            ratio = this.canvas.width / this.background.width + 0.1;
        }

        this.context.save();

        // Draw background (follow the mouse)
        this.dx -= (this.dx - ((Globals.events.mousePosition.x - this.canvas.width / 2) / (this.canvas.width) * (this.background.width * ratio - this.canvas.width) - (this.background.width * ratio - this.canvas.width) / 2)) / 10;
        this.dy -= (this.dy - ((Globals.events.mousePosition.y - this.canvas.height / 2) / (this.canvas.height) * (this.background.height * ratio - this.canvas.height) - (this.background.height * ratio - this.canvas.height) / 2)) / 10;
        this.context.drawImage(this.background, this.dx, this.dy, this.background.width * ratio, this.background.height * ratio);

        // Draw game title
        this.context.drawImage(this.title, (this.canvas.width - this.title.width) / 2, startY);


        // Draw buttons
        let ypos = startY + this.title.height + 80;// this.canvas.height - 230;

        let i = 0;
        document.body.style.cursor = "default";

        if (this.credits) {
            this.anim[4] = this.anim[4] < 1 ? this.anim[4] += .05 : 1;
            if (Globals.events.mouseDown) {
                this.credits = false;
                Globals.events.mouseDown = false;
            }
        } else {
            this.anim[4] = this.anim[4] > 0 ? this.anim[4] -= .05 : 0;
        }

        this.context.globalAlpha = this.anim[4];
        this.context.drawImage(this.creditsImage, (this.canvas.width / 2) - (this.creditsImage.width / 2), (this.canvas.height / 2) - (this.creditsImage.height / 2));
        this.context.globalAlpha = 1 - this.anim[4];

        const linex = (this.canvas.width) / 2;// - 150;

        const buttons = [
            {
                "text": "Play",
                "function": () => {
                    this.active = false;
                    this.fin = () => this.startGame();
                    Globals.audio.playTheme();
                }
            },
            {
                "text": "Dev Mode",
                "function": () => {
                    this.active = false;
                    this.fin = () => {
                        Globals.DEBUG = true;
                        this.startGame({intro: false});
                    };
                }
            },
            {
                "text": "Long Night",
                "function": () => {
                    this.active = false;
                    let count = 1;
                    this.fin = () => {
                        this.startGame({intro: false}, {dayLength: 60 * 60 * 120, time: 21});
                        Globals.audio.playTheme();
                    };
                }
            },
            {
                "text": "Credits",
                "function": () => {
                    this.credits = true;
                    Globals.events.mouseDown = false;
                }
            }
        ];


        buttons.forEach(aButton => {
            this.context.save();
            this.context.fillStyle = "#000";

            if (Math.abs(Globals.events.mousePosition.x - linex) < buttonWidth / 2 && Math.abs(Globals.events.mousePosition.y - ypos) < buttonHeight / 2) {
                this.anim[i] = this.anim[i] < 1 ? this.anim[i] += .1 : 1;
                if (Globals.events.mouseDown) {
                    aButton.function();
                } else {
                    document.body.style.cursor = "pointer";
                }
            } else {
                this.anim[i] = this.anim[i] > 0 ? this.anim[i] -= .1 : 0;
            }

            this.context.globalAlpha *= .5 + this.anim[i] / 2;

            const bw = buttonWidth + this.anim[i] * 20;
            const bh = buttonHeight + this.anim[i] * 10;
            this.context.fillRect(linex - bw / 2, ypos - bh / 2, bw, bh);

            this.context.globalAlpha /= .5 + this.anim[i] / 2;

            this.context.fillStyle = "white";
            this.context.font = "20px Arial";
            this.context.textAlign = "center";
            this.context.fillText(aButton.text, linex, ypos - buttonHeight / 2 + 32);
            this.context.restore();

            ypos += buttonHeight + 10;
            i++;
        });

        this.context.restore();
    }
}