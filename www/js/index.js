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

app.controller('AdicionarCtrl', function($scope, $location) {  
    
    var categoriaModel = new model.Categoria();
    
    $scope.dtDespesa = new Date();
    
    $scope.adicionar = function(){
        if (!($scope.vlDespesa) && !($scope.vlDespesa > 0)){
            return;
        }
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
        $location.path('/home')
    }   
    
    $scope.addCategoria = function(stCategoria){
        var catArray = String($scope.stCategoria).split(',');
        cat = catArray[catArray.length - 1].trim();
        $scope.stCategoria = String($scope.stCategoria).replace(cat, stCategoria + ", ");
        $scope.categorias = {};
        document.getElementById("categoria").focus();
    }
    
    $scope.adicionarCategoria = function(stCategoria){
        if(!$scope.stCategoria){
            $scope.stCategoria = stCategoria;
        }else{
            $scope.stCategoria = $scope.stCategoria + ', ' + stCategoria
        }
    }
    
    $scope.listCategorias = function(){
        var catArray = String($scope.stCategoria).split(',');
        cat = catArray[catArray.length - 1].trim();
        
        persistence.executeSql("SELECT * FROM tbcategoria WHERE stCategoria LIKE '" + cat + "%'", [], function(categorias){
            console.log(categorias);
            if(categorias.length == 0){
                $scope.categorias = {};
            }
            $scope.categorias = categorias;
            $scope.$apply();
        })
        
    }

    $scope.textAreaAdjuste = function($event){
        if($event.keyCode == 13){
            var ta = document.getElementById('observacao');
            ta.style.height = (ta.scrollHeight) + "px";
        }
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