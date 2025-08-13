import * as vscode from 'vscode'

export const PACKAGE_CMND_NAME = 'cfh'
export const PACKAGE_CONTEXT = `${PACKAGE_CMND_NAME}.copiedFolderHierarchyPath`

export function showMessage(msg: string, error = true, items: string[] = []) {
    return error
        ? vscode.window.showErrorMessage(`Copy Folder Hierarchy: ${msg}`, ...items)
        : vscode.window.showInformationMessage(`Copy Folder Hierarchy: ${msg}`, ...items)
}

export async function setContext(val: boolean): Promise<void> {
    await vscode.commands.executeCommand('setContext', PACKAGE_CONTEXT, val)
}
