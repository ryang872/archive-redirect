// This function updates the list of sites in the UI
function updateSiteList() {
    const siteListElement = document.getElementById('siteList');
    siteListElement.innerHTML = ''; 

    // Retrieve the stored sites from browser's local storage
    browser.storage.local.get('redirectSites', (result) => {
        let sites = result.redirectSites || [];

        // Sort the sites by title, skipping "The" at the beginning
        sites.sort((a, b) => {
            let titleA = a.title.startsWith('The ') ? a.title.slice(4) : a.title;
            let titleB = b.title.startsWith('The ') ? b.title.slice(4) : b.title;
            return titleA.localeCompare(titleB);
        });

        sites.forEach((site) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';

            // Create a cell for the site title
            const titleCell = document.createElement('td');
            titleCell.className = 'px-4 py-2 text-sm text-left text-gray-700';
            titleCell.textContent = site.title;

            // Create a cell for the site value
            const valueCell = document.createElement('td');
            valueCell.className = 'px-4 py-2 text-sm text-left text-gray-700';
            valueCell.textContent = site.url;

            // Append the cells to the row
            row.appendChild(titleCell);
            row.appendChild(valueCell);   
            
            // Create a "Remove" link
            const removeLink = document.createElement('a');
            removeLink.textContent = 'X'; 
            removeLink.href = '#';
            removeLink.addEventListener('click', (event) => {
                event.preventDefault();
                removeSite(site);
            });

            // Add CSS styles to make the link look like a red button
            removeLink.style.display = 'flex'; 
            removeLink.style.justifyContent = 'center'; 
            removeLink.style.alignItems = 'center'; 
            removeLink.style.backgroundColor = 'red';
            removeLink.style.color = 'white';
            removeLink.style.width = '15px'; 
            removeLink.style.height = '15px'; 
            removeLink.style.borderRadius = '1px'; 
            removeLink.style.textDecoration = 'none';
            removeLink.style.padding = '0'; 
            removeLink.style.margin = '0'; 
            removeLink.style.fontSize = '10px'; 
            removeLink.style.lineHeight = '15px'; 

            // Create a cell for the "Remove" link and append it to the row
            const linkCell = document.createElement('td');
            linkCell.appendChild(removeLink);
            row.appendChild(linkCell);

            // Append the row to the table body
            siteListElement.appendChild(row);
        });
    });
}

// This function adds a new site to the list
function addSite() {
    const siteInput = document.getElementById('siteInput');
    const site = siteInput.value.trim();

    if (site) {
        // Send a message to the background script to fetch the title of the site
        browser.runtime.sendMessage({action: "fetchTitle", url: site}, (response) => {
            const title = response.title;
            browser.storage.local.get('redirectSites', (result) => {
                const currentSites = result.redirectSites || [];
                const siteObject = {url: site, title: title};

                if (!currentSites.some(currentSite => currentSite.url === site)) {
                    currentSites.push(siteObject);
                    browser.storage.local.set({'redirectSites': currentSites}, () => {
                        siteInput.value = ''; // Clear the input field
                        document.getElementById('notification').textContent = 'Site added!';
                        setTimeout(() => document.getElementById('notification').textContent = '', 3000);
                        updateSiteList(); // Update the list after adding a new site
                    });
                } else {
                    document.getElementById('notification').textContent = 'Site already exists!';
                    setTimeout(() => document.getElementById('notification').textContent = '', 3000);
                }
            });
        });
    }
}

// This function removes a site from the list
function removeSite(site) {
    browser.storage.local.get('redirectSites', (result) => {
        const currentSites = result.redirectSites || [];
        const index = currentSites.findIndex(currentSite => currentSite.url === site.url);
        if (index !== -1) {
            currentSites.splice(index, 1);
            browser.storage.local.set({'redirectSites': currentSites}, () => {
                updateSiteList(); 
            });
        }
    });
}

// Export function
function exportData() {
    // Retrieve the data from local storage
    browser.storage.local.get('redirectSites', (result) => {
        let data = result.redirectSites || [];

        // Create a downloadable link for a JSON file that contains the data
        let a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        }));
        a.download = 'data.json';

        // Start the download
        a.click();
    });
}

// Import function
function importData() {
    // Create an input element for file selection
    let input = document.createElement('input');
    input.type = 'file';

    // Listen for a change event on the input element
    input.addEventListener('change', () => {
        let file = input.files[0];

        // Read the file
        let reader = new FileReader();
        reader.onload = (e) => {
            // Parse the JSON data
            let data = JSON.parse(e.target.result);

            // Store the data in local storage
            browser.storage.local.set({ redirectSites: data });

            // Update the site list
            updateSiteList();
        };
        reader.readAsText(file);
    });

    // Trigger the file selection dialog
    input.click();
}

// Attach theaddSite function to the click event of the Add button
document.getElementById('addButton').addEventListener('click', addSite);

// Attach the exportData function to the click event of the Export button
document.getElementById('exportButton').addEventListener('click', exportData);

// Attach the importData function to the click event of the Import button
document.getElementById('importButton').addEventListener('click', importData);

// Load the site list when the options page is opened
updateSiteList();
