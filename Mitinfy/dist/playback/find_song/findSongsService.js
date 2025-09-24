"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPanel = void 0;
const extension_1 = require("../../extension");
const auxiliar_elems_1 = require("../../log_in/auxiliar_elems");
class findPanel {
    accessToken;
    constructor() {
        this.accessToken = (0, extension_1.getSavedAccessToken)().original_token;
    }
    find(name) {
        try {
            if (!this.accessToken) {
                // generar error de credenciales, SpotifyAuthError
            }
            // seguir acá 
        }
        catch (e) {
            const mensaje = e instanceof auxiliar_elems_1.SpotifyAuthError ? "No hay credenciales validas..." : "Error interno del sistema";
            return mensaje;
        }
    }
}
exports.findPanel = findPanel;
//# sourceMappingURL=findSongsService.js.map