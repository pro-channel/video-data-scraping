# Tokyo motion 動画情報スクレイピング プログラム

Youtubeチャンネル「プロちゃん」で使用したソースを公開しています。<br>
動画WEBサイト[Tokyo motion]の検索結果ページから、
検索結果の動画情報を収集してcsvファイルに出力します。<br>
収集するデータは5つです<br>

- rate [レート]
- added [追加日(追加日が1日未満の場合は値に0が設定されます)]
- views [閲覧数]
- time [再生時間]
- URL [動画ページURL]

## 実行方法
`node ./index.js "キーワード" "追加日"　`

### キーワード 引数
検索に使用するキーワードを設定して下さい<br>
設定されていない場合、検索キーワード無しのページを読み込みます

### 追加日 引数
数値を指定して下さい。


## 公開動画ページ  
<https://www.youtube.com/watch?v=>  
  
## チャンネルトップページ  
<https://www.youtube.com/channel/UCaxEDX_m_rFGTZ-5yNOQ1wQ>