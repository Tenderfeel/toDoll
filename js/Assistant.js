(function(win, $){
	var toDoll = win.toDoll || {};
	
	/**
	 * Class Assistant
	 * @constructor
	 * 
	 * voice format
	 * {"text":"おはようございます！", "face":"joy", "delay":500}
	 */
	toDoll.Assistant = new Class({
		Implements:[Options, Events],
		options:{

			/** @type {string} 台詞ファイル */
			scenario:'scenario/jk.json',

            /** @type {string} 立ち位置 */
			position:'right',

			ngWords:{
        		//Lv1
	        	'complain':['セッ○ス','セック○','お○にー','くり○りす', '手コキ', '手ｺﾐ', '手マン', '手ﾏﾝ', '青姦', '千摺り', '素股', '即ハメ', '即ﾊﾒ', '即マン', '即ﾏﾝ', '即ヤリ', '即ﾔﾘ',   '潮ふき', '潮フキ', '潮吹き','マンコ', 'まんこ', 'ﾏﾝｺ', 'まんこ','ぱいぱん', 'パイパン', 'ﾊﾟｲﾊﾟﾝ','ハメ撮', 'ﾊﾒ撮', 'ハメ撮り', 'はめ撮り', 'ﾊﾒ撮り', 'ハメ写', 'ﾊﾒ写','セクロス', 'ｾｸﾛｽ',    'セックル', 'ｾｯｸﾙ','マン汁', 'まん汁', 'ﾏﾝ汁', 'まん汁', 'ヤリコン', 'ﾔﾘｺﾝ', 'ヤリサー', 'ﾔﾘｻｰ', 'ヤリトモ', 'ヤリマン', 'やりまん', 'ﾔﾘﾏﾝ','オナニー', 'おなにー', 'ｵﾅﾆｰ', 'スカトロ', 'すかとろ', 'ｽｶﾄﾛ', 'すかとろ'],
	        	//Lv2
	        	'dislike': ['おっぱい','エンコウ', 'ｴﾝｺｳ','淫乱', '援助交際', '円交', '援交', '盗撮','買春', '売女','幼女','ょぅι゛ょ','ようじょ'],
	        	//Lv3
	        	'hate':['アナル', 'あなる', 'ｱﾅﾙ','SEX', 'sex', 's_e_x', 'S_E_X', 'ＳＥ×', 'ＳＥＸ', 'Ｓｅｘ', 'ｓｅｘ', 'Ｓｅｘ', 'ｓＥｘ', 'ｓｅＸ', 'ＳＥｘ', 'ｓＥＸ', 'ＳｅＸ', 'セックス', 'セックす', 'セッくス', 'セっクス', 'せっくス', 'セッくス', 'ｾｯｸｽ','ちんこ', 'チンコ','チンコ', 'ﾁﾝｺ', 'チンチン', 'ちんちん', 'ﾁﾝﾁﾝ', 'チンポ', 'ちんぽ', 'チンポ', 'ﾁﾝﾎﾟ','れいぷ', 'レイプ', 'ﾚｲﾌﾟ','顔射','自慰', 'fuck', 'ファック', 'ふぁっく','乱交','痴漢'],
	        	//Lv4
	        	'detest':['ﾀﾋね','ｼﾈ','いんらん', 'ｲﾝﾗﾝ','殺す', 'しね','自殺','麻薬','大麻', '死ね','死ん'],
	        	
	        	//special
	        	'love':['好き','すき','愛してる','結婚して'],
	        	'cheer':['疲れた','もうやだ','嫌だ','疲れる','無理'],
	        	'cure':['死にたい','死にます','死にましょう','しにましょう', '死にませんか','しにませんか', '自殺','殺して','死ぬ','しぬ', 'しにたい','しにます']
	       },

            voice:{
                /** @type {Array} */
                "loading":[{"text":"ごめん。ちょっと待って", "face":"normal", "delay":0}],

                /** @type {Array} エラーメッセージ */
                "error":[ {"text":"エラーがあったみたいです", "face":"normal", "delay":0}]
            },

            maxWordLen:10,
            maxTaskLen:10,

            baloon:'assistant-speech-baloon',

            layer:'assistant'
		},

        /**
         * 喋っているかどうかのフラグ
         * @type {boolean}
         */
		talking:false,

        /**
         * 初期化
         * @param option
         */
		initialize:function(option){
			this.setOptions(option);

			this.baloon = $(this.options.baloon);
			this.layer = $(this.options.layer);
			
			this.Scenario = new toDoll.Scenario();

            this.talkTimer = null;
			this.scenario = null;

            //初期表情セット
            this.setExpression(this.options.voice.loading.face);
            this.setBaloon(this.options.voice.loading.text);

			this.load();
		},

        /**
         * JSON読み込み
         */
		load:function(){
			var that = this;
			//console.log('Assistant load');
			that.talk(that.options.voice.loading);

			return new Request.JSON({
				url: this.options.scenario,
				onSuccess: function(json){
					that.Scenario.setData( json);
                    that.setTalk('start');
                    that.talk();
				},
				onFailure:function(){
                    console.log('error');
					that.talk(that.options.voice.error);
				}
			}).get();
		},
		
		/**
		 * 台詞処理
		 * @param {Array} scenario voiceオブジェクトが入った配列
		 */
		vocalCodes:function(scenario){
			var that = this;
    			
			var voice = scenario.shift();

            if(voice){
                var pending = voice['pending'] ? voice.pending : 0;

                this.talkTimer = setTimeout(function(){
                    that.setBaloon(voice.text);
                    that.setExpression(voice.face);
                    
                    if(voice['callback']){
						voice['callback']();
					}
					
                }, pending);
            }
				
			if(scenario.length){
				//console.log(scenario,voice['text']);
				
				this.talkTimer = setTimeout(function(){
					return that.vocalCodes(scenario);
				}, (voice.delay + pending));

			}else{
				this.talking = false;
				return this.fireEvent('talkComplete');
				
			}
		},

        /**
         * リセット
         * 台詞再生の重複を防ぐ
         */
        reset:function(){
            //console.log('Assistant reset');
            this.Scenario.clearBook();
            clearTimeout(this.talkTimer);
            this.talking = false;
            return this;
        },

        getTalk :function(action, opt_when){
            if(typeof action === 'string'){
               return  this.Scenario.getData(action, opt_when);
            }else{
                return  this.Scenario.getData();
            }
        },

		//台本に追加
        setTalk:function(action, opt_when){
            
            if(typeof action === 'string'){
                   this.Scenario.setBook(action, opt_when);
            }else if(typeOf(action) === 'array'){
            	this.Scenario.add(action);
            }
            
            return this;
        },
		
		/**
		 * 喋らせる
		 * @param {Array} scenario voiceオブジェクトが入った配列
		 */
		talk:function(){

			if(this.talking){
				return false;
			}else{
				this.talking = true;
				var scenario = this.Scenario.getBook();
				this.vocalCodes(scenario);
			}
            return this;
		},
		
		/**
		 * ふきだしセット
		 * @param {string} text
		 */
		setBaloon:function(text){
			this.baloon.set('html', text);
		},
		
		/**
		 * 表情セット
		 * @param {string} tag
		 */
		setExpression:function(tag){
			this.layer.setAttribute('data-face', tag);
		},


        /**
         * 軽くバリデーションなど
         * @param {string} text
         */

		validation:function(text){
        	var result = [];
        	var ngtest = {  detest:false, hate:false, dislike:false, complain:false };

			text = text.clean().stripScripts().replace(/[\n\r]+/g, '');

	        if(text.length === 0){
	            result.push('empty');
	        }
	
	        if(text.length > this.options.maxWordLen){
	            result.push('over');
	        }
		
			Object.each(this.options.ngWords, function(ngWord, lv){
				for(var i = ngWord.length; i--; ){
					if(text.test(ngWord[i], 'i')){
						ngtest[lv] = true;
					}
				}
			});
			
			Object.each(ngtest, function( r, lv){
				if(r === true){
					result.push(lv);
				}
			});
			
			return result;
	
		}
	});
	
	win.toDoll = toDoll;

})(window, document.id);
