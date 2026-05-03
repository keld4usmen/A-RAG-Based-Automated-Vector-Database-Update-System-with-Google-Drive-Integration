# RAG-Based Automated Vector Database Update System with Google Drive Integration

This repository contains an n8n workflow for ingesting documents from Google Drive, generating OpenAI embeddings, and storing them in a Pinecone vector database. It is intended for human resource policy documents and other policy-related content.

## Workflow

### Google Drive → Pinecone Ingestion
- Trigger: `Google Drive Trigger` monitors a specific Google Drive folder for newly created files.
- Download: `Google Drive` node downloads the detected document.
- Embeddings: `Embeddings OpenAI` generates embeddings for the document content.
- Text processing: `Default Data Loader` and `Recursive Character Text Splitter` split content into manageable chunks.
- Storage: `Pinecone Vector Store` inserts the processed chunks into a Pinecone index.

This workflow keeps the vector database updated automatically whenever new policy documents are added to the watched Google Drive folder.

## Intended Content

- Human resource policy documents
- Governance and compliance policy files
- Related documentation stored in Google Drive

A sample file included in this repository is `HUMAN_RESOURCE_POLICIES_-_GESCI__June_2018.pdf`, which demonstrates the type of policy content targeted by this automation.

## Key Components

- n8n no-code automation platform
- Google Drive OAuth2 connector
- OpenAI embeddings
- Pinecone vector database
- LangChain-style document loading and text splitting

## Notes

- The workflow is currently configured to run continuously and ingest new Google Drive files.
- The Pinecone index may be renamed to match the HR policy use case.
- This repository focuses on the ingestion/update automation rather than a chat interface.

## Usage

1. Import the JSON workflow file into n8n.
2. Configure Google Drive OAuth2 credentials.
3. Configure OpenAI API credentials.
4. Configure Pinecone API credentials and the target index.
5. Activate the workflow in n8n.
