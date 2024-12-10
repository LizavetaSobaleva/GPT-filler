let apiKey = "";
let customOptions = [];

// Load API key and custom options from chrome.storage.local
chrome.storage.local.get(["apiKey", "customOptions"], (result) => {
  apiKey = result.apiKey || "";
  customOptions = result.customOptions || [];
  updateContextMenu(); // Update the menu after loading
});

// Listener for updates to settings when they change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.customOptions) {
    customOptions = changes.customOptions.newValue;
    updateContextMenu(); // Update the menu when customOptions change
  }
  if (changes.apiKey) {
    apiKey = changes.apiKey.newValue;
  }
});

// Function to update the context menu
function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.error("Error removing context menus:", chrome.runtime.lastError);
    }

    // Check if customOptions is empty and log a warning
    if (customOptions.length === 0) {
      console.warn("No custom options available to create context menu items.");
    }

    // Create new menu items based on customOptions
    customOptions.forEach((option, index) => {
      chrome.contextMenus.create(
        {
          id: `customOption-${index}`,
          title: option.title,
          contexts: ["selection"], // Changed to "selection"
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error creating context menu:",
              chrome.runtime.lastError
            );
          }
        }
      );
    });
  });
}

// Handler for clicks on context menu items
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const index = parseInt(info.menuItemId.split("-")[1]);
  const option = customOptions[index];

  if (option) {
    // Retrieve selected text on the page
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: getSelectedText,
      },
      (selection) => {
        if (chrome.runtime.lastError || !selection[0].result) {
          console.error(
            "Error retrieving selected text:",
            chrome.runtime.lastError
          );
          return;
        }

        const selectedText = selection[0].result;

        // Send a request to ChatGPT
        sendRequestToChatGPT(selectedText, option.context, option.length, tab);
      }
    );
  } else {
    console.error("No option found for menu item ID:", info.menuItemId);
  }
});

// Function to get the selected text on the page
function getSelectedText() {
  return window.getSelection().toString();
}

// Function to send a request to ChatGPT and copy the response to the clipboard
async function sendRequestToChatGPT(selectedText, context, length, tab) {
  const prompt = `For the topic "${selectedText}" and considering the context "${context}", write a clear and concise response. Ensure the response is professional and limited to ${length} sentences.`;

  if (!apiKey) {
    console.error("API Key is missing.");
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_completion_tokens: length * 30,
      }),
    });

    if (!response.ok) {
      console.error(
        "API responded with an error:",
        response.status,
        response.statusText
      );
      return;
    }

    const data = await response.json();

    if (
      data.choices &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      const responseText = data.choices[0].message.content.trim();

      // Execute a script on the page to copy the text
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          if (!navigator.clipboard) {
            // If Clipboard API is not supported
            showNotification("Clipboard API is not supported in this browser.", false);
            return;
          }

          navigator.clipboard.writeText(text)
            .then(() => {
              showNotification("Response copied to clipboard! Use Ctrl+V to paste.", true);
            })
            .catch(err => {
              console.error("Failed to copy text to clipboard:", err);
              showNotification("Failed to copy text to clipboard. Please try again.", false);
            });

          // Function to create and display a notification
          function showNotification(message, isSuccess) {
            // Create notification element
            const notification = document.createElement('div');
            notification.textContent = message;

            // Style the notification
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.padding = '10px 20px';
            notification.style.backgroundColor = isSuccess ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
            notification.style.color = 'white';
            notification.style.borderRadius = '5px';
            notification.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            notification.style.zIndex = '10000';
            notification.style.fontSize = '16px';
            notification.style.fontFamily = 'Arial, sans-serif';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';

            // Add notification to the DOM
            document.body.appendChild(notification);

            // Fade-in animation
            requestAnimationFrame(() => {
              notification.style.opacity = '1';
            });

            // Remove notification after 3 seconds
            setTimeout(() => {
              notification.style.opacity = '0';
              // Remove the element after the fade-out transition
              setTimeout(() => {
                if (notification.parentNode) {
                  notification.parentNode.removeChild(notification);
                }
              }, 500); // Matches the opacity transition time
            }, 3000);
          }
        },
        args: [responseText]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error executing script:", chrome.runtime.lastError);
        }
      });

    } else if (data.error) {
      console.error("API error response:", data.error.message);
    }
  } catch (error) {
    console.error("Error during fetch:", error);
  }
}
