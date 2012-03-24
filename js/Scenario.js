(function(win, $){
	var toDoll = win.toDoll || {};

	toDoll.Scenario = new Class({
		initialize:function(data){
			this.data = data;
			this.book = [];
		},

		setData:function(action, data){
			if(typeof action === 'string'){
				this.data[action] = data;
			}else{
				this.data = action;
			}
		},

		/**
		 * 台詞データ取得
		 * @param {string} action 大カテゴリ
		 * @param {string} when 'before' or 'after'
		 */
		getData:function(action, opt_when){
			if(!this.data){
				return null;
			}

			if(action){
				if(opt_when){
					   try {
						   if(opt_when.indexOf( '_random') === -1){
                               return this.data[action][opt_when].clone();

						   }else{//ランダム
                               var dat = this.data[action][opt_when].getRandom();
                               if(typeOf(dat) === 'object'){
                                   return [ Object.clone(dat)];
                               }else if(typeOf(dat) === 'array'){
                                   return dat.clone();
                               }

						   }

					   }catch(e){
						   return null;
					   }
				}else{
					try{
						return this.data[action].clone();
					}catch(e){
						return null;
					}
				}
			}else{
				return this.data;
			}
		},

		/**
		 * 台詞を台本に追加
		 * @param {Array} array
		 */
		add:function(array){
			for(var i = 0, x = array.length; i < x ; i ++ ){
				this.book.push(array[i]);
			}
		},

		/**
		 * 台本から先頭の台詞を取り出す
		 * @return {Object}
		 */
		get:function(){
			if( this.book.length > 0 ) {
				return this.book.shift();
			}
			return null;
		},

		/**
		 *
		 * @param action
		 * @param opt_when
		 */
		setBook:function(action, opt_when){
			var array = this.getData(action, opt_when);
			if(array){
				this.add(array);
			}
		},

		getBook:function(){
			return this.book;
		},

		bookSize:function(){
			return this.book.length;
		},

		remove:function(i){
			this.book.splice(i,1);
		},

		clearBook:function(){
			this.book = [];
		}
	});

	win.toDoll = toDoll;
})(window, document.id);
