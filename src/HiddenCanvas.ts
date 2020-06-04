export class HiddenCanvas {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(width: number, height: number) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
    }

    //Split provided image into many images
    static split(img: HTMLImageElement, px: number, py: number, callback: Function) {
        //TODO we shouldn't be drawing the entire image for every image split
        const hc = new HiddenCanvas(px, py);
        const c = hc.context;
        let n = 0;
        let amt = 0;

        const list = [];
        //TODO better way to fill list with null?
        while (list.length < (img.width / px) * (img.height / py)) {
            list.push(null);
        }

        function addToList(n: number) {
            hc.getImage((img) => {
                list[n] = img;
                amt++;
                if (amt >= list.length) {
                    callback(list);
                }
            });
        }

        for (let y = 0; y > -img.height; y -= py) {
            for (let x = 0; x > -img.width; x -= px) {
                c.clearRect(0, 0, px, py);
                c.drawImage(img, x, y);
                addToList(n++);
            }
        }
    }

    //Get image from canvas
    getImage(callback): HTMLImageElement {
        const img = document.createElement("img");
        const dataURL = this.canvas.toDataURL("image/png");

        img.onload = (e) => {
            callback(img);
        };

        img.src = dataURL;
        return img;
    }
}
