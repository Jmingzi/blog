> 原文地址：[使用 electron 实现截图](https://iming.work/detail/5d8991ecba39c800732cb98c)

## 前言
截图的需求还是很常见的，微信的截图已经做的很快且流畅，那么如果用 js 去实现应该是怎样呢？

> ps：如果不清楚 electron 工作原理，可以去官网查看文档

## 流程图

如果不考虑进程交互细节，抽象的流程如下：

![5d8987cbf884af00688eedb0](http://lc-iYzWnL2H.cn-n1.lcfile.com/8a0c13cdf70e1e9020d1)

然而实际上每一个环节都有可能耗时较长导致体验很差。

#### 1. 用户触发

有两种方式，一个是存在用户界面，点击按钮触发；另一个是不存在用户界面（伪实现），即透明且可点击穿透，然后监听全局的按键事件：

```js
globalShortcut.register('command+m', () => {
  mainWindow.webContents.send('do-crop-second')
})
```
#### 2. 获取屏幕信息及截图

我们可以使用 `screen.getAllDisplays()` 获取到当前屏幕信息，截图可以使用第三方 node 包。

查了下，发现在 electron 中，有2种可以实现的方法：

- 使用渲染进程中的 `desktopCapturer` api，但是这个 api 很耗时，会感受到明显的等待。
```js
desktopCapturer.getSources({
    types: ['screen'],
    // 尺寸
    thumbnailSize: display.size
  }, (error, sources) => {
    if (!error) {
      resolve(sources[i].thumbnail.toDataURL())
    }
    reject(error)
  })
```

- 利用 chrome 原生 api 获取屏幕的媒体信息（**需要注意的是，该 api 已废弃**）
```js
navigator.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: `screen:${display.id}`,
        minWidth: display.size.width,
        minHeight: display.size.height,
        maxWidth: display.size.width,
        maxHeight: display.size.height
      }
    }
  }, stream => {
    // 拿到的是视频流信息
    // 我们可以使用 video 标签将它播放一帧后暂停
    // 然后使用 canvas.drawImage 方法，它的第一个参数接受 HTMLVideoElement
    // 最后 canvas.toDataURL 就可以得到图片了 
}, err => {})
```

以上这2种方法是目前能查到的最多的，但你发现没有，为什么要做的这么麻烦呢？还在渲染进程里做，做完再传递给主进程。

我们完全可以在主进程中进行截图操作，例如 mac 的 `screencapture` 这样会更快。

![5d898d9ad5de2b00735c76c3](http://lc-iYzWnL2H.cn-n1.lcfile.com/70a15c24ceb91ed5ceee)

#### 3. 新建渲染进程窗口

因为我们要根据当前屏幕的数量创建同样的窗口盖在原有的窗口上，并将那一瞬间的截图铺满显示在这个窗口里。所以，自然而然的想到了

```js
new BrowserWindow({
  // ...
})
```
但是这个 api 会有2个问题

- 在 mac 上新建全屏窗口会有明显的动画过渡
- 新建的窗口并不能覆盖在原有窗口上

第一个问题可以使用 mac 现有的 api 解决
```js
const $win = new BrowserWindow({
  frame: false,
  enableLargerThanScreen: true,
})

app.dock.hide()
$win.setAlwaysOnTop(true, 'screen-saver')
$win.setVisibleOnAllWorkspaces(true)
$win.setFullScreenable(false)
app.dock.show()
$win.setVisibleOnAllWorkspaces(false)
```

但是第二个问题我目前还不知道如何解决，这非常影响体验。

> 另外，新建的窗口地址需要说明的是，如果使用 vue，我们完全可以采用路由来实现。

#### 4. 用户操作

这部分的逻辑就非常独立了，也可以使用现有库来解决。

截图时显示的蒙层区域原理，在鼠标拖拽改变大小时，同时使用 canvas 同步 `drawImage` 截取尺寸的图片显示。

涂鸦操作就是在选取完一个区域后，再添加文字或画笔，同样也是 canvas 实现。

最后需要注意的是导出图片

```js
// 获取选取的图片信息
const d = ctx.getImageData(data.left, data.top, data.width, data.height)
// 重制 canvas 大小后
// 再放入图片
ctx.putImageData(d, 0, 0)
// 导出
const dataUrl = canvas.toDataURL()
ipcRenderer.send('crop-data-result', dataUrl)
```

## 总结

截图的难点在于 `截图 -> 将图片置顶显示`，这样在`开启截图 -> 关闭截图`流程中，用户只能体验到细微的变化，后续的用户操作都是附加的。如果我们能够使用 node 调用底层服务来处理，应该会快很多。















