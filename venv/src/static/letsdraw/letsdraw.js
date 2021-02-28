(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.LETSDRAW = {}));
}(this, (function (exports) { 'use strict';

	var getmessage = function () { return "hello world"; };
	window["getmessage"] = getmessage;

	exports.getmessage = getmessage;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
