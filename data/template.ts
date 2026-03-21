// 视频 Prompt 模板数据 - 校园怪兽铠甲变身模板

export const template = {
  name: "校园怪兽铠甲变身模板",
  description: "校园场景 + 怪兽 + 铠甲变身的视频 Prompt 模板",
  // 原始模板结构 - 用于拼接完整 Prompt
  structure: `{scene}。{subject}，{action}。{camera}。{lighting}。{style}，{quality}。`,
  
  // 7 层变量选项
  variables: {
    scene: {
      label: "场景",
      icon: "🏔️",
      options: [
        { name: "大学校园", content: "大学校园操场，黄昏时分，教学楼背景" },
        { name: "小学操场", content: "小学操场，课间休息，彩色教学楼背景" },
        { name: "城市 CBD", content: "城市 CBD 街道，夜晚，摩天大楼霓虹灯" },
        { name: "雪山之巅", content: "雪山之巅，暴风雪，冰川背景" },
        { name: "科幻实验室", content: "科幻实验室，白色洁净空间，全息投影" },
        { name: "海边沙滩", content: "海边沙滩，日落时分，海浪拍打礁石" },
        { name: "古老城堡", content: "中世纪古老城堡，石墙塔楼，阴云密布" },
        { name: "太空站", content: "未来太空站内部，金属走廊，蓝色科技灯" },
        { name: "森林秘境", content: "神秘森林深处，阳光透过树叶，雾气缭绕" },
        { name: "地下基地", content: "地下军事基地，混凝土墙壁，红色警报灯" },
      ]
    },
    subject: {
      label: "主体",
      icon: "🧗",
      options: [
        { name: "学生 + 银色铠甲", content: "年轻学生，变身银色铠甲战士" },
        { name: "赛车手 + 火焰铠甲", content: "赛车手，变身火焰铠甲" },
        { name: "科学家 + 能量融合", content: "科学家，融合外星能量" },
        { name: "上班族 + 机械巨龙", content: "上班族，机械巨龙伙伴" },
        { name: "登山者 + 冰雪巨龙", content: "登山者，冰雪巨龙伙伴" },
        { name: "护士 + 天使翅膀", content: "护士，背后展开白色天使翅膀" },
        { name: "警察 + 雷电战甲", content: "警察，变身雷电战甲" },
        { name: "舞者 + 凤凰化身", content: "舞者，化身为火焰凤凰" },
      ]
    },
    action: {
      label: "动作",
      icon: "⚔️",
      options: [
        { name: "破土变身", content: "怪兽从地面破土而出 → 瞬间变身铠甲" },
        { name: "空中对峙", content: "巨龙从天而降 → 变身 → 空中对峙" },
        { name: "融合升空", content: "生物漂浮 → 融合能量 → 悬浮升空" },
        { name: "冲刺进化", content: "高速冲刺 → 身体发光 → 进化完成" },
        { name: "守护觉醒", content: "危险逼近 → 保护他人 → 能力觉醒" },
        { name: "合体变身", content: "人与怪兽合体 → 新形态诞生" },
        { name: "释放终结", content: "蓄力 → 释放终极技能 → 敌人消散" },
      ]
    },
    camera: {
      label: "镜头",
      icon: "🎥",
      options: [
        { name: "一镜到底低角度", content: "一镜到底 14 秒，低角度仰拍，IMAX 画幅" },
        { name: "航拍俯视", content: "一镜到底，航拍俯视 + 快速推进" },
        { name: "360 度环绕", content: "一镜到底，360 度环绕拍摄，广角" },
        { name: "手持跟拍", content: "手持摄影跟拍，轻微晃动，真实感" },
        { name: "慢动作特写", content: "超慢动作特写，细节清晰，戏剧性" },
        { name: "快速剪辑", content: "多机位快速剪辑，节奏紧凑" },
        { name: "第一人称视角", content: "第一人称 POV，沉浸式体验" },
      ]
    },
    lighting: {
      label: "灯光",
      icon: "💡",
      options: [
        { name: "黄昏 + 特效光", content: "黄昏自然光 + 铠甲发光 + 怪兽火焰光" },
        { name: "霓虹 + 科技光", content: "霓虹灯 + 机械蓝光 + 激光特效" },
        { name: "雪山反光", content: "雪山反光 + 冰雪蓝光 + 结晶特效" },
        { name: "正午阳光", content: "强烈正午阳光，高对比度，清晰阴影" },
        { name: "月光 + 荧光", content: "皎洁月光 + 生物荧光 + 神秘紫光" },
        { name: "爆炸火光", content: "爆炸火光 + 浓烟 + 橙红色调" },
        { name: "实验室白光", content: "冷白荧光灯，均匀照明，科技感" },
      ]
    },
    style: {
      label: "风格",
      icon: "🎨",
      options: [
        { name: "真人实拍好莱坞", content: "真人实拍质感，好莱坞大片风格" },
        { name: "赛博朋克", content: "真人实拍，赛博朋克风格" },
        { name: "温馨治愈", content: "真人实拍 + 动画质感，温馨治愈" },
        { name: "黑暗奇幻", content: "黑暗奇幻风格，哥特式美学" },
        { name: "日式特摄", content: "日式特摄风格，假面骑士质感" },
        { name: "纪录片风格", content: "纪录片手持拍摄，真实记录感" },
        { name: "动画电影", content: "3D 动画电影质感，皮克斯风格" },
      ]
    },
    quality: {
      label: "质量",
      icon: "📺",
      options: [
        { name: "8K 电影级", content: "8K 超高清，电影级调色，无 CG 感" },
        { name: "4K 高清", content: "4K 高清，明亮调色" },
        { name: "胶片质感", content: "16mm 胶片感，复古颗粒" },
        { name: "手机实拍感", content: "手机拍摄质感，社交媒体风格" },
        { name: "IMAX 大屏", content: "IMAX 大屏质感，超宽画幅" },
        { name: "Netflix 剧集", content: "Netflix 剧集质感，电视剧调色" },
      ]
    },
  }
};
