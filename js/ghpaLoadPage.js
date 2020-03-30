const ghpaExistingAuth = JSON.parse(localStorage.getItem('ghpaToken'));

if (!(ghpaSSOFlag && ghpaExistingAuth && ghpaRetrieve(ghpaExistingAuth))) {
    fetch("/loginform.html").then(function (response) {
        return response.text();
    }).then(function (data) {
        document.getElementById("ghpaLoginForm").innerHTML = data;
    });
    
    document.getElementById("bobby").style.display = "block";
}
