/**
 * This file 
 */

import { LanguageStatusItem, Disposable, l10n, LanguageStatusSeverity } from 'vscode';
import { createLanguageStatusItem, getDocumentSelector } from './vscodeapi';
import { Command } from 'vscode-languageclient';

let _status: LanguageStatusItem | undefined;
export function registerLanguageStatusItem(id: string, name: string, command: string): Disposable {
    _status = createLanguageStatusItem(id, getDocumentSelector());
    _status.name = name;
    _status.text = name;
    _status.command = Command.create(l10n.t('Open logs'), command);

    return {
        dispose: () => {
            _status?.dispose();
            _status = undefined;
        },
    };
}

/**
 * Emit a message to 
 * @param status 
 * @param severity 
 * @param busy 
 * @param detail 
 */
export function updateStatus(
    status: string | undefined,
    severity: LanguageStatusSeverity,
    busy?: boolean,
    detail?: string,
): void {
    if (_status) {
        _status.text = status && status.length > 0 ? `${_status.name}: ${status}` : `${_status.name}`;
        _status.severity = severity;
        _status.busy = busy ?? false;
        _status.detail = detail;
    }
}
