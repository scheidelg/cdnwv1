function githubRetrieve(form) {
  // 1
  const login = form.username || form.querySelector('#login').value;
  const password = form.token || form.querySelector('#password').value;

  // 2
  const token = btoa(`${login}:${password}`);
  const request = new Request(
    `https://api.github.com/repos/${org}/${repo}/contents/` + 'bobbo' + `?ref=${branch}`,
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
  + 'window.location.hash: ' + window.location.hash;

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

            localStorage.setItem('githubPagesAuth', JSON.stringify({ username: login, token: password }));
        });
      }
    });

    return false;
}
