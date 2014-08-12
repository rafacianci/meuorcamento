module.exports = function(app){
	var home = app.controllers.home;
	app.get('/', home.index);
	app.get('/cadastro', home.cadastro);
	app.post('/entrar', home.login);
	app.post('/cadastrar', home.cadastrar);
	app.get('/sair', home.logout);
}


