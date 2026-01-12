
import React, { useState } from 'react';
import { AnalysisResult, YouTubeVideo, ScriptOutline } from '../types';
import { generateScriptOutline } from '../services/geminiService';

interface AnalysisViewProps {
  video: YouTubeVideo;
  result: AnalysisResult;
  geminiApiKey: string;
  onClose: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ video, result, geminiApiKey, onClose }) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [outline, setOutline] = useState<ScriptOutline | null>(null);
  const [loadingOutline, setLoadingOutline] = useState(false);

  const handleKeywordSelect = async (kw: string) => {
    if (!geminiApiKey) {
      alert("상단에서 Gemini API 키를 입력해주세요.");
      return;
    }
    setSelectedKeyword(kw);
    setLoadingOutline(true);
    try {
      const data = await generateScriptOutline(geminiApiKey, kw, video.title + " " + result.summary);
      setOutline(data);
    } catch (err) {
      alert("대본 생성 중 오류가 발생했습니다.");
    } finally {
      setLoadingOutline(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-1.5 bg-red-100 rounded-lg">🤖</span>
            AI 정밀 분석 & 기획
          </h2>
          <p className="text-sm text-gray-500 mt-1">"{video.title}" 분석 및 소재 추천</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto bg-slate-50/30">
        {/* 요약 */}
        <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">시청자 반응 요약</h3>
          <p className="text-gray-800 leading-relaxed font-medium">"{result.summary}"</p>
        </section>

        {/* 추천 키워드 영역 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-gray-900">추천 핵심 키워드</h3>
            <span className="text-xs font-medium px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">Click to Plan</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((kw, i) => (
              <button
                key={i}
                onClick={() => handleKeywordSelect(kw)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                  selectedKeyword === kw 
                  ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200 scale-105' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                #{kw}
              </button>
            ))}
          </div>
        </section>

        {/* 대본 생성 결과 */}
        {loadingOutline && (
          <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">선택하신 키워드로 대본 목차를 구성 중입니다...</p>
          </div>
        )}

        {outline && !loadingOutline && (
          <section className="bg-white border-2 border-red-100 rounded-2xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-300">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
              <h4 className="font-bold text-red-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
                콘텐츠 가이드: {outline.keyword}
              </h4>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">추천 제목</p>
                <h5 className="text-xl font-extrabold text-gray-900">"{outline.title}"</h5>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">도입부 (Intro)</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg italic leading-relaxed">
                  {outline.intro}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400">주요 구성 (Outline)</p>
                {outline.sections.map((sec, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      {i < outline.sections.length - 1 && <div className="w-0.5 flex-1 bg-red-50 my-1"></div>}
                    </div>
                    <div className="pb-4">
                      <h6 className="font-bold text-gray-900 mb-1">{sec.heading}</h6>
                      <p className="text-sm text-gray-600 leading-relaxed">{sec.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 mb-2">마무리 (Outro)</p>
                <p className="text-sm text-gray-700 leading-relaxed">{outline.outro}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
