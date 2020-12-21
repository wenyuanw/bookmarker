import { Render } from "./Render"
import { debounce } from './util'
import { bookmarkEventDelegation } from './event'
import {getStorageData} from "./store"
let renderer = new Render(false)

// 显示隐藏 select
function handleSelectOpen(e){
  let selectContainer = e.currentTarget.parentNode
	selectContainer.classList.toggle('show')
  e.stopPropagation()
}
// 点击selectItem
function handleSelectChange(e){
  const { value } = e.target.dataset
  const label = e.target.innerText
  let selectValue = e.currentTarget.parentNode.querySelector(".select-value")
  let selectContainer = e.currentTarget.parentNode
	selectValue.dataset.value = value
	selectValue.querySelector("span").innerText = label
	selectContainer.classList.toggle('show')
  e.stopPropagation()
}

export class SearchBar {
  constructor() {
    this.init()
    this.searchInsideDebounce = debounce(this.searchInside, 700)
  }
  init() {
    this.initSearchOutside()
    this.initSearchInside()
    this.initSelectListener()
    this.getLocalSetting()
  }

  async getLocalSetting(){
    let res = await getStorageData("engine")
    if(res.engine){
      this.setEngine("engine", res.engine)
    }
  }

  setEngine(name,value){
    let selectContainer = document.querySelector(`.select-container[data-name='${name}']`)
    let selectValue = selectContainer.querySelector(".select-value")
    selectValue.dataset.value = value
    selectValue.querySelector("span").innerText = value
  }
  // 注册搜索外部
  initSearchOutside() {
    document
      .querySelector("#search-bar")
      .addEventListener("keyup", this.searchOutside)
  }
  //搜索外部实际逻辑
  searchOutside(e) {
    if (e.which === 13) {
      var obj = document.querySelectorAll(".search-select")[0]
      const { value } = obj.dataset
      const inputValue = e.target.value
      let url = ""
      if (!inputValue) {
        return
      }
      switch (value) {
        case "baidu":
          url = "https://baidu.com/s?wd="
          break
        case "google":
          url = "https://www.google.com/search?q="
          break
        case "bing":
          url = "https://www.bing.com/search?q="
          break
        case "sougou":
          url = "https://www.sogou.com/web?query="
          break
      }
      window.open(`${url}${inputValue}`, "_blank")
      e.target.value = ''
      document.querySelectorAll("#bookmark,#collect").forEach((ele) => {
        ele.style.display = "block"
      })
      document.querySelector("#search-result").style.display = "none"
    }
  }
  //注册搜索本地
  initSearchInside() {
    document
      .querySelector("#search-bar")
      .addEventListener("input", (e) => this.searchInsideDebounce(e))
  }
  //搜索本地实际逻辑
  searchInside(e) {
    let query = e.target.value
    if (query.length) {
      document.querySelectorAll("#bookmark,#collect").forEach((ele) => {
        ele.style.display = "none"
      })
      chrome.bookmarks.search(query, async (data) => {
        await renderer.initSearchResult(data)
        document.querySelector("#search-result").addEventListener('click',bookmarkEventDelegation)
      })
    } else {
      document.querySelectorAll("#bookmark,#collect").forEach((ele) => {
        ele.style.display = "block"
      })
      document.querySelector("#search-result").style.display = "none"
    }
  }
  //注册右侧的下拉框
  initSelectListener(){
    Array.from(document.querySelectorAll(".select-value")).forEach((ele) => {
      ele.addEventListener("click", handleSelectOpen)
    })
    Array.from(document.querySelectorAll(".select-options")).forEach((ele) => {
      ele.addEventListener("click", handleSelectChange)
    })
  }

}
