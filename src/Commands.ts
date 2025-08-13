import fs from 'fs-extra'
import path from 'node:path'
import * as vscode from 'vscode'
import * as utils from './utils'

export async function copyFolderHierarchy(uri: vscode.Uri, context: vscode.ExtensionContext): Promise<void> {
    console.log('🚀🚀🚀 ~ Commands.ts:7 ~ copyFolderHierarchy ~ uri:', uri)
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

        const destPath = path.join(targetUri.fsPath, rel)
        await fs.ensureDir(destPath)

        const destUri = vscode.Uri.file(destPath)
        await vscode.commands.executeCommand('revealInExplorer', destUri)
        folderCreatedMsg(destUri)
        // await utils.setContext(false)
    } catch (error: any) {
        utils.showMessage(error?.message ?? 'Failed to create folder hierarchy')
    }
}

export async function createFolderHierarchyWithoutTopMostDir(targetUri: vscode.Uri, context: vscode.ExtensionContext): Promise<void> {
    try {
        const rel: string = context.globalState.get(utils.PACKAGE_CONTEXT) as string || ''

        const parts = rel.split(path.sep).filter(Boolean)

        if (parts.length <= 1) {
            utils.showMessage('Nothing to create: copied path has no subdirectories')
            return
        }

        const subPath = path.join(...parts.slice(1))
        const destPath = path.join(targetUri.fsPath, subPath)
        await fs.ensureDir(destPath)

        const destUri = vscode.Uri.file(destPath)
        await vscode.commands.executeCommand('revealInExplorer', destUri)
        folderCreatedMsg(destUri)
        // await utils.setContext(false)
    } catch (error: any) {
        utils.showMessage(error?.message ?? 'Failed to create folder hierarchy')
    }
}

function folderCreatedMsg(destUri: vscode.Uri): void {
    utils.showMessage(`created "${vscode.workspace.asRelativePath(destUri, false)}"`, false)
}
