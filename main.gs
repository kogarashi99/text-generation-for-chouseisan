function doGet(e) {
  var htmlOutput = HtmlService.createTemplateFromFile("index").evaluate();
  htmlOutput.setTitle('調整さん用テキスト生成').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return htmlOutput;
}

function generateText(form_t1,form_t2,form_t3,form_t4,form_t5,form_t6,form_t7,form_t8){
  const startDate = new Date(form_t1)
  const endDate = new Date(form_t2)

  if(startDate.getTime() > endDate.getTime()){
    return [false, "開始日が終了日より遅くなっています。"]
  }

  let text = ""
  let date = startDate

  const addTextArr = form_t6.split(",")

  const daysArr = ["日","月","火","水","木","金","土"]

  while(date.getTime() <= endDate.getTime()){
    let events_flg = false
    let day = date.getDay()
    if(form_t3[day]){
      const calendarId = "ja.japanese.official#holiday@group.v.calendar.google.com";
      const calendar = CalendarApp.getCalendarById(calendarId); 
      const events = calendar.getEventsForDay(date);
      if(events.length > 0){
        events_flg = true
        if(form_t4 == "yes"){
          date = new Date(date.getFullYear(),date.getMonth(),date.getDate()+1)
          continue
        }
      }
      if(form_t5 == "old"){
        for(addText of addTextArr){
          if(events_flg) text += Utilities.formatDate(date,"JST","M/d") + "(" + daysArr[day] + "・祝) " + addText + "\n"
          else text += Utilities.formatDate(date,"JST","M/d") + "(" + daysArr[day] + ") " + addText + "\n"
        }
      }else if(form_t5 == "new"){
        const startTime = form_t7[0]
        const endTime = form_t7[1]
        if(startTime > endTime){
          return [false, "開始時刻が終了時刻より遅くなっています。"]
        }
        for(let i = 0;i < (endTime - startTime);i++){
          const time = Number(startTime) + i
          if(form_t8 == "yes" && zemiCheck(date, time)) continue
          const addText = Number(startTime) + i + ":00~" + Number(Number(startTime) + 1 + i) + ":00"
          if(events_flg) text += Utilities.formatDate(date,"JST","M/d") + "(" + daysArr[day] + "・祝) " + addText + "\n"
          else text += Utilities.formatDate(date,"JST","M/d") + "(" + daysArr[day] + ") " + addText + "\n"
        }
      }
    }
    date = new Date(date.getFullYear(),date.getMonth(),date.getDate()+1)
  }
  if(text.length == 0){
    return [false, "条件を満たす日付は存在しません。"]
  }
  text = text.trim()
  return [true, text]
}

function zemiCheck(date, time){
  const zemiCalendar = CalendarApp.getCalendarById('kusakaken.zemi@gmail.com');
  let events = zemiCalendar.getEventsForDay(date);
  Logger.log(events)
  eventNum = events.length;
  for (let i = 0; i < eventNum; i++) {
    //let title = events[i].getTitle();　//予定のタイトル
    let startTime = events[i].getStartTime().getHours();　//予定の開始日時
    let endTime = events[i].getEndTime().getHours();　//予定の終了日時
    //let description = events[i].getDescription();　//予定の説明
    //let location = events[i].getLocation().replace(/筑波大学/g,"");　//場所
    if(time >= startTime && time <= endTime) return true
  }
  return false
}