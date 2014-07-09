var app = angular.module('app', ['ngRoute', 'ngAnimate']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
                when('/home', {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }).
                when('/adicionar/', {
                    templateUrl: 'templates/adicionar.html',
                    controller: 'AdicionarCtrl'
                }).
                when('/visualizar/', {
                    templateUrl: 'templates/visualizar.html',
                    controller: 'VisualizarCtrl'
                }).
                otherwise({
                    redirectTo: '/home'
                });
    }]);

app.controller('HomeCtrl', function($scope) {
    console.log('Moises');
});

app.controller('AdicionarCtrl', function($scope) {  
    
    var categoriaModel = new model.Categoria();
    loadCategorias();
    
    
    $scope.adicionar = function(){
        categorias = new String($scope.stCategoria).split(",")
        var cdsCategorias = [];
        
        for(i in categorias){
            var categoria = categorias[i].trim();
            var encontrou = false;
            
            for(var j = 0; j < $scope.categorias.length; j++){
                if(categoria.toLowerCase() == $scope.categorias[j].stCategoria.toLowerCase()){
                    encontrou = true;
                    cdsCategorias.push($scope.categorias[j].cdCategoria)
                }
            }
            if(!encontrou){
                categoriaModel.insert({stCategoria : categoria}, function(cdCategoria){
                    cdsCategorias.push(cdCategoria);
                });
                loadCategorias();
            }
        }
        var despesaModel = new model.Despesa();
        var insert = {
            vlDespesa : $scope.vlDespesa,
            dtDespesa : new Date($scope.dtDespesa).getTime() / 1000,
            stObservacao : $scope.stObservacao
        }
        
        despesaModel.insert(insert, function(cdDespesa){
            var catDespModel = new model.CategoriaDesp();
            for(i in cdsCategorias){
                catDespModel.insert({
                    cdCategoria : cdsCategorias[i],
                    cdDespesa : cdDespesa
                });
            }
        })
    }   
    
    $scope.adicionarCategoria = function(stCategoria){
        if(!$scope.stCategoria){
            $scope.stCategoria = stCategoria;
        }else{
            $scope.stCategoria = $scope.stCategoria + ', ' + stCategoria
        }
    }
    
    $scope.addCategoria = function(){         
        loadCategorias();
    }
    
    function loadCategorias () {
        categoriaModel.fetchAll({limit : 10, order : 'qtUsado'}, function(categorias){
            $scope.categorias = categorias;
            $scope.$apply();
        })
    }
    
});

app.controller('VisualizarCtrl', function($scope){
    var despesaModel = new model.Despesa();
    var newDesp = [];
    var SQL = "SELECT d.*, GROUP_CONCAT(c.stCategoria) as stCategorias FROM tbdespesa d JOIN tbcategoriadesp cd ON cd.cdDespesa = d.cdDespesa JOIN tbcategoria c ON cd.cdCategoria = c.cdCategoria GROUP BY d.cdDespesa";
    persistence.executeSql(SQL, [], function(despesas){
        for(i in despesas){
            newDesp[i] = {
                cdDespesa : despesas[i].cdDespesa,
                vlDespesa : despesas[i].vlDespesa,
                dtDespesa :  Util.timeStamp2Date(despesas[i].dtDespesa),
                stCategorias : despesas[i].stCategorias
            }
            
        }
        $scope.despesas = newDesp;
        $scope.$apply();
    })
})