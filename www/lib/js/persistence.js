var persistence = {};

persistence.open = function(options, callback) {
    try {
        persistence.db = window.openDatabase(options.name, options.version, options.description, options.size)
    } catch (e) {
        alert('Erro ao abrir conexão com banco de dados');
    }

    persistence.createTable(function() {
        callback()
    });
}

persistence.executeSql = function(sql, params, callback) {
    var db = persistence.db;
    db.transaction(function(tx) {
        tx.executeSql(sql, params, function(tx, rs) {
            var len = rs.rows.length;
            var aux = [];
            for (var i = 0; i < len; i++) {
                aux.push(rs.rows.item(i));
            }
            callback(aux);
        }, persistence.onError);
    });
//    console.log(sql)
//    console.log(params)
}

persistence.onError = function(tx, rs) {
    console.log(rs.message);
//    console.log(tx);
//    console.log("Erro");
}

persistence.onSuccess = function(tx, r) {
    console.log("Ééé suucesso!");
}

persistence.createTable = function(callback) {
    persistence.db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS "tbcategoria" ("cdCategoria" INTEGER PRIMARY KEY  NOT NULL , "stCategoria" TEXT NOT NULL, "qtUsado" INTEGER DEFAULT 0)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS "tbcategoriadesp" ("cdCategoria" INTEGER, "cdDespesa" INTEGER, PRIMARY KEY ("cdCategoria", "cdDespesa"))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS "tbdespesa" ("cdDespesa" INTEGER PRIMARY KEY NOT NULL, "vlDespesa" REAL NOT NULL, "dtDespesa" TEXT NOT NULL, "stObservacao" TEXT)');
    }, persistence.onError, callback)
}

//Model
model = {};
model.Abstract = function() {

    this.table = null;
    this.pk = null;

    this.delete = function(where) {
        var SQL = 'DELETE FROM ' + this.table;
        if (where) {
            SQL += ' WHERE ' + where;
        }

//        var db = persistence.db;
        persistence.db.transaction(function(tx) {
            tx.executeSql(SQL, [], persistence.onSucces, persistence.onError);
        })
//        console.log(SQL);
    }

    this.fetchAll = function(options, callback) {

        var SQL = 'SELECT * FROM '
                + this.table;

        
        if (options) {
            if(options.where){
                SQL += ' WHERE ' + options.where;
            }
            if (options.order) {
                SQL += ' ORDER BY ' + options.order;
            }
            if (options.limit) {
                SQL += ' LIMIT ' + options.limit;
            }
        }
        
        
        

        persistence.db.transaction(function(tx) {
            tx.executeSql(SQL, [], function(tx, rs) {
                var len = rs.rows.length
                var retorno = new Array();
                for (var i = 0; i < len; i++) {
                    retorno[i] = rs.rows.item(i);
                }
//                console.log(retorno);
                callback(retorno)

            }, persistence.onError);
        })

//        console.log(SQL);

    }

    this.fetchRow = function(where, callback) {
        var SQL = 'SELECT * FROM '
                + this.table;

        if (where != null) {
            SQL += ' WHERE ' + where;
        }

        persistence.db.transaction(function(tx) {
            tx.executeSql(SQL, [], function(tx, rs) {
                if (rs.rows.length > 0) {
                    callback(rs.rows.item(0))
                } else {
                    callback(false)
                }
            }, function(tx, rs) {
                console.log(rs.message);
            });
        })

//        console.log(SQL);
    }

    this.insert = function(objeto, callback) {
        var SQL = 'INSERT INTO '
                + this.table
                + '(' + this.fields
                + ') VALUES ('
                + this.getValues(objeto)
                + ')';

        console.log(SQL);
        persistence.db.transaction(function(tx) {
            tx.executeSql(SQL, [], function(tx, rs) {
                if (callback != undefined) {
                    callback(rs.insertId);
                }
            }, persistence.onError);
        });
    }


    this.update = function(objeto, where) {
        var attrs = [];

        for (field in this.fields) {
            var value = objeto[this.fields[field]];
            if (value != undefined) {

                if (typeof value == "string") {
                    attrs.push(this.fields[field] + ' = "' + value + '"')
                } else {
                    attrs.push(this.fields[field] + ' = ' + value);
                }

            }

        }
        if (!where) {
            where = "1 = 1";
        }
        var SQL = "UPDATE "
                + this.table
                + " SET "
                + attrs
                + " WHERE "
                + where;

        var db = persistence.db;

        db.transaction(function(tx) {
            tx.executeSql(SQL, [], persistence.onSucces, persistence.onError);
        });

//        console.log(SQL)  
//        console.log(attrs)

    }

    this.getValues = function(objeto) {
        var values = [];

        for (field in this.fields) {
            var value = objeto[this.fields[field]];

//            if(this.pk[this.fields[field]] != undefined){
//                
//            }
            if (typeof value == "string") {
                if (value.slice(0, 8) == "datetime") {
                    values.push(value);
                } else {
                    values.push("'" + value + "'");
                }
            } else if (value == undefined) {
                values.push('null');
            } else {
                values.push(value);
            }

        }
        return values;
    }

}
model.Categoria = function(){
    this.table = "tbcategoria";
    this.fields = ["cdCategoria", "stCategoria"];
    this.pk = ["cdCategoria"];
}
model.CategoriaDesp = function(){
    this.table = "tbcategoriadesp";
    this.fields = ["cdCategoria", "cdDespesa"];
    this.pk = ["cdCategoria", "cdDespesa"];
}
model.Despesa = function() {
    this.table = "tbdespesa";
    this.fields = ["cdDespesa", "vlDespesa", "dtDespesa", "stObservacao"];
    this.pk = ["cdDespesa"];
}
model.Categoria.prototype = new model.Abstract();
model.CategoriaDesp.prototype = new model.Abstract();
model.Despesa.prototype = new model.Abstract();

//Constantes Config
//model.Config.PEDIDO_VALIDA_SALDO = "APP_FV_PEDIDO_VALIDA_SALDO"
//model.Config.PRODUTO_TIPOS_CLASS_MOSTRAR = "APP_FV_PRODUTO_TIPOS_CLASS_MOSTRAR"
//model.Config.PEDIDO_TIPOS_CLASS_MOSTRAR = "APP_FV_PEDIDO_TIPOS_CLASS_MOSTRAR"
//model.Config.PEDIDO_DTFATURAMENTO = "PEDIDO_DTFATURAMENTO"
//model.Config.PEDIDO_DTFATURAMENTO_SKU = "APP_FV_PEDIDO_DTFATURAMENTO_SKU"
//model.Config.MENU = "APP_FV_MENU"