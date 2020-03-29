const existingAuth = JSON.parse(localStorage.getItem('githubPagesAuth'));
githubSSO = true;
if (existingAuth) {
    githubRetrieve(existingAuth);
}
