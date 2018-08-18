$(document).ready(function(){
    $(".player_list").mCustomScrollbar();

    var musicLen = $(".music_pogress .line").width();
    var musicLeft = $(".music_pogress .line").offset().left;
    var $musicLine = $(".music_pogress .bigline");
    var soundLen = $(".music_sound .line").width();
    var soundLeft = $(".music_sound .line").offset().left;
    var $soundLine = $(".music_sound .bigline");
    var lrcLen;
    var musicArr = [];
    var lrcArr = [];
    var lyricsTimeArr = [];
    var musicIndex = 0;
    var lycindex;
    var audio = $("audio")[0]; 
    var setTimer;  
    var time;  
    var musicKey;
    var key = false; 
    var movekey; 
    audio.volume = 0.5; 

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
                init(0);
                isIE();                
            },
            error: function(e){
                console.log(e);
            }
        });
    }
    // 产生歌曲列表
    function creatMusiclist(index,music){
        var $item = $("<li class=\"song\">"+
            "<i class=\"checkbox\"></i>"+
            "<div class=\"number\">"+(index+1)+"</div>"+
            "<div class=\"song_name\">"+
            "<span class=\"music_name\">"+music.name+"</span>"+
             "<div class=\"song_btn\"><i class=\"stop\"></i><i class=\"add\"></i><i class=\"down\"></i><i class=\"share\"></i></div></div>"+
            "<div class=\"song_author\"><a href=\"\">"+music.singer+"</a></div>"+
             "<div class=\"song_time\"><span class=\"time_text\">"+music.time+"</span><i class=\"delete\"></i></div></li>")
        
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
        time = getTime(mu_time);        
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
        var currentTime = audio.currentTime;       
        var newWidth = currentTime/time*musicLen;
        var resultTime =  formatTime(time,currentTime);
        $musicLine.css("width",newWidth);
        $(".text_right").text(resultTime);
        lyricsTongbu(currentTime);
        if(audio.ended){
            clearInterval(setTimer);
            // auto(musicIndex);
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
                lyricsTongbu();
            },
            error: function(e){
                console.log(e);
            }
        });
    }
    // 产生歌词
    function creatLrc(data){
        var lrcTime = [];        
        lrcArr = data.split("\n");
        $.each(lrcArr,function(index,lyrics){
            var $lrc = $("<li class=\"lys\">"+lyrics.split("]")[1]+"</li>");
            $(".box_lyc").append($lrc);
            lrcTime[index] = lyrics.split("]")[0].split("[")[1];
        })
        $.each(lrcTime,function(index,lrc){
            lyricsTimeArr[index] = formatLrc(lrc); 
        })
        lrcLen = lyricsTimeArr.length;
    }
    // 歌词同步
    function lyricsTongbu(currentTime){
        if(currentTime > lyricsTimeArr[lycindex]){
            lycindex++;
            if(movekey==2){
                lycindex=0;
                for(var i=0;currentTime > lyricsTimeArr[i];i++){
                    lycindex++;
                }
            }
            if(lycindex<lrcLen-1){
                $(".lys").eq(lycindex-1).addClass("on").siblings().removeClass("on");
            }
        }
        if(movekey==1){
            movekey=0;
            lycindex=0;
            for(var i=0;currentTime > lyricsTimeArr[i];i++){
                lycindex++;
            }
            $(".lys").eq(lycindex-1).addClass("on").siblings().removeClass("on");
            if(lycindex<=5){
                $(".box_lyc").css("top","0px");
            }
        }
        if(lycindex>5){
            var top = (lycindex-5)*34;
            $(".box_lyc").css("top",-top+"px");
        }
    }
    // 格式化歌词时间
    function formatLrc(lrc){
        var tim = lrc.split(":");
        var min = parseFloat(tim[0]);
        var second = parseFloat(tim[1]);
        return min*60+second;
    }
    // 切换状态
    function musicStatus(){
        $(".btn_stop").addClass("btn_start");        
        $(".stop").removeClass("start");
        $(".number").removeClass("number_bg");
        $(".stop").eq(musicIndex).addClass("start");
        $(".number").eq(musicIndex).addClass("number_bg");
        $(".song").eq(musicIndex).addClass("on").siblings().removeClass("on");
        $(".song_btn").removeClass("song_btn_show");
    }
    // 获取歌曲时间
    function getTime(mu_time){
        var tim = mu_time.split(":");
        var min = parseInt(tim[0]);
        var second = parseInt(tim[1]);
        return min*60+second;
    }
    // 格式化歌曲时间
    function formatTime(time,currentTime){
        var min = parseInt(time/60);
        var second = parseInt(time%60);
        var min2 = parseInt(currentTime/60);
        var second2 = parseInt(currentTime%60);
        if(min>=0&&min<10){
            min = "0" + min;
        }
        if(min2>=0&&min2<10){
            min2 = "0" + min2;
        }
        if(second>=0&&second<10){
            second = "0" + second;
        }
        if(second2>=0&&second2<10){
            second2 = "0" + second2;
        }
        return min2+":"+second2+" / "+min+":"+second;
    }
    // 同步播放时间
    function updateTime(results){
        var currentTime = results*0.01*time; 
        var resultTime =  formatTime(time,currentTime);        
        $(".text_right").text(resultTime);
    }
    // 歌曲播放是否结束
    function resultFun(left,len,pageX){
        var result = (pageX-left)*100/len;
        if(result>=100){
            result = 100;
        }if(result<=0){
            result = 0;
        }
        return result;
    }
    // 播放进度条
    function musicMove(e){
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
            $("body").css("user-select","text");
            audio.currentTime = results*0.01*time; 
            key = false;  
            musicKey = ""; 
            // console.log(results);
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
            if($(this).hasClass("start")){
                $(".btn_stop").removeClass("btn_start");
                audio.pause();   
                clearInterval(setTimer);
            }else{
                $(".btn_stop").addClass("btn_start");
                audio.play();
                setTimer = setInterval(autoFun,200);
            }          
            $(this).toggleClass("start");  
            var $parents =  $(this).parents(".song");        
            $parents.siblings().find(".stop").removeClass("start");
            $parents.toggleClass("on");
            $parents.siblings().find(".number").removeClass("number_bg");
            $parents.find(".number").toggleClass("number_bg");
        }else{
            musicIndex = no;
            auto(musicIndex);
        }
    });
    // 暂停
    $(".btn_stop").click(function(){

        if(!$(this).hasClass("btn_start")){
            audio.play();
            setTimer = setInterval(autoFun,200);
            musicStatus();
        }else{
            $(this).removeClass("btn_start");            
            audio.pause();   
            clearInterval(setTimer); 
            $(".stop").removeClass("start");
            $(".number").removeClass("number_bg");
            $(".song").removeClass("on");
        } 
    });
    // 下一首
    $(".btn_next").click(function(){
        musicIndex++;
        if(musicIndex > musicArr.length-1){
            musicIndex = 0;
        }
        auto(musicIndex);
    });
    // 上一首
    $(".btn_prev").click(function(){
        musicIndex--;
        if(musicIndex < 0){
            musicIndex = musicArr.length-1;
        }
        auto(musicIndex);
    });

    // 歌曲播放进度条
    $(".music_pogress .progress").mousedown(function(){
        key = true;        
        $("body").css("user-select","none");
        $(document).mousemove(musicMove);
        $(document).one("mouseup",function(e){
            $(document).off("mousemove");
            musicKey = "up";
            musicMove(e);
        })
    });
    // 声音进度条
    $(".music_sound .progress").mousedown(function(){
        $("body").css("user-select","none"); 
        $(document).mousemove(soundMove)
        $(document).one("mouseup",function(e){
            $(document).off("mousemove");
            $("body").css("user-select","text");
            soundMove(e);
        })
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

})