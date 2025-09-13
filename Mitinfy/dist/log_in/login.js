"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const vscode_1 = __importDefault(require("vscode"));
const extension_1 = require("../extension");
const plantillas_1 = require("./plantillas");
let server = null;
async function login() {
    if (!server) {
        server = extension_1.app.listen(8080, () => {
            console.log('🚀 Servidor corriendo en puerto 8080');
        });
    }
    const auth_url = 'https://accounts.spotify.com/authorize?'
        + `client_id=${extension_1.CLIENT_ID}`
        + '&response_type=code'
        + `&redirect_uri=${encodeURIComponent(extension_1.REDIRECT_URL)}`
        + '&scope=user-read-playback-state user-modify-playback-state streaming';
    await vscode_1.default.env.openExternal(vscode_1.default.Uri.parse(auth_url));
    extension_1.app.get('/callback', async (req, res) => {
        try {
            if (!req.query.code) {
                throw new plantillas_1.SpotifyAuthError('No se recibió código de autorización', 400);
            }
            const credentials = Buffer.from(`${extension_1.CLIENT_ID}:${extension_1.CLIENT_SECRET}`).toString('base64');
            const requestBody = new URLSearchParams({
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: extension_1.REDIRECT_URL
            }).toString();
            vscode_1.default.window.showInformationMessage('📤 Enviando petición a Spotify...');
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                },
                body: requestBody
            });
            if (!tokenRes.ok) {
                throw new plantillas_1.SpotifyAuthError(`Error HTTP ${tokenRes.status}: ${tokenRes.statusText}`, tokenRes.status);
            }
            const tokenData = await tokenRes.json();
            // Validar que tenemos los tokens necesarios
            const tokenResponse = tokenData;
            if (!tokenResponse.access_token || !tokenResponse.refresh_token) {
                throw new plantillas_1.SpotifyAuthError('Tokens faltantes en respuesta de Spotify', 400);
            }
            await saveTokensToVSCode(tokenResponse.access_token, tokenResponse.refresh_token);
            await verifyTokensSaved();
            res.status(200).send(generateSuccessPage(tokenResponse));
            vscode_1.default.window.showInformationMessage('¡Login exitoso con Spotify! 🎵');
        }
        catch (error) {
            let statusCode = 500;
            let errorMessage = 'Error interno del servidor';
            if (error instanceof plantillas_1.SpotifyAuthError) {
                statusCode = error.statusCode;
                errorMessage = error.message;
            }
            res.status(statusCode).send(generateErrorPage(statusCode, errorMessage));
            vscode_1.default.window.showErrorMessage(`Error de autenticación: ${errorMessage}`);
        }
    });
}
// Funciones auxiliares para mejor organización
async function saveTokensToVSCode(accessToken, refreshToken) {
    const config = vscode_1.default.workspace.getConfiguration();
    await Promise.all([
        config.update('mitinfy.accessToken', accessToken, vscode_1.default.ConfigurationTarget.Global),
        config.update('mitinfy.refreshToken', refreshToken, vscode_1.default.ConfigurationTarget.Global),
    ]);
}
async function verifyTokensSaved() {
    const config = vscode_1.default.workspace.getConfiguration();
    const savedAccessToken = config.get('mitinfy.accessToken');
    const savedRefreshToken = config.get('mitinfy.refreshToken');
    if (!savedAccessToken || !savedRefreshToken) {
        throw new plantillas_1.SpotifyAuthError('Error guardando tokens en VS Code', 500);
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
//# sourceMappingURL=login.js.map