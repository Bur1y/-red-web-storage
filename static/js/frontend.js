var intervalPointer;

// client routes:
var handlers = {};

handlers['login'] = login;
handlers['list'] = list;
handlers['help'] = help;
handlers['signup'] = signup;

function router(state){
    var route = document.location.hash.replace('#', ''); // login, list, e.t.c...
    if ((typeof handlers[route]) === 'function') {
        handlers[route]();
    } else {
        handlers['login']();
    }
}

window.addEventListener('popstate', router);
window.addEventListener('load', router);