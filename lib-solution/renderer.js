const electron = require('electron')

const ipc = electron.ipcRenderer
const remote = electron.remote
const clipboard = remote.clipboard
const shell = electron.shell

const $ = selector => document.querySelector(selector)
const mainProcess = remote.require('./main')
const marked = require('marked')

const $markdownView = $('.raw-markdown')
const $htmlView = $('.rendered-html')
const $openFileButton = $('#open-file')
const $saveFileButton = $('#save-file')
const $copyHtmlButton = $('#copy-html')
const $showInFileSystemButton = $('#show-in-file-system')
const $openInDefaultEditorButton = $('#open-in-default-editor')

let currentFile = null

ipc.on('file-opened', (event, file, content) => {
  currentFile = file

  $showInFileSystemButton.disabled = false
  $openInDefaultEditorButton.disabled = false

  $markdownView.value = content
  renderMarkdownToHtml(content)
})

function renderMarkdownToHtml (markdown) {
  const html = marked(markdown)
  $htmlView.innerHTML = html
}

$markdownView.addEventListener('keyup', (event) => {
  const content = event.target.value
  renderMarkdownToHtml(content)
})

$openFileButton.addEventListener('click', () => {
  mainProcess.openFile()
})

$copyHtmlButton.addEventListener('click', () => {
  const html = $htmlView.innerHTML
  clipboard.writeText(html)
})

$saveFileButton.addEventListener('click', () => {
  const html = $htmlView.innerHTML
  mainProcess.saveFile(html)
})

document.addEventListener('click', (event) => {
  if (event.target.href && event.target.href.startsWith('http')) {
    event.preventDefault()
    shell.openExternal(event.target.href)
  }
})

$showInFileSystemButton.addEventListener('click', () => {
  shell.showItemInFolder(currentFile)
})

$openInDefaultEditorButton.addEventListener('click', () => {
  shell.openItem(currentFile)
})
