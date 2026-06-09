const ARTICLE_TYPES = {
  CASE_ANALYSIS: 'case_analysis',
  LEGAL_RESEARCH: 'legal_research',
  CONTRACT_TEMPLATE: 'contract_template',
  PRACTICE_GUIDE: 'practice_guide',
  LAWS_REGULATIONS: 'laws_regulations',
};

const ARTICLE_TYPE_LABELS = {
  [ARTICLE_TYPES.CASE_ANALYSIS]: '案例分析',
  [ARTICLE_TYPES.LEGAL_RESEARCH]: '法律研究',
  [ARTICLE_TYPES.CONTRACT_TEMPLATE]: '合同范本',
  [ARTICLE_TYPES.PRACTICE_GUIDE]: '办案指南',
  [ARTICLE_TYPES.LAWS_REGULATIONS]: '法律法规',
};

const USER_ROLES = {
  ADMIN: 'admin',
  SENIOR_LAWYER: 'senior_lawyer',
  LAWYER: 'lawyer',
  ASSISTANT: 'assistant',
};

const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: '管理员',
  [USER_ROLES.SENIOR_LAWYER]: '资深律师',
  [USER_ROLES.LAWYER]: '律师',
  [USER_ROLES.ASSISTANT]: '行政助理',
};

const TAG_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
};

const PIN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const SEARCH_WEIGHTS = {
  TITLE: 10,
  TAG: 5,
  CONTENT: 1,
};

const RANKING_WEIGHTS = {
  VIEWS: 1,
  LIKES: 10,
};

const CUSTOM_DICTIONARY = [
  '连带责任保证',
  '一般保证',
  '诉讼时效',
  '除斥期间',
  '保证期间',
  '不安抗辩权',
  '先履行抗辩权',
  '同时履行抗辩权',
  '代位权',
  '撤销权',
  '缔约过失责任',
  '违约责任',
  '侵权责任',
  '过错责任',
  '无过错责任',
  '公平责任',
  '举证责任',
  '举证责任倒置',
  '管辖异议',
  '级别管辖',
  '地域管辖',
  '专属管辖',
  '协议管辖',
  '移送管辖',
  '指定管辖',
  '第三人撤销之诉',
  '执行异议之诉',
  '再审',
  '申诉',
  '抗诉',
  '公诉',
  '自诉',
  '取保候审',
  '监视居住',
  '刑事拘留',
  '逮捕',
  '羁押必要性审查',
  '不起诉',
  '免于刑事处罚',
  '缓刑',
  '假释',
  '减刑',
  '累犯',
  '自首',
  '立功',
  '数罪并罚',
  '想象竞合',
  '法条竞合',
  '牵连犯',
  '吸收犯',
  '继续犯',
  '结果加重犯',
  '买卖合同纠纷',
  '借款合同纠纷',
  '租赁合同纠纷',
  '服务合同纠纷',
  '股权转让协议',
  '离婚案件',
  '会见笔录',
  '买卖合同',
  '借款合同',
  '股权转让',
];

module.exports = {
  ARTICLE_TYPES,
  ARTICLE_TYPE_LABELS,
  USER_ROLES,
  USER_ROLE_LABELS,
  TAG_LEVELS,
  PIN_STATUS,
  SEARCH_WEIGHTS,
  RANKING_WEIGHTS,
  CUSTOM_DICTIONARY,
};
