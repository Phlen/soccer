

// var  articles = require('../../api/articles')
// console.log(articles)
var WxParse = require('../../wxParse/wxParse.js')

Page({
    data: {
        // 文章
        article: null,
        // 图集
        mediaList: [],

        // 图片预览模式
        previewMode: false,

        // 当前预览索引
        previewIndex: 0
    },
    onLoad: function(params) {
        console.log('onLoad')
        console.log('article')
        console.log(params)
        this.getArticle(params)
        // this.getMediaList()
    },

    getArticle: function(params) {
        console.log(params)
        // this.setData({
        //     html: res.data
        // })
        let id = params.id , article = {}
        let that = this
        if (id === undefined) {
            // article = articles.articles[0]
            return false
        } else {
            // article = this.fillterArticle(id);
            // console.log(article)
            // this.fillterArticle(id)
            wx.request({
                url: `https://api.dongqiudi.com/article/${id}.html?_font=m`,
                header: {},
                success: function(res) {
                    // 匹配类
                    let reg = /<body[\s\S]*?>([\s\S]*?)<\/?body>/g

                    let scriptReg = /<script[\s\S]*?>([\s\S]*?)<\/?script>/gm

                    res.data = res.data.replace(scriptReg,'')

                    let matchCon = reg.exec(res.data)
                    let WxParseCon = WxParse('html', matchCon[0])
                    for (let [index, elem] of WxParseCon[0].child.entries()) {
                        if (elem.tag == 'div') {
                            // 社区规范，添加类名
                            elem.class = 'extra'
                            for(let [ix, v] of elem.child.entries()) {
                                if (v.tag == 'div') {
                                    v.class = `div-${ix}`
                                }
                            }
                        }
                    }
                    console.log(WxParseCon[0])
                    that.setData({
                        wxParseData: WxParseCon
                    })
                }
            })
        }
        this.setData({
            article: article
        })
    },

    // 过滤文章
    fillterArticle(id) {
        var article = {}
        for (let [index, elem] of articles.articles.entries()) {
            if (Number(elem.meta.id) == id) {
                article = elem
            }
        }
        return article
    },

    // 过滤出预览图片
    getMediaList() {
        if(typeof this.data.article !== 'undefined' && this.data.article.list.length) {
            this.setData({
                mediaList: this.data.article.list.filter(content => content.type === "IMAGE")
            })
        }
        console.log(this.data.mediaList)
    },

    // 预览图集
    enterPreviewMode(event) {
        let url = event.target.dataset.src;
        let urls = this.data.mediaList.map(media => media.content)
        console.log(url)
        console.log(urls)
        let previewIndex = urls.indexOf(url)

        this.setData({
            previewMode: true, previewIndex
        })
    },

    // 退出预览模式
    leavePreviewMode() {
        this.setData({previewMode: false, previewIndex: 0});
    },


})