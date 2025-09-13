"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyAuthError = void 0;
class SpotifyAuthError extends Error {
    statusCode;
    spotifyError;
    description;
    constructor(message, statusCode, spotifyError, description) {
        super(message);
        this.statusCode = statusCode;
        this.spotifyError = spotifyError;
        this.description = description;
        this.name = 'SpotifyAuthError';
        this.statusCode = statusCode;
    }
}
exports.SpotifyAuthError = SpotifyAuthError;
//# sourceMappingURL=plantillas.js.map