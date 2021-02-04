let { Sequelize, Model, DataTypes } = require('sequelize');

let sequelize = new Sequelize('redWebDB', 'root', '228036',
    { host: 'localhost', dialect: 'mysql' });

let fs = require('fs');
var url = require("url");

/**
 * Item Model - begin
 */
class Item extends Model {}
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
 * Item Model - end
 */

/**
 * User Model - begin
 */
class User extends Model {}
User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    login: DataTypes.STRING,
    pass: DataTypes.STRING,
    access: DataTypes.INTEGER
}, {
    sequelize,
    modelName: 'users'
});
User.sync(); // { force: true }
/**
 * User Model - end
 */

/**
 * Token Model - begin
 */
class Token extends Model {}
Token.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: DataTypes.UUID,
    expire: DataTypes.BIGINT
}, {
    sequelize,
    modelName: 'tokens'
});
Token.sync(); // { force: true }
/**
 * Token Model - end
 */

/**
 * Функция авторизации пользователя.
 * successCallback вызывается при успешной авторизации с ID пользователя.
 * errorCallback   вызывается при ошибке авторизации с описанием ошибки в виде строки.
 */
function authorize(token, successCallback, errorCallback) {
    console.log("token?", token);
    if (token == undefined) {
        errorCallback("Not authorized");
    } else {
        Token.findAll({
            where : {
                id: token
            }
        }).then(function (tokens) {
            if (tokens.length > 0) {
                successCallback(tokens[0].dataValues.userId);
            } else {
                errorCallback("Not authorized");
            }
        }).catch(function (error) {
            errorCallback("Database error");
        });
    }
}

/**
 * getting list items from database and return it as JSON to frontend
 */
function getList(request, response){
    readDataFromRequest(request, function(dataJSON) {
        authorize(request.headers.token, function(userId) {
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
                    response.writeHead(503, { "Content-Type": "application/json" });
                    response.end();
                });
            },
            function (error) {
                response.writeHead(401, { "Content-Type": "application/json" });
                response.write(JSON.stringify({ error: error }));
                response.end();
            });
    });
}

/**
 * Функция для чтения данных из запроса и преобразования их в JSON.
 * 'callback' вызывается с одним параметром: данными в JSON.
 */
function readDataFromRequest(request, callback) {
    var body = [];
    request.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        if (body.length == 0) {
            body = '{}';
        } else {
            body = body.join('');
        }
        console.log('body', body);
        var dataJSON = JSON.parse(body);
        callback(dataJSON);
    });
}

/**
 * Функция обработки операции добавления записи в БД.
 */
function create(request, response){
    readDataFromRequest(request, function(dataJSON) {
        authorize(request.headers.token, function(userId) {
                var imageContent = dataJSON.image;
                var buffer = Buffer.from(imageContent, 'base64');
                // console.log('image content', imageContent);
                // console.log('buffer', buffer);
                var filePath = `static/images/${userId}/`;
                if (! fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                }

                filePath = filePath + dataJSON.title;

                fs.writeFile(filePath, buffer, 'binary', function(err) {
                    if (err) {
                        response.writeHead(401, { "Content-Type": "application/json" });
                        response.write(JSON.stringify({ error: err }));
                        response.end();
                    } else {
                        Item.create({
                            title:    dataJSON.title,
                            filepath: filePath
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
                    }
                });
            },
            function(error) {
                response.writeHead(401, { "Content-Type": "application/json" });
                response.write(JSON.stringify({ error: error }));
                response.end();
            });
    });
}

/**
 * Функция обработки операции удаления записи из БД.
 */
function remove(request, response) {
    authorize(request.headers.token, function(userId) {
            var query = url.parse(request.url).query;
            var ids = query.replace(/^ids=/, '').split('%2C');
            ids.forEach(function(id) {
                Item.destroy({
                    where: {
                        id: id
                    }
                })
            });
            response.writeHead(204, {"Content-Type": "application/json"});
            response.end();
        },
        function(error) {
            response.writeHead(401, { "Content-Type": "application/json" });
            response.write(JSON.stringify({ error: error }));
            response.end();
        });
}

function createArchiveAndGetItPath(ids){
    var filepath = `${__dirname}/files.zip`;
    /* Задание*!
     *
     * Сформировать файл filepath по следующему алгоритму:
     * 1. из массива ids получить по id полный путь до файлов изображений
     *    (т.е. сходить в бд, достать по id записи и получить из них полные пути до файлов)
     * 2. на www.npmjs.com подобрать модуль, постедством которого выполнить создание архива из полученных в п.1 файлов
     *    и положить результирующий архив по пути, указанному в filepath (перезаписываит кадлый раз этот файл)
     * 3. ниже этой строчки происходит возврат пути до этого файла и логика передачи файла на веб приложение,
     *    а также логика получения и сохранения файла веб приложением уже реализована!
     */
    return filepath;
}

/**
 * Функция обработки операции получения нескольких изображений
 */
function download(request, response) {
    authorize(request.headers.token, function(userId) {

            var query = url.parse(request.url).query;
            var ids = query.replace(/^ids=/, '').split('%2C');

            var filePath = createArchiveAndGetItPath(ids);
            var stat = fs.statSync(filePath);

            response.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-Length': stat.size
            });

            var readStream = fs.createReadStream(filePath);

            readStream.on('open', function() {
                readStream.pipe(response);
            });

            readStream.on('error', function(err) {
                response.end(err);
            });
        },
        function(error) {
            response.writeHead(401, { "Content-Type": "application/json" });
            response.write(JSON.stringify({ error: error }));
            response.end();
        });
}


function register(request, response) {
    readDataFromRequest(request, function(dataJSON) {
        User.create({
            login:  dataJSON.login,
            pass:   dataJSON.password,
            access: 1
        }).then(function (okData) {
            response.writeHead(204, {"Content-Type": "application/json"});
            response.end();
        }).catch(function (errData) {
            response.writeHead(503, {"Content-Type": "application/json"});
            var result = { message: "Could not create user." };
            response.write(JSON.stringify(result));
            response.end();
        })
    });
}

function login(request, response) {
    readDataFromRequest(request, function(dataJSON) {
        User.findAll({
            where: {
                login: dataJSON.login,
                pass:  dataJSON.password
            }
        }).then(function(users) {
            if (users.length > 0) {
                var userId   = users[0].dataValues.id;
                var login    = users[0].dataValues.login;
                var tokenTTL = 60; // min
                var today    = Date.now();
                var expire   = today + tokenTTL * 60 * 1000;
                Token.create({
                    userId: userId,
                    expire: expire
                }).then(function(okData) {
                    response.writeHead(201, {"Content-Type": "application/json"});
                    response.write(JSON.stringify({ login : login, token : okData.dataValues.id }));
                    response.end();
                }).catch(function(errData) {
                    response.writeHead(503, {"Content-Type": "application/json"});
                    var error = {
                        message: errData
                    };
                    response.write(JSON.stringify(error));
                    response.end();
                });
            } else {
                response.writeHead(401, {"Content-Type": "application/json"});
                response.write(JSON.stringify({ message: "Wrong login or password." }));
                response.end();
            }
        }).catch(function(err){
            console.log(`err? ${err}`);
            response.write(JSON.stringify({ message: "Database error." }));
            response.end();
        })
    });
}

function logout(request, response) {
    readDataFromRequest(request, function (dataJSON) {
        var token = dataJSON.token;
        Token.findAll({
            where : {
                id: token
            }
        }).then(function(data) {
            if (data.length > 0) {
                Token.destroy({
                    where: {
                        id: token
                    }
                }).then(function (data) {
                    response.writeHead(204, {"Content-Type": "application/json"});
                    response.end();
                });
            } else {
                response.writeHead(401, {"Content-Type": "application/json"});
                response.write(JSON.stringify({ message: "Not authorized." }));
                response.end();
            }
        }).catch(function (error) {
            response.writeHead(503, {"Content-Type": "application/json"});
            response.write(JSON.stringify({ message: "Database error." }));
            response.end();
        });
    });
}

exports.getList  = getList;
exports.create   = create;
exports.remove   = remove;
exports.download = download;
exports.register = register;
exports.login    = login;
exports.logout   = logout;