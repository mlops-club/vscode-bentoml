import * as vscode from 'vscode';
import * as consts from '@/common/constants';
import * as os from 'os';
import * as path from 'path';
import {
  BentoMlExtensionSettings as BentoMlExtensionSettings,
  getExtensionSettings,
  getInterpreterFromSetting,
} from '@/common/settings';
import { registerLogger, traceError, traceInfo, traceLog } from '@/common/logging';
import { createOutputChannel } from '@/common/vscodeapi';
import { initializePython, promptIfPythonInterpreterIsNotConfigured } from '@/common/python';
import { ensureBentoMlCliIsAvailable } from '@/common/bentoml/install-cli';
import { SimpleModel, Bento } from '@/common/bentoml/models';
import {
  listModels,
  listBentos,
  deleteModel,
  deleteBento,
  getBentoInfo,
  getModelInfo,
  serve,
  containerize,
} from '@/common/bentoml/cli-client';
import {
  BentoMlModelsTreeDataProvider,
  BentoMLModelNameGroupTreeItem,
  BentoMLModelVersionTreeItem,
} from '@/common/ui/bentoml-models-tree-view';
import { BentoMlBentosTreeDataProvider, BentoMlBento } from '@/common/ui/bentoml-bentos-tree-view';
import { BentoMlServeTreeDataProvider } from '@/common/ui/bentoml-serve-tree-view';
import yaml from 'js-yaml';
import { serveBentoInTerminalCommand } from '@/common/commands/serve-bento-in-terminal';

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
  await promptIfPythonInterpreterIsNotConfigured();
  await ensureBentoMlCliIsAvailable();
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
  vscode.window.registerTreeDataProvider('bentoml-models', bentoMlModelsTreeProvider);

  const bentoMlBentosTreeProvider = new BentoMlBentosTreeDataProvider();
  vscode.window.registerTreeDataProvider('bentoml-bentos', bentoMlBentosTreeProvider);

  const bentoMlServeTreeDataProvider = new BentoMlServeTreeDataProvider();
  vscode.window.registerTreeDataProvider('bentoml-serve', bentoMlServeTreeDataProvider);

  /**
   * Register the commands that are used by this extension.
   *
   * Any of the buttons that you see in the tree view, trigger commands.
   * Other commands can be invoked via the command palette, e.g. `Ctrl + Shift + P`.
   *
   * These commands are defined in the package.json file.
   */

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.refreshModelEntry`, async () => {
    await loadPythonExtension(context);
    bentoMlModelsTreeProvider.refresh();
  });
  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.refreshBentoEntry`, async () => {
    await loadPythonExtension(context);
    bentoMlBentosTreeProvider.refresh();
  });
  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.refreshServeEntry`, async () => {
    await loadPythonExtension(context);
    bentoMlServeTreeDataProvider.refresh();
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.serveBentoInTerminal`, serveBentoInTerminalCommand);

  vscode.commands.registerCommand(
    `${consts.EXTENSION_ID}.openModelInBrowser`,
    async (model: BentoMLModelVersionTreeItem) => {
      vscode.env.openExternal(vscode.Uri.parse('https://docs.bentoml.com'));
    }
  );
  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.openBentoInBrowser`, async (bento: BentoMlBento) => {
    vscode.env.openExternal(vscode.Uri.parse('https://docs.bentoml.com'));
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.copyValueToClipboard`, async (treeItem: vscode.TreeItem) => {
    if (treeItem.description) {
      await vscode.env.clipboard.writeText(treeItem.description as string);
      vscode.window.showInformationMessage(`${treeItem.label} was copied to your clipboard`);
    }
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.viewBentos`, async (bento: BentoMlBento) => {
    const response = await getBentoInfo(bento.bento.tag as string);

    // Parse YAML content
    const yamlContent = yaml.dump(response);

    // Open the YAML content in a new untitled document in Visual Studio Code
    try {
      const doc: vscode.TextDocument = await vscode.workspace.openTextDocument({
        content: yamlContent,
        language: 'yaml',
      });
      await vscode.window.showTextDocument(doc);
    } catch (err) {
      traceError(err);
    }
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.viewModels`, async (model: BentoMLModelVersionTreeItem) => {
    const modelYaml: string = await getModelInfo(model.label as string);

    // Parse YAML content
    //const yamlContent = yaml.dump(response);

    // Open the YAML content in a new untitled document in Visual Studio Code
    try {
      const modelYaml: string = await getModelInfo(model.label as string);
      // Open the YAML content in a new untitled document in Visual Studio Code
      const doc: vscode.TextDocument = await vscode.workspace.openTextDocument({
        content: modelYaml,
        language: 'yaml',
      });
      // make the tab active
      await vscode.window.showTextDocument(doc);
    } catch (err) {
      traceError(err);
    }
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.deleteModel`, async (model: SimpleModel) => {
    await listModels();
    deleteModel(model);
    bentoMlModelsTreeProvider.refresh();
  });
  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.deleteBento`, async (bento: Bento) => {
    await listBentos();
    deleteBento(bento);
    bentoMlBentosTreeProvider.refresh();
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.serve`, async ({ bentoFile }) => {
    const { absolutePath, service } = bentoFile;
    const directoryPath = path.dirname(absolutePath);
    try {
      const result = await serve(directoryPath);
      if (result.toLowerCase().includes('error')) {
        throw new Error(result);
      }
      await vscode.window.showInformationMessage(`[${consts.EXTENSION_NAME}] Started serving ${service}!`);
    } catch (e) {
      await vscode.window.showErrorMessage(`[${consts.EXTENSION_NAME}] Failed to serve ${service}: ${e}`);
    }
  });

  vscode.commands.registerCommand(`${consts.EXTENSION_ID}.containerizeBento`, async (bento: BentoMlBento) => {
    const bentoTag = bento.bento.tag;
    try {
      const result = await containerize(bentoTag);
      if (result.toLowerCase().includes('error')) {
        throw new Error(result);
      }
      await vscode.window.showInformationMessage(`[${consts.EXTENSION_NAME}] Started containerizing ${bentoTag}!`);
    } catch (e) {
      await vscode.window.showErrorMessage(`[${consts.EXTENSION_NAME}] Failed to containerize ${bentoTag}: ${e}`);
    }
  });

  let dependencyInstallationDisposable = vscode.commands.registerCommand(
    `${consts.EXTENSION_ID}.installPythonDependencies`,
    async () => {
      // The code you place here will be executed every time your command is executed
      await ensureBentoMlCliIsAvailable();
      vscode.window.showInformationMessage(`[${consts.EXTENSION_NAME}] Python dependencies installed successfully!`);
    }
  );
  context.subscriptions.push(dependencyInstallationDisposable);

  let homeDirOpeningDisposable = vscode.commands.registerCommand(
    `${consts.EXTENSION_ID}.openBentomlHomeDir`,
    async () => {
      const extensionConfig = vscode.workspace.getConfiguration();

      const homeDir = os.homedir();
      const bentomlDirPath = extensionConfig.get<string>('bentoml.bentomlHomeDir') || 'bentoml';
      const bentomlDir = path.resolve(homeDir, bentomlDirPath);
      console.log(`bentomlDir: ${bentomlDir}`);

      try {
        const bentomlDirUri = vscode.Uri.file(bentomlDir);
        const bentomlWorkspaceFolder: vscode.WorkspaceFolder = {
          uri: bentomlDirUri,
          name: 'bentoml-home-directory', // Optional
          index: 0,
        };

        const currentFolders = vscode.workspace.workspaceFolders ?? [];
        const allFolders: vscode.WorkspaceFolder[] = [...currentFolders, bentomlWorkspaceFolder];
        for (const folder of allFolders) {
          console.log(`folder URI (before): ${folder.uri}`);
        }
        const added: boolean = vscode.workspace.updateWorkspaceFolders(0, 1, ...allFolders);
        console.log(`Added? ${added}`);
        const newCurrentFolders = vscode.workspace.workspaceFolders ?? [];
        for (const folder of newCurrentFolders) {
          console.log(`folder URI (after): ${folder.uri}`);
        }
      } catch (error) {
        console.error('Error opening BentoML home directory:', error);
        vscode.window.showErrorMessage('Error opening BentoML home directory');
      }
    }
  );
  context.subscriptions.push(homeDirOpeningDisposable);

  // notify the user that the extension activated successfully
  vscode.window.showInformationMessage(`[${consts.EXTENSION_NAME}] extension loaded!`);

  // Perform initial load of bentoml models and bentos to display in the sidebar
  // TODO: this is hacky/brittle because it waits 3 seconds in hopes that the extension will have
  // fully loaded before this logic is run.
  setTimeout(async () => {
    await Promise.all([
      bentoMlBentosTreeProvider.refresh(),
      bentoMlModelsTreeProvider.refresh(),
      bentoMlServeTreeDataProvider.refresh(),
    ]);
  }, 3000);
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
