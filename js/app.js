(function(win, $) {

	var toDoll = win.toDoll;
	toDoll.enable = false;

	var images = ['amazed', 'angry', 'bashful', 'cry', 'happy', 'joy', 'normal', 'sad', 'scornful', 'shy', 'surprise', 'trouble'];

	console.log('window size...' + window.innerWidth + 'px / ' + window.innerHeight + 'px');

	window.addEvents({
		'load' : function() {
			document.body.addClass(Browser.name);
		},
		'domready' : function() {
			if(supportCheck()) {
				$('support-check-result').empty();
				execute();
			}
		},
		'resize' : function() {
			if(supportCheck()) {
				$('support-check-result').empty();
				
				if(!toDoll.enable) {
					execute();
				}
			}
		}
	});

	function supportCheck() {

		if(!!!Browser.safari && !!!Browser.chrome) {
			$('container').addClass('supportCheckAlert');
			$('support-check-result').set('html', 'Chrome または Safari でご覧下さい');
			
			if(!toDoll.enable) {
				$('todoBox').addClass('hide');
				$('user').addClass('hide');
				$('container')
				$('assistant-speech-baloon').set('text', '対応してないんだって');
			}

			return false;
		}
		
		if(window.innerWidth < 800 || window.innerHeight < 500) {
			$('container').addClass('supportCheckAlert');
			
			$('support-check-result').set('html', '横800px　縦500px以上の広さが必要です。<br>（900 x 500px以上推奨）');

			if(!toDoll.enable) {
				$('todoBox').addClass('hide');
				$('user').addClass('hide');
				$('container')
				$('assistant-speech-baloon').set('text', 'もうちょっと離れてくれる？');
			}

			return false;

		}
		
		$('container').removeClass('supportCheckAlert');
		
		return true;

	};

	function execute() {

		toDoll.enable = true;
		$('container').addClass('enable');
		
		$('todoBox').removeClass('hide');
		$('user').removeClass('hide');

		images.each(function(img) {
			new Image().src = 'http://webtecnote.com/jsdoit/todoll/img/jk/' + img + '.png';
		});

		win.addEvents({
			'domready' : function() {

				var Controller = new toDoll.Controller();

				$('add-form').addEvent('submit', function(e) {
					e.stop();
					Controller.addEnter();
					return false;
				});
				/**
				 * ボタンクリックDelegate
				 * data-action="methodName" data-tid="todoId" data-param="parametor"
				 */
				document.addEvent('click:relay(button)', function(event, target) {
					event.preventDefault();
					var action = target.getAttribute('data-action') || target.getParent().getAttribute('data-action');
					var tid = target.getAttribute('data-tid') || target.getParent().getAttribute('data-tid');
					//ToDoのID
					var param = target.getAttribute('data-param');

					if(!!Controller[action]) {
						if(param === 'well' && toDoll.welLimit) {
							Controller[action]('deny');
						} else {
							Controller[action](param, tid);
						}
					}

				});
			}
		});
	}

})(window, document.id);
