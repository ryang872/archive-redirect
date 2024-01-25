function extractAndRedirect() {
    // Attempt to find the first link in .TEXT-BLOCK
    var firstLink = document.querySelector('.TEXT-BLOCK a');

    if (!firstLink) {
        // If firstLink is not found, attempt to find the first <li> with "archive this url" under CONTENT
        var archiveListItem = findArchiveLink(document.getElementById('CONTENT'));

        if (archiveListItem) {
            // Get the href attribute of the found <a> element
            const archiveUrl = archiveListItem.querySelector('a').getAttribute('href');

            // Construct the new URL            
            newUrl = "https://archive.is" + archiveUrl;

            // Redirect to the extracted link
            window.location.href = newUrl;                   
              
        }

    } else {
        // Redirect to the extracted link
        window.location.href = firstLink.href;        
    }

}

// Function to find the first <li> element under the container with the text "archive this url"
function findArchiveLink(container) {
    const listItems = container.querySelectorAll('li');

    for (const listItem of listItems) {
        // Check if the text content of the <li> element contains "archive this url"
        if (listItem.textContent.includes('archive this url')) {
            return listItem;
        }
    }

    return null;
}

// Run the script as soon as the page is loaded
extractAndRedirect();

