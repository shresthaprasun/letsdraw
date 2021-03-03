// import * as SocketIO from "socket.io-client";

interface IPoint {
    x: number;
    y: number;
}

window["init"] = (parent: HTMLElement): void => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("touch-action", "none");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.width = 1280;
    canvas.height = 800;
    // canvas.style.width = "100%";
    // canvas.style.height = "100%";
    canvas.style.border = "1px solid black";
    canvas.style.touchAction = "none";
    parent.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) { return; }
    ctx.lineWidth = 10;

    let isprimaryPointerDown = false;
    let isSecondaryPointerDown = false;

    let start: IPoint = { x: 0, y: 0 };
    let topleft: IPoint = { x: 0, y: 0 };
    let lod: number = 0;

    // const socket = SocketIO.io();
    // socket.on("connect", function (): void {
    //     socket.emit("connect", { data: "connected to the SocketServer..." });
    // });

    canvas.oncontextmenu = (event: MouseEvent): void => {
        event.preventDefault();
    };


    canvas.addEventListener("pointerdown", (event: PointerEvent): void => {
        if (event.button === 0 && event.buttons === 1) {
            ctx.beginPath();
            ctx.moveTo(event.pageX, event.pageY);
            isprimaryPointerDown = true;
        }
        else if (event.button === 2 && event.buttons === 2) {
            isSecondaryPointerDown = true;
            start.x = Math.floor(event.pageX);
            start.y = Math.floor(event.pageY);
        }
    });

    canvas.addEventListener("pointerenter", (event: PointerEvent): void => {
        //https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#determining_the_primary_pointer
        // if (event.button)
        //     switch (event.pointerType) {
        // case "touch":
        // case "pen":
        //     ctx.beginPath();
        //     ctx.moveTo(event.pageX, event.pageY);
        //     isPointerDown = true;
        //     break;
        // case "mouse":
        if (event.button === 0) {
            ctx.beginPath();
            ctx.moveTo(event.pageX, event.pageY);
            isprimaryPointerDown = true;
        }
        else if (event.button === 2) {
            isSecondaryPointerDown = true;

        }
    });

    canvas.addEventListener("pointermove", (event: PointerEvent): void => {
        if (isprimaryPointerDown) {
            ctx.lineTo(event.pageX, event.pageY);
            ctx.stroke();
            const xBatch = [];
            const yBatch = [];
            const colorBatch = [];
            for (let i = -10; i < 10; ++i) {
                for (let j = -10; j < 10; ++j) {
                    const pixel = ctx.getImageData(event.pageX + i, event.pageY + i, 1, 1);
                    if (pixel.data["3"] !== 0) {
                        xBatch.push(Math.floor(event.pageX));
                        yBatch.push(Math.floor(event.pageY));
                        colorBatch.push(pixel.data);
                    }
                    // socket.emit("uploadPixelInfo", { x:event.pageX, y:event.pageY, color:pixel.data});

                }
            }

            window["emit"]("uploadPixelInfo", { x: xBatch, y: yBatch, color: colorBatch });
        }
        if (isSecondaryPointerDown) {

            const pageX = Math.floor(event.pageX);
            const pageY = Math.floor(event.pageY);
            console.log("page", pageX, pageY);
            const diff: IPoint = { x: pageX - start.x, y: pageY - start.y };
            let panData: ImageData | undefined = undefined;
            let dataToSaveAlongWidth: ImageData | undefined = undefined;
            let dataToSaveAlongHeight: ImageData | undefined = undefined;
            if (diff.x >= 0 && diff.y >= 0) { //moving towards bottom-right
                panData = ctx.getImageData(0, 0, canvas.width - diff.x, canvas.height - diff.y);
                if (diff.y >= 1) {
                    dataToSaveAlongWidth = ctx.getImageData(0, canvas.height - diff.y, canvas.width, diff.y);
                }
                if (diff.x >= 1) {
                    dataToSaveAlongHeight = ctx.getImageData(canvas.width - diff.x, 0, diff.x, canvas.height - diff.y);
                }
                // _________________
                // |   ________|_\_|___ panning and shifted out of canvas
                // |  |        | \ |  |dataToSaveAlongHeight
                // |  |        | \ |  |
                // |__|________|_\_|  |
                // |/_|/_/_/_/_/_/_|  |dataToSaveAlongWidth
                //    |_______________|
            }
            else if (diff.x >= 0 && diff.y <= 0) { //moving towards top-right
                panData = ctx.getImageData(0, 0 - diff.y, canvas.width - diff.x, canvas.height + diff.y);
                if (diff.y <= -1) {
                    dataToSaveAlongWidth = ctx.getImageData(0, 0, canvas.width, 0 - diff.y);
                }
                if (diff.x >= 1) {
                    dataToSaveAlongHeight = ctx.getImageData(canvas.width - diff.x, diff.y, diff.x, canvas.height + diff.y);
                }
            }
            else if (diff.x <= 0 && diff.y <= 0) { //moving towards top-left
                panData = ctx.getImageData(0 - diff.x, 0 - diff.y, canvas.width + diff.x, canvas.height + diff.y);
                if (diff.y <= -1) {
                    dataToSaveAlongWidth = ctx.getImageData(0, 0, canvas.width, 0 - diff.y);
                }
                if (diff.x <= -1) {
                    dataToSaveAlongHeight = ctx.getImageData(0, 0 - diff.y, 0 - diff.x, canvas.height + diff.y);
                }
            }
            else if (diff.x <= 0 && diff.y >= 0) { //moving towards bottom-left
                panData = ctx.getImageData(0 - diff.x, 0, canvas.width + diff.x, canvas.height - diff.y);
                if (diff.y >= 1) {
                    dataToSaveAlongWidth = ctx.getImageData(0, canvas.height - diff.y, canvas.width, diff.y);
                }
                if (diff.x <= -1) {
                    dataToSaveAlongHeight = ctx.getImageData(0, 0, 0 - diff.x, canvas.height - diff.y);
                }
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            panData && ctx.putImageData(panData, diff.x > 0 ? diff.x : 0, diff.y > 0 ? diff.y : 0);
            topleft.x -= diff.x;
            topleft.y -= diff.y;
            start.x = pageX;
            start.y = pageY;
        }
        event.preventDefault();
    });

    canvas.addEventListener("pointerup", (event: PointerEvent): void => {
        if (event.button === 0) {
            isprimaryPointerDown = false;

        }
        else if (event.button === 2) {
            isSecondaryPointerDown = false;
        }
        event.preventDefault();
        event.stopImmediatePropagation();

    });

    canvas.addEventListener("pointerleave", (_event: PointerEvent): void => {
        isprimaryPointerDown = false;
        isSecondaryPointerDown = false;
    });

};
