### 移动端html5页面初始化

>不缩放页面，尺寸单位用rem

```html
<!DOCTYPE html>
<html>
<head>
  <title></title>
  <meta charset="utf-8">
  <!--图标iconfont-->
  <link rel="stylesheet" href="//statics.jituancaiyun.com/css/h5-common-iconfont/iconfont.css">
  <!--计算分辨率 设置跟字体-->
  <script src="//statics.jituancaiyun.com/js/set-mobile-viewport/3.0/index.js"></script>
</head>
<body>
  
  <!--客户端桥接-->
  <script src="//statics.jituancaiyun.com/Hybrid/src/bridge.1.1.js"></script>
</body>
</html>
```

关于图标iconfont
如果有新增的，请将[阿里iconfont](http://www.iconfont.cn/manage/index?manage_type=myprojects&spm=a313x.7781069.1998910419.9.62fLs5&projectId=91710&keyword=)下载后覆盖到statics项目的`css/h5-common-iconfont`

在retina屏幕下，不采用缩放，1px边框的实现有2种：
第一种，根据伪类，将边框放大后再缩小：
```css
%common {
    content:'';
    position: absolute;
    top:0;
    left:0;
    width: 200%;
    height: 200%;
    border-style:solid;
    -webkit-transform-origin: 0 0;
    -moz-transform-origin: 0 0;
    -ms-transform-origin: 0 0;
    -o-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scale(0.5, 0.5);
    -ms-transform: scale(0.5, 0.5);
    -o-transform: scale(0.5, 0.5);
    transform: scale(0.5, 0.5);
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    pointer-events: none;
}

@mixin border($color, $borderRadius, $borderWidth, $zIndex) {
    position: relative;
    border: none;
    &:before {
        border-color: $color;
        border-width: $borderWidth;
        border-radius: $borderRadius;
        z-index: $zIndex;
        @extend %common;
    }
}
```

第二种，利用背景渐变：
```css
.border-1px {
  background-image: linear-gradient(top, #ccc, #ccc 50%, transparent 50%);
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: bottom;
}
```
另外，关于移动端自适应解决方案详细参考：[讨论的问题 [个人分享会@Jmingzi]](http://gitlab.shinemo.com/ub/statics/blob/master/video.statics.jituancaiyun.com/summary/2016-11-07.md)

UI组件可使用[mui](https://github.com/Jmingzi/mui)
