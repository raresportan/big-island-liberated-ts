import { Globals } from "./Globals";
import { MainMenu } from "./MainMenu";
import { Game } from "./Game";
import '../styles.css';

let menu;

function openMainMenu() {
    menu = new MainMenu(startGame);
}
function startGame(gameOptions = {}, worldOptions = {}) {
    menu = null;
    const game = new Game(openMainMenu, gameOptions, worldOptions);
}

window.onload = (e) => {
    Globals.STATIC_WIDTH = (window.innerWidth/Globals.RESOLUTION) | 0;
    Globals.STATIC_HEIGHT = Math.floor(Globals.STATIC_WIDTH / 2.35);
    Globals.CHUNK_JOIN = Math.ceil(Globals.STATIC_WIDTH / (Globals.GRAPHIC_BLOCK_SIZE * Globals.CHUNK_BLOCKS)) + 1;

    const canvas:HTMLCanvasElement = document.querySelector("#canvas");
    canvas.width = Globals.STATIC_WIDTH;
    canvas.height = Globals.STATIC_HEIGHT;

    openMainMenu();
};

