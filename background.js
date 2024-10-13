chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: 'popup.html',   // The popup page URL
    type: 'popup',       // Open it as a popup window
    width: 400,          // Customize width
    height: 600,         // Customize height
    top: 100,            // Customize the position (top)
    left: 500            // Customize the position (left)
  });
});