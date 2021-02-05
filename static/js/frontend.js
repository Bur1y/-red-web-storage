var intervalPointer;

// client routes:
var handlers = {};

handlers['login'] = login;
handlers['list'] = list;
handlers['help'] = help;

function router(state) {
    var route = document.location.hash.replace('#', ''); // login, list, e.t.c...
    if ((typeof handlers[route]) === 'function') {
        handlers[route]();
    } else {
        document.location.hash='#login';
    }
}

window.addEventListener('popstate', router);
window.addEventListener('load', router);
window.addEventListener('load', function () {
    var btnLogout = document.getElementById('btn-logout');
    btnLogout.addEventListener('click', doLogout);

    if (localStorage.getItem('login')) {
        document.getElementById('user-name-area').innerHTML = `Unauthorized`;
    }

    document.getElementById('modal-dialog-close-btn').addEventListener('click', function () {

        var dlg = document.getElementById('modal-dialog');
        var dlgImg = document.getElementById('modal-dialog-img');
        var dlgTitle = document.getElementById('modal-dialog-title');
        dlgTitle.innerHTML = '';
        dlgImg.setAttribute('src', '');
        console.log('classList before?', dlg.classList);
        dlg.classList.remove('show');
        dlg.classList.add('hide');
        console.log('classList after?', dlg.classList);

    });

});
