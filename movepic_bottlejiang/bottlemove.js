;(function ($, window, document, undefined) {
    var pluginName = 'bottle',      //插件名称
        defaults = {                //默认参数
        	'color':'yellow'
        };

    function Plugin(element, options) {
    	//缓存element,让原型链上的方法都可以访问
        this.element = element;     

        //默认属性和自定义熟悉合并处理
        this.options = $.extend({}, defaults, options);  

        //默认值
        this._defaults = defaults;
        this._name = pluginName;

		this.nameA = function(){
			console.log('nameA');
		};
		//获取滚动条高度
		this.scrTop = $(document).scrollTop();
		//获取视口宽度
		this.userWidth = document.documentElement.clientWidth || document.body.clientWidth;
		//右移后触摸结束后状态
		this.moveToRight = 0;
		//左移后触摸结束后状态
		this.moveToLeft = 0;
		//获取外边距离，过界相对模块高度取余操作需要
		this.juli = $('#bottleL').offset().top;
		//获取元素的高度，以便下面的移动计算
        this.positionL = '';
        this.positionT = '';
        // this.touchStar = '';
        this.touchStarX = '';
        this.touchStarY = '';

        this.beginMove = 0;
        this.between = 0;
        //标记
        this.flag = true;
		this.id = $(this.element).attr('id');
		// this.class = this.options.class;
		this.class = this.id == 'bottleR' ? 'bottleR' : 'bottleL' ;
		this.body = $( '#' + this.id + ' .' + this.class );
		this.bodyMargin = parseInt(this.body.css('margin-top')) + parseInt(this.body.css('margin-bottom'));
		this.bodyBorder = parseInt(this.body.css('border-top')) + parseInt(this.body.css('border-bottom'));
		this.bodyPadding = parseInt(this.body.css('padding-top')) + parseInt(this.body.css('padding-bottom'));

		this.bodyMarginH = parseInt(this.body.css('margin-left')) + parseInt(this.body.css('margin-right'));
		this.bodyBorderH = parseInt(this.body.css('border-left')) + parseInt(this.body.css('border-right'));
		this.bodyPaddingH = parseInt(this.body.css('padding-left')) + parseInt(this.body.css('padding-right'));
		//一个div的高度--height()不包括padding-border-margin
		this.bottleHeight = Math.ceil( this.body.height() + this.bodyMargin + this.bodyBorder + this.bodyPadding );
		this.bottleWidth = Math.ceil( this.body.width() + this.bodyMarginH + this.bodyBorderH + this.bodyPaddingH );

        //插件初始化（在里面可以做dom构造，事件绑定等操作）
        this.init(element);  
    }

    Plugin.prototype.init = function() {
    	// $(this.element).css(this.options);
    	$('#bottleL').children().addClass('bottleL');
    	$('#bottleR').children().addClass('bottleR');
    	this.touchEnd();
    };

    Plugin.prototype.unbindAll = function(){
    	$('.bottleL').unbind();
		$('.bottleR').unbind();
		$('#bottleL').bottle({'class':'bottleL'});
		$('#bottleR').bottle({'class':'bottleR'});
    };

    Plugin.prototype.fzFun = function(event) {
		switch (event.type) {
	        case 'touchstart':
	        case 'touchmove':
	        case 'touchend':
	        // case 'touchcancel':
          		return event.originalEvent.touches[0];
        	default:
         		return event;
      	}
    };

    Plugin.prototype.betweenLow = function(i){
    	return parseInt( (0.5 + i) * this.bottleHeight - 0.5 * i * this.bodyMargin );
    };

    Plugin.prototype.NextMoveCss = function(targer,i){
    	return $($(targer).nextAll()[i]).css({
			'top' : - parseInt(this.bottleHeight ) + 0.5 * this.bodyMargin + 'px' ,
			'transition':'top 0.5s,left 0.5s,z-index 0.5s'
		});
    };

    Plugin.prototype.PrevMoveCss = function(target,i){
    	return $($(target).prevAll()[i]).css({
			'top' : parseInt(this.bottleHeight ) - 0.5 * this.bodyMargin + 'px' ,
			'transition':'top 0.5s,left 0.5s,z-index 0.5s'
		});
    };

    Plugin.prototype.allBack = function(i){
    	var k;
    	return (function(){
    		for( k = 0; k < i.length ; k++){
				$(i[k]).css({'left':0,'top':0,'z-index':0,'transition':'z-index 0.5s'});
			}
    	})();
    };

    Plugin.prototype.allToBack = function(){
    	return (function(){
    		for( k = 0; k < $('.bottleL').length ; k++){
				$($('.bottleL')[k]).css({'left':0,'top':0,'z-index':0,'transition':'top 0s,left 0s,z-index 0.5s'});
			}
			for( k = 0; k < $('.bottleR').length ; k++){
				$($('.bottleR')[k]).css({'left':0,'top':0,'z-index':0,'transition':'top 0s,left 0s,z-index 0.5s'});
			}
    	})();
    };

    Plugin.prototype.allButTarget = function(Target){
    	return (function(){
    		$(Target).css({'left':0,'top':0,'z-index':0,'transition':'top 0.5s,left 0.5s,z-index 0.5s'});
    	})();
    };

    Plugin.prototype.over_Half_insert = function(mainClass,target){
    	var L_or_R_class,opposeClass,num;
    	L_or_R_class = mainClass == 'bottleR' ? 'bottleR' : 'bottleL';
    	opposeClass = L_or_R_class == 'bottleR' ? 'bottleL' : 'bottleR';
    	num = mainClass == 'bottleR' ? this.moveToRight : this.moveToLeft ;
    	return (function(){
    		if( num === 0){
				if ($('.'+L_or_R_class+'').length ===0) {
					$('#'+L_or_R_class+'').append($(target));
				} else {
					$($('.'+L_or_R_class+'')[0]).before($(target));
				}
				$(target).removeClass(opposeClass).addClass(L_or_R_class);
			} else {
				$($('.'+L_or_R_class+'')[num - 1]).after($(target));
				$(target).removeClass(opposeClass).addClass(L_or_R_class);
			}
    	})();

    };

    Plugin.prototype.touchStart = function() {
    	var _this = this;
    	_this.flag = true;
    	_this.moveToRight = 0;
    	_this.moveToLeft = 0;
    	var touchStarDom = this.body.each(function(index,element){
    		$(element).on('touchstart',function(e){
    			_this.between = null;
    			e.preventDefault();
		      	e.stopPropagation();
		    	_this.positionL = e.target.offsetLeft;
		    	_this.positionT = e.target.offsetTop;
		    	_this.beginMove = _this.positionT;
		    	// _this.touchStar = _this.fzFun(e);
		    	_this.touchStarX = _this.fzFun(e).pageX;
		    	_this.touchStarY = _this.fzFun(e).pageY;
		    	$(e.target).css({'z-index':10,'transition':'top 0s,left 0s'});
    		});
    	});

    	return touchStarDom;
    };

    Plugin.prototype.touchMove = function() {
    	var _this = this,k;
    	var touchMoveDom = this.touchStart().each(function(index,element){
    		$(element).on('touchmove',function(e){
    			e.preventDefault();
		      	e.stopPropagation();

    			if( (_this.fzFun(e).clientX < 0.5 * _this.userWidth && $(e.target).hasClass('bottleL')) || (_this.fzFun(e).clientX >= 0.5 * _this.userWidth && $(e.target).hasClass('bottleR')) ){

	    			var i,j,betweenLimit,betweenLimitH;
	    			_this.between = e.target.offsetTop - _this.beginMove;
	    			//next和prev的个数
	    			var NextNum = $(e.target).nextAll().length;
	    			var PrevNum = $(e.target).prevAll().length;
	    			var targetDom = '';
	    			var targetTime = '';
	    			if( _this.between >= 0 ){
	    				// targetDom = $(e.target).nextAll();
	    				// targetTime = NextNum;

		    			for( i = 0 ; i < NextNum ; i++){
		    				betweenLimit = _this.betweenLow(i);
		    				betweenLimitH = _this.betweenLow(i+1);

			    			if ( _this.between >= betweenLimit && _this.between < betweenLimitH ) {
			    				_this.NextMoveCss(e.target,i);
			    			} else if ( _this.between < betweenLimit ) {
			    				$($(e.target).nextAll()[i]).css({
			    					'top' : 0 
			    				});
			    			}
		    			}
	    			} else {
	    				// _this.between = -_this.between;
	    				// targetDom = $(e.target).prevAll();
	    				// targetTime = PrevNum;

		    			for( j = 0 ; j < PrevNum ; j++){
		    				betweenLimit = _this.betweenLow(j);
		    				betweenLimitH = _this.betweenLow(j+1);
			    			if ( -_this.between >= betweenLimit && -_this.between < betweenLimitH ) {
			    				_this.PrevMoveCss(e.target,j);
			    			} else if ( -_this.between < betweenLimit ) {
			    				$($(e.target).prevAll()[j]).css({
			    					'top' : 0 
			    				});
			    			}
		    			}
	    			}
	    			// for( i = 0 ; i < targetTime ; i++){
	    			// 	betweenLimit = _this.betweenLow(i);
	    			// 	betweenLimitH = _this.betweenLow(i+1);

		    		// 	if ( _this.between >= betweenLimit && _this.between < betweenLimitH ) {
		    		// 		if( _this.between >= 0 ){
		    		// 			_this.NextMoveCss(e.target,i);
		    		// 		} else {
		    		// 			_this.PrevMoveCss(e.target,j);
		    		// 		}
		    		// 	} else if ( _this.between < betweenLimit ) {
		    		// 		$(targetDom[i]).css({
		    		// 			'top' : 0 
		    		// 		});
		    		// 	}
	    			// }
	    			$(e.target).css({
						'left':_this.positionL + (Math.floor(_this.fzFun(e).pageX) - Math.floor(_this.touchStarX)),
						'top':(_this.fzFun(e).pageY - _this.touchStarY),
						'z-index':'10'
					});
					$('#num').text(_this.positionL + (_this.fzFun(e).pageX - _this.touchStarX));
					$('#num1').text(_this.fzFun(e).pageY - _this.touchStarY);
					$('#num2').text(Math.floor(_this.fzFun(e).pageX));
					$('#num3').text(Math.floor(_this.touchStarX));
    			} else {
    				if ( $(e.target).hasClass('bottleL') ) {
    					var rightNum = $('.bottleR').length;
    					var PrevNumMove = Math.ceil( ((_this.fzFun(e).clientY - _this.juli + $(document).scrollTop() - 0.5 * _this.bottleHeight)) / _this.bottleHeight );
    					PrevNumMove = PrevNumMove <=0 ? 0 : PrevNumMove;
    					PrevNumMove = PrevNumMove > rightNum ? rightNum : PrevNumMove; 
    					var NextNumMove = rightNum - PrevNumMove;
    					_this.moveToRight = PrevNumMove;

    					//next的一律后退，prev一律还原
						for (k = 0 ; k < NextNumMove ; k++ ){
    						$($('.bottleR')[PrevNumMove + k]).css({
    							'transition':'top 0.5s,left 0.5s,z-index 0.5s',
    							'top': _this.bottleHeight - 0.5 * _this.bodyMargin + 'px'
    						});
						}
						for (k = 0 ; k < PrevNumMove ; k++ ){
    						$($('.bottleR')[k]).css({
    							'transition':'top 0.5s,left 0.5s,z-index 0.5s',
    							'top': 0
    						});
						}

	    				$(e.target).css({
							'left':_this.positionL + (_this.fzFun(e).clientX - _this.touchStarX),
							'top':(_this.fzFun(e).clientY - _this.touchStarY + $(document).scrollTop()),
							'z-index':'10'
						});

    				} else if ( $(e.target).hasClass('bottleR') ) {
    					var leftNum = $('.bottleL').length;
    					
    					var PrevNumMoveToleft = Math.ceil( ((_this.fzFun(e).clientY - _this.juli + $(document).scrollTop() - 0.5 * _this.bottleHeight)) / _this.bottleHeight );
    					PrevNumMoveToleft = PrevNumMoveToleft <=0 ? 0 : PrevNumMoveToleft;
    					PrevNumMoveToleft = PrevNumMoveToleft > leftNum ? leftNum : PrevNumMoveToleft; 
    					var NextNumMoveToleft = leftNum - PrevNumMoveToleft;
    					_this.moveToLeft = PrevNumMoveToleft;

    					//next的一律后退，prev一律还原
						for (k = 0 ; k < NextNumMoveToleft ; k++ ){
    						$($('.bottleL')[PrevNumMoveToleft + k]).css({
    							'transition':'top 0.5s,left 0.5s,z-index 0.5s',
    							'top': _this.bottleHeight - 0.5 * _this.bodyMargin + 'px'
    						});
						}
						for (k = 0 ; k < PrevNumMoveToleft ; k++ ){
    						$($('.bottleL')[k]).css({
    							'transition':'top 0.5s,left 0.5s,z-index 0.5s',
    							'top': 0
    						});
						}

	    				$(e.target).css({
							'left':_this.positionL + (_this.fzFun(e).clientX - _this.touchStarX),
							'top':(_this.fzFun(e).clientY - _this.touchStarY + $(document).scrollTop()),
							'z-index':'10'
						});
    				}
    			}

    		});
    	});

    	return touchMoveDom;
    };

    Plugin.prototype.touchEnd = function() {
    	var _this = this;
    	var i,k,betweenLow,betweenHight,endTop;
    	var touchEndDom = this.touchMove().each(function(index,element){
    		$(element).on('touchend',function(e){
    			if( (e.originalEvent.changedTouches[0].clientX < 0.5 * _this.userWidth && $(e.target).hasClass('bottleL')) || (e.originalEvent.changedTouches[0].clientX >= 0.5 * _this.userWidth && $(e.target).hasClass('bottleR')) ){
	    			//next和prev的个数
	    			var NextNum = $(e.target).nextAll().length;
	    			var PrevNum = $(e.target).prevAll().length;
	    			if( _this.between >= 0 ){
	    				_this.flag = true;
	    				for( i = 0 ; i < NextNum ; i++){
		    				betweenLow = _this.betweenLow(i);
		    				betweenHight = _this.betweenLow(i+1);
			    			if( _this.between >= betweenLow && _this.between < betweenHight ){
		    					_this.allToBack();
		    					_this.allButTarget(e.target);
			    				$($(e.target).nextAll()[i]).after($(e.target));
			    				_this.between = null;

		    					_this.flag = false;
			    				break;

			    			//写在for里面是起不了作用的，因为比如最后一个的next为0，根本不会进来for
			    			//拖动的距离不足以替换
			    			} else if ( _this.between < betweenLow ){
			    				_this.allButTarget(e.target);
			    				_this.flag = false;
			    				break;
			    			}
			    		}
			    		//除了for循环的其他情况：1=拖动距离太小不足以变换【折回】，2=拖动距离非常大排最后【插入】
		    			if(_this.flag){
		    				if( Math.abs(_this.between) < (parseInt( 0.5 * _this.bottleHeight)) ){
	    						_this.allButTarget(e.target);
		    				} else if ( _this.between ) {
		    					_this.allToBack();
		    					_this.allButTarget(e.target);
		    					var lastid = $(e.target).hasClass('bottleL') ? 'bottleL' : 'bottleR' ;
			    				$('#'+lastid).append($(e.target));
			    				_this.between = null;
		    				}
		    			}
	    			} else if (_this.between < 0) {
	    				_this.flag = true;
	    				for( i = 0 ; i < PrevNum ; i++){
		    				betweenLow = _this.betweenLow(i);
		    				betweenHight = _this.betweenLow(i+1);
			    			if( -_this.between >= betweenLow && -_this.between < betweenHight ){
		    					_this.allToBack();
		    					_this.allButTarget(e.target);
			    				$($(e.target).prevAll()[i]).before($(e.target));
			    				_this.between = null;
		    					_this.flag = false;
			    				break;
			    			} else if ( -_this.between < betweenLow ){
			    				_this.allButTarget(e.target);
		    					_this.flag = false;
			    				break;
			    			}
			    		}
		    			if(_this.flag){
		    				if( -_this.between < parseInt( 0.5 * _this.bottleHeight ) ){
	    						_this.allButTarget(e.target);
		    				} else if ( -_this.between ) {
		    					_this.allToBack();
		    					_this.allButTarget(e.target);
			    				var lastidup = $(e.target).hasClass('bottleL') ? 'bottleL' : 'bottleR' ;
			    				$('#'+lastidup).prepend($(e.target));
			    				_this.between = null;
		    				}
		    			}
	    			}
	    		//超过中线就插在右边 bottleLeft
    			} else {
    				if ( $(e.target).hasClass('bottleL') ) {
    					_this.allToBack();
    					_this.allButTarget(e.target);
    					_this.over_Half_insert('bottleR',e.target);
    				} else if ( $(e.target).hasClass('bottleR') ) {
    					_this.allToBack();
    					_this.allButTarget(e.target);
    					_this.over_Half_insert('bottleL',e.target);
    				}
    			}
    		});
    	});

    	return touchEndDom;
    };

    //测试
    Plugin.prototype.name = function(op) {
    	console.log(op);
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            //将实例化后的插件暂存，避免重复渲染
            if (!$.data(this, 'plugin_' + pluginName)) {
            	// console.log('in');
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);