// var data = [
// {id:1, title:"Рис. 1"},
// {id:2, title:"Рис. 2"},
// {id:4, title:"Рис. 4"},
// {id:5, title:"Рис. 5"}
// ];

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
    var listTableBody = document.getElementById('list-table-body');
    listTableBody.innerHTML = `<tr><td colspan=3>Please wait... Loading....</td></tr>`;
    fetch(`/api/get-list?time=${Date.now()}`).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                refresh(data);
            });
        } else {
            // console.log('Somethin went wrong...');
        }
    }).catch(function(error){
        // console.log('Somethin went wrong...', error);
        listTableBody.innerHTML = `<tr><td colspan=3><div class="error">Network Error (await 5 sec...)</div></td></tr>`;
    });
}

window.onload = function(){
    downloadDataFromServer();
    setInterval(function(){
        var listTableBody = document.getElementById('list-table-body');
        listTableBody.innerHTML = `<tr><td colspan=3>...</td></tr>`;
        setTimeout(function(){
            downloadDataFromServer();
        }, 1000);
    }, 4000);
};