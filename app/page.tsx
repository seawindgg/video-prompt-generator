"use client";

import { useState, useEffect, useCallback } from "react";
import { templates } from "@/data/template";

type Template = typeof templates[0];
type VariableKey = string;

export default function Home() {
  // 当前选择的模板
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);

  // 存储每层变量的选择（支持自定义）
  const [selections, setSelections] = useState<Record<VariableKey, { selected: string; custom: string }>>({});

  // 生成的完整 Prompt（纯文本）
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  // 带高亮的 Prompt（HTML）
  const [highlightedPrompt, setHighlightedPrompt] = useState("");

  // 复制成功提示
  const [copied, setCopied] = useState(false);

  // 初始化选择
  useEffect(() => {
    const initial: Record<VariableKey, { selected: string; custom: string }> = {};
    Object.keys(selectedTemplate.variables).forEach((key) => {
      initial[key] = { selected: "", custom: "" };
    });
    setSelections(initial);
  }, [selectedTemplate]);

  // 智能全局替换 + 高亮
  const generatePromptWithHighlight = useCallback(() => {
    // 获取每层的值（自定义优先，否则用选择的，最后用默认值）
    const values: Record<string, string> = {};
    const modifiedVars: Record<string, {old: string, new: string}> = {}; // 记录替换
    
    Object.entries(selectedTemplate.variables).forEach(([key, variable]) => {
      const selection = selections[key] || { selected: "", custom: "" };
      if (selection.custom) {
        values[key] = selection.custom;
        modifiedVars[key] = { old: variable.default, new: selection.custom };
      } else if (selection.selected) {
        const option = (variable as any).options?.find((o: any) => o.name === selection.selected);
        values[key] = option?.content || variable.default;
        if (option) modifiedVars[key] = { old: variable.default, new: option.content };
      } else {
        values[key] = variable.default;
      }
    });

    // 基于原始模板替换占位符
    let prompt = selectedTemplate.rawTemplate;
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      prompt = prompt.replace(regex, value);
    });

    // 同义词映射表
    const synonymGroups: Record<string, {words: string[], label: string}> = {
      protagonist: { words: ['男生', '他'], label: 'protagonist_name' },
      monster: { words: ['骷髅魔', '怪兽', '它'], label: 'monster_name' },
      crowd: { words: ['学生', '他们'], label: 'crowd_name' },
      mech: { words: ['机甲', '重型机甲', '巨型机甲', '它'], label: 'mech_name' },
    };

    // 存储所有替换记录（用于高亮）
    const allReplacements: Array<{word: string, color: string, type: string}> = [];

    // 智能全文替换 - name 类变量
    const nameVars = ['protagonist_name', 'monster_name', 'crowd_name'];
    nameVars.forEach((nameVar) => {
      if (modifiedVars[nameVar]) {
        const { old: oldVal, new: newVal } = modifiedVars[nameVar];
        
        // 从新值中提取核心词
        let coreNewWord = newVal.split(/[，,]/)[0].trim();
        // 如果核心词太长，取前 10 个字
        if (coreNewWord.length > 10) coreNewWord = coreNewWord.substring(0, 10);
        
        // 找到对应的同义词组
        let synonymGroup = null;
        if (nameVar === 'protagonist_name') synonymGroup = synonymGroups.protagonist;
        else if (nameVar === 'monster_name') synonymGroup = synonymGroups.monster;
        else if (nameVar === 'crowd_name') synonymGroup = synonymGroups.crowd;
        
        if (synonymGroup) {
          // 替换同义词组中的所有词
          synonymGroup.words.forEach((oldWord) => {
            const regex = new RegExp(oldWord, 'g');
            if (prompt.match(regex)) {
              prompt = prompt.replace(regex, coreNewWord);
              allReplacements.push({ word: coreNewWord, color: 'bg-green-500/50', type: nameVar });
            }
          });
        }
      }
    });

    // 特殊处理：台词变量替换（dialogue_crowd 和 dialogue_hero）
    // 因为台词是硬编码在 timeline 中的，需要单独替换
    const dialogueReplacements = [
      { var: 'dialogue_crowd', default: '快走啊威威，这个时候你装什么啊' },
      { var: 'dialogue_hero', default: '下课' },
    ];
    
    dialogueReplacements.forEach(({ var: dialogueVar, default: defaultDialogue }) => {
      if (modifiedVars[dialogueVar]) {
        const { new: newDialogue } = modifiedVars[dialogueVar];
        // 替换默认台词为新台词
        const regex = new RegExp(defaultDialogue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (prompt.match(regex)) {
          prompt = prompt.replace(regex, newDialogue);
        }
      }
    });

    // 高亮颜色映射
    const highlightColors: Record<string, string> = {
      'protagonist_name': 'bg-green-500/50',    // 主角名称 - 绿色
      'monster_name': 'bg-red-500/50',          // 怪兽名称 - 红色
      'crowd_name': 'bg-blue-500/50',           // 人群名称 - 蓝色
      'protagonist_desc': 'bg-purple-500/50',   // 主角描述 - 紫色
      'monster_desc': 'bg-orange-500/50',       // 怪兽描述 - 橙色
      'crowd_desc': 'bg-blue-500/30',           // 人群描述 - 浅蓝色
      'scene': 'bg-cyan-500/50',                // 场景 - 青色
      'armor': 'bg-yellow-500/50',              // 铠甲 - 黄色
      'lighting': 'bg-pink-500/50',             // 光线环境 - 粉色
      'camera': 'bg-indigo-500/50',             // 镜头方式 - 靛蓝色
      'duration': 'bg-teal-500/50',             // 视频时长 - 蓝绿色
      'style': 'bg-rose-500/50',                // 风格 - 玫瑰色
      'quality': 'bg-slate-500/50',             // 物理质感 - 灰色
      'dialogue_crowd': 'bg-amber-500/50',      // 人群台词 - 琥珀色
      'dialogue_hero': 'bg-lime-500/50',        // 主角台词 - 青柠色
      'timeline': 'bg-violet-500/50',           // 时间轴分镜 - 紫色
      'protagonist_action': 'bg-emerald-500/50', // 主角动作 - 翠绿色
      'monster_action': 'bg-fuchsia-500/50',    // 怪兽动作 - 紫红色
    };

    setGeneratedPrompt(prompt);

    // 生成带高亮的 HTML
    let highlighted = prompt;
    
    // 高亮所有被修改的变量内容
    Object.entries(modifiedVars).forEach(([key, { old: oldVal, new: newVal }]) => {
      const color = highlightColors[key] || 'bg-yellow-500/50';
      
      // 对于 name 类变量，高亮核心词
      if (nameVars.includes(key)) {
        const coreWord = newVal.split(/[，,]/)[0].trim().substring(0, 10);
        const escapedValue = coreWord
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const regex = new RegExp(`(${escapedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
        highlighted = highlighted.replace(regex, `<mark class="${color} text-white px-0.5 rounded">$1</mark>`);
      }
      // 对于其他变量（desc/action/基础变量等），高亮新值中的独特部分
      else {
        // 提取新值中的独特内容（排除已高亮的 name 部分）
        let contentToHighlight = newVal;
        
        // 如果新值包含 name 类变量的核心词，排除它（避免重复高亮）
        nameVars.forEach((nameVar) => {
          if (modifiedVars[nameVar]) {
            const nameCore = modifiedVars[nameVar].new.split(/[，,]/)[0].trim().substring(0, 10);
            contentToHighlight = contentToHighlight.replace(nameCore, '');
          }
        });
        
        // 只高亮长度适中的内容（避免高亮过长的 timeline）
        if (contentToHighlight && contentToHighlight.trim().length > 0 && contentToHighlight.length < 200) {
          const escapedValue = contentToHighlight
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          const regex = new RegExp(`(${escapedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
          highlighted = highlighted.replace(regex, `<mark class="${color} text-white px-0.5 rounded">$1</mark>`);
        }
      }
    });

    setHighlightedPrompt(highlighted);
  }, [selections, selectedTemplate]);

  useEffect(() => {
    generatePromptWithHighlight();
  }, [generatePromptWithHighlight]);

  // 处理选择变化
  const handleSelectChange = (key: VariableKey, value: string) => {
    setSelections(prev => ({
      ...prev,
      [key]: { ...prev[key], selected: value }
    }));
  };

  // 处理自定义输入变化
  const handleCustomChange = (key: VariableKey, value: string) => {
    setSelections(prev => ({
      ...prev,
      [key]: { ...prev[key], custom: value }
    }));
  };

  // 获取当前层的值（用于显示）
  const getVariableValue = (key: VariableKey) => {
    const selection = selections[key];
    const variable = selectedTemplate.variables[key as keyof typeof selectedTemplate.variables];
    if (!selection || !variable) return "";
    if (selection.custom) return selection.custom;
    if (selection.selected) {
      const option = (variable as any).options?.find((o: any) => o.name === selection.selected);
      return option?.content || selection.selected;
    }
    return variable.default;
  };

  // 检查变量是否被修改
  const isVariableModified = (key: VariableKey) => {
    const selection = selections[key];
    return !!(selection && (selection.custom || selection.selected));
  };

  // 一键恢复默认
  const handleReset = () => {
    const initial: Record<VariableKey, { selected: string; custom: string }> = {};
    Object.keys(selectedTemplate.variables).forEach((key) => {
      initial[key] = { selected: "", custom: "" };
    });
    setSelections(initial);
  };

  // 复制 Prompt
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  // 统计修改数量
  const modifiedCount = Object.entries(selections).filter(
    ([, selection]) => selection.custom || selection.selected
  ).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* 头部 */}
      <header className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🎬 视频 Prompt 生成器
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                基于模板的可视化 Prompt 生成工具
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/seawindgg/video-prompt-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 模板选择 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📋 选择模板
          </label>
          <select
            value={selectedTemplate.id}
            onChange={(e) => {
              const template = templates.find(t => t.id === e.target.value);
              if (template) setSelectedTemplate(template);
            }}
            className="w-full max-w-md bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：表单 */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  📋 变量配置
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    已修改：{modifiedCount}/{Object.keys(selectedTemplate.variables).length}
                  </span>
                  {modifiedCount > 0 && (
                    <button
                      onClick={handleReset}
                      className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all flex items-center gap-1"
                    >
                      🔄 恢复默认
                    </button>
                  )}
                </div>
              </div>
              
              {/* 变量表单 */}
              <div className="space-y-6">
                {Object.entries(selectedTemplate.variables).map(([key, variable], index) => {
                  const selection = selections[key] || { selected: "", custom: "" };
                  const isBase = variable.type === 'base';
                  const isModified = isVariableModified(key);
                  
                  return (
                    <div key={key} className={`space-y-2 p-3 rounded-lg transition-all ${isModified ? 'bg-purple-500/10 border border-purple-500/30' : ''}`}>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <span className="text-xl">{variable.icon}</span>
                        <span>{index + 1}. {variable.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${isBase ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                          {isBase ? '基础' : '特有'}
                        </span>
                        {isModified && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                            ✏️ 已修改
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">({key})</span>
                      </label>
                      
                      {/* 下拉选择 */}
                      {(variable as any).options && (variable as any).options.length > 0 && (
                        <select
                          value={selection.selected}
                          onChange={(e) => handleSelectChange(key, e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          <option value="">使用默认值</option>
                          {(variable as any).options.map((option: any) => (
                            <option key={option.name} value={option.name}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {/* 自定义输入 */}
                      <textarea
                        value={selection.custom}
                        onChange={(e) => handleCustomChange(key, e.target.value)}
                        placeholder={selection.custom ? "" : ((variable as any).placeholder || `或自定义${variable.label}...`)}
                        rows={selection.custom ? 3 : 1}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      />
                      
                      {/* 当前值预览 */}
                      {getVariableValue(key) && (
                        <p className="text-xs text-purple-400 mt-1 line-clamp-2">
                          → {getVariableValue(key)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 右侧：实时预览 */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  ✨ 实时预览
                </h2>
                {modifiedCount > 0 && (
                  <span className="text-xs text-yellow-400">
                    🔍 黄色高亮 = 已修改内容
                  </span>
                )}
              </div>
              
              {/* 生成的 Prompt */}
              <div 
                className="bg-white/5 rounded-lg p-4 mb-4 max-h-[600px] overflow-y-auto border border-white/10"
                dangerouslySetInnerHTML={{ __html: highlightedPrompt.replace(/\n/g, '<br/>') || '<span class="text-gray-400">请选择变量以生成 Prompt...</span>' }}
                style={{ 
                  color: '#f1f5f9',
                  textShadow: '0 0 1px rgba(255,255,255,0.1)'
                }}
              />
              
              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  disabled={!generatedPrompt}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <span>✅</span>
                      <span>已复制!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>复制 Prompt</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* 使用提示 */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  💡 使用提示
                </h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>• 每层变量可选择预设或自定义输入</li>
                  <li>• 自定义输入会覆盖选择的内容</li>
                  <li>• 不选择则使用默认值（原版 Prompt）</li>
                  <li>• <span className="text-yellow-400">黄色高亮</span>显示已修改的内容</li>
                  <li>• 点击"恢复默认"一键重置所有变量</li>
                </ul>
              </div>
              
              {/* 统计信息 */}
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-xs text-gray-500">
                <span>字符数：{generatedPrompt.length}</span>
                <span>模板：{selectedTemplate.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="border-t border-purple-500/30 bg-slate-900/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>视频 Prompt 生成器 - 基于模板的可视化生成工具</p>
          <p className="mt-1">Powered by Next.js + Vercel</p>
        </div>
      </footer>
    </main>
  );
}
