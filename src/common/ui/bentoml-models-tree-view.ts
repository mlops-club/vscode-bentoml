// TODO -- This entire file needs to be rewritten to use BentoML models

import * as vscode from 'vscode';
import { Model, SimpleModel } from '../bentoml/models';
import { listModels } from '../bentoml/cli-client';

/**
 *
 * class Tree extends TreeDataProvider<   BentoMLModelTreeItem | TreeItem > {
 *
 * BentoMLModelTreeItem -- this.label = model.tag ("<model name>:<model version>")
 *    |-> [  TreeItem -- this.label =    ]
 *
 *
 * BentoMLModelNameGroupTreeItem  (this.label = "<model name>")
 *    -> [  BentoMLModelTreeItem -- this.label = model.tag ("<model version>") ]
 *             -> [  TreeItem -- this.label = "Module: <module>"   ]
 *
 * Tree.getChildren(element)
 *  case undefined: return a list of these BentoMLModelNameGroupTreeItem
 *  case BentoMLModelNameGroupTreeItem: return element.getChildren()
 *  case BentoMLModelTreeItem: return element.getChildren()
 *  case TreeItem: return []
 *
 */

export class BentoMlModelsTreeDataProvider
  implements vscode.TreeDataProvider<BentoMLModelNameGroupTreeItem | BentoMLModelVersionTreeItem | vscode.TreeItem>
{
  constructor(public models: SimpleModel[] = []) {}

  private _onDidChangeTreeData: vscode.EventEmitter<BentoMLModelVersionTreeItem | undefined | null | void> =
    new vscode.EventEmitter<BentoMLModelVersionTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<BentoMLModelVersionTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  async refresh(): Promise<void> {
    this.models = await listModels();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BentoMLModelVersionTreeItem): vscode.TreeItem {
    console.log(`getTreeItem used: ${element}`);
    return element;
  }

  /**
   * When the tree view is first opened, element is undefined. This means
   * this function needs to return the top-level items.
   */
  getChildren(
    element?: BentoMLModelVersionTreeItem
  ): Thenable<BentoMLModelNameGroupTreeItem[] | BentoMLModelVersionTreeItem[] | vscode.TreeItem[]> {
    // Tree.getChildren(element)
    // case undefined: return a list of these BentoMLModelNameGroupTreeItem
    // case BentoMLModelNameGroupTreeItem: return element.getChildren()
    // case BentoMLModelTreeItem: return element.getChildren()
    // case TreeItem: return []
    if (!element) {
      const modelNames: Map<string, SimpleModel[]> = new Map();
      for (const model of this.models) {
        const [modelName] = model.tag.split(':');
        if (!modelNames.has(modelName)) {
          modelNames.set(modelName, []);
        }
        modelNames.get(modelName)?.push(model);
      }
      const modelNameItems: BentoMLModelNameGroupTreeItem[] = Array.from(modelNames.entries()).map(
        ([modelName, models]) => new BentoMLModelNameGroupTreeItem(modelName, models)
      );
      return Promise.resolve(modelNameItems);
    } else {
      if (element instanceof BentoMLModelNameGroupTreeItem) {
        return Promise.resolve(element.getChildren());
      } else {
        return Promise.resolve([]);
      }
    }
  }
}

/**
 * Group models by name in the `Models` sidebar view.
 */
export class BentoMLModelNameGroupTreeItem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly models: SimpleModel[]
  ) {
    super(name, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = 'bentoml-model-group-tree-item';
  }

  getChildren(): BentoMLModelVersionTreeItem[] {
    const children: BentoMLModelVersionTreeItem[] = this.models.map(
      (model) => new BentoMLModelVersionTreeItem(model.tag, vscode.TreeItemCollapsibleState.None, model)
    );
    return children;
  }
}

export class BentoMLModelVersionTreeItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon('cloud');

  // setting this value allows us to condition the context menu on the type of tree item like so:
  // "when": "viewItem == top-level-bentoml-model-tree-item"; this allows us, in the package.json,
  // to distinguish between the top-level tree item and the details tree items (children of the top-level items)
  contextValue = 'top-level-bentoml-model-tree-item';

  constructor(
    public readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly model: SimpleModel
  ) {
    super(version, collapsibleState);
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
