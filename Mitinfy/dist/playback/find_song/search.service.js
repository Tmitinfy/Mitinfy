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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = void 0;
const code = __importStar(require("vscode"));
const extension_1 = require("../../extension");
class searchService {
    static instance;
    accessToken = (0, extension_1.getSavedAccessToken)().original_token;
    SearchPanel;
    context;
    constructor(context) {
        this.context = context;
    }
    static getInstances(context) {
        if (!searchService.instance) {
            searchService.instance = new searchService(context);
        }
        return searchService.instance;
    }
    async DisplaySearchPanel() {
        if (this.SearchPanel) {
            this.SearchPanel.reveal();
            return;
        }
        this.SearchPanel = code.window.createWebviewPanel('mitinfySearch', 'Search Songs', code.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                code.Uri.parse(`${this.context.extensionPath}/src/playback/webview/search.html`)
                // code.Uri.file(path.join(this.context.extensionPath, 'src', 'playback', 'webview'))
            ]
        });
    }
}
exports.searchService = searchService;
//# sourceMappingURL=search.service.js.map