$(document).ready(function(){
    $(".player_list").mCustomScrollbar();

    var musicLen = $(".music_pogress .line").width();
    var musicLeft = $(".music_pogress .line").offset().left;
    var $musicLine = $(".music_pogress .bigline");
    var soundLen = $(".music_sound .line").width();
    var soundLeft = $(".music_sound .line").offset().left;
    var $soundLine = $(".music_sound .bigline");

    // var oldWidth;
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
            },
            error: function(e){
                console.log(e);
            }
        });
    }

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
                $(".lys").eq(lycindex-1).siblings().removeClass("on");
                $(".lys").eq(lycindex-1).addClass("on");
            }
        }
        if(movekey==1){
            movekey=0;
            lycindex=0;
            for(var i=0;currentTime > lyricsTimeArr[i];i++){
                lycindex++;
            }
            $(".lys").eq(lycindex-1).siblings().removeClass("on");
            $(".lys").eq(lycindex-1).addClass("on");
            if(lycindex<=5){
                $(".box_lyc").css("top","0px");
            }
        }
        if(lycindex>5){
            var top = (lycindex-5)*34;
            $(".box_lyc").css("top",-top+"px");
        }
    }

    function formatLrc(lrc){
        var tim = lrc.split(":");
        var min = parseFloat(tim[0]);
        var second = parseFloat(tim[1]);
        return min*60+second;
    }

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

    $(".song_list").delegate(".checkbox","click",function(){
        $(this).toggleClass("checkbox_bg");
    })

    $(".song_list").delegate(".song_btn","click",function(){
        $(this).parents(".song").siblings().find(".song_btn").removeClass("song_btn_show");
        $(this).parents(".song").siblings().find(".delete").removeClass("song_btn_show");
        $(this).parents(".song").siblings().find(".time_text").removeClass("text_hide");
        $(this).addClass("song_btn_show");
        $(this).parents(".song").find(".delete").addClass("song_btn_show");
        $(this).parents(".song").find(".time_text").addClass("text_hide");
    });

    $(".song_list").delegate(".stop","click",function(){
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
            $(this).parents(".song").siblings().find(".stop").removeClass("start");
            $(this).toggleClass("start");
            $(this).parents(".song").siblings().find(".number").removeClass("number_bg");
            $(this).parents(".song").find(".number").toggleClass("number_bg");
        }else{
            musicIndex = no;
            auto(musicIndex);
            musicStatus();
        }
    });

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
        } 
    });
    $(".btn_next").click(function(){
        musicIndex++;
        if(musicIndex > musicArr.length-1){
            musicIndex = 0;
        }
        auto(musicIndex);
        musicStatus();
    });
    $(".btn_prev").click(function(){
        musicIndex--;
        if(musicIndex < 0){
            musicIndex = musicArr.length-1;
        }
        auto(musicIndex);
        musicStatus();
    });

    function musicStatus(){
        $(".btn_stop").addClass("btn_start");        
        $(".stop").removeClass("start");
        $(".number").removeClass("number_bg");
        $(".stop").eq(musicIndex).addClass("start");
        $(".number").eq(musicIndex).addClass("number_bg");
    }

    function auto(index){
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
        // $(".lyr_name").text(musicArr[index].name);
        // $(".lyr_singer").text(musicArr[index].singer);
        $(".lyr_album").text(musicArr[index].album);
        $(".stop").eq(index).addClass("start");
        $(".number").eq(index).addClass("number_bg");
        time = getTime(mu_time);
        audio.play();
        clearInterval(setTimer);
        setTimer = setInterval(autoFun,200);
    }

    function getTime(mu_time){
        var tim = mu_time.split(":");
        var min = parseInt(tim[0]);
        var second = parseInt(tim[1]);
        return min*60+second;
    }
    function changeMusic(){
        audio.pause();
        playMusic(index);
        audio.currentTime = 0;
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
    function updateTime(results){
        var currentTime = results*0.01*time; 
        var resultTime =  formatTime(time,currentTime);        
        $(".text_right").text(resultTime);
    }
    function resultFun(left,len,pageX){
        var result = (pageX-left)*100/len;
        if(result>=100){
            result = 100;
        }if(result<=0){
            result = 0;
        }
        return result;
    }

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

    $(".music_sound .progress").mousedown(function(){
        $("body").css("user-select","none"); 
        $(document).mousemove(soundMove)
        $(document).one("mouseup",function(e){
            $(document).off("mousemove");
            $("body").css("user-select","text");
            soundMove(e);
        })
    });
    
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
    function soundMove(e){
        var pageX = e.pageX;            
        var results = resultFun(soundLeft,soundLen,pageX);
        $soundLine.css("width",results+"%");
        audio.volume = results*0.01;
    }

    $(".sound").click(function(){
        $(this).toggleClass("sound_no");
        if(audio.muted){
            audio.muted = false;
        }else{
            audio.muted = true; 
        }
    })

})