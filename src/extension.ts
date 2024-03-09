import * as vscode from 'vscode';
import * as consts from './common/constants';
import { BentoMlExtensionSettings as BentoMlExtensionSettings, getExtensionSettings, getInterpreterFromSetting } from './common/settings';
import { registerLogger, traceInfo, traceLog } from './common/logging';
import { createOutputChannel } from './common/vscodeapi';
import { initializePython } from './common/python';
import { ensureBentoMlCliIsAvailable } from './common/bentoml/install-cli';
import { Model } from './common/bentoml/models';

import { BentoMlModelsTreeDataProvider, BentoMlModel } from './common/ui/bentoml-models-tree-view';

export async function activate(context: vscode.ExtensionContext) {
  /**
   * Set up the logger.
   *
   * traceInfo(), traceError(), traceWarn(), and traceDebug() will
   * show up in a special "output channel" in the VS Code "Panel".
   *
   * To view these logs in a VS Code window where this extension is activated,
   *
   * 1. Open the panel with `Ctrl + ~`
   * 2. Click on the "Output" tab
   * 3. Select "BentoML" output channel from the dropdown
   */
  const outputChannel = createOutputChannel(consts.EXTENSION_NAME);
  context.subscriptions.push(outputChannel, registerLogger(outputChannel));

  /**
   * Read the extension settings.
   *
   * Settings are registered in the package.json file under the `contributes.configuration` section.
   *
   * The user of the extension can define settings in their .vscode/settings.json or global settings.
   */
  await loadPythonExtension(context);
  const bentoMlExtensionSettings: BentoMlExtensionSettings = await getExtensionSettings();
  // print settings whenever they change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e: vscode.ConfigurationChangeEvent) => {
      traceInfo('Extension settings changed. New settings:', getExtensionSettings());
    })
  );

  /**
   * Register the BentoML Models tree view.
   *
   * VS Code Terminology:
   * - a "View Container" is a sidebar item in VS Code, e.g. "Explorer", "Search", "Source Control", etc.
   *   This extension contributes a View Container with the BentoML logo.
   * - a "View" is a collapsible dropdown menu within a View Container. For the file explorer view, these
   *   would be "Open Editors", "Outline", etc. This extension contributes a "Tree View" to the BentoML View Container.
   *
   * This tree view allows the user to browse BentoML models. The UI elements, e.g. the icons are
   * defined in the package.json file.
   */
  const bentoMlModelsTreeProvider = new BentoMlModelsTreeDataProvider();
  vscode.window.registerTreeDataProvider('bentoml-models-tree-view', bentoMlModelsTreeProvider);

  /**
   * Register the commands that are used by this extension.
   *
   * Any of the buttons that you see in the tree view, trigger commands.
   * Other commands can be invoked via the command palette, e.g. `Ctrl + Shift + P`.
   *
   * These commands are defined in the package.json file.
   */
  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.refreshEntry`, async () => {
    await loadPythonExtension(context);
    bentoMlModelsTreeProvider.refresh();
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.openInBrowser`, async (session: BentoMlModel) => {
    vscode.env.openExternal(vscode.Uri.parse("https://docs.bentoml.com"));
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.copyValueToClipboard`, async (treeItem: vscode.TreeItem) => {
    if (treeItem.description) {
      await vscode.env.clipboard.writeText(treeItem.description as string);
      vscode.window.showInformationMessage(`${treeItem.label} was copied to your clipboard`);
    }
  });


  let disposable = vscode.commands.registerCommand(`${consts.EXTENSION_ID}.installPythonDependencies`, async () => {
    // The code you place here will be executed every time your command is executed
    await ensureBentoMlCliIsAvailable();
    vscode.window.showInformationMessage(`[${consts.EXTENSION_NAME}] Python dependencies installed successfully!`);
  });

  context.subscriptions.push(disposable);

  // notify the user that the extension activated successfully
  vscode.window.showInformationMessage(`[${consts.EXTENSION_NAME}] extension loaded!`);

  // Perform initial load of bentoml models and bentos to display in the sidebar, TODO this is hacky/brittle
  // setTimeout(async () => {
  //   await clearmlSessionsTreeProvider.refresh();
  // }, 3000);
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * Ensure the Python extension is installed.
 *
 * It is required for this extension to run, because this extension uses the Python extension's API
 * to find the active Python interpreter.
 *
 * @param context
 */
const loadPythonExtension = async (context: vscode.ExtensionContext) => {
  const interpreter = getInterpreterFromSetting(consts.SETTINGS_NAMESPACE);
  const interpreterNotSet = interpreter === undefined || interpreter.length === 0;
  if (interpreterNotSet) {
    traceLog(`Python extension loading`);
    await initializePython(context.subscriptions);
    traceLog(`Python extension loaded`);
  }
};
