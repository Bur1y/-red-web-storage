// https://learn.javascript.ru/promise-basics
// https://learn.javascript.ru/async-await

function doLoginIsValidForm(login, password) {

    var errors = [];
    var minLoginLen = 3;
    var minPassLen = 4;

    if (login.length < minLoginLen) {
        errors.push(`Minimal login length is ${minLoginLen}`);
    }

    if (password.length < minPassLen) {
        errors.push(`Minimal password length is ${minPassLen}`);
    }

    document.getElementById('login-form-errors').innerHTML = errors.join('<br />');
    setTimeout(function () {
        document.getElementById('login-form-errors').innerHTML = '';
    }, 3000);

    return errors.length === 0;
}

async function doLogin(event) {
    var login = event.target.login.value;
    var password = event.target.password.value;
    if (doLoginIsValidForm(login, password)) {

        var loginResult = await new Promise(function (resolve) {

            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({login: login, password: password})
            }).then(function (response) {
                if (response.ok) {
                    response.text().then(function (data) {
                        resolve({status: 'success', data: data});
                    });
                } else {
                    var notOkResponse = `${response.status} ${response.statusText}`;
                    resolve({status: 'error', data: notOkResponse});
                }
            }).catch(function (error) {
                resolve({status: 'error', data: error});
            });

        });

        if (loginResult.status === 'success') {
            var dataJSON = JSON.parse(loginResult.data);
            localStorage.setItem('token', dataJSON.token);
            localStorage.setItem('login', dataJSON.login);
            document.getElementById('user-name-area').innerHTML = `Вы вошли как: <b>${dataJSON.login}</b>`;
            document.location.hash = '#list';
        } else {
            document.getElementById('login-form-errors').innerHTML = loginResult.data;
            setTimeout(function () {
                document.getElementById('login-form-errors').innerHTML = '';
            }, 3000);
        }

    }
}

async function doLogout() {
    var token = localStorage.getItem('token');
    var logoutResult = await new Promise(function (resolve) {

        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({token: token})
        }).then(function (response) {
            if (response.ok) {
                response.text().then(function (data) {
                    resolve({status: 'success', data: data});
                });
            } else {
                var notOkResponse = `${response.status} ${response.statusText}`;
                resolve({status: 'error', data: notOkResponse});
            }
        }).catch(function (error) {
            resolve({status: 'error', data: error});
        });

    });

    if (logoutResult.status === 'success') {
        localStorage.removeItem('token');
        localStorage.removeItem('login');
        // document.getElementById('login-form-errors').innerHTML = '';
        setTimeout(function () {
            document.location.hash = '#login';
        }, 500);

    }
}

function isUnauthorized() {
    var token = localStorage.getItem('token');
    return new Promise(function (resolve) {
        fetch(`/api/get-list`, {
            headers: {
                'token': token
            }
        }).then(function (response) {
            if (response.ok) {
                resolve(false);
            } else {
                resolve(response.status === 401);
            }
        }).catch(function (error) {
            alert('Network Error');
        });
    });
}

async function login() {
    try {
        document.getElementById("app").innerHTML = await new Promise(function (resolve) {
            fetch(`/roter-modules/view-login.html`).then(function (response) {
                if (response.ok) {
                    response.text().then(function (data) {
                        resolve(data);
                    });
                } else {
                    resolve('ERROR DETECTED');
                }
            }).catch(function (error) {
                resolve('ERROR DETECTED ' + error);
            });
        });

        if (document.location.hash === '#login') {

            if (await isUnauthorized()) {
                var loginForm = document.getElementById('login-form');
                loginForm.addEventListener('submit', function (event) {
                    event.preventDefault();
                    doLogin(event);
                });
            } else {
                document.location.hash = '#list';
            }

        }


    } catch (e) {
        //
    }
}

async function list() {

    try {
        document.getElementById("app").innerHTML = await new Promise(function (resolve) {
            fetch(`/roter-modules/view-list.html`).then(function (response) {
                if (response.ok) {
                    response.text().then(function (data) {
                        resolve(data);
                    });
                } else {
                    resolve('ERROR DETECTED');
                }
            }).catch(function (error) {
                resolve('ERROR DETECTED ' + error);
            });
        });

        if (document.location.hash === '#list') {
            downloadDataFromServer();
        }

    } catch (e) {
        //
    }

}

async function help() {
    try {
        document.getElementById("app").innerHTML = await new Promise(function (resolve) {
            fetch(`/roter-modules/view-help.html`).then(function (response) {
                if (response.ok) {
                    response.text().then(function (data) {
                        resolve(data);
                    });
                } else {
                    resolve('ERROR DETECTED');
                }
            }).catch(function (error) {
                resolve('ERROR DETECTED ' + error);
            });
        });
    } catch (e) {
        //
    }
}

function showImageInModal(filePath, fileTitle) {
    // console.log(`Открываем модальный диалог с изображением ${filePath}`);
    // FIXME:
    var dlg = document.getElementById('modal-dialog');
    var dlgImg = document.getElementById('modal-dialog-img');
    var dlgTitle = document.getElementById('modal-dialog-title');

    dlgTitle.innerHTML = fileTitle;
    dlgImg.setAttribute('src', filePath);

    console.log('classList before?', dlg.classList);
    dlg.classList.remove('hide');
    dlg.classList.add('show');
    console.log('classList after?', dlg.classList);


}

function refresh(inputData) {
    var listTableBody = document.getElementById('list-table-body');
    listTableBody.innerHTML = '';

    inputData.forEach(function (oneElement) {
        listTableBody.innerHTML += `<tr>
		<td class="c1"><input type="checkbox" class="chb-select" name="chb-${oneElement.id}" title="выберите для действия"></td>
		<td>${oneElement.title}</td>
		<td class="c3"><button type="button" class="watch-btn" data-title="${oneElement.title}" data-path="${oneElement.filepath}">Просмотр</button></td>
		</tr>`;
    });


    // отбираем все кнопки "Просмотр" таблицы
    var buttons = document.getElementsByClassName('watch-btn');

    // на каждой из отобранных кнопок удаляем слушатель события клика и регистрируем заново
    for (var btn of buttons) {
        /**
         * функция коллбэк, реагирующая на событие лкика в кнопку "Просмотр"
         **/
        function clickHandler(event) {
            var filePath = event.target.getAttribute('data-path');
            var fileTitle = event.target.getAttribute('data-title');
            showImageInModal(filePath, fileTitle); //
        }

        btn.removeEventListener('click', clickHandler); // удаляем
        btn.addEventListener('click', clickHandler); // регистрируем заново
    }

    function downloadFile(data, filename, type) {
        var file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    // отобрать форму пакетной обработки данных
    var batchActionsForm = document.getElementById('batch-actions-form');

    function submitHandler(event) {
        event.preventDefault();
        var form = event.target;

        var formData = new FormData(form);
        var batchIds = [];
        var action;

        for (var pair of formData.entries()) {
            if (pair[0] === 'action') {
                action = pair[1];
            }
            if ((pair[0]).match(/^chb-/)) {
                batchIds.push((pair[0]).replace(/^chb-/, ''));
            }
        }

        if (!batchIds.length) {
            alert('Нужно выбрать хотябы одну запись');
            return;
        }

        console.log('action?', action);
        console.log('batchIds?', batchIds);

        var token = localStorage.getItem('token');
        var baseUrl = document.location.toString().split("/#")[0];

        switch (action) {
            case 'delete':
                var url = new URL(`${baseUrl}/api/remove`);
                url.searchParams.set('ids', batchIds);
                fetch(url.toString(), {
                    method: 'delete',
                    headers: {
                        'token': token
                    }
                }).then(function (response) {
                    if (response.ok) {
                        list();
                    } else {
                        var notOkResponse = `${response.status} ${response.statusText}`;
                        alert(notOkResponse);
                    }
                }).catch(function (error) {
                    alert('Network Error');
                });

                break;

            case 'download':
                var url = new URL(`${baseUrl}/api/download`);
                url.searchParams.set('ids', batchIds);
                console.log(batchIds);
                fetch(url.toString(), {
                    headers: {
                        'token': token
                    }
                }).then(function (response) {
                    if (response.ok) {
                        response.blob().then(function (fileData) {
                            instance.getDataValue('filepath');
                            downloadFile(fileData, `Akagi.jpg`, 'image');
                        });
                    } else {
                        var notOkResponse = `${response.status} ${response.statusText}`;
                        alert(notOkResponse);
                    }
                }).catch(function (error) {
                    alert('Network Error');
                });
                break;

            case 'select':
                alert('Не выбрано действие');
                break;
        }

    }

    // удалить существующий слушатель события отправки формы и зарегистрировать его заново
    batchActionsForm.removeEventListener('submit', submitHandler);
    batchActionsForm.addEventListener('submit', submitHandler);
}

function downloadDataFromServer() {
    // localStorage.setItem('token', 'value');
    // localStorage.removeItem('token');
    var token = localStorage.getItem('token');
    var listTableBody = document.getElementById('list-table-body');
    listTableBody.innerHTML = `<tr><td colspan=3>Please wait... Loading....</td></tr>`;
    fetch(`/api/get-list`, {
        headers: {
            'token': token
        }
    }).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                refresh(data);
            });
        } else {
            var notOkResponse = `${response.status} ${response.statusText}`;
            listTableBody.innerHTML = `<tr><td colspan=3><div class="error">${notOkResponse}</div></td></tr>`;
            setTimeout(function () {
                document.location.hash = '#login';
            }, 1500);
        }
    }).catch(function (error) {
        listTableBody.innerHTML = `<tr><td colspan=3><div class="error">Network Error (await 5 sec...)</div></td></tr>`;
    });
}
