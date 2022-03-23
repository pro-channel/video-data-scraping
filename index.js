const reqest = require('request')
const cheerio = require('cheerio')
const fs = require("fs")
const { add } = require('cheerio/lib/api/traversing')

var keyWord = process.argv[2]
if (!keyWord) {
    keyWord = ""
}

var maxDate = Number(process.argv[3])
if (!maxDate && maxDate !== 0) {
    maxDate = 3
}

const siteUrl = "https://www.tokyomotion.net"

// URL原型
const baseUrl = siteUrl + "/search?search_query=" + encodeURI(keyWord) + '&search_type=videos'

// 1pageのビデオ数
const videoCount = 20

const stream = fs.createWriteStream("./list.csv", {flags:"w"});
stream.on("error", (err)=>{
    if(err)
      console.log("ファイルロックしてませんか??");
      stream.end("\n");
      process.exit(0)
});

// ページのビデオデータ取得処理
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


            if (nowPage >= lastPage) {
                // 書き込み終了
                console.log("page:" + nowPage)
                console.log("end")
                stream.end("\n");
            }

            // 次ページ書き込み
            console.log("page:" + nowPage)
            getPageData(nowPage + 1, lastPage)
        }
    )
}

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


