module.exports = function(app){
	
	var Usuario = app.models.usuario;

	var HomeController = {
		index : function(req, res){
			res.render('home/index');
		},
		cadastro: function(req, res){
			res.render('home/cadastro')
		},
		cadastrar: function(req, res){
			var query = {email : req.body.usuario.email}
			Usuario.findOne(query).select('nome email').exec(function(erro, usuario){
				if (usuario) {
					console.log('Usuário já cadastrado');
					// req.session.usuario = usuario;
				}else{
					Usuario.create(req.body.usuario, function(erro, usuario){
						if(erro){
							console.log(erro);
							res.redirect('/cadastro');
						}else{
							console.log('Cadastro realizado');
							// req.session.usuario = usuario;
							// res.redirect('/contatos');
						}
					});
				}
			});
		},
		login: function(req, res){
			var query = {email : req.body.usuario.email}
			
			Usuario.findOne(query).select('nome email').exec(function(erro, usuario){
				console.log('Erro no find: ', erro);
				if (usuario) {
					req.session.usuario = usuario;
				}else{
					Usuario.create(req.body.usuario, function(erro, usuario){
						console.log('Erro no create: ', erro);
							if(erro){
								res.redirect('/');
							}else{
								req.session.usuario = usuario;
								res.redirect('/contatos');
							}
					});
				}
			});
		},
		logout: function(req, res){
			console.log('Logout');
			req.session.destroy();
			res.redirect('/');
		}
	};
	
	return HomeController;
}