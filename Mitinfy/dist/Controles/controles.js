"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spotifyRequest = spotifyRequest;
exports.play = play;
exports.pause = pause;
exports.nextTrack = nextTrack;
exports.previousTrack = previousTrack;
const vscode_1 = __importDefault(require("vscode"));
const extension_1 = require("../extension");
async function spotifyRequest(endpoint, method) {
    const { original_token } = (0, extension_1.getSavedAccessToken)();
    if (!original_token) {
        vscode_1.default.window.showErrorMessage("No se encontró un token de acceso de Spotify.");
        return;
    }
    const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method,
        headers: {
            Authorization: `Bearer ${original_token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const error = await response.text();
        vscode_1.default.window.showErrorMessage(`Error de Spotify: ${error}`);
    }
}
// funciones
async function play() {
    await spotifyRequest("play", "PUT");
    vscode_1.default.window.showInformationMessage("poner play");
}
async function pause() {
    await spotifyRequest("pause", "PUT");
    vscode_1.default.window.showInformationMessage("pausa");
}
async function nextTrack() {
    await spotifyRequest("next", "POST");
    vscode_1.default.window.showInformationMessage("cancioncita sisguiente");
}
async function previousTrack() {
    await spotifyRequest("previous", "POST");
    vscode_1.default.window.showInformationMessage("me quiero matar");
}
//# sourceMappingURL=controles.js.map