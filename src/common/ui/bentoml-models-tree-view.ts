// TODO -- This entire file needs to be rewritten to use BentoML models

import * as vscode from 'vscode';
import { Model } from '../bentoml/models';


export class BentoMlModelsTreeDataProvider implements vscode.TreeDataProvider<BentoMlModel | vscode.TreeItem> {
  constructor(public models: Model[] = []) {}

  private _onDidChangeTreeData: vscode.EventEmitter<BentoMlModel | undefined | null | void> =
    new vscode.EventEmitter<BentoMlModel | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<BentoMlModel | undefined | null | void> =
    this._onDidChangeTreeData.event;

  async refresh(): Promise<void> {
    // this.interactiveSessions = await fetchClearmlSessions();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BentoMlModel): vscode.TreeItem {
    return element;
  }

  getChildren(element?: BentoMlModel): Thenable<BentoMlModel[] | vscode.TreeItem[]> {
    // when the tree view is first opened, element is undefined. This means
    // this function needs to return the top-level items.
    if (!element) {
      return Promise.resolve(
        this.models.map(
          (model: Model) => new BentoMlModel(`Model`, vscode.TreeItemCollapsibleState.Collapsed, model)
        )
      );
    }

    // otherwise, the element is a BentoMlModel, so expanding it should reveal
    // a list of its details. We show the details as tree items nested underneath.
    const bentoMlModelDetails: vscode.TreeItem[] = (element as BentoMlModel).getBentoMlModelDetailsAsTreeItems();
    return Promise.resolve(bentoMlModelDetails);
  }
}

export class BentoMlModel extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon('cloud');

  // setting this value allows us to condition the context menu on the type of tree item like so:
  // "when": "viewItem == top-level-clearml-session-tree-item"; this allows us, in the package.json,
  // to distinguish between the top-level tree item and the details tree items (children of the top-level items)
  contextValue = 'top-level-bentoml-session-tree-item';

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly model: Model
  ) {
    super(label, collapsibleState);

    this.description = model.id;

    this.tooltip = `
    Comment: ${model.comment}
    Project ID: ${model.project.id}
    Task ID: ${model.id}
    `;
  }

  getBentoMlModelDetailsAsTreeItems = (): vscode.TreeItem[] => {
    const makeTreeItem = (label: string, description: string): vscode.TreeItem => {
      const treeItem = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
      treeItem.description = description;
      treeItem.contextValue = 'bentoml-session-detail-tree-item';
      return treeItem;
    };

    return [
      makeTreeItem(`Project ID`, this.model.project.id),
      makeTreeItem(`Task ID`, this.model.id),
      makeTreeItem(`Comment`, this.model.comment),
      makeTreeItem(`Active duration`, String(this.model.active_duration) + ' minutes'),
      makeTreeItem(`Status`, this.model.status),
      makeTreeItem(`Type`, this.model.type),
      makeTreeItem(`Created`, this.model.created),
      makeTreeItem(`Last update`, this.model.last_update),
      makeTreeItem(`Last iteration`, String(this.model.last_iteration)),
      makeTreeItem(`Last worker`, this.model.last_worker),
      makeTreeItem(`Queue `, this.model.execution.queue.id),
    ];
  };
}
