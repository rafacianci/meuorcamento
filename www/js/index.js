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
                    controller: 'AdicionarCtrl'
                }).
                when('/despesa/visualizar', {
                    templateUrl: 'templates/visualizar.html',
                    controller: 'VisualizarCtrl'
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

    var chart = AmCharts.makeChart("chartdiv-geral", {
        "type": "serial",
        "theme": "dark",
        "rotate": false,
        "dataProvider": [{
                "tipo": "Despesas",
                "valor": 200,
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

    var SQL = "SELECT * FROM tbdespesa AS d JOIN tbcategoria AS c ON c.cdCategoria = d.cdCategoria";
    persistence.executeSql(SQL, [], function(despesas) {
        console.log(despesas)
    })
    var chartDespesa = AmCharts.makeChart("chartdiv-despesas", {
        "type": "pie",
        "theme": "dark",
        "labelText": "R$ [[percents]]",
        "innerRadius": "40%",
        "titleField": "category",
        "valueField": "column-1",
        "allLabels": [],
        "balloon": {},
        "titles": [],
        "dataProvider": [
            {
                "category": "carro",
                "column-1": 8
            },
            {
                "category": "moto",
                "column-1": 6
            },
            {
                "category": "estudo",
                "column-1": 2
            }
        ]
    });

    $scope.goTo = function(url) {
        $location.path(url);
    }

});
app.controller('AdicionarCtrl', function($scope, $location) {

    var categoriaModel = new model.Categoria();
    $scope.dtDespesa = new Date();
    $scope.adicionar = function() {
        if (!($scope.vlDespesa) && !($scope.vlDespesa > 0)) {
            return;
        }

        var despesaModel = new model.Despesa();
        var insert = {
            vlDespesa: $scope.vlDespesa,
            dtDespesa: new Date($scope.dtDespesa).getTime() / 1000,
            stObservacao: $scope.stObservacao,
            cdCategoria: $scope.categoria.cdCategoria
        }
        
        despesaModel.insert(insert);

        $location.path('/home')
    }

    $scope.addCategoria = function(categoria) {
        $scope.categoria = categoria;
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
app.controller('VisualizarCtrl', function($scope) {
    var despesaModel = new model.Despesa();
    var newDesp = [];
    var SQL = "SELECT d.*, GROUP_CONCAT(c.stCategoria) as stCategorias FROM tbdespesa d JOIN tbcategoriadesp cd ON cd.cdDespesa = d.cdDespesa JOIN tbcategoria c ON cd.cdCategoria = c.cdCategoria GROUP BY d.cdDespesa";
    persistence.executeSql(SQL, [], function(despesas) {
        for (i in despesas) {
            newDesp[i] = {
                cdDespesa: despesas[i].cdDespesa,
                vlDespesa: despesas[i].vlDespesa,
                dtDespesa: Util.timeStamp2Date(despesas[i].dtDespesa),
                stCategorias: despesas[i].stCategorias
            }

        }
        $scope.despesas = newDesp;
        $scope.$apply();
    })
})