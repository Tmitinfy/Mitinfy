import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('mi-extension.abrirPanel', () => {
    const panel = vscode.window.createWebviewPanel(
      'miPanel',                  // id interno
      'Panel HTML',               // título en la pestaña
      vscode.ViewColumn.One,      // en qué columna se abre
      { enableScripts: true }     // permite JS en el webview
    );

    panel.webview.html = getWebviewContent();
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: sans-serif;
          padding: 1rem;
          background: #1e1e1e;
          color: white;
        }
        h1 {
          color: #42a5f5;
        }
        button {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          background: #42a5f5;
          color: white;
          cursor: pointer;
        }
        button:hover {
          background: #1e88e5;
        }
      </style>
    </head>
    <body>
      <h1>Hola desde mi extensión 🚀</h1>
      <p>Este panel usa <b>HTML + CSS</b> dentro de un Webview.</p>
      <button onclick="alert('¡Funciona!')">Probar</button>
    </body>
    </html>
  `;
}

export function deactivate() {}
