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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.login = login;
exports.deactivate = deactivate;
exports.playMusic = playMusic;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = __importStar(require("vscode"));
var express_1 = __importDefault(require("express"));
var app = (0, express_1.default)();
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
var CLIENT_ID = "6ed056117cfb4d9bb9a93ec4bcb7d5b9";
var CLIENT_SECRET = "bcf93dd96259479dbe7f2e8a0097ae2b";
var REDIRECT_URL = "https://localhost:8080/callback";
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "Mitinfy" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('Mitinfy.helloWorld', function () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from mitinfy!');
    });
    context.subscriptions.push(disposable);
}
function login() {
    return __awaiter(this, void 0, void 0, function () {
        var auth_url, getUsrToken, usrToken;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    auth_url = 'https://accounts.spotify.com/authorize?' +
                        "client_id=".concat(CLIENT_ID) +
                        'response_type=code&' +
                        "redirect_url=".concat(REDIRECT_URL, "&") +
                        'scope=user-read-playback-state';
                    return [4 /*yield*/, vscode.env.openExternal(vscode.Uri.parse(auth_url))];
                case 1:
                    _a.sent();
                    getUsrToken = function () {
                        return app.get('/callback', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            var tokenRes;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!req.query.code) {
                                            res.status(400).send('No hay ningún código de autorización');
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, fetch('https://accounts.spotify.com/api/token', {
                                                method: 'POST',
                                                headers: { 'content_type': 'application/x-www-form-urlencoded' },
                                                body: new URLSearchParams({
                                                    grant_type: 'authorization_code',
                                                    code: req.query.code,
                                                    redirect_uri: REDIRECT_URL
                                                }).toString()
                                            })];
                                    case 1:
                                        tokenRes = _a.sent();
                                        if (tokenRes) {
                                            res.status(200).send('Autenticacion exitosa');
                                            return [2 /*return*/, tokenRes.json()];
                                        }
                                        res.status(400).send('token nulo');
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    };
                    usrToken = getUsrToken();
                    return [2 /*return*/];
            }
        });
    });
}
// This method is called when your extension is deactivated
function deactivate() { }
function playMusic() { }
