// TODO -- This entire file needs to be rewritten to use BentoML models

import * as vscode from 'vscode';
import { Model, SimpleModel } from '../bentoml/models';
import { getModels } from '../bentoml/cli-client';

export class BentoMlModelsTreeDataProvider implements vscode.TreeDataProvider<BentoMlModel | vscode.TreeItem> {
  constructor(public models: SimpleModel[] = []) {}

  private _onDidChangeTreeData: vscode.EventEmitter<BentoMlModel | undefined | null | void> =
    new vscode.EventEmitter<BentoMlModel | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<BentoMlModel | undefined | null | void> =
    this._onDidChangeTreeData.event;

  async refresh(): Promise<void> {
    this.models = await getModels();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BentoMlModel): vscode.TreeItem {
    console.log(`getTreeItem used: ${element}`);
    return element;
  }

  getChildren(element?: BentoMlModel): Thenable<BentoMlModel[] | vscode.TreeItem[]> {
    // when the tree view is first opened, element is undefined. This means
    // this function needs to return the top-level items.
    console.log(`element: ${element}`);
    if (!element) {
      //const dummy_model = new BentoMlModel(`Model`, vscode.TreeItemCollapsibleState.Collapsed);
      return Promise.resolve(
        this.models.map(
          (model: SimpleModel) => new BentoMlModel(model.tag, vscode.TreeItemCollapsibleState.Collapsed, model)));
      // return Promise.resolve(
      //   this.models.map(
      //     (model: Model) => new BentoMlModel(`Model`, vscode.TreeItemCollapsibleState.Collapsed, model)
      //   )
      // );
    }

    // otherwise, the element is a BentoMlModel, so expanding it should reveal
    // a list of its details. We show the details as tree items nested underneath.

    const bentomlModelDetails: vscode.TreeItem[] = (element as BentoMlModel).getBentomlModelDetailsAsTreeItems();
    return Promise.resolve(bentomlModelDetails);
  }
}
    //return Promise.resolve([element]);



export class BentoMlModel extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon('cloud');

  // setting this value allows us to condition the context menu on the type of tree item like so:
  // "when": "viewItem == top-level-bentoml-model-tree-item"; this allows us, in the package.json,
  // to distinguish between the top-level tree item and the details tree items (children of the top-level items)
  contextValue = 'top-level-bentoml-model-tree-item';

  constructor(
    public readonly name: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly model: SimpleModel,
  ) {
    super(name, collapsibleState);
  }

getBentomlModelDetailsAsTreeItems = (): vscode.TreeItem[] => {
  const makeTreeItem = (name: string, description: string): vscode.TreeItem => {
    const treeItem = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
    treeItem.description = description;
    treeItem.contextValue = 'bentoml-model-detail-tree-item';
    return treeItem;
  };

  //"tag": "linear_reg:yji63og57g4tvxwy",
  //"module": "bentoml.sklearn",
  //"size": "940.00 B",
  //"creation_time": "2024-03-09 12:45:27"
  // return [
  //   makeTreeItem(`Tag`, this.model.model_info.tag),
  //   makeTreeItem(`Module`, this.model.model_info.module),
  //   makeTreeItem(`Size`, this.model.model_fs),
  //   //human_readable_size(calc_dir_size(model.path)),
  //   makeTreeItem(`Created`, this.model.model_info.creation_time),
  // ];

  return [
    makeTreeItem(`Tag`, this.model.tag),
    makeTreeItem(`Module`, this.model.module),
    makeTreeItem(`Size`, this.model.size),
    //human_readable_size(calc_dir_size(model.path)),
    makeTreeItem(`Created`, this.model.creation_time),
  ];

};
}