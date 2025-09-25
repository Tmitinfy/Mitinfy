"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyAuthError = void 0;
exports.verifyTokensSaved = verifyTokensSaved;
exports.generateSuccessPage = generateSuccessPage;
exports.generateErrorPage = generateErrorPage;
/**
 * En este archivo no hay logica alguna, son solamente plantillas/funciones auxiliares que se usan para el inicio de sesión.
 * Igualmente son escensiales para el correcto funcionamiento de el servicio.
 *
 */
const vscode = __importStar(require("vscode"));
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
async function verifyTokensSaved() {
    const config = vscode.workspace.getConfiguration();
    const savedAccessToken = config.get('mitinfy.accessToken');
    const savedRefreshToken = config.get('mitinfy.refreshToken');
    if (!savedAccessToken || !savedRefreshToken) {
        throw new SpotifyAuthError('Error guardando tokens en VS Code', 500);
    }
}
function generateSuccessPage(tokenData) {
    return `
        <html>
            <head>
                <title>Mitinfy - Autenticación Exitosa</title>
            </head>
            <body>
                <div class="success">✅ ¡Autenticación exitosa!</div>
                <div class="info">Tu extensión Mitinfy está lista para usar Spotify.</div>
                <div class="info">Ya puedes cerrar esta ventana y volver a VS Code.</div>
                <div class="debug">
                    <strong>Información de debug:</strong><br>
                    • Access token: ${tokenData.access_token.substring(0, 20)}...<br>
                    • Refresh token: ${tokenData.refresh_token.substring(0, 20)}...<br>
                    • Expira en: ${tokenData.expires_in} segundos<br>
                    • Scopes: ${tokenData.scope}
                </div>
                <button class="close-btn" onclick="window.close()">Cerrar ventana</button>
            </body>
        </html>
    `;
}
function generateErrorPage(statusCode, errorMessage, details) {
    return `
        <html>
            <head>
                <title>Mitinfy - Error de Autenticación</title>
            </head>
            <body>
                <div class="error">❌ Error de autenticación</div>
                <div class="details">
                    <strong>Error ${statusCode}:</strong> ${errorMessage}<br><br>
                    <strong>Detalles:</strong> ${details}
                </div>
                <a href="javascript:history.back()" class="retry-btn">Reintentar</a>
            </body>
        </html>
    `;
}
//# sourceMappingURL=auxiliar_elems.js.map