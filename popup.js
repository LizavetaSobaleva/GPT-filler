document.addEventListener("DOMContentLoaded", () => {
    let customOptions = [];
    let editingIndex = -1;

    chrome.storage.local.get(["apiKey", "customOptions"], (result) => {
        document.getElementById("apiKey").value = result.apiKey || "";
        customOptions = result.customOptions || [];
        renderOptions();
    });

    document.getElementById("apiKey").addEventListener("input", () => {
        const apiKey = document.getElementById("apiKey").value;
        chrome.storage.local.set({ apiKey });
    });

    document.getElementById("addOption").addEventListener("click", () => {
        const title = document.getElementById("newTitle").value;
        const context = document.getElementById("newContext").value;
        const length = parseInt(document.getElementById("newLength").value);

        if (title && context && length > 0) {
            if (editingIndex >= 0) {
                customOptions[editingIndex] = { title, context, length };
                editingIndex = -1;
            } else {
                customOptions.push({ title, context, length });
            }

            document.getElementById("newTitle").value = "";
            document.getElementById("newContext").value = "";
            document.getElementById("newLength").value = "";

            chrome.storage.local.set({ customOptions }, () => {
                renderOptions();
            });
        }
    });

    function renderOptions() {
        const optionsList = document.getElementById("optionsList");
        optionsList.innerHTML = "";
        customOptions.forEach((option, index) => {
            const li = document.createElement("li");

            const shortContext = option.context.length > 30 ? option.context.substring(0, 30) + "..." : option.context;
            
            li.innerHTML = `
                <div><strong>${option.title}</strong> (${option.length} sentences) </div>
                <div>${shortContext}</div>
                <div><button class="edit-option" data-index="${index}">Edit</button>
                <button class="delete-option" data-index="${index}">Delete</button></div>
            `;

            li.querySelector(".edit-option").addEventListener("click", () => {
                document.getElementById("newTitle").value = option.title;
                document.getElementById("newContext").value = option.context;
                document.getElementById("newLength").value = option.length;
                editingIndex = index;
            });

            li.querySelector(".delete-option").addEventListener("click", () => {
                customOptions.splice(index, 1);
                chrome.storage.local.set({ customOptions }, () => {
                    renderOptions();
                });
            });

            optionsList.appendChild(li);
        });
    }
});
