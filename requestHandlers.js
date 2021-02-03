let { Sequelize, Model, DataTypes } = require('sequelize');

let sequelize = new Sequelize('redWebDB', 'root', '228036',
    { host: 'localhost', dialect: 'mysql' });

class Item extends Model {}

console.log('connect DATABASE');
Item.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: DataTypes.STRING,
    filepath: DataTypes.STRING
}, {
    sequelize,
    modelName: 'items'
});

Item.sync(); // { force: true }


/**
 * getting list items from database and return it as JSON to frontend
 */
function getList(request, response){

    /*if(request.headers.token!='qwerty'){
        response.writeHead(401, {"Content-Type": "application/json"});
        response.write('{"status": "unauthorized"}');
        response.end();
        return;
    }*/

    Item.findAll({}).then(function(data) {
        var result = [];
        data.forEach(function (e) {
            result.push({ id: e.id, title: e.title, filepath: e.filepath });
        });
        var dataJSON = JSON.stringify(result);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.write(dataJSON);
        response.end();
    }).catch(function(err){
        console.log(`err? ${err}`);
    })
}

function create(request, response){
    var body = [];
    request.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = body.join('');
        var dataJSON = JSON.parse(body);

        Item.create({
            title: dataJSON.title,
            filepath: dataJSON.filepath
        }).then(function(okData) {
            console.log(`result?`, okData);
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end();
        }).catch(function(errData) {
            console.log('ERROR', errData);
            response.writeHead(503, {"Content-Type": "application/json"});
            var error = {
                message: errData
            };
            response.write(JSON.stringify(error));
            response.end();
        });
    });
}

/**
 * Функция обработки операции удаления записи из БД.
 */
function remove(request, response) {
    var body = [];
    request.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = body.join('');
        var dataJSON = JSON.parse(body);
        console.log('DATA', dataJSON);
        dataJSON.forEach(function(id) {
            Item.destroy({
                where: {
                    id: id
                }
            })
        });
        response.writeHead(204, {"Content-Type": "application/json"});
        response.end();
    });
}

exports.getList = getList;
exports.create  = create;
exports.remove  = remove;