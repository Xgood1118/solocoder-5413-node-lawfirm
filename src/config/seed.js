const userService = require('../modules/user/user.service');
const tagService = require('../modules/tag/tag.service');
const articleService = require('../modules/article/article.service');
const { USER_ROLES, ARTICLE_TYPES } = require('../constants');

function seedData() {
  tagService.initDefaultTags();

  const users = [
    { name: '张伟', role: USER_ROLES.SENIOR_LAWYER, department: '民商法律部', email: 'zhangwei@lawfirm.com' },
    { name: '李明', role: USER_ROLES.LAWYER, department: '民商法律部', email: 'liming@lawfirm.com' },
    { name: '王芳', role: USER_ROLES.LAWYER, department: '刑事法律部', email: 'wangfang@lawfirm.com' },
    { name: '刘洋', role: USER_ROLES.ASSISTANT, department: '行政部', email: 'liuyang@lawfirm.com' },
    { name: '陈静', role: USER_ROLES.LAWYER, department: '知识产权部', email: 'chenjing@lawfirm.com' },
    { name: '赵强', role: USER_ROLES.SENIOR_LAWYER, department: '刑事法律部', email: 'zhaoqiang@lawfirm.com' },
    { name: '管理员', role: USER_ROLES.ADMIN, department: '行政部', email: 'admin@lawfirm.com' },
  ];

  const createdUsers = {};
  for (const userData of users) {
    const user = userService.createUser(userData);
    createdUsers[user.name] = user;
  }

  const allTags = tagService.getAllTags();
  const tagMap = {};
  for (const tag of allTags) {
    tagMap[tag.name] = tag;
  }

  const articles = [
    {
      title: '连带责任保证期间约定不明的司法认定',
      author: '张伟',
      authorId: createdUsers['张伟'].id,
      type: ARTICLE_TYPES.LEGAL_RESEARCH,
      tagIds: [tagMap['合同纠纷']?.id, tagMap['借款合同纠纷']?.id].filter(Boolean),
      summary: '本文分析连带责任保证中保证期间约定不明时的司法认定标准，结合最高院判例进行深度解读。',
      content: `# 连带责任保证期间约定不明的司法认定

## 一、问题的提出

在司法实践中，连带责任保证合同关于保证期间的约定常常出现"约定不明"的情形。例如，约定"保证期间直至主债务本息还清时为止"，或者"保证期间与主债务诉讼时效期间相同"等。

## 二、法律规定

### 2.1 《民法典》相关规定

《民法典》第六百九十二条规定：保证期间是确定保证人承担保证责任的期间，不发生中止、中断和延长。

债权人与保证人可以约定保证期间，但是约定的保证期间早于主债务履行期限或者与主债务履行期限同时届满的，视为没有约定；没有约定或者约定不明确的，保证期间为主债务履行期限届满之日起六个月。

### 2.2 司法解释

《最高人民法院关于适用<中华人民共和国民法典>有关担保制度的解释》第三十二条规定：保证合同约定保证人承担保证责任直至主债务本息还清时为止等类似内容的，视为约定不明，保证期间为主债务履行期限届满之日起六个月。

## 三、司法实践中的认定标准

### 3.1 "本息还清时为止"类约定

此类约定最常见，最高人民法院的司法态度经历了从"两年"到"六个月"的转变。

### 3.2 与诉讼时效挂钩的约定

如果保证合同约定"保证期间与主债务诉讼时效相同"，这种约定是否构成约定不明？

## 四、律师建议

1. 在起草保证合同时，应明确约定保证期间的具体时长
2. 避免使用"直至还清为止"等模糊表述
3. 对于重要的保证合同，建议约定三年的保证期间`,
    },
    {
      title: '某买卖合同纠纷胜诉案例分析',
      author: '李明',
      authorId: createdUsers['李明'].id,
      type: ARTICLE_TYPES.CASE_ANALYSIS,
      tagIds: [tagMap['合同纠纷']?.id, tagMap['买卖合同纠纷']?.id].filter(Boolean),
      summary: '本所代理的一起标的额500万元的买卖合同纠纷案件，成功为委托人挽回全部损失。',
      content: `# 某买卖合同纠纷胜诉案例分析

## 一、案情背景

原告（我方委托人）：甲贸易有限公司
被告：乙实业有限公司

### 1.1 基本事实

2023年3月，原被告签订《钢材买卖合同》，约定原告向被告供应钢材1000吨，总价500万元。

### 1.2 争议焦点

被告主张原告交付的钢材存在质量问题，拒绝支付剩余货款200万元。

## 二、争议焦点

1. 原告交付的钢材是否符合质量标准
2. 被告是否享有先履行抗辩权
3. 违约金计算标准是否过高

## 三、本所律师策略

### 3.1 证据组织

- 提交了全部送货单、验收单
- 申请质量鉴定，证明钢材符合国家标准
- 提交被告同期向第三方采购同类钢材的证据

### 3.2 法律论证

- 详细论证先履行抗辩权的行使条件
- 结合司法解释说明违约金调整的考量因素

## 四、判决结果

一审法院全部支持了我方诉讼请求，判决被告支付货款200万元及违约金。

## 五、本所律师复盘

本案胜诉的关键在于充分的证据准备和对先履行抗辩权的准确把握。`,
    },
    {
      title: '离婚案件办理全流程指南',
      author: '王芳',
      authorId: createdUsers['王芳'].id,
      type: ARTICLE_TYPES.PRACTICE_GUIDE,
      tagIds: [tagMap['婚姻家事']?.id, tagMap['离婚诉讼']?.id].filter(Boolean),
      summary: '离婚案件从立案到执行的标准化操作流程，包含各阶段注意事项和文书模板。',
      content: `# 离婚案件办理全流程指南

## 一、收案阶段

### 1.1 初次接待

- 了解当事人基本情况
- 了解婚姻状况及离婚原因
- 初步判断是否符合离婚条件

### 1.2 收案审批

- 填写收案审批表
- 办理委托手续
- 收取律师费用

## 二、立案准备

### 2.1 证据收集清单

- 结婚证原件及复印件
- 身份证复印件
- 子女出生证明
- 财产证明材料

### 2.2 起诉状起草要点

- 诉讼请求明确具体
- 事实与理由简洁明了
- 避免使用过激言辞

## 三、审理阶段

### 3.1 庭前准备

- 证据交换
- 质证意见准备
- 调解方案制定

### 3.2 庭审注意事项

- 着装规范
- 发言条理清晰
- 注意当事人情绪

## 四、执行阶段

- 申请强制执行
- 财产查询与控制
- 案款发放

## 五、常见问题解答

1. 第一次起诉离婚会判离吗？
2. 子女抚养权如何确定？
3. 夫妻共同财产如何分割？`,
    },
    {
      title: '股权转让协议标准模板',
      author: '张伟',
      authorId: createdUsers['张伟'].id,
      type: ARTICLE_TYPES.CONTRACT_TEMPLATE,
      tagIds: [tagMap['公司治理']?.id, tagMap['股权转让']?.id].filter(Boolean),
      summary: '标准股权转让协议模板，包含通用条款和风险提示条款。',
      content: `# 股权转让协议

转让方（以下简称"甲方"）：
身份证号：
住址：

受让方（以下简称"乙方"）：
身份证号：
住址：

## 第一条 股权转让标的

1.1 甲方同意将其持有的XX有限公司（以下简称"目标公司"）XX%的股权（对应出资额人民币XX万元）转让给乙方。

1.2 乙方同意受让上述股权。

## 第二条 转让价格及支付方式

2.1 本次股权转让价款为人民币XX万元。

2.2 支付方式：
（1）本协议签订之日起3日内，乙方支付首期款XX万元；
（2）股权变更登记完成之日起3日内，乙方支付尾款XX万元。

## 第三条 股权交割

3.1 双方应于本协议生效后XX日内共同办理股权变更登记手续。

3.2 自股权变更登记完成之日起，乙方成为目标公司股东，享有相应股东权利，承担相应股东义务。

## 第四条 声明与保证

4.1 甲方保证对转让股权享有完整、合法的处分权，不存在任何质押、冻结或其他权利限制。

4.2 甲方保证已向乙方充分披露目标公司的财务状况和经营情况。

## 第五条 违约责任

5.1 任何一方违反本协议约定，应向守约方支付违约金。

## 第六条 争议解决

6.1 因本协议引起的争议，双方应协商解决；协商不成的，提交目标公司所在地人民法院诉讼解决。

## 第七条 其他条款

7.1 本协议自双方签字之日起生效。
7.2 本协议一式四份，甲乙双方各执一份，目标公司留存一份，工商登记机关一份。`,
    },
    {
      title: '《民法典》诉讼时效制度实务解读',
      author: '陈静',
      authorId: createdUsers['陈静'].id,
      type: ARTICLE_TYPES.LAWS_REGULATIONS,
      tagIds: [tagMap['民商']?.id, tagMap['合同纠纷']?.id].filter(Boolean),
      summary: '对《民法典》诉讼时效制度的全面解读，结合司法实务中的常见问题进行分析。',
      content: `# 《民法典》诉讼时效制度实务解读

## 一、诉讼时效的基本概念

诉讼时效是指权利人在法定期间内不行使权利，义务人便享有抗辩权，从而导致权利人无法胜诉的法律制度。

## 二、普通诉讼时效期间

### 2.1 法律规定

《民法典》第一百八十八条第一款规定：向人民法院请求保护民事权利的诉讼时效期间为三年。法律另有规定的，依照其规定。

### 2.2 起算时间

诉讼时效期间自权利人知道或者应当知道权利受到损害以及义务人之日起计算。

## 三、特殊诉讼时效

### 3.1 一年短期时效

**注意：《民法典》已取消一年短期时效，统一适用三年普通时效。**

### 3.2 最长诉讼时效

自权利受到损害之日起超过二十年的，人民法院不予保护，有特殊情况的，人民法院可以根据权利人的申请决定延长。

## 四、诉讼时效的中止

### 4.1 中止事由

在诉讼时效期间的最后六个月内，因下列障碍，不能行使请求权的，诉讼时效中止：

1. 不可抗力
2. 无民事行为能力人或者限制民事行为能力人没有法定代理人
3. 继承开始后未确定继承人或者遗产管理人
4. 权利人被义务人或者其他人控制
5. 其他导致权利人不能行使请求权的障碍

## 五、诉讼时效的中断

### 5.1 中断事由

有下列情形之一的，诉讼时效中断，从中断、有关程序终结时起，诉讼时效期间重新计算：

1. 权利人向义务人提出履行请求
2. 义务人同意履行义务
3. 权利人提起诉讼或者申请仲裁
4. 与提起诉讼或者申请仲裁具有同等效力的其他情形

## 六、除斥期间与诉讼时效的区别

诉讼时效和除斥期间是两个不同的概念，律师在实务中必须准确区分。`,
    },
    {
      title: '盗窃罪辩护要点分析',
      author: '赵强',
      authorId: createdUsers['赵强'].id,
      type: ARTICLE_TYPES.CASE_ANALYSIS,
      tagIds: [tagMap['刑法分论']?.id, tagMap['盗窃罪']?.id].filter(Boolean),
      summary: '从盗窃数额认定、盗窃形态、量刑情节等方面分析盗窃罪的辩护要点。',
      content: `# 盗窃罪辩护要点分析

## 一、盗窃数额的认定

### 1.1 一般标准

盗窃公私财物价值一千元至三千元以上为"数额较大"，三万元至十万元以上为"数额巨大"，三十万元至五十万元以上为"数额特别巨大"。

### 1.2 特殊盗窃对象

- 盗窃违禁品按盗窃罪处理的，不计数额
- 盗窃信用卡并使用的，按实际使用数额认定
- 盗窃增值税专用发票的，按发票数量认定

## 二、盗窃既未遂的认定

### 2.1 失控说与控制说

我国刑法理论和司法实践主要采用"失控加控制说"。

### 2.2 既未遂并存的处理

盗窃既有既遂，又有未遂，分别达到不同量刑幅度的，依照处罚较重的规定处罚；达到同一量刑幅度的，以盗窃罪既遂处罚。

## 三、常见辩护要点

### 3.1 数额辩护

- 申请价格认定复核
- 提出合理怀疑
- 排除非法证据

### 3.2 情节辩护

- 自首认定
- 立功认定
- 退赃退赔
- 被害人谅解

## 四、典型案例分析

结合本所承办的具体案例，分析辩护策略的选择与效果。`,
    },
  ];

  for (const articleData of articles) {
    articleService.createArticle(articleData);
  }

  console.log(`已初始化 ${users.length} 个用户`);
  console.log(`已初始化 ${allTags.length} 个标签`);
  console.log(`已初始化 ${articles.length} 篇文章`);

  return {
    users: createdUsers,
    articles,
  };
}

module.exports = { seedData };
