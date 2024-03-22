import * as vscode from 'vscode';
import { BentoFile } from '../bentoml/models';
import { getBentoFiles } from '../bentoml/bentofile';



export class BentoFileTreeItem extends vscode.TreeItem {
    readonly contextValue = 'top-level-bentoml-serve-tree-item';
    constructor(
        public readonly bentoFile: BentoFile
    ) {
        const { service } = bentoFile;
        super(service, vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = `${this.label}`;
    }

    private makeTreeItem = (name:string,description:string, collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None) : vscode.TreeItem => {
        const treeItem = new vscode.TreeItem(name, collapsibleState);
        treeItem.description = description;
        treeItem.contextValue = 'bentoml-serve-detail-tree-item';
        return treeItem;
    };

    getBentoFileDetailsAsTreeItems =(): vscode.TreeItem[] => {
        
        const items: vscode.TreeItem[] = [];
        Object.entries(this.bentoFile).forEach(([key, value]) => {
            if(typeof value === 'object'){
                items.push(this.makeTreeItem(key, JSON.stringify(value), vscode.TreeItemCollapsibleState.None));
            }else {
                items.push(this.makeTreeItem(key, value.toString(), vscode.TreeItemCollapsibleState.None));
            }
        });
        return items;
    };

}

export class BentoMlServeTreeDataProvider implements vscode.TreeDataProvider<BentoFileTreeItem | vscode.TreeItem> {

    constructor(public models: BentoFile[] = []) {}

    private _onDidChangeTreeData: vscode.EventEmitter<BentoFileTreeItem | undefined | null | void> =
      new vscode.EventEmitter<BentoFileTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BentoFileTreeItem | undefined | null | void> =
      this._onDidChangeTreeData.event;


    refresh(): void {
        this.models = this.getBentoFiles();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BentoFileTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: BentoFileTreeItem): Thenable<BentoFileTreeItem[] | vscode.TreeItem[]> {
        if (!element) {
            return Promise.resolve(this.models.map(
                    (model: BentoFile) => new BentoFileTreeItem(model)
                ));
        }else{
            const bentomlFileDetails = element.getBentoFileDetailsAsTreeItems();
            return Promise.resolve(bentomlFileDetails);
        }
    }

    private getBentoFiles(): BentoFile[]{
        const rootPaths = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath) || [];
        if (rootPaths.length !== 0) {
            return rootPaths.map(rootPath => getBentoFiles(rootPath)).flat().filter(bentoFile => !!bentoFile.service);
            
        }else{
            return [];
        }
    }

}