/**
 * toDoll
 *
 * ところどころで Fork元である edo_m18 さんのソースを流用しています
 * 使っているのはjQueryではなくMooToolsです
 */

(function(win, $){
    var toDool = win.toDool || {};

    toDool.ToDo = new Class({
        Implements:[Options],

        options:{
            dbName  :'todoll',
            max:10//最大保存数
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

    win.toDool = toDool;

})(window, document.id);

(function(win, $){
    var toDool = win.toDool || {};

    toDool.Scenario = new Class({
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

    win.toDool = toDool;
})(window, document.id);

(function(win, $){
    var toDool = win.toDool || {};

    /**
     * Class Assistant
     * @constructor
     *
     * voice format
     * {"text":"おはようございます！", "face":"joy", "delay":500}
     */
    toDool.Assistant = new Class({
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

            maxWordLen:10,//文字数
            maxTaskLen:10,//タスク保存数

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

            this.Scenario = new toDool.Scenario();

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
            //console.log('Assistant setTalk:', this.talking, action, opt_when, this.Scenario.bookSize());

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

    win.toDool = toDool;

})(window, document.id);


(function(win, $){
    var toDool = win.toDool || {};

    toDool.todo = [];

    toDool.wellCount = 0;//焦らしカウンタ
    toDool.welLimit = false;//焦らしフラグ
    toDool.busy = null; //（タイマー的な）処理中で忙しいんですフラグ

    Element.NativeEvents['webkitTransitionStart'] = 2;
    Element.NativeEvents['webkitTransitionEnd'] = 2;
    Element.NativeEvents['webkitAnimationStart'] = 2;
    Element.NativeEvents['webkitAnimationEnd'] = 2;
    Element.NativeEvents['transitionstart'] = 2;
    Element.NativeEvents['transitionend'] = 2;
    Element.NativeEvents['animationstart'] = 2;
    Element.NativeEvents['animationend'] = 2;

    /**
     * @constructor
     */
    toDool.Controller = new Class({
        Implements:[Options, Events],

        options:{
            todoOptions:{},
            assistantOptions:{}
        },

        //
        initialize:function(option){
            this.setOptions(option);

            this.Assistant = new toDool.Assistant(this.options.assistantOptions);

            this.options.todoOptions['max'] = this.Assistant.maxTaskLen;

            this.Todo = new toDool.ToDo(this.options.todoOptions);

            this.container = $('todo');
            this.commandPanel = $('user-voice');
            this.addFormPanel = $('add-form');
            this.confirmPanel = $('confirm');

            this.removeCheckedToDo = []; //削除するToDアイテム（のID）

            var that = this;

            /**
             * set #todo Delegate
             */
            this.container.addEvents({

                //mouseover
                'mouseover:relay(.todoItem:not(.complete):not(.edit) > .todoTxtItem)': function(event, target){
                    event.preventDefault();

                    if(!toDool.busy){
                        that.Assistant.reset().setTalk('todoitem', 'mouseover_random').talk();
                    }
                },

                //click -> edit
                'click:relay(.todoItem:not(.complete):not(.edit) > .todoTxtItem)':function(event, target){
                    event.preventDefault();

                    that.Assistant.reset().setTalk('edit','start').setTalk('edit','waiting').talk();
                    that.createChangeForm(target);
                }
            });

        },


        /**
         * ToDo確認
         */
        check:function(){

            this.Assistant.reset().setTalk('check','before');

            if(this.busy){
                return false;
            }

            //ToDoがひとつも登録されていない
            if (! this.Todo.isEmpty()) {
                this.Assistant.setTalk('check','empty')
                    .setTalk('waiting')
                    .talk();
                $('container').removeClass('showTodo');
                return true;

            }else{

                this.container.empty();
                this.reflesh();
                this.reading();

            }

        },

        /**
         * リスト更新
         * @param data
         */
        reflesh:function(opt_append){

            var data = this.Todo.getData();
            toDool.todo = [];

            //全ToDoデータを画面から削除
            if(opt_append){
                this.container.empty();
            }

            for (var i = 0, l = data.length; i < l; i++) {

                element = this._createTodoHTML(data[i]);

                toDool.todo.push(element);

                if(opt_append){
                    this.container.grab(element);
                }

            }//for
        },

        /**
         * データの読み上げ
         * @param data
         */
        reading:function(){
            var afterWords;
            var data = this.Todo.getData();

            toDool.busy = true;

            var talk = [];
            for (var i = 0, l = data.length; i < l; i++) {
                talk.push({
                    'text': data[i].txt,
                    face:'happy',
                    'delay':data[i].txt.length * 300,
                    callback:function(){
                        $('container').addClass('showTodo');
                        $('todo').grab(toDool.todo.shift());
                    }
                });
            }

            afterWords = this.Assistant.getTalk('check','after');
            afterWords.getLast().callback = function(){
                toDool.busy = null;
            };

            talk.append(afterWords);

            //全部コンプしてたときの台詞
            if(this.Todo.isFullComplete()){
                talk.append( this.Assistant.getTalk('complete', 'fullcomp_random'));
            }

            talk.append(this.Assistant.getTalk('waiting'));

            //１つずつ喋らせる
            this.Assistant.setTalk(talk).talk();
        },

        /**
         * html要素作成
         * @param data
         * @param compFlg
         */
        _createTodoHTML:function(data){

            var  compFlg = data.complete ? ' complete' : '';

            var  html = '<span class="todoTxtItem" data-tid="'+ data.tid + '">' + data.txt + '</span>';

            if(compFlg){
                var date = new Date(data.complete);
                var datetime = date.format('%Y-%m-%dT%T+09:00');
                var timetext = date.format('%Y/%m/%d %T');
                html += '<time class="todoCompTime" datatime="' + datetime + '">'+ timetext +'</time>';
            }

            html += '<div class="todoCtrl completeCtrl">';
            html +=    '<button  data-tid="' + data.tid + '" class="btnComp" data-action="complete">完了</button> ';
            html +=    '<button type="button"  data-tid="' + data.tid + '" data-action="removeConf" class="btnDel">削除</button>';
            html +=  '</div>';
            html +=  '<div class="todoCtrl resumeCtrl">';
            html +=    '<button data-tid="' + data.tid + '" class="btnResume" data-action="resume">再開</button>';
            html +=  '</div>';
            html +=  '<div class="todoCtrl editCtrl">';
            html +=    '<button data-tid="' + data.tid + '" class="btnEditUpdate" data-action="editEnter">更新</button>';
            html +=    '<button data-tid="' + data.tid + '" class="btnEditCancel" data-action="editCancel">キャンセル</button>';
            html +=  '</div>';

            return new Element('div', {"id":'todoitem-' + data.tid, 'class':'todoItem' + compFlg, 'html':html});
        },

        /**
         * ToDo追加するときのフォーム表示演出
         */
        add:function(){

            var that = this;

            if( ! this.Todo.isAdd()){
                return false;
            }

            this.Assistant.reset()
                .setTalk('add','before')
                .setTalk('add', 'waiting');

            this.Todo.ADDFLG = true;

            var transitionCallback =  function(){
                that.Assistant.talk();
                this.removeEvent('webkitTransitionEnd');
                this.removeEvent('transitionend');
            };

            this.commandPanel.addEvent('webkitTransitionEnd', transitionCallback);
            this.commandPanel.addEvent('transitionend', transitionCallback);

            this.commandPanel.setAttribute('data-effect', 'fadeOut');//コマンド隠す
            this.addFormPanel.setAttribute('data-effect', 'fadeIn');//フォーム出す

        },

        /**
         * 追加します
         */
        addEnter:function(){
            this.addForm = $('add-text');
            var text = this.addForm.value;
            this.Assistant.reset();

            var check = this.Assistant.validation(text);

            //これ以上無理
            if(this.Todo.isMax()){
                this.Assistant.setTalk('validation','max').setTalk('waiting').talk();
                return false;
            }

            if(check.length > 0){
                this.Assistant.setTalk('validation', check.shift());
                this.Assistant.setTalk('add', 'waiting');
                this.Assistant.talk();
                this.addForm.value = '';
                return false;
            }

            this.Assistant.setTalk('add', 'execute').setTalk('waiting').talk();
            this.addForm.value = '';

            var id = this.Todo.getID();
            id = !isNaN( id ) ? id : 0;

            this.Todo.add(text, id);
            $('container').addClass('showTodo');

            this.reflesh(true);
        },

        /**
         * 追加やめます
         */
        addCancel:function(){
            this.Todo.ADDFLG = false;
            this.Assistant.reset().setTalk('add','cancel').setTalk('waiting').talk();

            this.commandPanel.setAttribute('data-effect', 'fadeIn');//コマンド出す
            this.addFormPanel.setAttribute('data-effect', 'fadeOut');//フォーム隠す

        },

        /**
         * －－－－－－－－－－　終了　－－－－－－－－－－－
         *
         * @param {(number|string)} id 対象のToDo ID
         */
        complete: function(param,  id ) {

            var data = this.Todo.getData(Number( id ));

            //コンプリートフラグ
            data.complete =  Date.now();
            this.Assistant.reset()
                .setTalk('complete', 'normal_random');

            //フラグを更新してデータを保存
            this.Todo.setData(data, Number( id ));

            //全部コンプしてたときの台詞
            if(this.Todo.isFullComplete()){
                this.Assistant.setTalk('complete', 'fullcomp_random');
            }

            this.Assistant.setTalk('waiting').talk();

            this.reflesh(true);

        },


        /**
         * －－－－－－－－－－　再開　－－－－－－－－－－－
         * @param {(number|string)} id 対象のToDo ID
         */
        resume:function( param, id ){

            var data = this.Todo.getData(Number( id ));

            //コンプリートフラグ消す
            data.complete =  0;
            this.Assistant.reset()
                .setTalk('resume', 'normal_random')
                .setTalk('waiting')
                .talk();

            //フラグを更新してデータを保存
            this.Todo.setData(data, Number( id ));

            this.reflesh(true);
        },

        /**
         * 全消去確認
         */
        clearConf:function(){
            var count = this.Todo.getIndex();

            if(toDool.busy){
                return false;
            }

            if(count === 0){//忘れるものがない
                this.Assistant.reset().setTalk('clear','empty')
                    .setTalk('waiting').talk();

                return false;
            }else{
                this.Assistant.reset().setTalk('clear','conf').talk();
                this.confirmPanel.setAttribute('data-effect', 'fadeIn');//確認出す
                this.confirmPanel.setAttribute('data-title', 'Clear Confirm');

                this.confirmPanel.setAttribute('data-action', 'clear');//アクションセット
                this.commandPanel.setAttribute('data-effect', 'fadeOut');//コマンド隠す
            }
        },

        /**
         * 全消し処理
         */
        clear:function(ans, id){

            if(toDool.busy){
                return false;
            }

            if(ans === "yes"){//する
                var count = this.Todo.getIndex();
                var that = this;

                this.Assistant.reset()
                    .setTalk('clear','before')
                    .setTalk('clear','after');

                this.Assistant.setTalk('waiting').talk();

                toDool.busy = setTimeout(function(){
                    that.Todo.clear();
                    toDool.busy = null;
                    toDool.todo = [];
                    that.container.empty();//画面に表示しているリストを削除
                    $('container').removeClass('showTodo');
                }, 5000);

                return this.confirm(null);

            }else{//そのほかの答え
                return this.confirm(ans);
            }
        },


        /**
         * ToDo削除確認
         * @param id
         */
        removeConf:function(param, id){

            this.container.getElement('#todoitem-' + id ).addClass('remove');

            this.Assistant.reset()
                .setTalk('remove', 'conf')
                .talk();

            this.confirmPanel.setAttribute('data-action', 'remove');
            this.confirmPanel.setAttribute('data-title', 'Remove Confirm');

            this.removeCheckedToDo.push(id);

            //TODO フォームとコマンドどちらも表示されている可能性がある。けど(ﾟεﾟ)ｷﾆｼﾅｲ!!
            //this.addFormPanel.getAttribute('data-effect');
            //this.commandPanel.getAttribute('data-effect');

            this.confirmPanel.setAttribute('data-effect', 'fadeIn');//確認出す
            this.commandPanel.setAttribute('data-effect', 'fadeOut');//コマンド隠す
            this.addFormPanel.setAttribute('data-effect', 'fadeOut');//フォーム隠す
        },

        /**
         * ToDo削除
         * IDはthis.removeCheckedToDoの中に配列で
         * @param {string} ans confirmの答え
         */
        remove: function(ans) {
            var data, l, i=0;

            var count = this.Todo.getIndex();
            var that = this;

            if(ans === "yes"){
                this.Assistant.reset()
                    .setTalk('remove','before').setTalk('remove','after')
                    .setTalk('waiting').talk();

                //いったん全データを取得
                data = this.Todo.getData();

                this.removeCheckedToDo.each(function(id){
                    //該当するデータを検索
                    for (l = data.length; i < l; i++) {
                        if (data[i].tid == id) {
                            data.splice(i,1);
                            break;
                        }
                    }
                });

                //データを保存
                this.Todo.setData(data);

                if(data.length === 0){
                    $('container').removeClass('showTodo');
                }

                //全部コンプしてたときの台詞
                if(this.Todo.isFullComplete()){
                    this.Assistant.setTalk('complete', 'fullcomp_random');
                }

                this.reflesh(true);

                return this.confirm(null);

            }else{

                return this.confirm(ans);
            }

        },


        /**
         * 確認
         * @param ans
         */
        confirm:function(ans){

            switch(ans){

                case 'no'://やめる
                    this.Assistant.reset().setTalk('confirm','cancel').setTalk('waiting').talk();
                    this.confirm(null);
                    return;
                    break;

                case 'well'://焦らす
                    toDool.wellCount++; //焦らしカウントアップ

                    if(toDool.wellCount > 3 || toDool.wellLimit){//仏の顔も３度までって言うじゃん？
                        return  this.clear('deny');

                    }else{
                        var data = this.Assistant.getTalk('confirm', 'well');
                        var last = data.getLast();
                        last.callback = function(){ toDool.welLimit = true; };
                        data.push(last);

                        this.Assistant.reset().setTalk(data).talk();
                    }

                    return;
                    break;

                case 'deny'://嫌がる
                    this.Assistant.reset().setTalk('confirm','deny').setTalk('waiting').talk();
                    this.confirm(null);
                    break;

                default:

                    this.commandPanel.setAttribute('data-effect', 'fadeIn');//コマンド出す
                    this.confirmPanel.setAttribute('data-effect', 'fadeOut');//確認隠す

                    break;
            }
        },

        /**
         * ToDoを変更するフォーム
         *
         */
        createChangeForm: function(  element ) {
            var that = this;
            var id = element.getAttribute('data-tid');
            var input = new Element('input', {'type': 'text',
                'value': element.get('text'),
                'id':'edit-todo-'+id,
                'data-tid':id,
                'class':'editTodoItem',
                'events':{
                    'keydown':function(e){
                        if(e.code === 13){
                            that.editEnter(null, this.getAttribute('data-tid'));
                        }
                    }
                }});

            element.empty().grab(input);
            input.focus();
            element.getParent().addClass('edit');
        },

        /**
         * ToDoを変更するフォーム隠す
         * @param id
         */
        hideChangeForm:function( id ){

            var todoitem = $('todoitem-' + id);
            var input = todoitem.getElement('.editTodoItem');
            todoitem.getElement('.todoTxtItem').set('html', input.value);
            todoitem.removeClass('edit');
        },

        /**
         * 編集
         * @param _ans
         * @param id
         */
        editEnter:function(_ans, id){
            var data= this.Todo.getData(Number(id));//データを取得
            var parent = $('todoitem-' + id);
            var editForm =  parent.getElement('.editTodoItem');
            var text = editForm.value;
            var check = this.Assistant.validation(text);

            this.Assistant.reset();

            if(check.length > 0){
                this.Assistant.setTalk('validation', check.shift())
                    .setTalk('edit', 'waiting')
                    .talk();
                this.editForm.value = '';
                return false;
            }

            data.txt = text;

            this.Assistant.setTalk('edit', 'execute_random').setTalk('waiting').talk();
            editForm.value = '';

            this.Todo.setData(data, Number(id));//保存

            this.reflesh(true);

        },

        /**
         * 編集キャンセル
         * @param _ans {undefined}
         * @param id {string}
         */
        editCancel:function(_ans, id){
            this.Assistant.reset().setTalk('edit','cancel').talk();
            this.hideChangeForm(id);
        }

    });

    win.toDool = toDool;
})(window, document.id);

(function(win, $){

    var toDool = win.toDool;

    var images = ['amazed', 'angry', 'bashful', 'cry', 'happy', 'joy', 'normal', 'sad', 'scornful', 'shy', 'surprise', 'trouble'];

    if(!!Browser.safari || !!Browser.chrome){

        images.each(function(img){
            new Image().src = 'http://webtecnote.com/jsdoit/todoll/img/jk/' + img + '.png';
        });

        win.addEvents({
            'domready' : function(){

                var Controller = new toDool.Controller({
                    assistantOptions:{
                        scenario:'./zqR4/js'
                    }
                });

                $('add-form').addEvent('submit', function(e){
                    e.stop();
                    Controller.addEnter();
                    return false;
                });

                /**
                 * ボタンクリックDelegate
                 * data-action="methodName" data-tid="todoId" data-param="parametor"
                 */
                document.addEvent('click:relay(button)', function(event, target){
                    event.preventDefault();
                    var action = target.getAttribute('data-action') || target.getParent().getAttribute('data-action');
                    var tid = target.getAttribute('data-tid') || target.getParent().getAttribute('data-tid'); //ToDoのID
                    var param = target.getAttribute('data-param');

                    if(!!Controller[action]){
                        if(param === 'well' &&  toDool.welLimit){
                            Controller[action]('deny');
                        }else{
                            Controller[action]( param, tid);
                        }
                    }

                });


            }

        });
    }else{

        window.addEvent('domready', function(){
            $('todoBox').destroy();
            $('assistant-voice').destroy();
            $('user').destroy();
            $('assistant').setAttribute('data-face', 'sad');
            $('container').grab(new Element('p', {'id':'no-support', 'text':'お使いのブラウザには対応していません'}));
        });
    }
})(window, document.id);