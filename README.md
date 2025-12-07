# GitHub Vercel Deploy Chrome Extension

A Chrome extension that allows you to upload code folders to GitHub and automatically deploy to Vercel.

## Features

- 📁 Upload entire code folders to GitHub
- 🚀 Automatic deployment to Vercel
- 🔒 Supports private repositories
- 📊 Real-time progress tracking
- ✨ Modern, clean interface
- 🔐 Secure token-based authentication

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Setup

### 1. Get GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens/new)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Chrome Deploy Extension")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (if you use GitHub Actions)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

### 2. Get Vercel Token

1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a descriptive name (e.g., "Chrome Deploy Extension")
4. Select appropriate scope (recommended: Full Account)
5. Click "Create"
6. Copy the token

### 3. Configure the Extension

1. Click the extension icon in your toolbar
2. Enter your GitHub token in the first input field
3. Enter your Vercel token in the second input field
4. Click "Save Tokens"
5. The extension will verify your tokens and show connection status

## Usage

1. Click the extension icon in your toolbar
2. If tokens are configured, you'll see the upload interface
3. Click "Select Folder" and choose your code folder
4. Enter a repository name and optional description
5. Choose whether to make the repository private
6. Click "Deploy to GitHub & Vercel"
7. Wait for the deployment to complete
8. Access your project via the provided links

## Requirements

- Active GitHub account with Personal Access Token
- Active Vercel account with API Token
- Chrome browser (version 88+)

## Token Security

Your tokens are:
- Stored securely in Chrome's local storage
- Only accessible by this extension
- Never sent to any third parties
- Only used to communicate with GitHub and Vercel APIs

You can update or remove your tokens at any time by clicking "Update Tokens" in the extension.

## Limitations

- Maximum file size: 100MB per file (GitHub limit)
- Excludes: node_modules, .git, .next, dist, build folders
- Requires File System Access API support
- GitHub API rate limits apply (typically 5,000 requests per hour for authenticated users)

## Troubleshooting

### "Invalid token" error
- Make sure your GitHub token has the `repo` scope
- Make sure your Vercel token is valid and not expired
- Try regenerating your tokens

### Files not uploading
- Check if the repository name is already taken
- Ensure your tokens have the correct permissions
- Check browser console for detailed error messages

### Deployment fails
- Make sure the repository was created successfully on GitHub
- Verify your Vercel account has available deployment slots
- Check if the project type is supported by Vercel

## Privacy

This extension:
- Stores tokens locally in Chrome storage
- Does not send data to third parties
- Only communicates with GitHub and Vercel APIs
- Does not track or collect user data

## License

MIT License
