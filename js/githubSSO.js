const existingAuth = JSON.parse(localStorage.getItem('githubPagesAuth'));
if (existingAuth) {
    githubRetrieve(existingAuth);
}
