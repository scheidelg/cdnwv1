function ghpaRetrieve(form) {

    let fetchResponse=0; // really the only reason we need this is so that we can do a final check at the end, outside of the scope of the fetch request
    
    /* Extract the login and password that were passed to this function
     * (either from the authentication form or retrieved from
     * localStorage). */
    const login = form.username || form.querySelector('#ghpaLogin').value;
    const password = form.token || form.querySelector('#ghpaPassword').value;

    /* The ghpaFilename variable is initially defined in the ghpaConfig.js
     * file, and set to an emptry string.  The calling page can optionally
     * specify the private page to load by setting the value of the variable.
     *
     * If the variable is set to an empty string then retrieve the pathname of
     * the URL for the current window; if the variable is set to a non-empty
     * string, the use the current value. */
    if (ghpaFilename === '') {
        ghpaFilename = window.location.pathname;
    }

    /* If the pathname for the file to retrieve is empty or ends with a '/'
     * character, then append the default HTML file name that was set in the
     * ghpaDefaultHTMLfile variable (usually via the ghpaConfig.js file). */
    if (ghpaFilename == '' || ghpaFilename.slice(ghpaFilename.length -1) == '/') {
        ghpaFilename = ghpaFilename + ghpaDefaultHTMLfile
    }
    
    /* If the filename begins with a '/' character then remove that character.
     * Two notes:
     *
     *  - Every window.location.pathname should start with a '/' character, so
     *    this will always match unless (a) a calling page specifically sets
     *    the ghpaFilename variable without a leading '/', or (b) an edge
     *    case in a browser.
     *
     *  - Strictly speaking this shouldn't be necessary because the GitHub API
     *    is smart enough to deal with GET requests that contain '//'
     *    sequences. But, it's just a few lines of code and I think it's
     *    better to keep the GET request cleaner. */
    if (ghpaFilename.slice(0, 1) == '/') {
        ghpaFilename = ghpaFilename.slice(1)
    }

    /* Create the authentication token using the login and password that were
     * passed to this function. */
    const token = btoa(`${login}:${password}`);
    
    // Craft the GitHub GET request to retrieve the specified file.
    const request = new Request(
        `https://api.github.com/repos/${ghpaOrg}/${ghpaRepo}/contents/${ghpaFilename}?ref=${ghpaBranch}`,
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
         * authentication, then:
         *
         *  - if ghpaSSOFlag, then store credentials for later user
         *
         *  - if ghpaAuthOnlyFlag, then display a confirmation message
         *
         */
        if (response.status == 200 || response.status == 404) {
            
            // if SSO is enabled, then store credentials
            if (ghpaSSOFlag) {
                localStorage.setItem('ghpaToken', JSON.stringify({ username: login, token: password }));
            }
            
            /* If we're only performing an authentication check, then display
             * an appropriate message.
             *
             * Note that when only performing an authentication check, a
             * response.status of 404 is really what we want, as it indicates
             * that authentication was successful but the specified file
             * ghpaFilename doesn't exist in the private repository.  If the
             * specified file does exist in the private repository and we want
             * to display it (perhaps as a static "authentication successful"
             * message instead of the dynamic message rendered in code below),
             * then we wouldn't do a ghpaAuthOnlyFlag 'authentication only'
             * test. */
            if (ghpaAuthOnlyFlag) {
                /* Updating
                 * document.getElementById("ghpaAuthMessage").innerHTML
                 * instead of document.body.innerHTML to avoid a Javascript
                 * error if the content wasn't successfully retrieved. */
                 document.getElementById("ghpaAuthMessage").innerHTML = `Confirmed GitHub authentication to ${ghpaOrg} / ${ghpaRepo} / ${ghpaBranch} as ${login}.` + (ghpaSSOFlag ? " Credentials saved for SSO." : "");

                /* Hide the login form (if it's currently displayed).  Once
                 * the user successfully logs in, we don't want to confuse
                 * them by still presenting a login form. */
                document.getElementById("ghpaLoginForm").style.display = "none";

                /* Make sure the authentication message is displayed.  Setting
                 * style.display to '' (empty string) in JavaScript resets to
                 * the default value. */
                document.getElementById("ghpaAuthMessage").style.display = "";
            }            
        }

        /* If we successfully retrieved the contents and we are *not* only
         * performing an authentication check, then display the retrieved
         * content. */
        if (response.status == 200 && ! ghpaAuthOnlyFlag) {        
            response.json().then(function (json) { // 5
                const content = json.encoding === 'base64' ? atob(json.content) : json.content;

                // 6
                const startIdx = content.indexOf('<body');
                document.body.innerHTML = content.substring(
                    content.indexOf('>', startIdx) + 1,
                    content.indexOf('</body>'));

            });
        }

        /* If we didn't successfully retrieve the content, then display an
         * appropriate error message. */
        if (response.status != 200) {
            /* Define a variable to build the message to display, so that we
             * can just have one instance in this section where we set the
             * message. */
            let authMessage = '';
            
            /* Updating document.getElementById("ghpaAuthMessage").innerHTML
             * instead of document.body.innerHTML to avoid a Javascript error
             * if the content wasn't successfully retrieved. */

            /* If this is an authentication-only check and the response code
             * was *not* 404 (file not found), then display an error message
             * specific to 'authentication failed. */
            if (ghpaAuthOnlyFlag && response.status != 404) {
                authMessage = `Failed to authenticate to ${ghpaOrg} / ${ghpaRepo} / ${ghpaBranch} as ${login} (status: ${response.status}).`;

            /* If this was an attempt to actually retrieve content (i.e., not
             * an authentication-only check), then display a generic error
             * message.
             *
             * Note: We can check present error-specific messages here if
             * desired; either inside this 'else' or through a series of
             * 'else if' statements. */
            } else {
                authMessage = `Failed to load ${ghpaOrg} / ${ghpaRepo} / ${ghpaBranch} / ${ghpaFilename} as ${login} (status: ${response.status}).`;
            }
        
            document.getElementById("ghpaAuthMessage").innerHTML = authMessage;
        }
        
        /* Save response.status so that we can check the response status
         * outside of the response function (i.e., at the end when we're
         * setting a return value for this entire function. */
        fetchResponse=response.status;
    });

    /* We're calling this from one of two places:
     *
     *  (a) On submission of an HTML form where we've prevented the default
     *      form action from firing.
     *
     *      In this case it doesn't really matter what we return from this
     *      function... but we should return *something.*
     *
     *  (b) From ghpaLoadPage.js when both SSO is enabled and authentication
     *      credentials are in localStorage.
     *
     *      In this case we want to return true/false to identify whether
     *      content was successfully loaded.  That way the loading script code
     *      can determine whether any additional action needs to be taken such
     *      as displaying a prompt and/or an error message, or presenting the
     *      login form.
     */
    return (fetchResponse == 200);
}
