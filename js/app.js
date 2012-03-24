(function(win, $){

    var toDool = win.toDool;
    
    var images = ['amazed', 'angry', 'bashful', 'cry', 'happy', 'joy', 'normal', 'sad', 'scornful', 'shy', 'surprise', 'trouble'];

    if(!!Browser.safari || !!Browser.chrome){

        images.each(function(img){
            new Image().src = 'http://webtecnote.com/jsdoit/todoll/img/jk/' + img + '.png';
        });

        win.addEvents({
            'domready' : function(){

                var Controller = new toDool.Controller();

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