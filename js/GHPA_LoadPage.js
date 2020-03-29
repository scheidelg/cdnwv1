const GHPA_existingAuth = JSON.parse(localStorage.getItem('githubPagesAuth'));
if (GHPA_SSO_Flag && GHPA_existingAuth) {
    GHPA_Retrieve(GHPA_existingAuth);
} else {
    fetch("/loginform.html").then(function (response) {
        return response.text();
    }).then(function (data) {
        document.getElementById("loginForm").innerHTML = data;
    });
}
