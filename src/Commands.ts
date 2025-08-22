import fs from 'fs-extra'
import path from 'node:path'
import * as vscode from 'vscode'
import * as utils from './utils'

export async function copyFolderHierarchy(uri: vscode.Uri, context: vscode.ExtensionContext): Promise<void> {
    let folder = ''

    if (path.extname(uri.fsPath)) {
        folder = path.dirname(uri.fsPath)
    } else {
        folder = uri.fsPath
    }

    try {
        const wsFolder = vscode.workspace.getWorkspaceFolder(uri)

        if (!wsFolder) {
            utils.showMessage('Selected folder is not inside a workspace')
            return
        }

        let rel = path.relative(wsFolder.uri.fsPath, folder)
        rel = rel.split(path.sep).filter(Boolean).join(path.sep).trim()

        await context.globalState.update(utils.PACKAGE_CONTEXT, rel)
        await utils.setContext(!!rel)

        utils.showMessage(`(${rel}) copied`, false)
    } catch (error: any) {
        utils.showMessage(error?.message ?? 'Failed to copy folder hierarchy')
    }
}

export async function createFolderHierarchy(targetUri: vscode.Uri, context: vscode.ExtensionContext): Promise<void> {
    try {
        const rel: string = context.globalState.get(utils.PACKAGE_CONTEXT) as string || ''

        if (!rel) {
            utils.showMessage('No copied folder path found. Use "Copy Folder Hierarchy" first.')
            return
        }

        const pathSegments = rel.split(path.sep).filter(Boolean)

        const selectedSegments = await vscode.window.showQuickPick(
            pathSegments.map((segment) => ({
                label: segment,
                picked: true,
            })),
            {
                canPickMany: true,
                placeHolder: 'Select which folder segments to include in the hierarchy (uncheck to exclude)',
                ignoreFocusOut: true,
            },
        )

        if (!selectedSegments) {
            return
        }

        const selectedPaths = selectedSegments
            .filter((item) => item.picked)
            .map((item) => item.label)

        if (selectedPaths.length === 0) {
            utils.showMessage('No folder segments selected. Operation cancelled.')
            return
        }

        const finalPath = selectedPaths.join(path.sep)
        const destPath = path.join(targetUri.fsPath, finalPath)
        await fs.ensureDir(destPath)

        const destUri = vscode.Uri.file(destPath)
        await vscode.commands.executeCommand('revealInExplorer', destUri)
        utils.showMessage(`created "${vscode.workspace.asRelativePath(destUri, false)}"`, false)
        // await utils.setContext(false)
    } catch (error: any) {
        utils.showMessage(error?.message ?? 'Failed to create folder hierarchy')
    }
}
