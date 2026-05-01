import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog, shell } from 'electron';
import { startServer } from '../server/index.js';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(MODULE_DIR, '..');
const DESKTOP_USER_DATA_DIR = path.join(app.getPath('appData'), 'MyInternship');

app.setPath('userData', DESKTOP_USER_DATA_DIR);

let mainWindow = null;
let backendServer = null;

function getWindowUrl(port) {
  return `http://127.0.0.1:${port}`;
}

function getDistDir() {
  return path.resolve(PROJECT_DIR, 'dist');
}

function getDesktopIconPath() {
  return path.resolve(getDistDir(), 'logo.png');
}

async function waitForListening(server) {
  if (server.listening) {
    return;
  }

  await new Promise((resolve, reject) => {
    const handleListening = () => {
      cleanup();
      resolve();
    };

    const handleError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      server.off('listening', handleListening);
      server.off('error', handleError);
    };

    server.on('listening', handleListening);
    server.on('error', handleError);
  });
}

async function ensureBackendStarted() {
  if (backendServer) {
    return backendServer;
  }

  process.env.NODE_ENV = 'production';
  process.env.MYINTERNSHIP_API_HOST = '127.0.0.1';
  process.env.MYINTERNSHIP_DATA_DIR = path.join(DESKTOP_USER_DATA_DIR, 'data');

  const { server } = startServer({
    host: '127.0.0.1',
    port: 0,
    distDir: getDistDir(),
  });

  await waitForListening(server);
  backendServer = server;
  return backendServer;
}

async function createMainWindow() {
  const server = await ensureBackendStarted();
  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Unable to determine desktop app server port.');
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    autoHideMenuBar: true,
    title: 'MyInternship',
    backgroundColor: '#f7f7f5',
    icon: getDesktopIconPath(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(getWindowUrl(address.port));
}

async function shutdownBackend() {
  if (!backendServer) {
    return;
  }

  const serverToClose = backendServer;
  backendServer = null;

  await new Promise((resolve) => {
    serverToClose.close(() => resolve());
  });
}

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    try {
      await createMainWindow();
    } catch (error) {
      console.error('[myinternship-desktop] failed to start', error);
      await dialog.showErrorBox('MyInternship 启动失败', error instanceof Error ? error.message : '未知错误');
      app.quit();
      return;
    }

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    void shutdownBackend();
  });
}