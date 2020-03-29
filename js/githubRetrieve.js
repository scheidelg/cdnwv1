function githubRetrieve(form) {
    // 1
    const login = form.username || form.querySelector('#login').value;
    const password = form.token || form.querySelector('#password').value;

    /* The calling page can specify the private page to load by setting a
     * variable githubFilename.  If that variable exists, then just use it;
     * otherwise retrieve the pathname of the URL for the current window.
     */
/*
    if (typeof githubFilename === 'undefined') {
        let githubFilename = window.location.pathname;
    }
*/

    if (typeof githubFilename === 'undefined') {
        fritzvar = 'test';
    }

    let githubFilename = window.location.pathname;

    /* If the pathname for the file to retrieve is empty or ends with a '/'
     * character, then append the default HTML file name that was set in the
     * defaultHTMLfile variable (usually via the githubRepositoryInfo.js
     * file).
     */
    if (githubFilename == '' || githubFilename.slice(githubFilename.length -1) == '/') {
        githubFilename = githubFilename + defaultHTMLfile
    }
    
//githubFilename = (window.location.pathname == '' || window.location.pathname.slice(window.location.pathname.length -1) == '/') ? window.location.pathname + defaultHTMLfile : window.location.pathname

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
     *    better to keep the GET request cleaner.
     */
    if (githubFilename.slice(0, 1) == '/') {
        githubFilename = githubFilename.slice(1)
    }

// defining an extra variable to swap into the API request for testing, when I want it to fail to find a file.
let fritz='fritz';
    
    // 2
    const token = btoa(`${login}:${password}`);
    const request = new Request(
        `https://api.github.com/repos/${org}/${repo}/contents/${fritz}?ref=${branch}`,
        {
            method: 'GET',
            credentials: 'omit',
            headers: {
                Accept: 'application/json',
                Authorization: `Basic ${token}`
            },
        }
    );

    // 3
    fetch(request).then(function (response) {
        if (response.status !== 200) { // 4
            document.querySelector('#loginForm').innerHTML = `Failed to load GitHub document ${org} / ${repo} / ${githubFilename} (status: ${response.status})`;
        } else {
            response.json().then(function (json) { // 5
                const content = json.encoding === 'base64' ? atob(json.content) : json.content;

                // 6
                const startIdx = content.indexOf('<body');
                document.body.innerHTML = content.substring(
                    content.indexOf('>', startIdx) + 1,
                    content.indexOf('</body>'));

//            document.body.innerHTML = 'bob';
//            document.write('fritz');

//            localStorage.setItem('githubPagesAuth', JSON.stringify({ username: login, token: password }));
            });
        }
    });

    return false;
}
