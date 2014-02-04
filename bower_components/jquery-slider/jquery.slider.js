/*! Copyright (c) 2013 Nancle from CAU CS101
 * Licensed under the MIT License.
 *
 * copyright: Nancle from CAU CS 101
 *	 version: 1.0
 *
 * 设计思路： 利用mousedown mousenup mousenmove三个函数来模仿拖拽效果。一个全局变量if_mouse_down
 *  	    用于判断是否按下鼠标左键。滑块位置与滑块最大滚动距离的比值，等于内容块位置与内容块的高度
 */
;(function($){
	
	$.fn.jScroll = function(options){
		var defaul_options = {
			'scroll_enable' : true,
			'scroll_pace' : 35,
			'layout' : 'vertical',
			'scroll_id' : this.attr('id')
		}
		options = $.extend(defaul_options, options);
		
		var id = this.attr("id");
		var if_mouse_down = false; //全局变量，记录鼠标是按下还是松开
		var $content = $("#" + id +"_content"); //滚动内容
		var $content_panel = $("#" + id +"_content_panel"); //滚动内容容器
		var $bar = $("#" + id + "_bar");		//滚动条
		var $bar_panel = $("#" + id + "_bar_panel");
		var $document = $(document);		
		var $ontent_panel = $("#" + id + "_content_panel");
		var $scroll = $("#" + id);
		
		
		var cursor_top;					//用于记录点击鼠标左键或者放开鼠标左键时候光标位置
		var cursor_left;
		var cursor_top_moved;			//用于记录移动鼠标后光标位
		var cursor_left_moved;
		var bar_top = 0;				//用于记录滑块的位置置
		var bar_left = 0;
		var bar_height = $bar.outerHeight();
		var bar_width = $bar.outerWidth();
		var bar_panel_height = $bar_panel.outerHeight();
		var bar_panel_width = $bar_panel.outerWidth(); 
		var max_height = bar_panel_height - bar_height;		//滑动块最大的滑动距
		var max_width = bar_panel_width - bar_width;
		var content_width = $content.outerWidth();
		var content_height = $content.outerHeight();
		var content_panel_height = $content_panel.outerHeight();
		var content_panel_width = $content_panel.outerWidth();
		$bar.mousedown(function(e){
			
			if_mouse_down = true;
			cursor_top = e.pageY;
			cursor_left = e.pageX;
			e.preventDefault(); //阻止默认事件发生：取消单击，就不会触发"选中文本"事件（否则会影响操作） 
		});
		
		$document.mouseup(function(e){
			if_mouse_down = false;
			bar_top = $bar.position().top;		//记录鼠标松开时滑块位置
			bar_left = $bar.position().left;
		});
		
		//垂直滚动条
		if( options['layout'] == 'vertical'){
			$document.mousemove(function(e){
				if(if_mouse_down == true){
					cursor_top_moved = e.pageY;
					var cursor_offset = cursor_top_moved - cursor_top;		//光标移动的距离
					var current_top = bar_top + cursor_offset; 				//滑块的距离
					//若滑块超出滑块容器，修改他的位置为容器边界值
					if(current_top < 0){
						current_top = 0;
					}else if( current_top > max_height){
						current_top = max_height;
					}
					$bar.css("top", current_top);						//滑块移动
					var content_offset = (content_height - content_panel_height) * ( current_top / max_height);	//计算内容滚动的距离
					$content.css("top",  - content_offset); 
					
				}
			});
			
			$("#" + options['scroll_id']).bind('mousewheel', function(e, delta){
				if(delta > 0){
					bar_top -= options['scroll_pace'];
					//若滑块超出滑块容器，修改他的位置为容器边界值
					if(bar_top < 0){
						bar_top = 0;
					}
				}else if(delta < 0){
					bar_top += options['scroll_pace'];
					//若滑块超出滑块容器，修改他的位置为容器边界值
					if(bar_top > max_height){
						bar_top = max_height
					}
				}
				$bar.stop().animate({"top":bar_top}, 500);
				var content_top = (content_height - content_panel_height) * ( bar_top / max_height);	//计算内容滚动的距离
				$content.stop().animate({"top": -content_top});
				e.preventDefault();        //阻止默认事件，防止整体页面跟着滚动 
			})		
		}
	
		//水平滚动条
		if(options['layout'] == 'horizon'){
			$document.mousemove(function(e){
				if(if_mouse_down == true){
					cursor_left_moved = e.pageX;
					var cursor_offset = cursor_left_moved - cursor_left;		//光标移动的距离
					var current_left = bar_left + cursor_offset; 				//滑块的距离
					//若滑块超出滑块容器，修改他的位置为容器边界值
					if(current_left < 0){
						current_left = 0;
					}else if( current_left > max_width){
						current_left = max_width;
					}
					$("#test").html(bar_left + "$bar.offset().left:" + $bar.offset().left);
					$bar.css("left", current_left);						//滑块移动
					var content_offset = (content_width - content_panel_width) * ( current_left / max_width);	//计算内容滚动的距离
					$content.css("left",  - content_offset); 
					
				}
			});
			
			$("#" + options['scroll_id']).bind('mousewheel', function(e, delta){
				if(delta > 0){
					bar_left -= options['scroll_pace'];
					//若滑块超出滑块容器，修改他的位置为容器边界值
					if(bar_left < 0){
						bar_left = 0;
					}
				}else if(delta < 0){
					bar_left += options['scroll_pace'];
					//若滑块超出滑块容器，修改他的位置为容器边界值
					if(bar_left > max_width){
						bar_left = max_width
					}
				}
				$bar.stop().animate({"left":bar_left}, 500);
				var content_left = (content_width - content_panel_width) * ( bar_left / max_width);	//计算内容滚动的距离
				$content.stop().animate({"left": -content_left});
				e.preventDefault();        //阻止默认事件，防止整体页面跟着滚动 
			})	
		}
		
		
		
		if(!options['scroll_enable']){
			$("#" + options['scroll_id']).unmousewheel();
		}

	}
})(jQuery);