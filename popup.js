// State management
let selectedFiles = null
let folderHandle = null
let githubToken = null
let vercelToken = null

// DOM Elements
const tokenSection = document.getElementById("tokenSection")
const githubTokenInput = document.getElementById("githubToken")
const vercelTokenInput = document.getElementById("vercelToken")
const saveTokensBtn = document.getElementById("saveTokens")
const statusSection = document.getElementById("statusSection")
const updateTokensBtn = document.getElementById("updateTokens")
const uploadSection = document.getElementById("uploadSection")
const selectFolderBtn = document.getElementById("selectFolder")
const folderInfo = document.getElementById("folderInfo")
const folderName = document.getElementById("folderName")
const fileCount = document.getElementById("fileCount")
const configSection = document.getElementById("configSection")
const repoNameInput = document.getElementById("repoName")
const repoDescriptionInput = document.getElementById("repoDescription")
const privateRepoCheckbox = document.getElementById("privateRepo")
const actionsSection = document.getElementById("actionsSection")
const deployBtn = document.getElementById("deployBtn")
const progressSection = document.getElementById("progressSection")
const progressBar = document.getElementById("progressBar")
const progressPercent = document.getElementById("progressPercent")
const progressTitle = document.getElementById("progressTitle")
const progressMessage = document.getElementById("progressMessage")
const resultSection = document.getElementById("resultSection")
const errorSection = document.getElementById("errorSection")
const errorMessage = document.getElementById("errorMessage")
const retryBtn = document.getElementById("retryBtn")
const githubLink = document.getElementById("githubLink")
const vercelLink = document.getElementById("vercelLink")
const githubStatus = document.getElementById("githubStatus")
const vercelStatus = document.getElementById("vercelStatus")

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadTokens()
})

async function loadTokens() {
  try {
    const result = await window.chrome.storage.local.get(["githubToken", "vercelToken"])

    if (result.githubToken && result.vercelToken) {
      githubToken = result.githubToken
      vercelToken = result.vercelToken

      // Hide token input, show status
      tokenSection.classList.add("hidden")
      statusSection.classList.remove("hidden")
      uploadSection.classList.remove("hidden")

      // Check auth status
      await checkAuthStatus()
    }
  } catch (error) {
    console.error("Error loading tokens:", error)
  }
}

saveTokensBtn.addEventListener("click", async () => {
  const ghToken = githubTokenInput.value.trim()
  const vcToken = vercelTokenInput.value.trim()

  if (!ghToken || !vcToken) {
    showError("Please enter both tokens")
    return
  }

  // Save tokens to Chrome storage
  try {
    await window.chrome.storage.local.set({
      githubToken: ghToken,
      vercelToken: vcToken,
    })

    githubToken = ghToken
    vercelToken = vcToken

    // Hide token input, show status
    tokenSection.classList.add("hidden")
    statusSection.classList.remove("hidden")
    uploadSection.classList.remove("hidden")

    // Check auth status
    await checkAuthStatus()
  } catch (error) {
    showError("Failed to save tokens: " + error.message)
  }
})

updateTokensBtn.addEventListener("click", () => {
  statusSection.classList.add("hidden")
  uploadSection.classList.add("hidden")
  folderInfo.classList.add("hidden")
  configSection.classList.add("hidden")
  actionsSection.classList.add("hidden")
  tokenSection.classList.remove("hidden")

  // Clear inputs
  githubTokenInput.value = ""
  vercelTokenInput.value = ""
})

async function checkAuthStatus() {
  try {
    // Check GitHub authentication
    const githubAuth = await checkGitHubAuth()
    updateStatusBadge(githubStatus, githubAuth)

    // Check Vercel authentication
    const vercelAuth = await checkVercelAuth()
    updateStatusBadge(vercelStatus, vercelAuth)

    if (!githubAuth || !vercelAuth) {
      showError("Invalid tokens. Please update your tokens.")
    }
  } catch (error) {
    console.error("Error checking auth status:", error)
  }
}

function updateStatusBadge(element, isConnected) {
  element.className = `status-badge ${isConnected ? "connected" : "disconnected"}`
  element.textContent = isConnected ? "Connected" : "Invalid token"
}

async function checkGitHubAuth() {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })
    return response.ok
  } catch {
    return false
  }
}

async function checkVercelAuth() {
  try {
    const response = await fetch("https://api.vercel.com/v2/user", {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

// Select folder
selectFolderBtn.addEventListener("click", async () => {
  try {
    folderHandle = await window.showDirectoryPicker()
    selectedFiles = await readDirectory(folderHandle)

    // Display folder info
    folderName.textContent = folderHandle.name
    fileCount.textContent = `${selectedFiles.length} files`

    // Suggest repo name based on folder name
    repoNameInput.value = folderHandle.name.toLowerCase().replace(/\s+/g, "-")

    // Show sections
    folderInfo.classList.remove("hidden")
    configSection.classList.remove("hidden")
    actionsSection.classList.remove("hidden")
  } catch (error) {
    if (error.name !== "AbortError") {
      showError("Failed to read folder: " + error.message)
    }
  }
})

// Read directory recursively
async function readDirectory(dirHandle, path = "") {
  const files = []

  for await (const entry of dirHandle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name

    // Skip common directories to ignore
    if (entry.kind === "directory") {
      if (["node_modules", ".git", ".next", "dist", "build"].includes(entry.name)) {
        continue
      }
      const subFiles = await readDirectory(entry, entryPath)
      files.push(...subFiles)
    } else {
      const file = await entry.getFile()
      files.push({
        path: entryPath,
        content: await readFileContent(file),
      })
    }
  }

  return files
}

// Read file content
async function readFileContent(file) {
  // Check if file is binary
  const textFileExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".css",
    ".scss",
    ".html",
    ".md",
    ".txt",
    ".yaml",
    ".yml",
    ".xml",
    ".svg",
  ]
  const isBinary = !textFileExtensions.some((ext) => file.name.endsWith(ext))

  if (isBinary) {
    const arrayBuffer = await file.arrayBuffer()
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
  } else {
    return await file.text()
  }
}

// Deploy button
deployBtn.addEventListener("click", async () => {
  const repoName = repoNameInput.value.trim()

  if (!repoName) {
    showError("Please enter a repository name")
    return
  }

  if (!selectedFiles || selectedFiles.length === 0) {
    showError("Please select a folder first")
    return
  }

  await deployToGitHubAndVercel(repoName)
})

// Main deployment function
async function deployToGitHubAndVercel(repoName) {
  try {
    // Hide other sections
    errorSection.classList.add("hidden")
    resultSection.classList.add("hidden")
    deployBtn.disabled = true

    // Show progress
    progressSection.classList.remove("hidden")

    // Step 1: Create GitHub repository
    updateProgress(10, "Creating GitHub repository...", "Creating repository...")
    const repoData = await createGitHubRepo(repoName)

    // Step 2: Upload files to GitHub
    updateProgress(30, "Uploading files to GitHub...", "Uploading files...")
    await uploadFilesToGitHub(repoData.owner.login, repoName, selectedFiles)

    // Step 3: Deploy to Vercel
    updateProgress(70, "Deploying to Vercel...", "Deploying...")
    const vercelData = await deployToVercel(repoData.full_name)

    // Complete
    updateProgress(100, "Deployment complete!", "All done!")

    // Show success
    setTimeout(() => {
      progressSection.classList.add("hidden")
      showSuccess(repoData.html_url, vercelData.url)
    }, 1000)
  } catch (error) {
    console.error("[v0] Deployment error:", error)
    progressSection.classList.add("hidden")
    showError(error.message)
    deployBtn.disabled = false
  }
}

async function createGitHubRepo(name) {
  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      description: repoDescriptionInput.value || "",
      private: privateRepoCheckbox.checked,
      auto_init: true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create repository")
  }

  return await response.json()
}

// Upload files to GitHub
async function uploadFilesToGitHub(owner, repo, files) {
  const totalFiles = files.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const progress = 30 + 40 * (i / totalFiles)
    updateProgress(progress, "Uploading files to GitHub...", `Uploading ${file.path}...`)

    await uploadFileToGitHub(owner, repo, file.path, file.content)

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

async function uploadFileToGitHub(owner, repo, path, content) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Add ${path}`,
      content: btoa(unescape(encodeURIComponent(content))),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to upload ${path}`)
  }
}

async function deployToVercel(repoFullName) {
  const response = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoFullName.split("/")[1],
      gitSource: {
        type: "github",
        repo: repoFullName,
        ref: "main",
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || "Failed to deploy to Vercel")
  }

  const data = await response.json()
  return {
    url: `https://${data.url}`,
  }
}

// Update progress
function updateProgress(percent, title, message) {
  progressBar.style.width = `${percent}%`
  progressPercent.textContent = `${Math.round(percent)}%`
  progressTitle.textContent = title
  progressMessage.textContent = message
}

// Show success
function showSuccess(githubUrl, vercelUrl) {
  resultSection.classList.remove("hidden")
  githubLink.href = githubUrl
  vercelLink.href = vercelUrl

  // Reset form
  deployBtn.disabled = false
}

// Show error
function showError(message) {
  errorSection.classList.remove("hidden")
  errorMessage.textContent = message
}

// Retry button
retryBtn.addEventListener("click", () => {
  errorSection.classList.add("hidden")
  resultSection.classList.add("hidden")
  deployBtn.disabled = false
})
