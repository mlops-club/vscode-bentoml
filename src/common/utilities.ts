import { Uri, WorkspaceFolder } from 'vscode';
import { getWorkspaceFolders } from './vscodeapi';
import path from 'path';
import * as fs from 'fs-extra';

export async function getProjectRoot(): Promise<WorkspaceFolder> {
  const workspaces: readonly WorkspaceFolder[] = getWorkspaceFolders();
  if (workspaces.length === 0) {
    return {
      uri: Uri.file(process.cwd()),
      name: path.basename(process.cwd()),
      index: 0,
    };
  } else if (workspaces.length === 1) {
    return workspaces[0];
  } else {
    let rootWorkspace = workspaces[0];
    let root = undefined;
    for (const w of workspaces) {
      if (await fs.pathExists(w.uri.fsPath)) {
        root = w.uri.fsPath;
        rootWorkspace = w;
        break;
      }
    }

    for (const w of workspaces) {
      if (root && root.length > w.uri.fsPath.length && (await fs.pathExists(w.uri.fsPath))) {
        root = w.uri.fsPath;
        rootWorkspace = w;
      }
    }
    return rootWorkspace;
  }
}
