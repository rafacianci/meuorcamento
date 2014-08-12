module.exports = function(app){

	var Usuario = app.models.usuario;

	var UsuarioController = {
		list: function(req, res){
			if(req.params.id){
				Usuario.findOne({_id : req.params.id}).exec(function(erro, usuario){
					if (usuario) {
						res.json(usuario);
					}else{
						res.json(erro);
					}
				});	
			}else{
				Usuario.find(function(erro, usuario){
					if (usuario) {
						res.json(usuario);
					}else{
						res.json(erro);
					}
				});	
			}
			
		},
		create: function(req, res){
			Usuario.create(req.body, function(erro, usuario){
				if(erro){
					console.log('Erro no create: ', erro);
					res.json(erro);
				}else{
					res.json(usuario);
				}
			});
		},
		delete: function(req, res){
			Usuario.findOne({_id : req.params.id}).remove(function(erro, i){
				if(erro){
					res.json(erro);
				}else{
					res.json(i)
				}
			});				
		},
		alter: function(req, res){
			Usuario.update({_id : req.params.id}, req.body, { multi: true }, function(erro, i){
				if(erro){
					res.json(erro);
				}else{
					res.json(i);
				}
			});
		}

	}
	return UsuarioController;
}