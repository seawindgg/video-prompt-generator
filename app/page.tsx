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
    const modifiedVars: string[] = []; // 记录哪些变量被修改了
    
    Object.entries(selectedTemplate.variables).forEach(([key, variable]) => {
      const selection = selections[key] || { selected: "", custom: "" };
      if (selection.custom) {
        values[key] = selection.custom;
        modifiedVars.push(key);
      } else if (selection.selected) {
        const option = variable.options.find(o => o.name === selection.selected);
        values[key] = option?.content || variable.default;
        if (option) modifiedVars.push(key);
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

    // 智能同义词全局替换
    if (selectedTemplate.synonymRules) {
      Object.entries(selectedTemplate.synonymRules).forEach(([varKey, rule]) => {
        const isModified = modifiedVars.includes(varKey);
        if (isModified && varKey === 'protagonist') {
          // 提取新主角的关键词
          const newProtagonist = values[varKey];
          // 从新主角描述中提取核心词（如"赛车手"）
          const match = newProtagonist.match(/^(.+?)，/);
          const coreWord = match ? match[1] : newProtagonist.split('，')[0];
          
          // 替换原文中的"男生"
          if (coreWord && coreWord !== '男生') {
            prompt = prompt.replace(/男生/g, coreWord);
          }
        }
        if (isModified && varKey === 'crowd') {
          const newCrowd = values[varKey];
          const match = newCrowd.match(/^(?:惊慌 | 奔逃 | 惊恐 | 严阵以待 | 紧急避险) 的 (.+?)$/);
          const coreWord = match ? match[1] : newCrowd;
          if (coreWord && coreWord !== '学生') {
            prompt = prompt.replace(/学生/g, coreWord);
          }
        }
        if (isModified && varKey === 'monster') {
          const newMonster = values[varKey];
          const match = newMonster.match(/一头 (?:三层楼高的)?(.+?) 正在/);
          const coreWord = match ? match[1] : newMonster.split(' ')[0];
          if (coreWord && coreWord !== '骷髅魔') {
            prompt = prompt.replace(/骷髅魔/g, coreWord);
          }
        }
      });
    }

    setGeneratedPrompt(prompt);

    // 生成带高亮的 HTML
    let highlighted = prompt;
    
    // 高亮被修改的变量内容
    modifiedVars.forEach((varKey) => {
      const varValue = values[varKey];
      if (varValue) {
        // 转义 HTML 特殊字符
        const escapedValue = varValue
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        
        // 创建高亮正则（全局替换）
        const regex = new RegExp(`(${escapedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
        highlighted = highlighted.replace(regex, '<mark class="bg-yellow-500/50 text-white px-0.5 rounded">$1</mark>');
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
      const option = variable.options.find(o => o.name === selection.selected);
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
                      {variable.options && variable.options.length > 0 && (
                        <select
                          value={selection.selected}
                          onChange={(e) => handleSelectChange(key, e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          <option value="">使用默认值</option>
                          {variable.options.map((option) => (
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
                className="bg-slate-900/80 rounded-lg p-4 mb-4 max-h-[600px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: highlightedPrompt.replace(/\n/g, '<br/>') || '<span class="text-gray-500">请选择变量以生成 Prompt...</span>' }}
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
