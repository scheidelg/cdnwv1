const existingAuth = JSON.parse(localStorage.getItem('githubPagesAuth'));
githubSSO = true;
if (existingAuth) {
    githubRetrieve(existingAuth);
    document.body.style.display='';
} else {
    document.body.style.display='';
}
