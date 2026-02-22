# Base Assets - 银行素材说明

从银行 APK 解压包中提取的 UI 素材。

---

## 📂 文件夹结构

```
webbank/
├── lottie/                    # Lottie 动态动画
│   ├── antui_loading.json      # 加载动画
│   ├── antui_refresh_blue.json # 蓝色刷新动画
│   └── antui_refresh_white.json # 白色刷新动画
│
├── images/icons_base/         # 静态 PNG 图标
│   ├── ic_launcher.png          # App 启动图标
│   ├── ic_leimon_bank.png       # 银行 Logo
│   ├── xinyongkax.png           # 信用卡图标
│   ├── toux.png                 # 头像
│   ├── tongxunlu.png            # 通讯录
│   ├── wealth_bg.png            # 财富背景
│   ├── investment_bg.png        # 投资背景
│   ├── th_jixiangwu.png         # 吉祥物
│   ├── wdlguonian.png           # 过年相关
│   └── ... (共 30+ 图标)
│
└── base/                       # 原始 APK 解压包（保留）
```

---

## 🎬 Lottie 动画使用方法

### 1. 在 HTML 中引入 Lottie 库

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
```

### 2. 创建容器

```html
<div id="my-lottie" style="width: 100px; height: 100px;"></div>
```

### 3. 初始化动画

```javascript
lottie.loadAnimation({
    container: document.getElementById('my-lottie'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'lottie/antui_loading.json'
});
```

---

## 🖼️ 主要图标说明

| 文件名 | 说明 |
|--------|------|
| `ic_launcher.png` | App 启动图标 |
| `ic_leimon_bank.png` | 银行 Logo |
| `xinyongkax.png` | 信用卡 |
| `toux.png` | 头像 |
| `tongxunlu.png` | 通讯录 |
| `wealth_bg.png` | 财富背景 |
| `investment_bg.png` | 投资背景 |
| `th_jixiangwu.png` | 吉祥物 |
| `wdlguonian.png` | 过年主题 |

---

## 💡 替换当前项目素材

可以用这些银行官方素材替换 `images/` 目录下的现有素材：

```
images/icons/logo.png    → images/icons_base/ic_leimon_bank.png
images/icons/func_*.png  → images/icons_base/ 中对应图标
```

---

## 📌 注意事项

1. **素材来源**：从银行 APK 解压包提取，仅供学习参考
2. **Lottie 库**：需要 CDN 引入才能播放动画
3. **图标质量**：`mipmap-xxxhdpi-v4` 是最高清版本
