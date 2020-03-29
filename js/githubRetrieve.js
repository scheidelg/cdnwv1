function githubRetrieve(form) {
  // 1
  const login = form.username || form.querySelector('#login').value;
  const password = form.token || form.querySelector('#password').value;

  /* Retrieve the pathname of the URL that is being accessed.  If the pathname
   * is empty or ends with a '/' character, then append the default HTML file
   * name that was set in the githubFilename variable, usually via the
   * githubRepositoryInfo.js file.
   */
  let githubFilename = (window.location.pathname == '' || window.location.pathname.slice(window.location.pathname.length -1) == '/') ? window.location.pathname + defaultHTMLfile : window.location.pathname

  /* Retrieve the pathname of the URL that is being accessed.  If the pathname
   * If the filename begins with a '/' character then remove that character.
   * Strictly speaking this shouldn't be necessary because the GitHub API
   * is smart enough to deal with GET requests that contain '//' sequences.
   * But, it's just a few lines of code and I think it's better to keep the
   * GET request cleaner.
   */
  if (githubFilename.slice(0, 1) == '/') {
      githubFilename = githubFilename.slice(1)
  }
  
  // 2
  const token = btoa(`${login}:${password}`);
  const request = new Request(
    `https://api.github.com/repos/${org}/${repo}/contents/` + githubFilename + `?ref=${branch}`,
    {
      method: 'GET',
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${token}`
      },
    });

  // 3
  fetch(request)
    .then(function (response) {
      if (response.status !== 200) { // 4
//        document.querySelector('#loginForm').innerHTML = `Failed to load GitHub document ${org} / ${repo} / stbobbo (status: ${response.status})`;
//          document.body.innerHTML = 'bob';
document.body.innerHTML = 'window.location.href: ' + window.location.href + '<br>'
  + 'window.location.protocol: ' + window.location.protocol + '<br>'
  + 'window.location.host: ' + window.location.host + '<br>'
  + 'window.location.hostname: ' + window.location.hostname + '<br>'
  + 'window.location.port: ' + window.location.port + '<br>'
  + 'window.location.pathname: ' + window.location.pathname + '<br>'
  + 'window.location.search: ' + window.location.search + '<br>'
  + 'window.location.hash: ' + window.location.hash + '<br>'
  + 'githubFilename: ' + githubFilename + '<br>'
  + 'githubFilename: ' + githubFilename.slice(0, 1) + '<br>'
  + 'githubFilename: ' + githubFilename.slice(githubFilename.length) + '<br>'
  + 'githubFilename: ' + githubFilename.slice(githubFilename.length - 1) + '<br>'
  + 'githubFilename: ' + githubFilename.slice(1) + '<br>'
  + 'githubFilename: ' + githubFilename.slice(2) + '<br>'
  + 'githubFilename: ' + githubFilename.slice(20) + '<br>';

       

      } else {
        response.json()
          .then(function (json) { // 5
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
