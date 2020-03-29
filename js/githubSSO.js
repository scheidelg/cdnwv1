const existingAuth = JSON.parse(localStorage.getItem('githubPagesAuth'));
githubSSO = true;
if (existingAuth) {
    document.style.display="none";
    githubRetrieve(existingAuth);
}
