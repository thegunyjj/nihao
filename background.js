// Background service worker for Chrome extension

// Listen for installation
window.chrome.runtime.onInstalled.addListener(() => {
  console.log("[v0] GitHub Vercel Deploy extension installed")
})

// Handle messages from popup
window.chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "DEPLOY") {
    handleDeploy(request.data)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Keep channel open for async response
  }
})

// Handle deployment in background
async function handleDeploy(data) {
  // This can be extended to handle long-running operations
  // For now, most logic is in popup.js for simplicity
  return { status: "Processing in background" }
}
