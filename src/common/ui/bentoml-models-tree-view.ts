// TODO -- This entire file needs to be rewritten to use BentoML models

import * as vscode from 'vscode';

export class BentoMlModelsTreeDataProvider implements vscode.TreeDataProvider<BentoMlModel | vscode.TreeItem> {
  constructor(public interactiveSessions: Task[] = []) {}

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
        this.interactiveSessions.map(
          (sessionTask: Task) => new BentoMlModel(`Model`, vscode.TreeItemCollapsibleState.Collapsed, sessionTask)
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
  contextValue = 'top-level-clearml-session-tree-item';

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly sessionTask: Task
  ) {
    super(label, collapsibleState);

    this.description = sessionTask.id;

    this.tooltip = `
    Comment: ${sessionTask.comment}
    Project ID: ${sessionTask.project.id}
    Task ID: ${sessionTask.id}
    `;
  }

  getBentoMlModelDetailsAsTreeItems = (): vscode.TreeItem[] => {
    const makeTreeItem = (label: string, description: string): vscode.TreeItem => {
      const treeItem = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
      treeItem.description = description;
      treeItem.contextValue = 'clearml-session-detail-tree-item';
      return treeItem;
    };

    return [
      makeTreeItem(`Project ID`, this.sessionTask.project.id),
      makeTreeItem(`Task ID`, this.sessionTask.id),
      makeTreeItem(`Comment`, this.sessionTask.comment),
      makeTreeItem(`Active duration`, String(this.sessionTask.active_duration) + ' minutes'),
      makeTreeItem(`Status`, this.sessionTask.status),
      makeTreeItem(`Type`, this.sessionTask.type),
      makeTreeItem(`Created`, this.sessionTask.created),
      makeTreeItem(`Last update`, this.sessionTask.last_update),
      makeTreeItem(`Last iteration`, String(this.sessionTask.last_iteration)),
      makeTreeItem(`Last worker`, this.sessionTask.last_worker),
      makeTreeItem(`Queue `, this.sessionTask.execution.queue.id),
    ];
  };
}
