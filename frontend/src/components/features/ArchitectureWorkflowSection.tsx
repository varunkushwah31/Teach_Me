import React, { useState } from 'react';
import { ArrowRight, BookOpen, HelpCircle, Layers, Volume2, X } from 'lucide-react';

interface ArchitectureWorkflowSectionProps {
  onOpenStudio?: (tab?: string) => void;
}

interface WorkflowCardData {
  id: string;
  title: string;
  badge: string;
  description: string;
  diagramType: 'tutor' | 'quiz' | 'flashcard' | 'podcast';
  fullExplanation: string;
  details: string[];
}

const CARDS: WorkflowCardData[] = [
  {
    id: 'tutor-qa',
    title: 'Interactive AI Tutor Q&A',
    badge: 'Vector Grounding',
    description: 'Ask any question about your textbook PDF; get plain-English explanations with exact page citations.',
    diagramType: 'tutor',
    fullExplanation: `1. Student uploads course PDF (e.g. Molecular Biology Ch. 4).
2. TeachMe breaks the text into 512-token chunks and indexes them in PgVector.
3. When you ask a question, the AI retrieves relevant chunks (cosine distance < 0.35).
4. Ollama or your custom API explains the concept with verifiable textbook footnotes.`,
    details: [
      'Grounded in your uploaded document chunks with zero hallucinations',
      'Verifiable page & chapter citation links on every answer',
      'Supports complex STEM equations and legal case precedents'
    ]
  },
  {
    id: 'quiz-engine',
    title: 'Diagnostic Practice Quizzes',
    badge: 'Bloom Taxonomy',
    description: 'Generate 5-question multiple choice tests from your notes to diagnose exam weaknesses.',
    diagramType: 'quiz',
    fullExplanation: `1. TeachMe analyzes key concepts in your uploaded chapter.
2. Formulates 5 multiple-choice questions testing both recall and application.
3. Instant automated grading with score calculation (pass mark: >= 80%).
4. In-depth answer rationales showing why incorrect distractors are wrong.`,
    details: [
      'Bloom taxonomy alignment from basic definitions to synthesis',
      'Instant grading with detailed pedagogical feedback',
      'Direct citations to review chapters for every missed question'
    ]
  },
  {
    id: 'sm2-flashcards',
    title: 'SM-2 Spaced Repetition',
    badge: 'Memory Science',
    description: 'Automated flashcard decks with dynamic Ease Factor calculation and 1-click Anki export.',
    diagramType: 'flashcard',
    fullExplanation: `1. Key concepts and formulas are converted to interactive 3D flashcards.
2. Students rate their recall quality from 0 (Blackout) to 5 (Perfect).
3. The SuperMemo-2 algorithm updates the card's Ease Factor:
   EF' = max(1.3, EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
4. Calculates the optimal next review interval (e.g. 1d -> 6d -> 15d).`,
    details: [
      'Prevents the forgetting curve through adaptive interval scheduling',
      'Dynamic Ease Factor calculation with minimum boundary clamping',
      'One-click export to Anki (.apkg / .txt) for mobile study'
    ]
  },
  {
    id: 'audio-podcasts',
    title: '2-Speaker AI Study Podcast',
    badge: 'Audio Learning',
    description: 'Converts dense reading material into engaging conversational episodes between Alex and Maya.',
    diagramType: 'podcast',
    fullExplanation: `1. Extracts the core narrative and debates from your uploaded chapter.
2. Generates a 2-host dialogue script with analogies and banter.
3. Plays back speech with real browser voice synthesis (distinct pitches for Alex & Maya).
4. Synchronizes live audio equalizer with active dialogue sentence highlighting.`,
    details: [
      'Study on commutes, workouts, or walks with hands-free audio',
      'Natural dialogue analogies that make dry topics easy to grasp',
      'Real browser speech synthesis with speaker-specific voice tuning'
    ]
  }
];

export const ArchitectureWorkflowSection: React.FC<ArchitectureWorkflowSectionProps> = ({ onOpenStudio }) => {
  const [selectedCard, setSelectedCard] = useState<WorkflowCardData | null>(null);

  return (
    <section id="how-it-works" className="py-24 border-t border-[#272a2e] bg-[#1c1e21] relative overflow-hidden font-['Geist']">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-14 max-w-[700px]">
          <div className="inline-flex items-center gap-1.5 text-[#a8ff53] font-['Geist_Mono'] text-[13px] font-medium mb-3">
            <span>Pedagogical Architecture</span>
          </div>

          <h2 className="font-['Satoshi'] font-bold text-[32px] sm:text-[40px] text-[#e5e7eb] mb-4">
            Four AI Learning Engines Built for Complete Course Mastery
          </h2>

          <p className="text-[16px] text-[#878c99] leading-[1.58]">
            TeachMe transforms your passive reading into active recall through vector-grounded Q&A, diagnostic quizzes, spaced repetition memory, and audio podcasts.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="bg-[#121317] border border-[#272a2e] hover:border-[#3b3e45] rounded-[4px] p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl cursor-pointer group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {card.diagramType === 'tutor' && <BookOpen className="w-4 h-4 text-[#a8ff53]" />}
                    {card.diagramType === 'quiz' && <HelpCircle className="w-4 h-4 text-[#fa3abf]" />}
                    {card.diagramType === 'flashcard' && <Layers className="w-4 h-4 text-[#9c9af2]" />}
                    {card.diagramType === 'podcast' && <Volume2 className="w-4 h-4 text-[#d9f07c]" />}
                    <h3 className="font-['Satoshi'] font-semibold text-[18px] text-[#e5e7eb] group-hover:text-[#a8ff53] transition-colors">
                      {card.title}
                    </h3>
                  </div>
                  <span className="text-[11.5px] font-['Geist_Mono'] text-[#878c99] px-2 py-0.5 rounded bg-[#1c1e21] border border-[#272a2e]">
                    {card.badge}
                  </span>
                </div>

                <p className="text-[14px] leading-[1.6] text-[#878c99] mb-5">
                  {card.description}
                </p>

                {/* Visual Mini-Flow Container */}
                <div className="bg-[#1c1e21] border border-[#272a2e] rounded-[4px] p-4 font-['Geist_Mono'] text-[12px] text-[#d7d9dd] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#878c99]">
                    <span>Workflow Step</span>
                    <span className="text-[#a8ff53]">Active Pipeline</span>
                  </div>
                  <div className="p-2.5 bg-[#121317] rounded border border-[#272a2e]/80 text-[#d7d9dd] truncate">
                    {card.diagramType === 'tutor' && 'PDF -> 512-Token Chunks -> PgVector -> SSE Stream'}
                    {card.diagramType === 'quiz' && 'Key Topics -> Bloom 5 MCQs -> Instant Grading -> Review'}
                    {card.diagramType === 'flashcard' && 'Concept Deck -> Rate 0-5 -> Recalculate EF -> Anki Sync'}
                    {card.diagramType === 'podcast' && 'Chapter -> Alex & Maya Script -> TTS Speech Audio'}
                  </div>
                </div>
              </div>

              {/* Bottom Action Link */}
              <div className="pt-4 mt-5 border-t border-[#272a2e]/60 flex items-center justify-between text-[13px] text-[#878c99] group-hover:text-[#a8ff53] transition-colors">
                <span>Inspect learning methodology</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal Inspector for Cards */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121317] border border-[#3b3e45] rounded-[4px] max-w-[650px] w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#1c1e21] border border-[#272a2e] text-[#a8ff53] text-[12px] font-['Geist_Mono'] rounded">
                  {selectedCard.badge}
                </span>
                <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                  {selectedCard.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1 text-[#878c99] hover:text-[#e5e7eb] rounded hover:bg-[#272a2e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-[13px] font-['Geist_Mono'] text-[#878c99] uppercase tracking-wider">
                Step-by-Step Mechanism
              </h4>
              <div className="bg-[#1c1e21] p-4 rounded border border-[#272a2e] text-[13.5px] leading-[1.65] text-[#d7d9dd] font-['Geist_Mono'] whitespace-pre-wrap">
                {selectedCard.fullExplanation}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[13px] font-['Geist_Mono'] text-[#878c99] uppercase tracking-wider">
                Key Learning Benefits
              </h4>
              <ul className="space-y-1.5 text-[13.5px] text-[#878c99]">
                {selectedCard.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a8ff53]" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[#272a2e] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 bg-[#1c1e21] hover:bg-[#272a2e] text-[#d7d9dd] text-[13px] rounded cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const targetTab = selectedCard.diagramType === 'tutor' ? 'chat' : selectedCard.diagramType === 'quiz' ? 'quiz' : selectedCard.diagramType === 'flashcard' ? 'flashcards' : 'podcast';
                  setSelectedCard(null);
                  onOpenStudio?.(targetTab);
                }}
                className="px-4 py-2 bg-[#a8ff53] hover:bg-[#b8ff70] text-[#121317] font-medium text-[13px] rounded cursor-pointer"
              >
                Launch in Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
