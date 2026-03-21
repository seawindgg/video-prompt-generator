"use client";

import { useState, useEffect } from "react";
import { template } from "@/data/template";

type VariableKey = keyof typeof template.variables;

export default function Home() {
  // 存储每层变量的选择（支持自定义）
  const [selections, setSelections] = useState<Record<VariableKey, { selected: string; custom: string }>>({
    scene: { selected: "", custom: "" },
    subject: { selected: "", custom: "" },
    armor: { selected: "", custom: "" },
    event: { selected: "", custom: "" },
    camera: { selected: "", custom: "" },
    lighting: { selected: "", custom: "" },
    duration: { selected: "", custom: "" },
    timeline: { selected: "", custom: "" },
    quality: { selected: "", custom: "" },
  });

  // 生成的完整 Prompt
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  // 复制成功提示
  const [copied, setCopied] = useState(false);

  // 实时生成 Prompt
  useEffect(() => {
    // 获取每层的值（自定义优先，否则用选择的）
    const values: Record<string, string> = {};
    
    (Object.keys(template.variables) as VariableKey[]).forEach((key) => {
      const selection = selections[key];
      if (selection.custom) {
        values[key] = selection.custom;
      } else if (selection.selected) {
        const option = template.variables[key].options.find(o => o.name === selection.selected);
        values[key] = option?.content || "";
      } else {
        // 默认使用 placeholder
        values[key] = template.variables[key].placeholder || "";
      }
    });

    // 基于原始模板替换占位符
    let prompt = template.rawTemplate;
    prompt = prompt.replace(/{scene}/g, values.scene);
    prompt = prompt.replace(/{subject}/g, values.subject);
    prompt = prompt.replace(/{armor}/g, values.armor);
    prompt = prompt.replace(/{event}/g, values.event);
    prompt = prompt.replace(/{camera}/g, values.camera);
    prompt = prompt.replace(/{lighting}/g, values.lighting);
    prompt = prompt.replace(/{duration}/g, values.duration);
    prompt = prompt.replace(/{timeline}/g, values.timeline);
    prompt = prompt.replace(/{quality}/g, values.quality);

    setGeneratedPrompt(prompt);
  }, [selections]);

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
    if (selection.custom) return selection.custom;
    if (selection.selected) {
      const option = template.variables[key].options.find(o => o.name === selection.selected);
      return option?.content || selection.selected;
    }
    return template.variables[key].placeholder || `请选择${template.variables[key].label}`;
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
                {template.name}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：表单 */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                📋 选择变量
              </h2>
              
              {/* 9 层变量表单 */}
              <div className="space-y-6">
                {(Object.keys(template.variables) as VariableKey[]).map((key, index) => {
                  const variable = template.variables[key];
                  const selection = selections[key];
                  
                  return (
                    <div key={key} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <span className="text-xl">{variable.icon}</span>
                        <span>{index + 1}. {variable.label}</span>
                        <span className="text-xs text-gray-500 ml-auto">({key})</span>
                      </label>
                      
                      {/* 下拉选择 */}
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
                      
                      {/* 自定义输入 */}
                      <textarea
                        value={selection.custom}
                        onChange={(e) => handleCustomChange(key, e.target.value)}
                        placeholder={selection.custom ? "" : `或自定义${variable.label}...`}
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
              <h2 className="text-xl font-semibold text-white mb-4">
                ✨ 实时预览
              </h2>
              
              {/* 生成的 Prompt */}
              <div className="bg-slate-900/80 rounded-lg p-4 mb-4 max-h-[600px] overflow-y-auto">
                <p className="text-gray-100 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {generatedPrompt || "请选择变量以生成 Prompt..."}
                </p>
              </div>
              
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
                  <li>• 所有变量自动替换到完整模板中</li>
                  <li>• 点击复制按钮即可使用</li>
                </ul>
              </div>
              
              {/* 统计信息 */}
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-xs text-gray-500">
                <span>字符数：{generatedPrompt.length}</span>
                <span>模板：{template.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="border-t border-purple-500/30 bg-slate-900/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>视频 Prompt 生成器 - 基于 {template.name}</p>
          <p className="mt-1">Powered by Next.js + Vercel</p>
        </div>
      </footer>
    </main>
  );
}
