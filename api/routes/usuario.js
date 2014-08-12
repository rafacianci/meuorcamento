module.exports = function(app){
	var usuario = app.controllers.usuario;
	app.get('/usuario', usuario.list);
	app.post('/usuario', usuario.create);
	app.get('/usuario/:id', usuario.list);
	app.put('/usuario/:id', usuario.alter);
	app.delete('/usuario/:id', usuario.delete);
}