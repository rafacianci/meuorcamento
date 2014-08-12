module.exports = function(app){
	var Schema = require('mongoose').Schema;


	var usuario = Schema({
		nome: {type: String, required: true},
		email: {type: String, required: true, index: {unique: true}},
		senha: {type: String, required: true}
	});

	return db.model('usuarios', usuario);
}