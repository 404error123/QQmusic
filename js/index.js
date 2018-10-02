$(document).ready(function(){
    $(".player_list").mCustomScrollbar({scrollInertia: 200});

    var musicLen,musicLeft,$musicLine,soundLen,soundLeft,$soundLine;
    var lrcLen;
    var musicArr = [];
    var lyricsTimeArr = [];
    var musicIndex = 0;
    var lycindex;
    var setTimer;  
    var time;  
    var currentTime;
    var oldTime;
    var str;
    var key = false; 
    var movekey; 
    var audio = $("audio")[0]; 
    var lycHeight = 34;
    audio.volume = 0.5; 
 
    eventListen();
    resize();
    getMusicList();
    // 加载歌曲列表
    function getMusicList(){
        $.ajax({
            url: "./source/music.json",
            dataType: "json",
            success: function(data){
                var $list = $(".song_list");
                $.each(data,function(index,ele){
                    var $musicItem = creatMusiclist(index,ele);
                    $list.append($musicItem);
                });
                auto(0);
                isIE();                
            },
            error: function(e){
                console.log(e);
            }
        });
    }
    // 产生歌曲列表
    function creatMusiclist(index,music){
        var $item = $("<li class='song'>"+
            "<i class='checkbox'></i>"+
            "<div class='number'>"+(index+1)+"</div>"+
                "<div class='song_name'>"+
                    "<span class='music_name'>"+music.name+"</span>"+
                "<div class='song_btn'>"+
                    "<i class='stop' title='播放'></i>"+
                    "<i class='add' title='添加到歌单'></i>"+
                    "<i class='down' title='下载'></i>"+
                    "<i class='share' title='分享'></i>"+
                "</div>"+
            "</div>"+
            "<div class='song_author'><a href=''>"+music.singer+"</a></div>"+
            "<div class='song_time'>"+
                "<span class='time_text'>"+music.time+"</span>"+
                "<i class='delete' title='删除'></i>"+
            "</div></li>");
        
        musicArr[index] = music;

        return $item;
    }
    // 初始状态
    function init(index){
        musicIndex = index;
        var mu_time = musicArr[index].time;
        audio.src = musicArr[index].music_url;
        $(".box_lyc").html("");
        $(".box_lyc").css("top","0px");
        getLrc(musicIndex);
        $(".text_name,.lyr_name").text(musicArr[index].name);
        $(".text_singer,.lyr_singer").text(musicArr[index].singer);
        $(".text_right").text(mu_time);
        $(".bg_player").css("background-image","url("+musicArr[index].cover+")");
        $(".singer_img").attr("src",musicArr[index].cover);
        $(".lyr_album").text(musicArr[index].album);
        time = getTime(mu_time,"music");   
    }
    // 开始播放
    function auto(index){
        init(index);
        musicStatus();
        audio.play();
        clearInterval(setTimer);
        setTimer = setInterval(autoFun,200);
    }
    function autoFun(){
        if(key) return;
        currentTime = audio.currentTime;   
        var newWidth = currentTime/time*musicLen;
        var resultTime =  formatTime();
        $musicLine.css("width",newWidth);
        $(".text_right").text(resultTime);
        lyricsTongbu();
        if(audio.ended){
            clearInterval(setTimer);
            $(".btn_next").trigger("click");
        }
    }

    // 加载歌词
    function getLrc(index){
        lycindex = 0;
        var diz =  musicArr[index].lrc_url;
        $.ajax({
            url: musicArr[index].lrc_url,
            dataType: "text",
            success: function(data){
                creatLrc(data);    
            },
            error: function(e){
                console.log(e);
            }
        });
    }
    // 产生歌词
    function creatLrc(data){
        var lrcTime = [],lrcArr=[];
        lrcArr = data.split("\n");
        $.each(lrcArr,function(index,lyrics){
            var $lrc = $("<li class=\"lys\">"+lyrics.split("]")[1]+"</li>");
            $(".box_lyc").append($lrc);
            lrcTime[index] = lyrics.split("]")[0].split("[")[1];
        })
        $.each(lrcTime,function(index,lrc){
            lyricsTimeArr[index] = getTime(lrc,"lrc"); 
        })
        lrcLen = lyricsTimeArr.length;
    }
    // 歌词同步
    function lyricsTongbu(){
        if(movekey){
            movekey=false;
            lycindex=0;
            for(;currentTime >= lyricsTimeArr[lycindex];){
                lycindex++;
            }
            lycindex--;
            if(lycindex<=5){
                $(".box_lyc").css("top","0px");
            }
        }    
        if(lycindex<lrcLen && currentTime >= lyricsTimeArr[lycindex]){
            $(".lys").eq(lycindex).addClass("on").siblings().removeClass("on");
            lycindex++;            
        }
        if(lycindex>5){
            var top = (lycindex-5)*lycHeight;
            $(".box_lyc").css("top",-top+"px");   
        }
    }
    // 获取歌曲歌词时间
    function getTime(sourse,type){
        var tim = sourse.split(":");
        if(type=="music"){
            var min = parseInt(tim[0]);
            var second = parseInt(tim[1]);
        }else if(type=="lrc"){
            var min = parseFloat(tim[0]);
            var second = parseFloat(tim[1]);
        }
        return min*60+second;
    }
    // 格式化歌曲时间
    function formatTime(){
        if(time!==oldTime){
            str = " / "+timeResult(time,1)+":"+timeResult(time,0);
            oldTime = time;
        }
        return timeResult(currentTime,1)+":"+timeResult(currentTime,0)+str;
    }
    function timeResult(t,type){
       var re = type ? parseInt(t/60) : parseInt(t%60);
        if(re>=0&&re<10){
            re = "0" + re;
        }
        return re;
    }
    // 同步播放时间
    function updateTime(results){
        currentTime = results*0.01*time; 
        var resultTime =  formatTime();
        $(".text_right").text(resultTime);
    }
    // 纠正进度条
    function resultFun(left,len,pageX){
        var result = (pageX-left)*100/len;
        if(result>=100){
            result = 100;
        }else if(result<=0){
            result = 0;
        }
        return result;
    }
    // 切换为播放状态
    function musicStatus(){
        $(".btn_stop").addClass("btn_start");        
        $(".stop").removeClass("start");
        $(".number").removeClass("number_bg");
        $(".stop").eq(musicIndex).addClass("start");
        $(".number").eq(musicIndex).addClass("number_bg");
        $(".song").eq(musicIndex).addClass("on").siblings().removeClass("on");
        $(".song_btn").removeClass("song_btn_show");
        $(".delete").removeClass("song_btn_show");
        $(".time_text").removeClass("text_hide");
    }
    //点击暂停按钮
    function clickStop(){
        if($(this).hasClass("btn_start") || $(".stop").eq(musicIndex).hasClass("start")){
            audio.pause(); 
            clearInterval(setTimer); 
            $(".btn_stop").removeClass("btn_start");
            $(".stop").eq(musicIndex).removeClass("start");        
            $(".number").eq(musicIndex).removeClass("number_bg");
            $(".song").eq(musicIndex).removeClass("on");
        }else{
            audio.play();
            setTimer = setInterval(autoFun,200);
            musicStatus();
        }
    }
    //进度条
    function progress(fn){
        $("body").css("user-select","none");
        $(document).mousemove(fn);
        $(document).one("mouseup",function(e){
            $(document).off("mousemove");
            $("body").css("user-select","text");            
            musicKey = "up";
            fn(e,musicKey);
        })
    }
    // 播放进度条
    function musicMove(e,musicKey){
        var oldWidth = $musicLine.width()/musicLen*100;        
        var pageX = e.pageX;            
        var results = resultFun(musicLeft,musicLen,pageX);
        if(results>oldWidth){
            movekey = 2;
        }else if(results<oldWidth){
            movekey = 1;
        }
        $musicLine.css("width",results+"%");
        updateTime(results);
        if(musicKey=="up"){
            audio.currentTime = results*0.01*time; 
            key = false;  
            musicKey = "";
        }
    }
    // 声音进度条
    function soundMove(e){
        var pageX = e.pageX;            
        var results = resultFun(soundLeft,soundLen,pageX);
        $soundLine.css("width",results+"%");
        audio.volume = results*0.01;
    }
    // 判断是否是IE
    function isIE() {
        if (!!window.ActiveXObject || "ActiveXObject" in window){
             $(".bg_player").css("opacity","0");
             console.log("你是IE用户，不支持filter: blur");
        }
    }
    //重新获取进度条数据
    function resize(){
        musicLen = $(".music_pogress .line").width();
        musicLeft = $(".music_pogress .line").offset().left;
        $musicLine = $(".music_pogress .bigline");
        soundLen = $(".music_sound .line").width();
        soundLeft = $(".music_sound .line").offset().left;
        $soundLine = $(".music_sound .bigline");
    }
    // 弹出框
    function popUp(ele,handler){
        ele.show();
        ele.find(".btn_confirm").click(function(){
            $(this).parents(".hid_tips").hide();
            if(handler){
                handler();
            }
        }) 
        ele.find(".btn_cancel").click(function(){
            $(this).parents(".hid_tips").hide();            
        })
        ele.find(".close-btn").click(function(){
            $(this).parents(".hid_tips").hide();
        })
    }
    // 重新给歌曲列表排数字
    function rePaintNumber(){
        var $list = $(".song_list .song");
        for(var i = 0, len = $list.length; i < len; i++){
            $list.eq(i).find(".number").text(i+1);
        }
    }
    // 列表为空，不能播放
    function listEmpty(){
        $(".btn_stop").click().off("click",clickStop);
        musicIndex = -100;
    }
    //事件注册
    function eventListen(){
        // 歌曲正在加载状态
        $(audio).on("waiting",function(){
            $(".loading").show();
        });
        $(audio).on("canplay",function(){
            $(".loading").hide();
        });
        // 全选
        $(".song_header_check .checkbox").on("click",function(){
            var $checkbox = $(".song .checkbox");        
            if($(this).hasClass("checkbox_bg")){
                $(this).removeClass("checkbox_bg");
                $checkbox.removeClass("checkbox_bg");
            }else{
                $(this).addClass("checkbox_bg");
                $checkbox.addClass("checkbox_bg");
            }
        });
        // 单选
        $(".song_list").on("click",".checkbox",function(){
            $(this).toggleClass("checkbox_bg");
        })
        // 歌曲列表中的按钮显示
        $(".song_list").on("click",".song_btn",function(){
            var $parents = $(this).parents(".song");
            $(this).addClass("song_btn_show");
            $parents.siblings().find(".song_btn").removeClass("song_btn_show");
            $parents.find(".delete").addClass("song_btn_show").siblings().find(".delete").removeClass("song_btn_show");
            $parents.find(".time_text").addClass("text_hide").siblings().find(".time_text").removeClass("text_hide");
        });
        // 歌曲列表中的暂停
        $(".song_list").on("click",".stop",function(){
            var no = $(this).index(".stop");
            if(no==musicIndex){
                clickStop();
            }else{
                musicIndex = no;
                auto(musicIndex);
            }
        });
        // 暂停
        $(".btn_stop").click(clickStop);
        // 下一首
        $(".btn_next").click(function(){
            if(musicIndex > -2){
                musicIndex++;
                if(musicIndex > musicArr.length-1){
                    musicIndex = 0;
                }
                auto(musicIndex);
            }
        });
        // 上一首
        $(".btn_prev").click(function(){
            if(musicIndex > -2){
                musicIndex--;
                if(musicIndex < 0){
                    musicIndex = musicArr.length-1;
                }
                auto(musicIndex);
            }
        });
        // 歌曲播放进度条
        $(".music_pogress .progress").mousedown(function(){
            key = true;        
            progress(musicMove);
        });
        // 声音进度条
        $(".music_sound .progress").mousedown(function(){
            progress(soundMove);
        });
        // 静音按钮
        $(".sound").click(function(){
            $(this).toggleClass("sound_no");
            if(audio.muted){
                audio.muted = false;
            }else{
                audio.muted = true; 
            }
        });
        // 删除音乐 列表中的删除
        $(".song_list").on("click",".delete",function(){
            var $song = $(this).parents(".song");
            var songIndex= $song.index();
            musicArr.splice(songIndex,1);
            $song.remove();
            rePaintNumber();
            if(songIndex == musicIndex){
                if(!(musicArr.length)){
                    listEmpty();
                }else{
                    musicIndex--;       
                    $(".btn_next").click();
                }
            }else{
                if(songIndex < musicIndex){
                    musicIndex--;
                }
            } 
        })
        // 顶部的删除
        $(".delete-btn").click(function(){
            var deleArr = $(".song_list .checkbox_bg").parents(".song");
            var length = deleArr.length;
            if(length){
                var current = $(".song.on").index();
                $(".tips-text").text("确定要删除歌曲？");
                popUp($(".clear_tips"),function(){
                    var dele = [];
                    for(var i=0; i<length; i++){
                        dele.push(deleArr.eq(i).index());
                        if(deleArr.eq(i).index() == current){
                            var key = true;
                        }
                    }
                    deleArr.remove();
                    if(length == musicArr.length){
                        listEmpty();
                        console.log("aa");
                    }else{
                        musicArr = musicArr.filter(function(item,index,musicArr){
                            return dele.indexOf(index) == -1;
                        })
                        rePaintNumber();
                        if(key){
                            musicIndex = -1;       
                            $(".btn_next").click();
                        }
                    }
                })
            }
        })
        //清空列表
        $(".player_buttom .clear_btn").click(function(){
            $(".tips-text").text("确定要清空列表？");            
            popUp($(".clear_tips"),function(){
                $(".song_list").empty();
                listEmpty();
            })
        });
        // 纯净模式
        $(".btn_off").click(function(){
            $(".main").toggleClass("concise");
            lycHeight = lycHeight==34 ? 58 :34;
        });
        // 下载歌曲
        $(".btn_down").click(function(){
            popUp($(".down_tips"));
        })
        $(".song_list").on("click",".down",function(){
            popUp($(".down_tips"));
        })
        $(".down_btn").click(function(){
            if($(".song_list .checkbox_bg").length){
                popUp($(".down_tips"));                
            }
        })
        // 没有选择歌曲时提示
        $(".player_buttom>span:not(:last)").click(function(){
            if($(".song_list .checkbox_bg").length==0){
                $(".tips-sm").fadeIn(500,function(){
                    setTimeout(function(){
                        $(".tips-sm").fadeOut(500)
                    },500)
                })
            }
        })
        //窗口变化重新获取进度条的长度
        $(window).on("resize",resize)
        // 进入页面，用户有操作后，取消静音
        $(document).one("mousemove",function(){
            audio.muted = false;
        });
    }
    
})