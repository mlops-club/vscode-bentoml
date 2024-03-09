// TODO -- This entire file needs to be rewritten to use BentoML models

import * as vscode from 'vscode';
import { Bento } from '../bentoml/models';
import { getBentos } from '../bentoml/cli-client';

export class BentoMlBentosTreeDataProvider implements vscode.TreeDataProvider<BentoMlBento | vscode.TreeItem> {
  constructor(public bentos: Bento[] = []) {}

  private _onDidChangeTreeData: vscode.EventEmitter<BentoMlBento | undefined | null | void> =
    new vscode.EventEmitter<BentoMlBento | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<BentoMlBento | undefined | null | void> =
    this._onDidChangeTreeData.event;

  async refresh(): Promise<void> {
    this.bentos = await getBentos();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BentoMlBento): vscode.TreeItem {
    console.log(`getTreeItem used: ${element}`);
    return element;
  }

  getChildren(element?: BentoMlBento): Thenable<BentoMlBento[] | vscode.TreeItem[]> {
    // when the tree view is first opened, element is undefined. This means
    // this function needs to return the top-level items.
    console.log(`bento element: ${element}`);
    if (!element) {
      return Promise.resolve(
        this.bentos.map(
          (bento: Bento) => new BentoMlBento(bento.tag, vscode.TreeItemCollapsibleState.Collapsed, bento)));
    }

    // otherwise, the element is a BentoMlBento, so expanding it should reveal
    // a list of its details. We show the details as tree items nested underneath.

    const bentomlBentoDetails: vscode.TreeItem[] = (element as BentoMlBento).getBentomlBentoDetailsAsTreeItems();
    return Promise.resolve(bentomlBentoDetails);
  }
}
    //return Promise.resolve([element]);



export class BentoMlBento extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon('cloud');

  // setting this value allows us to condition the context menu on the type of tree item like so:
  // "when": "viewItem == top-level-bentoml-bento-tree-item"; this allows us, in the package.json,
  // to distinguish between the top-level tree item and the details tree items (children of the top-level items)
  contextValue = 'top-level-bentoml-bento-tree-item';

  constructor(
    public readonly name: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly bento: Bento,
  ) {
    super(name, collapsibleState);
  }

getBentomlBentoDetailsAsTreeItems = (): vscode.TreeItem[] => {
  const makeBentoTreeItem = (name: string, description: string): vscode.TreeItem => {
    const treeItem = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
    treeItem.description = description;
    treeItem.contextValue = 'bentoml-bento-detail-tree-item';
    return treeItem;
  };

  return [
    makeBentoTreeItem(`Tag`, this.bento.tag),
    makeBentoTreeItem(`Size`, this.bento.size),
    makeBentoTreeItem(`Model Size`, this.bento.model_size),
    makeBentoTreeItem(`Creation Time`, this.bento.creation_time),
  ];

};
}