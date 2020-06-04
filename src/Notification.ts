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


/**
 *  Renders notification for the user when certain things happen
 *  Multiple notifications can be displayed in the same time, one above the other.
 *  The oldest one is on top
 */
export class Notification {

    // notification rectangle height
    static readonly HEIGHT = 32;

    // array with current notifications
    static notifications: Array<Notification> = [];

    // notification text
    text: string;

    // how much time to display the notification
    timeLeft = 300;

    // vertical position of the notification
    y = Notification.HEIGHT;
    ay = 0;


    /**
     * Create a new notification
     * @param {string} text
     */
    constructor(text: string) {
        this.text = text;
    }


    /**
     * Render all notifications
     * @param {CanvasRenderingContext2D} c
     */
    static renderNotifications(c: CanvasRenderingContext2D) {
        for (let i = Notification.notifications.length - 1; i >= 0; i--) {
            if (Notification.notifications[i].render(c)) {
                Notification.notifications.splice(i, 1);
            }
        }
    }


    /**
     * Add a new notification
     * @param {string} text
     */
    static notify(text: string) {
        Notification.notifications.forEach((note: Notification) => {
            note.y += Notification.HEIGHT;
        });
        Notification.notifications.push(new Notification(text));
    }


    /**
     * Render the notification
     * @param {CanvasRenderingContext2D} c Canvas context
     * @returns {boolean}
     */
    render(c: CanvasRenderingContext2D) {
        c.globalAlpha = .5 * (this.timeLeft < 60 ? this.timeLeft / 60 : 1);
        c.fillStyle = "#000";
        c.font = "18px Arial";
        c.fillRect(0, Globals.SCREEN_HEIGHT - this.ay, c.measureText(this.text).width + 20, Notification.HEIGHT);
        c.fillStyle = "#fff";
        c.fillText(this.text, 10, Globals.SCREEN_HEIGHT - this.ay + 20);
        this.ay -= (this.ay - this.y) / 10;
        c.globalAlpha = 1;
        return this.timeLeft-- <= 0;
    }

}
