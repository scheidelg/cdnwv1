const existingAuth = JSON.parse(localStorage.getItem('githubPagesAuth'));
githubSSO = true;
if (existingAuth) {
    //document.body.style.display="none";
    githubRetrieve(existingAuth);
}
