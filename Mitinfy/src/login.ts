import vscode from 'vscode';
import { app, CLIENT_ID, REDIRECT_URL } from './extension';
export async function login() {
    const auth_url = 'https://accounts.spotify.com/authorize?' +
    `client_id=${CLIENT_ID}` + 
    'response_type=code&' +
    `redirect_url=${REDIRECT_URL}&` +
    'scope=user-read-playback-state'
    ;
    await vscode.env.openExternal(vscode.Uri.parse(auth_url));

    const getUsrToken = () => {
        return app.get('/callback', async (req, res) => {
            if(!req.query.code){res.status(400).send('No hay ningún código de autorización'); return;}

            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'content_type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: req.query.code as string,
                    redirect_uri: REDIRECT_URL
                }).toString()
            });

            if(tokenRes){
                res.status(200).send('Autenticacion exitosa');
                return tokenRes.json();

            }
            res.status(400).send('token nulo'); return;
        });

    };
    
   
    const usrToken = getUsrToken();

}