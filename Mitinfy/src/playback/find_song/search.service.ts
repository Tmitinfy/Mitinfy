import * as code from 'vscode';
import { getSavedAccessToken } from '../../extension';
import { SpotifyAuthError } from '../../log_in/auxiliar_elems';

export interface Track {
    uri: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
    
}

export class searchService{
    private static instance: searchService | undefined;
    private readonly accessToken:string = getSavedAccessToken().original_token as string;
    public SearchPanel: code.WebviewPanel | undefined;
    private context: code.ExtensionContext;
    constructor(context:code.ExtensionContext){
        this.context = context;
        
    }

    public static getInstances(context: code.ExtensionContext): searchService{
        if(!searchService.instance){
            searchService.instance = new searchService(context);
        }
        return searchService.instance;
    }

    public async DisplaySearchPanel(){
        if(this.SearchPanel){
            this.SearchPanel.reveal();
            return;
        }

        this.SearchPanel = code.window.createWebviewPanel(
            'mitinfySearch',
            'Search Songs',
            code.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    code.Uri.parse(`${this.context.extensionPath}/src/playback/webview/search.html`)
                   // code.Uri.file(path.join(this.context.extensionPath, 'src', 'playback', 'webview'))
                ]
            }
        );

    }
    
}