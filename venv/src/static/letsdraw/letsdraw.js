(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    window["init"] = function (parent) {
        var canvas = document.createElement("canvas");
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
        var ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.lineWidth = 10;
        var isprimaryPointerDown = false;
        var isSecondaryPointerDown = false;
        var start = { x: 0, y: 0 };
        var topleft = { x: 0, y: 0 };
        canvas.oncontextmenu = function (event) {
            event.preventDefault();
        };
        canvas.addEventListener("pointerdown", function (event) {
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
        canvas.addEventListener("pointerenter", function (event) {
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
        canvas.addEventListener("pointermove", function (event) {
            if (isprimaryPointerDown) {
                ctx.lineTo(event.pageX, event.pageY);
                ctx.stroke();
            }
            if (isSecondaryPointerDown) {
                var pageX = Math.floor(event.pageX);
                var pageY = Math.floor(event.pageY);
                console.log("page", pageX, pageY);
                var diff = { x: pageX - start.x, y: pageY - start.y };
                var panData = undefined;
                if (diff.x >= 0 && diff.y >= 0) { //moving towards bottom-right
                    panData = ctx.getImageData(0, 0, canvas.width - diff.x, canvas.height - diff.y);
                    if (diff.y >= 1) {
                        ctx.getImageData(0, canvas.height - diff.y, canvas.width, diff.y);
                    }
                    if (diff.x >= 1) {
                        ctx.getImageData(canvas.width - diff.x, 0, diff.x, canvas.height - diff.y);
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
                        ctx.getImageData(0, 0, canvas.width, 0 - diff.y);
                    }
                    if (diff.x >= 1) {
                        ctx.getImageData(canvas.width - diff.x, diff.y, diff.x, canvas.height + diff.y);
                    }
                }
                else if (diff.x <= 0 && diff.y <= 0) { //moving towards top-left
                    panData = ctx.getImageData(0 - diff.x, 0 - diff.y, canvas.width + diff.x, canvas.height + diff.y);
                    if (diff.y <= -1) {
                        ctx.getImageData(0, 0, canvas.width, 0 - diff.y);
                    }
                    if (diff.x <= -1) {
                        ctx.getImageData(0, 0 - diff.y, 0 - diff.x, canvas.height + diff.y);
                    }
                }
                else if (diff.x <= 0 && diff.y >= 0) { //moving towards bottom-left
                    panData = ctx.getImageData(0 - diff.x, 0, canvas.width + diff.x, canvas.height - diff.y);
                    if (diff.y >= 1) {
                        ctx.getImageData(0, canvas.height - diff.y, canvas.width, diff.y);
                    }
                    if (diff.x <= -1) {
                        ctx.getImageData(0, 0, 0 - diff.x, canvas.height - diff.y);
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
        canvas.addEventListener("pointerup", function (event) {
            if (event.button === 0) {
                isprimaryPointerDown = false;
            }
            else if (event.button === 2) {
                isSecondaryPointerDown = false;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        });
        canvas.addEventListener("pointerleave", function (_event) {
            isprimaryPointerDown = false;
            isSecondaryPointerDown = false;
        });
    };

})));
