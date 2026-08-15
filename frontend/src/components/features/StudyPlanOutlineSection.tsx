import React, { useState } from 'react';
import { Calendar, CheckCircle2, Download, Clock, ArrowRight } from 'lucide-react';
import { TeachMeAPI } from '../../services/teachMeService';
import type { StudyPlanDTO, NoteOutlineDTO } from '../../types/backend';

interface StudyPlanOutlineSectionProps {
  onOpenStudio?: (tab?: string) => void;
}

export const StudyPlanOutlineSection: React.FC<StudyPlanOutlineSectionProps> = ({ onOpenStudio }) => {
  const [activeView, setActiveView] = useState<'plan' | 'outline'>('plan');

  const [studyPlan] = useState<StudyPlanDTO>({
    documentId: 101,
    totalDays: 5,
    planTitle: '5-Day Midterm Exam Mastery: Cellular Biology & Molecular Genetics',
    schedule: [
      {
        day: 1,
        focusTopic: 'Membrane Transport & ATP Synthase',
        estimatedHours: 2,
        tasks: ['Read Chapter 4 textbook PDF (p. 84-112)', 'Practice 15 due flashcards in Bio deck', 'Take 5-question diagnostic quiz']
      },
      {
        day: 2,
        focusTopic: 'DNA Replication & Helicase Mechanisms',
        estimatedHours: 2.5,
        tasks: ['Ask AI tutor about Okazaki fragments', 'Review Cornell outline on DNA Polymerase III', 'Pass active recall check (>= 80%)']
      },
      {
        day: 3,
        focusTopic: 'RNA Transcription & Splicing Introns',
        estimatedHours: 1.5,
        tasks: ['Listen to 8-min 2-speaker study podcast', 'Review 10 flashcards on RNA Polymerase II']
      },
      {
        day: 4,
        focusTopic: 'Ribosomal Translation & Protein Folding',
        estimatedHours: 2,
        tasks: ['Study tRNA codon chart formulas', 'Rate 20 SM-2 flashcard recall quality grades', 'Export deck to Anki mobile']
      },
      {
        day: 5,
        focusTopic: 'Comprehensive Final Diagnostic & Exam Readiness',
        estimatedHours: 3,
        tasks: ['Calculate AI Exam Readiness score', 'Target review gaps identified by AI tutor', 'Pass final 50-question simulation quiz']
      }
    ]
  });

  const [outline] = useState<NoteOutlineDTO>({
    documentId: 101,
    title: 'Cornell Lecture Notes: Cellular Respiration, Glycolysis & Krebs Cycle',
    sections: [
      {
        heading: '1. Glycolysis (Cytosol)',
        level: 1,
        keyPoints: [
          'Glucose (6C) is phosphorylated into Fructose-1,6-bisphosphate via Hexokinase and PFK-1.',
          'Net yield per glucose molecule: 2 ATP (substrate-level phosphorylation) and 2 NADH.'
        ],
        formulas: ['Net Reaction: C6H12O6 + 2 NAD+ + 2 ADP + 2 Pi → 2 Pyruvate + 2 NADH + 2 ATP + 2 H2O']
      },
      {
        heading: '2. Citric Acid / Krebs Cycle (Mitochondrial Matrix)',
        level: 2,
        keyPoints: [
          'Pyruvate is converted to Acetyl-CoA via the Pyruvate Dehydrogenase Complex (PDH).',
          'Acetyl-CoA combines with Oxaloacetate (4C) to form Citrate (6C).',
          'Per glucose (2 turns): 6 NADH, 2 FADH2, and 2 GTP/ATP produced.'
        ],
        formulas: ['Yield: 2 Acetyl-CoA → 4 CO2 + 6 NADH + 2 FADH2 + 2 GTP']
      },
      {
        heading: '3. Oxidative Phosphorylation & Chemiosmosis (Inner Membrane)',
        level: 2,
        keyPoints: [
          'Electrons pass through Complexes I–IV; protons (H+) pumped into intermembrane space.',
          'Proton motive force drives rotor subunits of ATP Synthase to generate ATP.'
        ],
        formulas: ['Theoretical Maximum Yield: ~30 to 32 ATP per oxidized Glucose molecule']
      }
    ]
  });

  return (
    <section id="study-plans" className="py-24 border-t border-[#272a2e] bg-[#1c1e21] font-['Geist']">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#d9f07c] font-['Geist_Mono'] text-[13px] font-medium mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>Personalized Study Roadmaps</span>
            </div>
            <h2 className="font-['Satoshi'] font-bold text-[32px] sm:text-[38px] text-[#e5e7eb] mb-3">
              Day-by-Day Study Plans & Cornell Lecture Outlines
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#878c99] max-w-[620px] leading-[1.58]">
              TeachMe synthesizes your course syllabus and textbook chapters into daily milestone schedules, key formulas, and Cornell lecture notes.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setActiveView('plan')}
              className={`px-3 py-1.5 rounded-[4px] text-[13px] transition-colors cursor-pointer ${
                activeView === 'plan'
                  ? 'bg-[#272a2e] text-[#a8ff53] font-medium border border-[#3b3e45]'
                  : 'text-[#878c99] hover:text-[#e5e7eb]'
              }`}
            >
              5-Day Study Plan
            </button>
            <button
              onClick={() => setActiveView('outline')}
              className={`px-3 py-1.5 rounded-[4px] text-[13px] transition-colors cursor-pointer ${
                activeView === 'outline'
                  ? 'bg-[#272a2e] text-[#a8ff53] font-medium border border-[#3b3e45]'
                  : 'text-[#878c99] hover:text-[#e5e7eb]'
              }`}
            >
              Cornell Notes & Formulas
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-[#121317] border border-[#272a2e] rounded-[4px] p-6 sm:p-8 shadow-2xl">
          
          {/* VIEW 1: Day-by-Day Study Plan */}
          {activeView === 'plan' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#272a2e] gap-2">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    {studyPlan.planTitle}
                  </h3>
                  <span className="text-[12px] text-[#878c99] font-['Geist_Mono']">
                    Generated from your uploaded course notes • 5 Days • 11.0 Total Study Hours
                  </span>
                </div>

                <button
                  onClick={() => onOpenStudio?.('readiness')}
                  className="inline-flex items-center gap-1.5 text-[13px] text-[#a8ff53] hover:underline cursor-pointer"
                >
                  <span>Check Exam Readiness</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {studyPlan.schedule.map((day) => (
                  <div
                    key={day.day}
                    className="p-4 bg-[#1c1e21] border border-[#272a2e] hover:border-[#3b3e45] rounded-[4px] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded bg-[#121317] border border-[#272a2e] text-[11px] font-['Geist_Mono'] text-[#a8ff53]">
                          Day {day.day}
                        </span>
                        <span className="text-[11px] text-[#878c99] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {day.estimatedHours}h
                        </span>
                      </div>

                      <div className="font-medium text-[13px] text-[#e5e7eb] mb-2 leading-[1.4]">
                        {day.focusTopic}
                      </div>

                      <ul className="space-y-1.5 text-[12px] text-[#878c99]">
                        {day.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-1.5">
                            <span className="text-[#a8ff53] mt-0.5">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-[#272a2e]/60 text-[11px] text-[#afec73] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Milestone Check</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 2: Cornell Note Outlines & Formula Cheatsheet */}
          {activeView === 'outline' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#272a2e] gap-2">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    {outline.title}
                  </h3>
                  <span className="text-[12px] text-[#878c99] font-['Geist_Mono']">
                    Structured Cornell Format with Reaction Equations & Key Formulas
                  </span>
                </div>

                <button
                  onClick={() => TeachMeAPI.export.downloadMarkdownOutline(outline)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#a8ff53] text-[#121317] font-medium text-[12px] rounded hover:bg-[#b8ff70] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .MD Notes</span>
                </button>
              </div>

              {/* Outline Sections */}
              <div className="space-y-4">
                {outline.sections.map((sec, idx) => (
                  <div key={idx} className="p-4 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-[15px] text-[#e5e7eb]">
                        {sec.heading}
                      </h4>
                      <span className="text-[11px] font-['Geist_Mono'] text-[#9c9af2]">Core Concept</span>
                    </div>

                    <ul className="list-disc list-inside text-[13px] text-[#878c99] space-y-1">
                      {sec.keyPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>

                    {sec.formulas && (
                      <div className="p-3 bg-[#121317] border border-[#272a2e] rounded font-['Geist_Mono'] text-[12px] text-[#a8ff53]">
                        {sec.formulas.map((f, fIdx) => (
                          <div key={fIdx}>Reaction Equation: {f}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
