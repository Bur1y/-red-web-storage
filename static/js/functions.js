// https://learn.javascript.ru/promise-basics
// https://learn.javascript.ru/async-await

function doLoginIsValidForm(login, password){

	var errors = [];
	var minLoginLen = 3;
	var minPassLen = 4;

	if(login.length < minLoginLen){
		//errors.push(`Minimal login length is ${minLoginLen}`);
		alert(`Minimal login length is ${minLoginLen}`);
	}

	if(password.length < minPassLen){
		//errors.push(`Minimal password length is ${minPassLen}`);
		alert(`Minimal login length is ${minPassLen}`);
	}

	document.getElementById('login-form-errors').innerHTML = errors.join('<br />');
	setTimeout(function(){
		document.getElementById('login-form-errors').innerHTML = '';
	}, 3000);

	return errors.length === 0;
}

async function doLogin(event){
	var login = event.target.login.value;
	var password = event.target.password.value;
	if(doLoginIsValidForm(login, password)){

		var loginResult = await new Promise(function(resolve){

			fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json;charset=utf-8'
				},
				body: JSON.stringify({login: login, password: password})
			}).then(function(response){
				if(response.ok){
					response.text().then(function(data){
						resolve({status: 'success', data: data});
					});
				} else {
					var notOkResponse = `${response.status} ${response.statusText}`;
					resolve({status: 'error', data: notOkResponse});
				}
			}).catch(function(error){
				resolve({status: 'error', data: error});
			});

		});

		if(loginResult.status === 'success'){
			console.log('DO WITH TOKEN!!!', loginResult.data);
			var dataJSON = JSON.parse(loginResult.data);
			localStorage.setItem('token', dataJSON.token);
			document.location.hash='#list';
		} else {
			document.getElementById('login-form-errors').innerHTML = loginResult.data;
			setTimeout(function(){
				document.getElementById('login-form-errors').innerHTML = '';
			}, 3000);
		}

	}
}

async function doLogout(){
	var token = localStorage.getItem('token');
	var logoutResult = await new Promise(function(resolve){

		fetch('/api/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({token: token})
		}).then(function(response){
			if(response.ok){
				response.text().then(function(data){
					resolve({status: 'success', data: data});
				});
			} else {
				var notOkResponse = `${response.status} ${response.statusText}`;
				resolve({status: 'error', data: notOkResponse});
			}
		}).catch(function(error){
			resolve({status: 'error', data: error});
		});

	});

	if(logoutResult.status === 'success'){
		localStorage.removeItem('token');
		document.location.hash='#login';
	}
}

async function login(){
	try {
		document.getElementById("app").innerHTML = await new Promise(function(resolve){
			fetch(`/roter-modules/view-login.html`).then(function(response){
				if(response.ok){
					response.text().then(function(data){
						resolve(data);
					});
				} else {
					resolve('ERROR DETECTED');
				}
			}).catch(function(error){
				resolve('ERROR DETECTED ' + error);
			});
		});

		if(document.location.hash === '#login'){
			var loginForm = document.getElementById('login-form');
			loginForm.addEventListener('submit', function(event){
				event.preventDefault();
				doLogin(event);
			});
		}


	} catch(e){
		//
	}
}

async function list(){

	try {
		document.getElementById("app").innerHTML = await new Promise(function(resolve){
			fetch(`/roter-modules/view-list.html`).then(function(response){
				if(response.ok){
					response.text().then(function(data){
						resolve(data);
					});
				} else {
					resolve('ERROR DETECTED');
				}
			}).catch(function(error){
				resolve('ERROR DETECTED ' + error);
			});
		});

		if(document.location.hash === '#list'){
			downloadDataFromServer();
		}

	} catch(e){
		//
	}

}

async function help(){
	try {
		document.getElementById("app").innerHTML = await new Promise(function(resolve){
			fetch(`/roter-modules/view-help.html`).then(function(response){
				if(response.ok){
					response.text().then(function(data){
						resolve(data);
					});
				} else {
					resolve('ERROR DETECTED');
				}
			}).catch(function(error){
				resolve('ERROR DETECTED ' + error);
			});
		});
	} catch(e){
		//
	}
}

async function signup(){
	try {
		document.getElementById("app").innerHTML = await new Promise(function(resolve){
			fetch(`/roter-modules/view-signup.html`).then(function(response){
				if(response.ok){
					response.text().then(function(data){
						resolve(data);
					});
				} else {
					resolve('ERROR DETECTED');
				}
			}).catch(function(error){
				resolve('ERROR DETECTED ' + error);
			});
		});
	} catch(e){
		//
	}
}

function refresh(inputData){
	var listTableBody = document.getElementById('list-table-body');
	listTableBody.innerHTML = '';

	inputData.forEach(function(oneElement){
		listTableBody.innerHTML += `<tr>
				<td class="c1"><input type="checkbox" name="chb-${oneElement.id}" title="выберите для действия"></td>
				<td>${oneElement.title}</td>
				<td class="c3"><button>Скачать</button></td>
			</tr>`;
	});
}

function downloadDataFromServer(){
	// localStorage.setItem('token', 'value');
	// localStorage.removeItem('token');
	var token = localStorage.getItem('token');
	var listTableBody = document.getElementById('list-table-body');
	listTableBody.innerHTML = `<tr><td colspan=3>Please wait... Loading....</td></tr>`;
	fetch(`/api/get-list`, {
		headers: {
			'token': token
		}
	}).then(function(response){
		if(response.ok){
			response.json().then(function(data){
				refresh(data);
			});
		} else {
			var notOkResponse = `${response.status} ${response.statusText}`;
			listTableBody.innerHTML = `<tr><td colspan=3><div class="error">${notOkResponse}</div></td></tr>`;
			setTimeout(function(){
				document.location.hash='#login';
			}, 1500);
		}
	}).catch(function(error){
		listTableBody.innerHTML = `<tr><td colspan=3><div class="error">Network Error (await 5 sec...)</div></td></tr>`;
	});
}
