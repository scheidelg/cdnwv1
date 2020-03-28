function githubRetrieve(form) {
    // 1
    const login = form.username || form.querySelector('#login').value;
    const password = form.token || form.querySelector('#password').value;

    // 2
    const token = btoa(`${login}:${password}`);
    const request = new Request(
        `https://api.github.com/repos/${org}/${repo}/contents/testfile?ref=${branch}`,
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
    fetch(request).then(
        function (response) {
            if (response.status == 401) { // 4
                document.querySelector('#loginForm').innerHTML = `Failed authentication by ${login}.`;
            } else if (response.status == 200) {
                localStorage.setItem('githubPagesAuth', JSON.stringify({ username: login, token: password }));
                
                if (typeof authOnlyFlag === 'undefined' || authOnlyFlag === null) {
                    response.json().then(
                        function (json) { // 5
                            const content = json.encoding === 'base64' ? atob(json.content) : json.content;

                // 6
                            const startIdx = content.indexOf('<body');
                            document.body.innerHTML = content.substring(
                                content.indexOf('>', startIdx) + 1,
                                content.indexOf('</body>'));

    //            document.body.innerHTML = 'bob';
    //            document.write('fritz');
                        }
                    );
                } else {
                    document.body.innerHTML = "Successful GitHub authentication by '" + login + "'. Credentials saved for SSO."
                }
            } else
                document.querySelector('#loginForm').innerHTML = `Failed to load document (status: ${response.status})`;
            }
        }
    );

    return false;
}
