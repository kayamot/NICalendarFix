var changeflag = 0
var widthflag = 0
var firstflag = 1
//読み込み時1回実行
window.onload = function() {
  
  //グループ週表示なら
  if(isGroupweekly()){
    addbutton()
    addmouseover()
    if(isSchedule()){
      changeflag = 1
      firstflag = 0
      removeElement()
      changelayout()
      //時間線の作成
      drawTimeline()
    }
  }
}

//グループ週表示判定
var isGroupweekly = function(){
  //2番目のtabbox
  var tabbox = document.getElementsByClassName('tabbox')
  var activetab = tabbox[1].getElementsByClassName('tabActive')
  return activetab[0].textContent == 'グループ週表示'
}

//スケジュール判定
var isSchedule = function(){
  return location.href.includes('schedule')
}

//設備予約判定
var isReserve = function(){
  return location.href.includes('reserve')
}

//表示方法切り替え
var switchdisplay = function(){
  //初回のみelement削除
  if(changeflag == 1){
    //幅変えてたらもどす
    if(widthflag == 1){
      changewidth()
    }
    reverseToDefault()
    changeflag = 0
  }
  else{
    if(firstflag == 1){
      removeElement()
      firstflag = 0
    }
    changelayout()
    drawTimeline()
    changeflag = 1
  }
}

//マウスオーバーで色変更
var addmouseover = function(){
  //全スケジュール取得
  var monthrows=document.getElementsByClassName('month-row')
  
  //1件ごと予定処理
  for(const s of monthrows){
  s.addEventListener('mouseover', () => {
      var stcuser=s.getElementsByClassName('st-c-user')[0]
      stcuser.style.background='gray'
  });
  s.addEventListener('mouseout', () => {
      var stcuser=s.getElementsByClassName('st-c-user')[0]
      stcuser.style.background='white'
});
  }
}

//レイアウト変更
var changelayout =function(){

  //名称の幅
  if(isReserve()){
    var usernames = document.getElementsByClassName('st-username')
    for (var s of usernames){
      s.title = s.textContent
      s.style.maxHeight = '30.25px'
      s.style.whiteSpace = 'nowrap'; 
      s.style.overflow = 'visible'; 
    }
  }

  //列固定
  var stcusers = document.getElementsByClassName('st-c-user')
  for (var s of stcusers){
    s.style.position = 'sticky'
    s.style.left = '0px'
    s.style.zIndex = '5'
    s.style.background = 'white'
    if(isReserve()){
      s.style.width='300px'
    }
  }
  var userdatadummy = document.getElementsByClassName('gwk-userdata-dummy')
  for (var s of userdatadummy){
    s.style.position = 'sticky'
    s.style.left = '0px'
    s.style.zIndex = '6'
    if(isReserve()){
      s.style.width='300px'
    }
  }

  //日付取得
  var firstdatetext = document.getElementsByClassName('sc_dateselecter')
  //カレンダー左端の日付
  var firstdate = new Date(firstdatetext[0].value)
  firstdate.setHours(0,0,0,0)
  //会議の場合月曜日に合わせる
  if(isReserve()){
    firstdate.setDate(firstdate.getDate() - (firstdate.getDay() - 1))
  }
  //あとから取得の予定が全部勝手に2001年になるため なんで？
  firstdate.setYear(2001)

  //カレンダー右端の日付
  var lastdate = new Date(firstdate.getTime())
  lastdate.setDate(lastdate.getDate() + 7)

  //あとから取得の予定が全部勝手に2001年になるため なんで？
  firstdate.setYear(2001)

  //全スケジュール取得
  var schedule1=document.getElementsByClassName('cuiEv')
  
  //1件ごと予定処理
  for(const s of schedule1){
    //console.log(s)
    //直で高さ指定
    s.style.height = '25px'
    //1行目の要素取得
    var line1 =s.getElementsByClassName('cuiEvL1')
    //console.log(line1[0])
    
    
    //ダミーの場合は子要素がない
    if(line1[0] !== undefined){
      
      //---------------予定時間計算ここから 予定の幅と位置の計算のために必要---------------
      
      //時間の取得
      var time1 = s.getElementsByClassName('cuiEvTime')
      
      /*
      timetextのパターン
      1.時間のみ
      08:00～11:00

      2.日跨ぎ
      4/10 23:00 ～ 4/11 02:00

      3.終日
      終日

      4.日跨ぎ終日
      終日4/9 ～ 4/11

      5.なし　※イベント

      6.時間のみ（間隔なし）
      18:00

      */

      //timetextの取得
      try{
        timetext = time1[0].innerText
      } catch(e){
        //5.なし
        timetext = '00:00～24:00'
      }
            
      //日付（"/"）がある場合
      if(timetext.includes('/')){
        if(timetext.includes('終日')){
          //4.日またぎ終日
          starttimetext = timetext.substr(0,timetext.indexOf('～')).replace('終日','')
          endtimetext = timetext.substr(timetext.indexOf('～') + 1)
          starttime = new Date(starttimetext)
          endtime = new Date(endtimetext)
          //一日分加算
          endtime.setHours(24)
        } else{
          //2.日跨ぎ
          starttimetext = timetext.substr(0,timetext.indexOf('～'))
          endtimetext = timetext.substr(timetext.indexOf('～') + 1)
          starttime = new Date(starttimetext)
          endtime = new Date(endtimetext)
        }
        //年またぎ
        if(starttime > endtime){
          endtime.setFullYear(endtime.getFullYear() + 1)
        }
        //前後のはみ出し対策
        if(starttime < firstdate){
          starttime = firstdate
        }
        if(endtime > lastdate){
          endtime = lastdate
        }
      } else if(timetext.includes('終日')){
        //3.終日
        starttime = new Date()
        starttime.setHours(0,0,0,0)
        endtime = new Date(starttime.getTime())
        //一日分加算
        endtime.setHours(24)
      } else {
        if(timetext.includes('～')){
          //1.時間のみ
          starttimetext = timetext.substr(0,timetext.indexOf('～'))
          endtimetext = timetext.substr(timetext.indexOf('～') + 1)

          starttime = new Date()
          starttimehours =  starttimetext.substr(0,starttimetext.indexOf(':'))
          starttimeminutes = starttimetext.substr(starttimetext.indexOf(':') + 1)
          starttime.setHours(starttimehours,starttimeminutes,0,0)
          
          endtime = new Date()
          endtimehours =  endtimetext.substr(0,endtimetext.indexOf(':'))
          endtimeminutes = endtimetext.substr(endtimetext.indexOf(':') + 1)
          if(endtimehours == '00'){
            endtimehours = 24
          }
          endtime.setHours(endtimehours,endtimeminutes,0,0)
        }else{
          //6.時間のみ（間隔なし）
          starttimetext = timetext
          starttime = new Date()
          starttimehours =  Number(starttimetext.substr(0,starttimetext.indexOf(':')))
          starttimeminutes = Number(starttimetext.substr(starttimetext.indexOf(':') + 1))
          starttime.setHours(starttimehours,starttimeminutes,0,0)
          
          endtime = new Date(starttime.getTime())
          endtime.setHours(starttimehours,starttimeminutes + 30,0,0)
        }
      }
      //間の時間計算
      var diffMilliSec = endtime - starttime
      var diffHours = diffMilliSec / 1000 / 60 / 60
      
      //---------------予定時間計算ここまで---------------
      
      //重複してたら透明度上げる
      var duplicationflag = 0
      var scic = line1[0].getElementsByClassName('scic')
      for(var sc of scic){
        if(sc.title == '重複スケジュール'){
          duplicationflag = 1
        }
      }
      if(duplicationflag == 1){
       s.style.opacity = 0.7
      }
      
      //列幅を変える
      widthpercent = Math.min(diffHours / 24 * 100 , 700)
      s.style.width = widthpercent + '%'

      //位置を変える
      s.style.position = 'absolute'
      var leftposition = (starttime.getHours() + (starttime.getMinutes()/60)) /24 * 100
      s.style.left = leftposition + '%'
      
      //ダミー全部消えないので無理やりかぶったところも上側に持ってくる
      s.style.top = '0%'
      
      //1行目をなくす
      line1[0].style.height = '0px'

      //zindexを上げる(1-4)
      var zindexnum = Math.max(1,Math.round(4 - diffHours))
      if(zindexnum >= 1 && zindexnum <= 4){
        s.style.zIndex = zindexnum
      } else{
        s.style.zIndex = 1
      }

    }
  }
  //最低高さ100px制限の削除
  var stgrids=document.getElementsByClassName('st-grid')
  for(var s of stgrids){
    s.style.minHeight = '0px'
  }
  //下部余白padding削除、背景画像追加
  var stcs=document.getElementsByClassName('st-c')
  for(var s of stcs){
    s.style.paddingBottom = '0px'
    s.style.backgroundImage = 'url(https://i.gyazo.com/e69f6ef550a8da63325bee2873dd83ff.png)'
    s.style.backgroundSize = '100% 100%'
  }
  
  //日付クリックで拡大する機能の追加
  var daylabels=document.getElementsByClassName('gwk-daylabel')
  for(var d of daylabels){
    d.onclick = changewidth
  }
  
  //ボタン活性化
  var newbutton1 = document.getElementById('newbutton1')
  newbutton1.disabled = false
  
}

//いらない要素の削除 初回のみ
var removeElement = function(){
  //ダミー消す けどなんか一部消えない…
  var schedule2=document.getElementsByClassName('cuiEvDummy')
  for(var s of schedule2){
    s.remove()
  }
  //名前の下部分2か所消す
  var staffgroup=document.getElementsByClassName('st-username')
  for(var s of staffgroup){
    //所属
    var staffgroup=s.getElementsByClassName('ud-staffgroup')
    for(var ss of staffgroup){
      ss.remove()
    }
    //末尾のリンク
    const lastItem = s.children[1];
    lastItem.remove()

    //定員メモ
    if(isReserve()){
      var note=s.getElementsByClassName('ud-note')
      for(var ss of note){
        ss.remove()
      }
    }
  }
}

//レイアウトもとに戻す
var reverseToDefault = function(){

  //名称の幅
  if(isReserve()){
    var usernames = document.getElementsByClassName('st-username')
    for (var s of usernames){
      s.style.maxHeight = ''
      s.style.whiteSpace = 'normal'; 
      s.style.overflow = ''; 
      s.title = ''
    }
  }
  //列固定
  var stcusers = document.getElementsByClassName('st-c-user')
  for (var s of stcusers){
    s.style.position = ''
    s.style.left = ''
    s.style.zIndex = ''
    s.style.background = ''
    if(isReserve()){
      s.style.width=''
    }
  }
  var userdatadummy = document.getElementsByClassName('gwk-userdata-dummy')
  for (var s of userdatadummy){
    s.style.position = ''
    s.style.left = ''
    s.style.zIndex = ''
    if(isReserve()){
      s.style.width=''
    }
  }
  //全スケジュール取得
  var schedule1=document.getElementsByClassName('cuiEv')
  
  //1件ごと予定処理
  for(const s of schedule1){
    //直で高さ指定
    s.style.height = ''
    //1行目の要素取得
    var line1 =s.getElementsByClassName('cuiEvL1')
    
    //ダミーの場合は子要素がない
    if(line1[0] !== undefined){
      
      //列幅を変える
      s.style.width = ''
      
      //位置を変える
      s.style.position = ''
      s.style.left = ''
      
      //ダミー全部消えないので無理やりかぶったところも上側に持ってくる
      s.style.top = ''
      
      //1行目をなくす
      line1[0].style.height = ''
    }
  }
  //最低高さ100px制限の削除
  var stgrids=document.getElementsByClassName('st-grid')
  for(var s of stgrids){
    s.style.minHeight = ''
  }
  //下部余白padding削除、背景画像追加
  var stcs=document.getElementsByClassName('st-c')
  for(var s of stcs){
    s.style.paddingBottom = ''
    s.style.backgroundImage = ''
    s.style.backgroundSize = ''
  }
  
  //線消す
  if(document.getElementsByClassName('todayline')[0] !== undefined){
    document.getElementsByClassName('todayline')[0].remove()
  }
   //ボタン非活性化
  var newbutton1 = document.getElementById('newbutton1')
  newbutton1.disabled = true
  
}

//幅変更 2回目クリックは戻す
var changewidth = function(){
  var stcs = document.getElementsByClassName('st-c')
  var daylabels=document.getElementsByClassName('gwk-daylabel')
  
  //バグ修正 横幅固定
  var buttonbox = document.getElementsByClassName('buttonbox')[0]
  buttonbox.style.width = '100%'
  
  //幅設定
  var newwidth = ''
  if(widthflag == 1){
    widthflag = 0
  } else{
    newwidth = '600px'
    widthflag = 1
  }
  
  //幅変える
  for(var d of daylabels){
    d.style.width = newwidth
  }
  for(var s of stcs){
    s.style.width = newwidth
  }
  
}

//ボタン追加
var addbutton = function(){
  //
  var buttonbox = document.getElementById('bb_2')
  var button1 = document.getElementsByClassName('button1')[1]
  var newbutton1 = document.createElement("button")
  var newbutton2 = document.createElement("button")
  
  //横幅変更
  newbutton1.type = 'button'
  newbutton1.classList.add('button1')
  newbutton1.id = 'newbutton1'
  newbutton1.onclick = changewidth
  newbutton1.innerText = '(拡張)横幅変更'
  newbutton1.disabled = false
  
  //表示切替
  newbutton2.type = 'button'
  newbutton2.classList.add('button1')
  newbutton2.id = 'newbutton2'
  newbutton2.onclick = switchdisplay
  newbutton2.innerText = '(拡張)表示切替'
  newbutton2.disabled = false
  button1.after(newbutton2)
  
  newbutton2.after(newbutton1)
  button1.after(newbutton2)
  
  //グループ編集ボタン追加 ※スケジュールのみ
  var button2vt
  var button2
  var buttontext
  var buttonlink
  if(isSchedule()){
    button2vt = document.getElementsByClassName('vt')[11]
    button2 = button2vt.getElementsByClassName('button2')[0]
    buttontext = '会議室/Zoom予約'
    buttonlink = "window.open('https://niconsul.com/ynnifqdx/ni/niware/reserve/index.php?p=list&m=groupweekly&i_region&ic_id=2')"
    }
  if(isReserve()){
    button2vt = document.getElementsByClassName('scl_tc_group')[0]
    button2 = button2vt.getElementsByClassName('button2')[0]
    buttontext = 'スケジュール'
    buttonlink = "window.open('https://niconsul.com/ynnifqdx/ni/niware/schedule/index.php')"
  }
  var groupeditbutton = document.createElement("button")
  
  groupeditbutton.type = 'button'
  groupeditbutton.classList.add('button2')
  groupeditbutton.id = 'newlinkbutton'
  groupeditbutton.setAttribute('onclick', "window.open('https://niconsul.com/ynnifqdx/ni/nisystem/option/index.php?p=listmygroup', '_blank')");
  groupeditbutton.innerText = 'マイグループの編集'
  button2.after(groupeditbutton)
  
  //会議室リンクボタン追加
  var newlinkbutton = document.createElement("button")
  
  newlinkbutton.type = 'button'
  newlinkbutton.classList.add('button2')
  newlinkbutton.id = 'newlinkbutton'
  newlinkbutton.setAttribute('onclick', buttonlink);
  newlinkbutton.innerText = buttontext
  groupeditbutton.after(newlinkbutton)

}

//グループ週表示判定
var drawTimeline = function(){
  //todayを探す
  let todaynum 
  const gwkdayname = document.getElementsByClassName('gwk-daynames')[0]
  for(let i=0; i<8;i++){
    //○列目がtodayの場合数値保存
    if(gwkdayname.children[i].getElementsByClassName('today')[0] !== undefined){
      todaynum = i;
    }
  }
  
  //本日が含まれている場合に線の追加
  if(todaynum !== undefined){
    const monthrow = document.getElementsByClassName('month-row')[0]
    const todaystc = monthrow.getElementsByClassName('st-c')[todaynum-1]
    
    //時間割合の作成
    let d = new Date()
    let dmin = d.getHours() * 60 + d.getMinutes()
    let dminratio = dmin/60/24*100
    //縦幅
    let gridheight = document.getElementsByClassName('gridContainer')[0].offsetHeight
    let weektopheight = document.getElementsByClassName('gwk-weektop')[0].offsetHeight
    let lineheight = gridheight - weektopheight
    
    //線Elementの作成
    let todayline = document.createElement("div")
    todayline.classList.add('todayline')
    todayline.style.position ='absolute'
    todayline.style.border ='1px solid red'
    todayline.style.height = lineheight +'px'
    todayline.style.left = dminratio + '%'
    todayline.style.zIndex ='5'
    todayline.style.opacity =0.5
    todayline.style.pointerEvents = 'none'

    todaystc.appendChild(todayline)
  }
}

