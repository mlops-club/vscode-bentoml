import * as vscode from 'vscode';
import { Model, SimpleModel, Bento } from './models';
import { runShellCommand } from '../shell';
import { getPathToActivePythonInterpreter, promptIfPythonInterpreterIsNotConfigured } from '../python';
import { traceInfo } from '../logging';

export async function getModels() {
  const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'list', '--output', 'json']);
  console.log(`getModels() response: ${response.logs}`);
  return JSON.parse(response.logs) as SimpleModel[];
}

export async function getBentos() {
  const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'list', '--output', 'json']);
  console.log(`getBentos() response: ${response.logs}`);
  return JSON.parse(response.logs) as Bento[];
}

export async function showBentos(tag: string) {
  const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'get', tag]);
  console.log(`showBentos() response: ${response.logs}`);
  return response.logs;
}

export async function showModels(tag: string) {
  const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'get', tag]);
  console.log(`showBentos() response: ${response.logs}`);
  return response.logs;
}

export async function deleteModel(object: SimpleModel) {
  const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'delete', object.tag, '-y']);
  console.log(response.logs);
  return response.logs;
}

export async function deleteBento(object: Bento) {
  const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'delete', object.tag, '-y']);
  console.log(response.logs);
  return response.logs;
}

export async function serve(bentoDirectory: string): Promise<string> {
  const interpreterFpath = (await getPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'serve', bentoDirectory]);
  return response.logs;
}
