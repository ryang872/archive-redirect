
// Initialize the redirect list from local storage
function initializeRedirectList() {
    return new Promise((resolve, reject) => {
        browser.storage.local.get("redirectSites", (result) => {
            if (result.redirectSites) {
                resolve(result.redirectSites);
            } else {
                const defaultSites = [
                    {url: "www.washingtonpost.com", title: "The Washington Post"},
                    {url: "www.nytimes.com", title: "The New York Times "},
                    {url: "theathletic.com", title: "The Athletic"},
                    {url: "www.theatlantic.com", title: "The Atlantic"},
                    {url: "www.wsj.com", title: "Wall Street Journal"},
                    {url: "www.ft.com", title: "Financial Times"},
                    {url: "www.bloomberg.com", title: "Bloomberg"},
                    {url: "www.bostonglobe.com", title: "Boston Globe"},
                    {url: "www.newyorker.com", title: "The New Yorker"},
                    {url: "www.economist.com", title: "The Economist"}
                ];
                browser.storage.local.set({redirectSites: defaultSites}, () => {
                    resolve(defaultSites);
                });
            }
        });
    });
}

// Update the redirect list
function updateRedirectList(sites) {
    const sitesToRedirect = sites.map(site => `*://${site.url}/*`);

    // Remove any existing listeners
    if (browser.webRequest.onBeforeRequest.hasListener(redirect)) {
        browser.webRequest.onBeforeRequest.removeListener(redirect);
    }

    // Add new listener with updated sites
    browser.webRequest.onBeforeRequest.addListener(
        redirect,
        {urls: sitesToRedirect, types: ["main_frame"]},
        ["blocking"]
    );
}

// Redirect function
function redirect(requestDetails) {
    console.log("Checking URL for redirection: " + requestDetails.url);

    // Extract hostname and pathname from the URL
    const urlObj = new URL(requestDetails.url);
    const pathname = urlObj.pathname;

    // Check if the pathname is more than just the top level
    if (pathname !== "/" && pathname !== "") {
        console.log("Redirecting: " + requestDetails.url);
        const newUrl = "https://archive.is/" + requestDetails.url;
        return { redirectUrl: newUrl };
    }

    // If the URL is just the top level, do not redirect
    console.log("Not redirecting top-level domain: " + requestDetails.url);
    return { cancel: false };
}

// Listen for changes in local storage
browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.redirectSites) {
        updateRedirectList(changes.redirectSites.newValue);
    }
});

// Listen for messages from the options page
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchTitle") {
        fetch(`https://${request.url}`)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const title = doc.querySelector('title').innerText;
                sendResponse({title: title});
            })
            .catch(error => {
                console.error('Error:', error);
                sendResponse({title: request.url});
            });
        return true;
    }
});

initializeRedirectList().then(updateRedirectList);
