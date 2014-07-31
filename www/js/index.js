var app = angular.module('app', ['ngRoute', 'ngAnimate', 'angular-carousel']);
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
                when('/home', {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }).
                when('/despesa/adicionar', {
                    templateUrl: 'templates/adicionar.html',
                    controller: 'DespesaAdicionarCtrl'
                }).
                when('/despesa/visualizar', {
                    templateUrl: 'templates/visualizar.html',
                    controller: 'DespesaVisualizarCtrl'
                }).
                when('/receita/adicionar', {
                    templateUrl: 'templates/adicionar.html',
                    controller: 'ReceitaAdicionarCtrl',
                }).
                when('/receita/visualizar', {
                    templateUrl: 'templates/visualizar.html',
                    controller: 'ReceitaVisualizarCtrl',
                }).
                otherwise({
                    redirectTo: '/home'
                });
    }]);
app.controller('HomeCtrl', function($scope, $location) {

    var altura = $('.graficos').height() - 50;
    $('#chartdiv-geral').height(altura);
    $('#chartdiv-despesas').height(altura);
    $('#chartdiv-receitas').height(altura);
    var SQL = "SELECT sum(d.vlDespesa) AS vlDespesa FROM tbtransacao AS d";
    persistence.executeSql(SQL, [], function(despesas) {
        console.log(despesas);
        var chart = AmCharts.makeChart("chartdiv-geral", {
            "type": "serial",
            "theme": "dark",
            "rotate": false,
            "dataProvider": [{
                    "tipo": "Despesas",
                    "valor": despesas[0].vlDespesa,
                    "color": "#FEC628"
                }, {
                    "tipo": "Receitas",
                    "valor": 1882,
                    "color": "#3498db"
                }],
            "valueAxes": [{
                    "axisAlpha": 0,
    //                "position": "right",
    //                "title": "Despesas X Receitas"
                }],
            "startDuration": 1,
            "graphs": [{
                    "balloonText": "<b>[[category]]: [[value]]</b>",
                    "colorField": "color",
                    "fillAlphas": 0.9,
                    "lineAlpha": 0.2,
                    "type": "column",
                    "valueField": "valor"
                }],
            "chartCursor": {
                "categoryBalloonEnabled": false,
                "cursorAlpha": 0,
                "zoomable": false
            },
            "categoryField": "tipo",
            "categoryAxis": {
                "gridPosition": "start",
                "labelRotation": 0
            },
        });
    });
    
    var SQL = "SELECT d.cdCategoria, c.stCategoria, sum(d.vlDespesa) AS vlDespesa FROM tbtransacao AS d JOIN tbcategoria AS c ON c.cdCategoria = d.cdCategoria GROUP BY d.cdCategoria";
    persistence.executeSql(SQL, [], function(despesas) {
        console.log(despesas)

        var chartDespesa = AmCharts.makeChart("chartdiv-despesas", {
            "type": "pie",
            "theme": "dark",
            "labelText": "[[title]] - R$ [[value]]",
            "innerRadius": "40%",
            "titleField": "stCategoria",
            "valueField": "vlDespesa",
            "allLabels": [],
            "balloon": {},
            "titles": [],
            "dataProvider": despesas
        });
    });
    
    $scope.goTo = function(url) {
        $location.path(url);
    }

});
app.controller('DespesaAdicionarCtrl', function($scope, $location) {
    $scope.title = "Adicionar despesas";
    
    var categoriaModel = new model.Categoria();
    $scope.dtDespesa = new Date();
    
    $scope.adicionar = function() {
        if (!($scope.vlDespesa) && !($scope.vlDespesa > 0)) {
            return;
        }
        if(!$scope.categoriaAux){
            console.log('Selecione uma categoria');
            return;
        }

        var where = 'upper(stCategoria) = upper("' + $scope.categoriaAux + '")';
        categoriaModel.fetchAll({'where' : where}, function(cats){
            console.log(cats);
            if (cats.length == 0){
                categoriaModel.insert({stCategoria : $scope.categoriaAux}, function(cdCategoria){
                    console.log('Inseriu esse caralho: ', cdCategoria);
                    insereDespesa($scope.vlDespesa, $scope.dtDespesa, $scope.stObservacao, cdCategoria);
                });
            }else{
                console.log(cats[0].cdCategoria);
                insereDespesa($scope.vlDespesa, $scope.dtDespesa, $scope.stObservacao, cats[0].cdCategoria);
            }
        })
    
        
        function insereDespesa(vlDespesa, dtDespesa, stObservacao, cdCategoria){
            var despesaModel = new model.Transacao();

            var insert = {
               'vlDespesa' : vlDespesa,
               'dtDespesa' : new Date(dtDespesa).getTime() / 1000,
               'stObservacao' : stObservacao,
               'cdCategoria' : cdCategoria,
               'inTipo' : 'D'
            }
            console.log(insert);
            despesaModel.insert(insert);
            $location.path('/home');
            $scope.$apply();
        }        
    }

    $scope.addCategoria = function(categoria) {
        $scope.categoriaAux = categoria.stCategoria;
        $scope.categorias = {};
    }

    $scope.listCategorias = function() {    
        persistence.executeSql("SELECT * FROM tbcategoria WHERE stCategoria LIKE '" + $scope.categoriaAux + "%'", [], function(categorias) {
            console.log(categorias);
            if (categorias.length == 0) {
                $scope.categorias = {};
            }
            $scope.categorias = categorias;
            $scope.$apply();
        })
    }

    $scope.textAreaAdjuste = function($event) {
        if ($event.keyCode == 13) {
            var ta = document.getElementById('observacao');
            ta.style.height = (ta.scrollHeight) + "px";
        }
    }

});
app.controller('DespesaVisualizarCtrl', function($scope) {
    $scope.title = "Despesas";
    var despesaModel = new model.Transacao();
    var newDesp = [];
    var SQL = "SELECT d.*, c.stCategoria as stCategorias FROM tbtransacao d JOIN tbcategoria c ON d.cdCategoria = c.cdCategoria WHERE d.inTipo = 'D'";
    persistence.executeSql(SQL, [], function(despesas) {
        for (i in despesas) {
            newDesp[i] = {
                cdTransacao: despesas[i].cdTransacao,
                vlDespesa: despesas[i].vlDespesa,
                dtDespesa: Util.timeStamp2Date(despesas[i].dtDespesa),
                stCategorias: despesas[i].stCategorias
            }
        }
        $scope.despesas = newDesp;
        $scope.$apply();
    })
});

app.controller('ReceitaAdicionarCtrl', function($scope){
    $scope.title = "Receitas";    
        
});

app.controller('ReceitaVisualizarCtrl', function($scope){
    $scope.title = "Receitas";
    var despesaModel = new model.Transacao();
    var newDesp = [];
    var SQL = "SELECT d.*, c.stCategoria as stCategorias FROM tbtransacao d JOIN tbcategoria c ON d.cdCategoria = c.cdCategoria WHERE d.inTipo = 'R'";
    persistence.executeSql(SQL, [], function(despesas) {
        for (i in despesas) {
            newDesp[i] = {
                cdTransacao: despesas[i].cdTransacao,
                vlDespesa: despesas[i].vlDespesa,
                dtDespesa: Util.timeStamp2Date(despesas[i].dtDespesa),
                stCategorias: despesas[i].stCategorias
            }
        }
        $scope.despesas = newDesp;
        $scope.$apply();
    })
    
});
