function GHPA_Retrieve(form) {

    /* Extract the login and password that were passed to this function
     * (either from the authentication form or retrieved from
     * localStorage). */
    const login = form.username || form.querySelector('#GHPA_login').value;
    const password = form.token || form.querySelector('#GHPA_password').value;

    /* The GHPA_Filename variable is initially defined in the
     * GHPA_Config.js file, and set to an emptry string.  The calling
     * page can optionally specify the private page to load by setting the
     * value of the variable.
     *
     * If the variable is set to an empty string then retrieve the pathname of
     * the URL for the current window; if the variable is set to a non-empty
     * string, the use the current value. */
    if (GHPA_Filename === '') {
        GHPA_Filename = window.location.pathname;
    }

    /* If the pathname for the file to retrieve is empty or ends with a '/'
     * character, then append the default HTML file name that was set in the
     * GHPA_DefaultHTMLfile variable (usually via the GHPA_Config.js file). */
    if (GHPA_Filename == '' || GHPA_Filename.slice(GHPA_Filename.length -1) == '/') {
        GHPA_Filename = GHPA_Filename + GHPA_DefaultHTMLfile
    }
    
    /* If the filename begins with a '/' character then remove that character.
     * Two notes:
     *
     *  - Every window.location.pathname should start with a '/' character, so
     *    this will always match unless (a) a calling page specifically sets
     *    the GHPA_Filename variable without a leading '/', or (b) an edge
     *    case in a browser.
     *
     *  - Strictly speaking this shouldn't be necessary because the GitHub API
     *    is smart enough to deal with GET requests that contain '//'
     *    sequences. But, it's just a few lines of code and I think it's
     *    better to keep the GET request cleaner. */
    if (GHPA_Filename.slice(0, 1) == '/') {
        GHPA_Filename = GHPA_Filename.slice(1)
    }

    /* Create the authentication token using the login and password that were
     * passed to this function. */
    const token = btoa(`${login}:${password}`);
    
    // Craft the GitHub GET request to retrieve the specified file.
    const request = new Request(
        `https://api.github.com/repos/${GHPA_Org}/${GHPA_Repo}/contents/${GHPA_Filename}?ref=${GHPA_Branch}`,
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
            if (GHPA_SSO_Flag) {
                localStorage.setItem('githubPagesAuth', JSON.stringify({ username: login, token: password }));
            }
            
            /* If we're only performing an authentication check then display
               the appropriate message. */
            if (GHPA_AuthOnlyFlag) {
                /* Updating document.getElementById("loginForm").innerHTML
                 * instead of document.body.innerHTML to avoid a Javascript
                 * error if the content wasn't successfully retrieved. */
                 document.getElementById("GHPA_loginForm").innerHTML = `Successful GitHub authentication to ${GHPA_Org} / ${GHPA_Repo} / ${GHPA_Branch} by ${login}.` + (GHPA_SSO_Flag ? " Credentials saved for SSO." : "");
            }            
        }

        /* If we successfully retrieved the contents and we are *not* only
         * performing an authentication check, then display the retrieved
         * content. */
        if (response.status == 200 && ! GHPA_AuthOnlyFlag) {        
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
        if (response.status !=200 && !(response.status == 404 && GHPA_AuthOnlyFlag)) {
            /* Updating  document.getElementById("loginForm").innerHTML
             * instead of document.body.innerHTML to avoid a Javascript error
             * if the content wasn't successfully retrieved. */
             document.getElementById("loginForm").innerHTML = `Failed to load ${GHPA_Org} / ${GHPA_Repo} / ${GHPA_Branch} / ${GHPA_Filename} by ${login} (status: ${response.status}).`;
        }
    });

    /* We're calling this on submission of an HTML form where we've prevented
     * the default form action from firing.  So it doesn't really matter
     * what we return from this form... but we should return *something.* */
    return false;
}
