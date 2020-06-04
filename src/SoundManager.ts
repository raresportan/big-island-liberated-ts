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

/**
 * Sound manager
 *
 * Use it to play sounds.
 */
export class SoundManager {

    static readonly SOUNDS = ['bump', 'shoot1', 'hurt3', 'shoot', 'hurt2', 'hurt', 'hurt1', 'coin', 'theme'];
    audioElements: Map<String, HTMLAudioElement>;
    audioGroup: Map<String, Array<String>>;


    /**
     * Creates the SoundManager
     * Initialize HTMLAudioElements for all sounds
     */
    constructor() {
        this.audioElements = new Map<String, HTMLAudioElement>();

        SoundManager.SOUNDS.forEach((soundName: string) => {
            this.audioElements.set(soundName, document.querySelector(`#audio_${soundName}`));
        });

        this.audioGroup = new Map<String, Array<String>>();
        this.audioGroup.set("shoot", ["shoot", "shoot1"]);
        this.audioGroup.set("hurt",  ["hurt", "hurt1", "hurt2", "hurt3"]);
    }


    /**
     * Plays the sound with the given name or a random sound from a group
     * @param {string} soundName or groupName
     */
    play(soundName: string) {
        let audioElement;
        if (this.audioGroup.has(soundName)) {
            const groupSounds = this.audioGroup.get(soundName);
            audioElement = this.audioElements.get( groupSounds[(groupSounds.length * Math.random()) | 0]);
        } else {
            audioElement = this.audioElements.get(soundName);
        }

        if(audioElement){
            audioElement.play();
        }
    }

    playTheme() {
        let audioElement = this.audioElements.get("theme");
        if(audioElement) {
            audioElement.play();
        }
    }

    stopTheme() {
        let audioElement:HTMLAudioElement = this.audioElements.get("theme");
        if(audioElement) {
            audioElement.pause();
            // rewind
            audioElement.currentTime = 0;
        }
    }
}
