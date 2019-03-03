// import jQuery
var script = document.createElement('script');script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js";document.getElementsByTagName('head')[0].appendChild(script);

const apiDatas = JSON.parse('DATA GOES HERE');

const upload = data =>
  $.get(
    'http://tad.froghome.org/upload/AddDetailDataGo.php',
    {
      ...data,
      behavior_list_text: '0;;;1. 無:::1;;;2. 聚集:::2;;;3. 鳴叫:::3;;;4. 築巢:::4;;;5. 領域:::5;;;6. 配對:::6;;;7. 打架:::7;;;8. 護幼:::8;;;9. 單獨:::9;;;10. 覓食:::10;;;11. 休息:::11;;;12. 屍體:::12;;;13. 畸形蛙:::13;;;14. 病蛙',
      living_type_list_text: '1;;;1. 卵塊:::2;;;2. 蝌蚪:::3;;;3. 幼體:::4;;;4. 雄蛙:::5;;;5. 雌蛙:::8;;;6. 成蛙'
    }
  )


Promise.all(apiDatas.map(upload))
  .then(res => {
    $('iframe[name="main_show"]')[0]
      .contentDocument
      .querySelectorAll('frame[name="main_top"]')[0]
      .contentDocument
      .location
      .reload();
  })
