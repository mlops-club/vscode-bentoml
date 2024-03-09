import * as vscode from 'vscode';
import { Model, SimpleModel} from './models';
import { runShellCommand } from '../shell';
import { getPathToActivePythonInterpreter, promptIfPythonInterpreterIsNotConfigured } from '../python';
import { BentoMlModel } from '../ui/bentoml-models-tree-view';


export async function getModels() {
    const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
    const response = await runShellCommand(interpreterFpath, ["-m","bentoml", "models","list", "--output", "json"]);
    console.log(response.logs);
    return JSON.parse(response.logs) as SimpleModel[];
}

export async function deleteBentoModel(object: SimpleModel){
    const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
    const response = await runShellCommand(interpreterFpath, ["-m","bentoml", "models","delete", object.tag, "-y"]);
    console.log(response.logs);
    return response.logs;
}