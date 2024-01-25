// Function to update the list of sites in the popup
function updateSiteList() {
    const siteListElement = document.getElementById('siteList');
    siteListElement.innerHTML = ''; // Clear existing list

    // Fetch the list of sites from local storage and update the UI
    browser.storage.local.get('redirectSites', (result) => {
        const sites = result.redirectSites || [];
        sites.forEach(site => {
            const listItem = document.createElement('li');
            listItem.className = 'site-item'; // Apply the style class
            listItem.textContent = site;
            siteListElement.appendChild(listItem);
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

// Set up event listener for the Add button
document.getElementById('addButton').addEventListener('click', addSite);

// Load and display the current site list when the popup opens
updateSiteList();


