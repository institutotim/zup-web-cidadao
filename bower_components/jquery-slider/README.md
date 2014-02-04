>Copyright (c) 2013 Nancle from CAU CS101
>
>Licensed under the MIT License.
>
>version: 1.0
>
>经过IE6&IE6+，chrome，firefox测试兼容


*使用方法：{yourId}替换成你的id

	1. [ HTML ] 
        <div id="{yourId}">
             <div id="{yourId}_content_panel">
                 <div id="{yourId}_content">
                 </div>
             </div>
             <div id="{yourId}_bar_panel">
                 <div id="{yourId}_bar"></div>
             </div>
         </div>
         
    2.[ CSS ]  这些参数是必备的，另外的可以根据自己的需要添加
        #vscroll{ width:px; height:px; position:relative; overflow:hidden }
        #vscroll_content_panel{ width:px; height:px; position:absolute; top:0px; left:0px; overflow:hidden }
        #vscroll_content{ width:px;  position:absolute; top:0; left:0; }
        #vscroll_bar_panel{ width:px; height:px; background:#; position:absolute; top:px; left:px }
        #vscroll_bar{ width:px; height:px; background-color:#; position:absolute; top:px; left:px }
        
    3.[ JS ]
        <script type="text/javascript" src="lib/jquery-1.9.1.js"></script>
        <script type="text/javascript" src="lib/jquery.mousewheel.js"></script>
        <script type="text/javascript" src="jquery.slider.js"></script>
        
    4.调用
       $("#{yourId}").jScroll({
		'scroll_enable' : true,   //是否开启滚轮，默认开启
		'scroll_pace' : 35,      //滚轮每单位滚动的距离， 默认值是35
    	'scroll_id' : '{yourId}',//触发滚轮的id， 默认是主id，即上述html中第一个标签的id
    	'layout' : 'vertical' 	//布局方式：vertical(垂直) , horizon（水平）默认为垂直
        });		

*演示地址： [http://quchen.cau.edu.cn/jsDev/jquery-slider/](http://quchen.cau.edu.cn/jsDev/jquery-slider/ "jQuery-slider") .
