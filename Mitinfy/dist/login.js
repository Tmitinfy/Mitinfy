"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const vscode_1 = __importDefault(require("vscode"));
const extension_1 = require("./extension");
async function login() {
    const auth_url = 'https://accounts.spotify.com/authorize?' +
        `client_id=${extension_1.CLIENT_ID}` +
        'response_type=code&' +
        `redirect_url=${extension_1.REDIRECT_URL}&` +
        'scope=user-read-playback-state';
    await vscode_1.default.env.openExternal(vscode_1.default.Uri.parse(auth_url));
    const getUsrToken = () => {
        return extension_1.app.get('/callback', async (req, res) => {
            if (!req.query.code) {
                res.status(400).send('No hay ningún código de autorización');
                return;
            }
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'content_type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: req.query.code,
                    redirect_uri: extension_1.REDIRECT_URL
                }).toString()
            });
            if (tokenRes) {
                res.status(200).send('Autenticacion exitosa');
                return tokenRes.json();
            }
            res.status(400).send('token nulo');
            return;
        });
    };
    const usrToken = getUsrToken();
}
//# sourceMappingURL=login.js.map