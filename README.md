# ![logo](icon-48.png)  ChatGPT Filler Extension 

**ChatGPT Filler** is a Chrome extension that allows you to create customizable context menu items. These items use the OpenAI API (ChatGPT) to generate responses based on selected text on a webpage.

## Features

- **Customizable Context Menu**: Add your own menu options with titles, contexts, and desired response lengths.
- **Integration with ChatGPT**: Uses the OpenAI API to generate professional and concise responses.
- **Clipboard Support**: Automatically copies the response to the clipboard for easy pasting.
- **Simple Configuration**: Set up API keys and custom options directly from the extension popup.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click on **Load unpacked** and select the directory where this extension is located.
5. The extension will now appear in your browser.

## Usage

### Initial Setup
1. Click on the extension icon in your browser toolbar.
2. Enter your OpenAI API key in the provided input field.
3. Add custom options by specifying:
   - **Title**: The menu item title that will appear in the context menu.
   - **Request Context**: Context for the AI to consider when generating responses.
   - **Response Length**: The number of sentences you want in the response.

### Using the Context Menu
1. Select text on any webpage.
2. Right-click to open the context menu and choose one of your custom options.
3. The extension will send the request to ChatGPT, and the response will be automatically copied to your clipboard.

## Permissions

The extension requires the following permissions:
- `contextMenus`: For adding custom items to the right-click menu.
- `scripting`: To execute scripts in the active tab.
- `storage`: To save API keys and custom options.
- `activeTab`: To interact with the currently active tab.
- `clipboardWrite`: To copy the AI-generated response to the clipboard.

## Development

### Prerequisites
- A valid OpenAI API key.
- Basic knowledge of Chrome Extensions and JavaScript.

### Running Locally
1. Modify the code if needed.
2. Reload the extension in `chrome://extensions/` for changes to take effect.

## Contributing
Feel free to submit issues or pull requests to improve this extension.

## License
This project is licensed under the MIT License.