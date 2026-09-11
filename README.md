# CJK Input Atlas

241 篇中日韩文字输入研究的目录与媒体。当前部署版本为 **v7**。

- [交给 Kimi 的部署说明](KIMI-DEPLOY.md)
- [下载最新部署 ZIP](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/CJK-Input-Atlas-Kimi-deploy.zip)
- [版本与校验文件](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest)
- [可维护源码](website/)

v7 将计算方法的 `na` 类别显示为 **NA**，并同步使用最新补充网页中已验证的压缩媒体。241 篇论文、241 个 GIF、图片、原文链接及英中日韩四种显示语言全部保留。算法和交互视图沿用综述分类，支持语言／文字、输入标签、计算方法、评价方式、目标人群五个维度。

优先显示视频截帧／作者 GIF、论文图组与图页 GIF，其次是视频和静态图片。GIF 支持播放与暂停；原文轮播明确标注为编辑展示，不是连续输入录像。

## Kimi 部署

解压最新 ZIP，将 `CJK-Input-Atlas-Kimi/site/` 完整部署到中性临时域名根目录，无需构建、数据库、账户或论文 PDF。保持现有目录结构，并验证详情页直接访问及刷新。

匿名审稿使用单独提供的临时链接；该链接不要写入此可识别账号的仓库。GitHub Pages 继续关闭。旧 `docs/` 编译快照已删除，避免误用旧版本；Git 历史和历史 Releases 可供追溯。

## 内容与源码

- 241 papers: EN-A 57; EN-B 184.
- Algorithms: 110; Interaction: 181; overlap: 50.
- 241 GIFs with paper/source attribution.
- English (default), Chinese, Japanese and Korean.
- Five review-aligned filter dimensions with 43 categories; tags may overlap.

`website/` contains the maintained React/TypeScript source and original media. The release ZIP contains only the prebuilt site and deployment documentation. No full-text PDFs are needed to host it.

To rebuild with Node.js 22.13 or later:

```sh
cd website
npm ci
npm test
npm run typecheck
NEXT_PUBLIC_BASE_PATH='' npm run build:pages
```

Deploy `website/dist/github-pages/`. The source build retains original media; the latest release applies verified delivery encodings. The Python media optimizer is included under `website/scripts/`.

The [compressed full-text archive from v6](https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/download/cjk-input-atlas-kimi-v6/CJK-Input-Atlas-pdfs-small.zip) remains an optional separate download.
