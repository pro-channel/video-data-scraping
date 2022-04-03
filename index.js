const reqest = require('request')
const cheerio = require('cheerio')
const fs = require("fs")
const { add } = require('cheerio/lib/api/traversing')

// キーワード引数の取得
var keyWord = process.argv[2]
if (!keyWord) {
    keyWord = ""
}

// 追加日引数の取得
var maxDate = Number(process.argv[3])
if (!maxDate && maxDate !== 0) {
    maxDate = 3
}

// 動画サイトURL
const siteUrl = "https://www.tokyomotion.net"

// 検索結果ページのURL原型
const baseUrl = siteUrl + "/search?search_query=" + encodeURI(keyWord) + '&search_type=videos'

// 1pageのビデオ数
const videoCount = 20

// 
const stream = fs.createWriteStream("./list.csv", {flags:"w"});
stream.on("error", (err)=>{
    if(err)
      console.log("ファイルロックしてませんか??");
      stream.end("\n");
      process.exit(0)
});

/**
 * 検索結果ページの動画情報を取得と書き込みを行う
 * @param {*} nowPage 取得するページ番号
 * @param {*} lastPage 最終ページの番号
 */
const getPageData = (nowPage, lastPage) => {
    reqest(
        (baseUrl + "&page=" + nowPage),
        (error, response, body) => {
            const $ = cheerio.load(body)
            for(i = 0; i < videoCount; i++) {
                let data = []
                
                // 登録情報が分、時間の場合「0日」とする
                let added = $("div.video-added:eq(" + i + ")").text().replace("days ago", "").trim()
                if (added.indexOf("minutes") !== -1 || added.indexOf("hours") !== -1) {
                    added = "0";
                }

                // 最大の登録日をチェックする
                if (added > maxDate) {
                    stream.end("\n");
                    return;
                }

                // video情報を配列に設定
                data.push($("div.row b:eq(" + i + ")").text().replace("%", "").trim())
                data.push(added);
                data.push($("div.video-views:eq(" + i + ")").text().replace("views","").trim())
                data.push($("div.duration:eq(" + i + ")").text().trim())
                data.push(siteUrl + encodeURI($("a.thumb-popu:eq(" + i + ")").attr("href")))

                // 1つのビデオデータをファイルに書き込み
                stream.write(data.join(","))
                stream.write("\n")

            }

            console.log("page:" + nowPage)

            if (nowPage >= lastPage) {
                // 書き込み終了
                console.log("end")
                stream.end("\n");
            }

            // 次ページへ
            getPageData(nowPage + 1, lastPage)
        }
    )
}

/**
 * メイン処理
 */
reqest(
    baseUrl ,
    (error, response, body) => {
        const $ = cheerio.load(body)
        const lastPage = Number($("ul.pagination li.hidden-xs:last").text().trim())
        if (!lastPage) {
            console.log("動画データはみつかりませんでした")
            return
        }
        const data = []
        data.push("rate","added","views","time","URL")
        stream.write(data.join(","))
        stream.write("\n")
        getPageData(1, lastPage);
    }
)


