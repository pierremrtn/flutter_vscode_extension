const vscode = require('vscode');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let panel;

	const lunchFlutterAppCommand = vscode.commands.registerCommand(
		'flutter-vscode-extension.lunchFlutterApp', function () {
			panel = createWebviewPanel(context);
		},
	);

	const sendMessageToFlutter = vscode.commands.registerCommand('flutter-vscode-extension.sendMessageToFlutter', async () => {
		if (!panel.webview) {
			vscode.window.showErrorMessage('Flutter UI is not open');
			return;
		}

		panel.webview.postMessage("Hi from vscode 👋");
	});


	context.subscriptions.push(lunchFlutterAppCommand, sendMessageToFlutter);
}


function createWebviewPanel(context) {
	const webBuildPath = path.join(context.extensionPath, 'flutter_app', 'build', 'web');
	const webAssetsPath = path.join(webBuildPath, 'assets');

	const panel = vscode.window.createWebviewPanel(
		'flutterApp', // Unique identifier for this type of panel
		'FLutter App', // Title displayed in the tab
		vscode.ViewColumn.One, // Editor column to show the panel in
		{
			enableScripts: true,
			webviewOptions: { retainContextWhenHidden: true },
			supportsMultipleEditorsPerDocument: false,
			localResourceRoots: [
				vscode.Uri.file(webBuildPath),
				vscode.Uri.file(webAssetsPath),
			]
		}
	);

	const toWebviewUri = (relativePath) => {
		const filePath = path.join(webBuildPath, relativePath);
		return panel.webview.asWebviewUri(vscode.Uri.file(filePath)).toString();
	};

	const baseUri = toWebviewUri('./');
	const mainDartJsUri = toWebviewUri("main.dart.js");

	// Set the HTML content
	panel.webview.html = getWebviewContent(context, {
		mainDartJsUri: mainDartJsUri,
		baseUri: baseUri,
	});

	panel.webview.onDidReceiveMessage(
		async (message) => {
			if (message) {
				console.log("true");
				vscode.window.showErrorMessage(message);
			}
		},
		undefined,
		context.subscriptions
	);

	return panel;
}

function getWebviewContent(context, {
	mainDartJsUri,
	baseUri,
}) {

	const historyApiMock = `
<script>
	(function () {
		var mockState = {};
		var originalPushState = history.pushState;
		var originalReplaceState = history.replaceState;

		history.pushState = function (state, title, url) {
			mockState = { state, title, url };
			console.log('Mock pushState:', url);
		};

		history.replaceState = function (state, title, url) {
			mockState = { state, title, url };
			console.log('Mock replaceState:', url);
		};

		Object.defineProperty(window, 'location', {
			get: function () {
				return {
					href: mockState.url || '${baseUri}',
					pathname: '/',
					search: '',
					hash: ''
				};
			}
		});
	})();	 
</script>`;



	return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Flutter App</title>
			<base href="${baseUri}">
        </head>
        <body>
            <h1>Hello from Webview!</h1>
		</body>
		${historyApiMock}
		<script>
			(function () {
			  	const vscode = acquireVsCodeApi();
				globalThis.vscodePostMessage = vscode.postMessage;
			})();
		</script>
		<script src="${mainDartJsUri}" type="application/javascript"></script>
        </html>
    `;
}



function deactivate() { }
module.exports = {
	activate,
	deactivate
}
