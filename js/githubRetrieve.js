function githubRetrieve(form) {

    /* Extract the login and password that were passed to this function
     * (either from the authentication form or retrieved from
     * localStorage). */
    const login = form.username || form.querySelector('#login').value;
    const password = form.token || form.querySelector('#password').value;

    /* The githubFilename variable is initially defined in the
     * githubRepository.js file, and set to an emptry string.  The calling
     * page can optionally specify the private page to load by setting the
     * value of the variable.
     *
     * If the variable is set to an empty string then retrieve the pathname of
     * the URL for the current window; if the variable is set to a non-empty
     * string, the use the current value. */
    if (githubFilename === '') {
        githubFilename = window.location.pathname;
    }

    /* If the pathname for the file to retrieve is empty or ends with a '/'
     * character, then append the default HTML file name that was set in the
     * defaultHTMLfile variable (usually via the githubRepositoryInfo.js
     * file). */
    if (githubFilename == '' || githubFilename.slice(githubFilename.length -1) == '/') {
        githubFilename = githubFilename + defaultHTMLfile
    }
    
    /* If the filename begins with a '/' character then remove that character.
     * Two notes:
     *
     *  - Every window.location.pathname should start with a '/' character, so
     *    this will always match unless (a) a calling page specifically sets
     *    the githubFilename variable without a leading '/', or (b) an edge
     *    case in a browser.
     *
     *  - Strictly speaking this shouldn't be necessary because the GitHub API
     *    is smart enough to deal with GET requests that contain '//'
     *    sequences. But, it's just a few lines of code and I think it's
     *    better to keep the GET request cleaner. */
    if (githubFilename.slice(0, 1) == '/') {
        githubFilename = githubFilename.slice(1)
    }

    /* Create the authentication token using the login and password that were
     * passed to this function. */
    const token = btoa(`${login}:${password}`);
    
    // Craft the GitHub GET request to retrieve the specified file.
    const request = new Request(
        `https://api.github.com/repos/${githubOrg}/${githubRepo}/contents/${githubFilename}?ref=${githubBranch}`,
        {
            method: 'GET',
            credentials: 'omit',
            headers: {
                Accept: 'application/json',
                Authorization: `Basic ${token}`
            },
        }
    );

    // send the GitHub GET request and process the results
    fetch(request).then(function (response) {
        
        /* If we received a response code that indicates successful
         * authentication, then we might want to store credentials and/or
         * display a message indicating successful authentication. */
        if (response.status == 200 || response.status == 404) {
            
            // if SSO is enabled, then store credentials
            if (githubSSO) {
                localStorage.setItem('githubPagesAuth', JSON.stringify({ username: login, token: password }));
            }
            
            /* If we're only performing an authentication check then display
               the appropriate message. */
            if (githubAuthOnlyFlag) {
                /* Updating the document.querySelector('#loginForm').innerHTML
                 * instead of document.body.innerHTML to avoid a Javascript
                 * error if the content wasn't successfully retrieved. */
                document.querySelector('#loginForm').innerHTML = `Successful GitHub authentication to ${githubOrg} / ${githubRepo} / ${githubBranch} by ${login}.` + (githubSSO ? " Credentials saved for SSO." : "");
            }            
        }

        /* If we successfully retrieved the contents and we are *not* only
         * performing an authentication check, then display the retrieved
         * content. */
        if (response.status == 200 && ! githubAuthOnlyFlag) {        
            response.json().then(function (json) { // 5
                const content = json.encoding === 'base64' ? atob(json.content) : json.content;

                // 6
                const startIdx = content.indexOf('<body');
                document.body.innerHTML = content.substring(
                    content.indexOf('>', startIdx) + 1,
                    content.indexOf('</body>'));

            });
        }

        /* If we didn't successfully retrieve the content, and didn't get a
         * 'page not found' 404 error on a 'only perform an authenticate
         * check', then display an appropriate error message. */
        if (response.status !=200 && !(response.status == 404 && githubAuthOnlyFlag)) {
            /* Updating the document.querySelector('#loginForm').innerHTML
             * instead of document.body.innerHTML to avoid a Javascript error
             * if the content wasn't successfully retrieved. */
            document.querySelector('#loginForm').innerHTML = `Failed to load ${githubOrg} / ${githubRepo} / ${githubBranch} / ${githubFilename} by ${login} (status: ${response.status}).`;
        }
    });

    /* We're calling this on submission of an HTML form where we've prevented
     * the default form action from firing.  So it doesn't really matter
     * what we return from this form... but we should return *something.* */
    return false;
}
function githubTest() {
    let varx = 1;
}
