(function(win, $){
	var toDoll = win.toDoll || {};
	
    toDoll.todo = [];

    toDoll.wellCount = 0;//焦らしカウンタ
    toDoll.welLimit = false;//焦らしフラグ
    toDoll.busy = null; //（タイマー的な）処理中で忙しいんですフラグ

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
	toDoll.Controller = new Class({
		Implements:[Options, Events],

		options:{
		    todoOptions:{},
		    assistantOptions:{}
		},

		//
		initialize:function(option){
			this.setOptions(option);

			this.Assistant = new toDoll.Assistant(this.options.assistantOptions);
            this.options.todoOptions['max'] = this.Assistant.maxTaskLen;
            this.Todo = new toDoll.ToDo(this.options.todoOptions);

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

                    if(!toDoll.busy){
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
            toDoll.todo = [];

            //全ToDoデータを画面から削除
            if(opt_append){
                this.container.empty();
            }

            for (var i = 0, l = data.length; i < l; i++) {

                element = this._createTodoHTML(data[i]);

                toDoll.todo.push(element);

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

            toDoll.busy = true;

            var talk = [];
            for (var i = 0, l = data.length; i < l; i++) {
                talk.push({
                    'text': data[i].txt,
                    face:'happy',
                    'delay':data[i].txt.length * 300,
                    callback:function(){
                        $('container').addClass('showTodo');
                        $('todo').grab(toDoll.todo.shift());
                    }
                });
            }

            afterWords = this.Assistant.getTalk('check','after');
            afterWords.getLast().callback = function(){
                toDoll.busy = null;
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

            if(toDoll.busy){
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

            if(toDoll.busy){
                return false;
            }

            if(ans === "yes"){//する
                var count = this.Todo.getIndex();
                var that = this;

                this.Assistant.reset()
                    .setTalk('clear','before')
                    .setTalk('clear','after');

                this.Assistant.setTalk('waiting').talk();

                toDoll.busy = setTimeout(function(){
                    that.Todo.clear();
                    toDoll.busy = null;
                    toDoll.todo = [];
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
         * ToDo削除処理
         */
        removeToDo:function(data){
        	var l, i=0;
        	
        	if(!this.removeCheckedToDo.length){
        		return data;
        	}
        	
        	var id = this.removeCheckedToDo.shift();
               		
           //該当するデータを検索
           for (l = data.length; i < l; i++) {
               if (data[i].tid == id) {
                    data.splice(i,1);
               		return this.removeToDo(data);
               }
           }
        	
        },
        

       /**
        * ToDo削除
        * IDはthis.removeCheckedToDoの中に配列で
        * @param {string} ans confirmの答え
        */
        remove: function(ans) {
           var data;
           var count = this.Todo.getIndex();
           var that = this;
           
           if(ans === "yes"){
               this.Assistant.reset()
                   .setTalk('remove','before').setTalk('remove','after')
                   .setTalk('waiting').talk();

               data = this.removeToDo(this.Todo.getData());
               
               //データを保存
               this.Todo.setData(data);
               this.removeCheckedToDo = [];

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
                    toDoll.wellCount++; //焦らしカウントアップ

                    if(toDoll.wellCount > 3 || toDoll.wellLimit){//仏の顔も３度までって言うじゃん？
                        return  this.clear('deny');

                    }else{
                        var data = this.Assistant.getTalk('confirm', 'well');
                        var last = data.getLast();
                        last.callback = function(){ toDoll.welLimit = true; };
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

	win.toDoll = toDoll;
})(window, document.id);
