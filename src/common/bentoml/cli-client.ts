import { Model, SimpleModel, Bento } from './models';
import { runShellCommand } from '../shell';
import { tryGetPathToActivePythonInterpreter } from '../python';
import { traceInfo } from '../logging';

export async function listModels() {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'list', '--output', 'json']);
  traceInfo(`getModels() response: ${response.logs}`);
  return JSON.parse(response.logs) as SimpleModel[];
}

export async function listBentos() {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'list', '--output', 'json']);
  traceInfo(`getBentos() response: ${response.logs}`);
  return JSON.parse(response.logs) as Bento[];
}

export async function getBentoInfo(tag: string) {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'get', tag]);
  traceInfo(`showBentos() response: ${response.logs}`);
  return response.logs;
}

export async function getModelInfo(tag: string) {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'get', tag]);
  traceInfo(`showBentos() response: ${response.logs}`);
  return response.logs;
}

export async function deleteModel(object: SimpleModel) {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'models', 'delete', object.tag, '-y']);
  traceInfo(response.logs);
  return response.logs;
}

export async function deleteBento(object: Bento) {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'delete', object.tag, '-y']);
  traceInfo(response.logs);
  return response.logs;
}

export async function serve(bentoDirectory: string): Promise<string> {
  const interpreterFpath = (await tryGetPathToActivePythonInterpreter()) as string;
  const response = await runShellCommand(interpreterFpath, ['-m', 'bentoml', 'serve', bentoDirectory]);
  return response.logs;
}
