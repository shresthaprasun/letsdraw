import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";
module.exports = {
    //start point
    input: "src/app.ts",
    output: [
        {
            // file: "./dist/letsdraw.js",
            file: "../venv/src/static/letsdraw/letsdraw.js",
            //global variable name
            name: "LETSDRAW",
            format: "umd",
            globals: {
                //package name : global var name
            }
        },
        {
            file: "../venv/src/static/letsdraw/letsdraw.es.js",
            format: "es",
        },
    ],
    external: [
    ],
    plugins: [
        resolve(),
        commonJS({
            include: "node_modules/css-element-queries/**"
        }),
        typescript({
            useTsconfigDeclarationDir: true
        }),
    ],
    context: "Window"
};