(function(win, $){
	var toDoll = win.toDoll || {};
	
	toDoll.ToDo = new Class({
		Implements:[Options],
		
		options:{
			dbName  :'todoll',
            max:10
		},

        INDEX    : 0,
        UID: 1,

		initialize:function(option){
			this.setOptions(option);
			this.storage = window.localStorage;
            this.UID = this.getID();
            this.INDEX = this.getIndex();

            this.saveID();
		},

        isEmpty:function(){
               return  (this.INDEX > 0);
        },

        /**
         * 新しく追加できるか確認
         *
         */
        isAdd:function(){
            return (! this.isMax() || this.getID());
        },

        /**
         * 保存数
         */
        isMax:function(){
            return (this.INDEX >= (this.options.max-1));
        },
		
		/**
         * idが数値かどうかを判定
         */
        isID: function(id) {
            return typeof id === 'number';
        },

        /**
         * ストレージからIDを得る
         */
        getID:function(){
            var i = this.storage[this.options.dbName + '.uid'];

            return i ? Number(i) : 1;
        },

        /**
         * IDを保存
         * @param id
         */
        saveID:function(){
            this.storage[this.options.dbName + '.uid'] = this.UID;
        },
        
		/**
         * 現在のindex数を取得する
         */
        getIndex: function(data) {

            var o = data ? data : this.getData();

            return o ? o.length : null;
        },

        /**
         * ToDoデータをlocalStorageから取得する
         *
         * @param {Number} id 取得したいToDoのID
         * @returns {Object} 取得したToDoデータリスト
         */
        getData: function(id) {

            var db = this.storage[this.options.dbName],
                json,
                i = 0, l;

            //データが存在していなければ初期化を実行する
            (db) || this.clear();

            //JSONデータをチェック。データが存在しなければ正規化
            json = JSON.parse(this.storage[this.options.dbName]);
            (json) || (json = {});
            (json.data) || (json.data = []);

            //IDが指定されていなかったらデータすべてを返す
            if (!this.isID(id)) {
                var data;

                if(typeOf(json.data) === 'object'){
                    data = [json.data];
                }else{
                   data = json.data.sort(function(a, b) {
                        return a.complete - b.complete;
                    });
                }

                //完了状態を元にソート
                //（完了したものが後ろに移動する）
                return data;
            }

            //指定されたIDのデータを返す
            for (l = json.data.length; i < l; i++ ) {
                if (json.data[i].tid == id) {
                    return json.data[i];
                }
            }

            //該当IDが存在しなければnullを返す
            return null;
        },
        
        /**
         * setter
         * @param {Object} data
         * @param {Number} id
         */
        setData: function(data, id) {

            var d,
                i = 0, l;

            if (!this.isID(id)) {
                this.storage[this.options.dbName] = JSON.stringify({data: data});
            } else {
                d = this.getData();

                update: {
                    for (l = d.length; i < l; i++) {
                        console.log('update1:', d[i]);
                        if (d[i].tid == id) {
                            d[i] = data;
                            break update;
                        }
                    }

                    d[d.length] = data;
                }

               this.INDEX = this.getIndex(d);
               this.UID++;
               this.saveID();
               this.storage[this.options.dbName] = JSON.stringify({data:d});
            }
        },

        /**
         * データベース（localStorage）とリストを初期化（クリア）する
         */
        clear: function() {
            this.storage[this.options.dbName] = JSON.stringify({data:[]});
            this.INDEX = 0;
        },
        
        /**
         * ToDoを削除する
         *
         * @param {Number} id 削除するToDoのID
         */
        remove: function(id) {

            var data,
                i = 0, l;
                
            //いったん全データを取得
            data = this.getData();

            //該当するデータを検索
            for (l = data.length; i < l; i++) {
                if (data[i].tid == id) {
                    data.splice(i,1);
                    break;
                }
            }

            //更新したデータリストを保存
            this.setData(data);
        },
        
        /**
         * ToDoをリストに追加する
         *
         * @param {String} txt ToDoに設定するテキスト.
         * @param {Number} id ToDoのユニークID
         */
        add: function(txt, id){

            var data;

            /**
             * 渡されたIDのデータを取得
             * もしデータがあればそれを更新する
             */
            data = this.getData(id);

            //各プロパティの正規化
            data || (data = {});
            //data.groupID || (data.groupID = 0);
            data.complete || (data.complete = 0);

            data.txt = txt;
            data.tid = id;
            
            //設定した情報を保存
            this.setData(data, id);
        },

        /**
         * 全部コンプしてるか調べる
         * @return {boolean}
         */

        isFullComplete : function(){

           var  data = this.getData();

           return data.every(function(item){

                return (item.complete !== 0);

            });
        }

	});

	win.toDoll = toDoll;

})(window, document.id);
