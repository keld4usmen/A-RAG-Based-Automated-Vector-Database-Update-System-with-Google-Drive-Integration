const webhookInput = document.getElementById('webhook-url');
const triggerBtn = document.getElementById('trigger-btn');
const uploadForm = document.getElementById('upload-form');
const uploadBtn = document.getElementById('upload-btn');
const uploadPreview = document.getElementById('upload-preview');
const previewName = document.getElementById('preview-name');
const previewSize = document.getElementById('preview-size');
const fileInput = document.getElementById('document-file');
const titleInput = document.getElementById('document-title');
const saveSettingsBtn = document.getElementById('save-settings');
const driveFolderIdInput = document.getElementById('drive-folder-id');
const pineconeIndexInput = document.getElementById('pinecone-index');
const statusWorkflow = document.getElementById('status-workflow');
const statusSource = document.getElementById('status-source');
const statusIndex = document.getElementById('status-index');
const statusLast = document.getElementById('status-last');
const log = document.getElementById('log');

let selectedFile = null;
let selectedFileData = null;

function logMessage(message) {
  const timestamp = new Date().toLocaleTimeString();
  log.innerHTML = `[${timestamp}] ${message}\n` + log.innerHTML;
}

function updateStatus() {
  const folderId = driveFolderIdInput.value.trim();
  const indexName = pineconeIndexInput.value.trim();
  statusWorkflow.textContent = folderId && indexName ? 'Configured' : 'Needs setup';
  statusSource.textContent = folderId ? folderId : 'Google Drive folder not set';
  statusIndex.textContent = indexName ? indexName : 'Pinecone index not set';
}

function saveSettings() {
  const settings = {
    webhookUrl: webhookInput.value.trim(),
    driveFolderId: driveFolderIdInput.value.trim(),
    pineconeIndex: pineconeIndexInput.value.trim(),
  };
  localStorage.setItem('hrPolicyFrontendSettings', JSON.stringify(settings));
  updateStatus();
  logMessage('Settings saved locally.');
}

function loadSettings() {
  const raw = localStorage.getItem('hrPolicyFrontendSettings');
  if (!raw) return;
  try {
    const settings = JSON.parse(raw);
    webhookInput.value = settings.webhookUrl || '';
    driveFolderIdInput.value = settings.driveFolderId || '';
    pineconeIndexInput.value = settings.pineconeIndex || '';
  } catch (error) {
    console.warn('Failed to load settings', error);
  }
}

function setPreview(file) {
  if (!file) {
    uploadPreview.classList.add('hidden');
    return;
  }

  selectedFile = file;
  previewName.textContent = file.name;
  previewSize.textContent = `${(file.size / 1024).toFixed(2)} KB`;
  uploadPreview.classList.remove('hidden');

  const reader = new FileReader();
  reader.onload = () => {
    selectedFileData = reader.result.split(',')[1];
  };
  reader.readAsDataURL(file);
}

async function triggerManualIngest() {
  const webhookUrl = webhookInput.value.trim();
  if (!webhookUrl) {
    logMessage('Please provide an n8n webhook URL.');
    return;
  }

  const payload = {
    action: 'manual_ingest',
    timestamp: new Date().toISOString(),
    folderId: driveFolderIdInput.value.trim(),
    indexName: pineconeIndexInput.value.trim(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with ${response.status}`);
    }

    statusLast.textContent = 'Manual ingest triggered';
    logMessage('Manual ingestion webhook successfully called.');
  } catch (error) {
    logMessage(`Error sending webhook: ${error.message}`);
  }
}

async function uploadFile() {
  if (!selectedFile || !selectedFileData) {
    logMessage('Select a document before uploading.');
    return;
  }

  const webhookUrl = webhookInput.value.trim();
  if (!webhookUrl) {
    logMessage('Provide an ingest endpoint or webhook before uploading.');
    return;
  }

  const body = {
    action: 'upload_document',
    title: titleInput.value.trim() || selectedFile.name,
    fileName: selectedFile.name,
    mimeType: selectedFile.type || 'application/octet-stream',
    contentBase64: selectedFileData,
    folderId: driveFolderIdInput.value.trim(),
    indexName: pineconeIndexInput.value.trim(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Upload failed with ${response.status}`);
    }

    const result = await response.json().catch(() => null);
    statusLast.textContent = 'File upload prepared';
    logMessage(`Document uploaded successfully. ${result && result.message ? result.message : ''}`);
  } catch (error) {
    logMessage(`Upload error: ${error.message}`);
  }
}

uploadForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!fileInput.files.length) {
    logMessage('No document selected for upload.');
    return;
  }
  setPreview(fileInput.files[0]);
  logMessage('Document ready for upload.');
});

fileInput.addEventListener('change', () => setPreview(fileInput.files[0] || null));
triggerBtn.addEventListener('click', triggerManualIngest);
uploadBtn.addEventListener('click', uploadFile);
saveSettingsBtn.addEventListener('click', saveSettings);

loadSettings();
updateStatus();
logMessage('Dashboard loaded. Configure settings and connect your workflow.');
