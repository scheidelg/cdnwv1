const existingAuth = JSON.parse(localStorage.getItem('githubPagesAuth'));
if (githubSSO && existingAuth) {
    githubRetrieve(existingAuth);
} else {
    fetch("/loginform.html").then(function (response) {
        return response.text();
    }).then(function (data) {
        document.getElementById("loginForm").innerHTML = data;
    });
}
