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
import { Color } from "./Color";
import { Globals } from "./Globals";

/**
 * Renders an overlay over the canvas to simulate sunset, night and sunrise
 */
export class Overlay {

    static readonly SUNRISE = 7;
    static readonly SUNSET = 21;
    readonly FROM_NIGHT_TO_DAWN_COLORS = ["#3e3e56", "#818fb6", "#b2cdec", "#cbe3f6"];
    readonly FROM_DUSK_TO_NIGHT_COLORS = ["#ebddcb", "#d3b7b2", "#bb98ad", "#806593"];

    /**
     * Render overlays
     * @param {CanvasRenderingContext2D} c Canvas context
     * @param {number} time
     */
    render(c: CanvasRenderingContext2D, time: number) {
        const SUNRISE = Overlay.SUNRISE;
        const SUNSET = Overlay.SUNSET;

        // SUNRISE
        if (time > SUNRISE - 1 && time < SUNRISE + 1) {
            // Calculate percent of sunrise completion
            let p = 1 - ((SUNRISE + 1) - time) / 2;
            c.globalAlpha = .75 - p * .75;

            // Get which 2 colors to use
            let color1 = Color.fromString(this.FROM_NIGHT_TO_DAWN_COLORS[Math.floor(p * (this.FROM_NIGHT_TO_DAWN_COLORS.length - 1))]);
            let color2 = Color.fromString(this.FROM_NIGHT_TO_DAWN_COLORS[Math.ceil(p * (this.FROM_NIGHT_TO_DAWN_COLORS.length - 1))]);

            // Weight of color2
            const w = p * (this.FROM_NIGHT_TO_DAWN_COLORS.length - 1) - Math.floor(p * (this.FROM_NIGHT_TO_DAWN_COLORS.length - 1));

            // Average colors with weight
            color1.blend(color2, w);
            color1.subtract(128);

            c.fillStyle = color1.toString();
            c.fillRect(0, 0, Globals.SCREEN_WIDTH, Globals.SCREEN_HEIGHT);
        }
        // NIGHT
        else if (time < SUNRISE - 1 || time > SUNSET + 1) {

            if (time < SUNRISE - 1) {
                time += 24;
            }
            let ASUNRISE = SUNRISE + 23;
            let ASUNSET = SUNSET + 1;

            // 100% = sunrise, 0% = sunset
            const p = (ASUNRISE - time) / (ASUNRISE - ASUNSET);

            c.globalAlpha = .75;
            const sunset = Color.fromString(this.FROM_NIGHT_TO_DAWN_COLORS[0]);
            const sunrise = Color.fromString(this.FROM_DUSK_TO_NIGHT_COLORS[this.FROM_DUSK_TO_NIGHT_COLORS.length - 1]);

            sunset.blend(sunrise, p);
            sunset.subtract(128);

            c.fillStyle = sunset.toString();
            c.fillRect(0, 0, Globals.SCREEN_WIDTH, Globals.SCREEN_HEIGHT);
        }
        // SUNSET
        else if (time > SUNSET - 1 && time < SUNSET + 1) {

            // 100% = night, 0% = dusk
            let p = 1 - (SUNSET + 1 - time) / 2;
            c.globalAlpha = p * .75;

            const color1 = Color.fromString(this.FROM_DUSK_TO_NIGHT_COLORS[Math.floor(p * (this.FROM_DUSK_TO_NIGHT_COLORS.length - 1))]);
            const color2 = Color.fromString(this.FROM_DUSK_TO_NIGHT_COLORS[Math.ceil(p * (this.FROM_DUSK_TO_NIGHT_COLORS.length - 1))]);

            const w = p * (this.FROM_DUSK_TO_NIGHT_COLORS.length - 1) - Math.floor(p * (this.FROM_DUSK_TO_NIGHT_COLORS.length - 1));

            color1.blend(color2, w);
            color1.subtract(128);

            c.fillStyle = color1.toString();
            c.fillRect(0, 0, Globals.SCREEN_WIDTH, Globals.SCREEN_HEIGHT);
        }

        c.globalAlpha = 1;
    }
}