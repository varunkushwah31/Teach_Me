import React, { useState } from 'react';
import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  ClockIcon,
  CheckSquareIcon,
  SquareIcon
} from '@phosphor-icons/react';
import { TeachMeAPI } from '@/services/teachMeService.ts';
import type { StudyPlanDTO, NoteOutlineDTO } from '@/types/backend.ts';

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
        focusTopic: 'Comprehensive Diagnostic & Exam Readiness',
        estimatedHours: 3,
        tasks: ['Calculate AI Exam Readiness score', 'Target review gaps identified by AI tutor', 'Pass final 50-question simulation quiz']
      }
    ]
  });

  // Interactive completed tasks state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    '1-0': true,
    '1-1': true,
    '1-2': false,
    '2-0': false
  });

  const totalTasks = studyPlan.schedule.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const toggleTask = (dayIdx: number, taskIdx: number) => {
    const key = `${dayIdx}-${taskIdx}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
        formulas: ['Net Reaction: C6H12O6 + 2 NAD+ + 2 ADP + 2 Pi -> 2 Pyruvate + 2 NADH + 2 ATP + 2 H2O']
      },
      {
        heading: '2. Citric Acid / Krebs Cycle (Mitochondrial Matrix)',
        level: 2,
        keyPoints: [
          'Pyruvate is converted to Acetyl-CoA via the Pyruvate Dehydrogenase Complex (PDH).',
          'Acetyl-CoA combines with Oxaloacetate (4C) to form Citrate (6C).',
          'Per glucose (2 turns): 6 NADH, 2 FADH2, and 2 GTP/ATP produced.'
        ],
        formulas: ['Yield: 2 Acetyl-CoA -> 4 CO2 + 6 NADH + 2 FADH2 + 2 GTP']
      },
      {
        heading: '3. Oxidative Phosphorylation & Chemiosmosis (Inner Membrane)',
        level: 2,
        keyPoints: [
          'Electrons pass through Complexes I-IV; protons (H+) pumped into intermembrane space.',
          'Proton motive force drives rotor subunits of ATP Synthase to generate ATP.'
        ],
        formulas: ['Theoretical Maximum Yield: ~30 to 32 ATP per oxidized Glucose molecule']
      }
    ]
  });

  return (
    <section id="study-plans" className="py-24 border-t border-[#1c1f2e] bg-[#08090d] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white mb-3 tracking-tight">
              Day-by-Day Study Plans &amp; Cornell Lecture Outlines
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-[65ch] leading-relaxed">
              TeachMe parses your uploaded course syllabus into daily milestone goals with an interactive checklist, formula cheatsheet, and Cornell lecture notes.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setActiveView('plan')}
              className={`px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer font-bold ${
                activeView === 'plan'
                  ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                  : 'text-zinc-400 hover:text-white bg-[#141622] border border-[#1c1f2e]'
              }`}
            >
              5-Day Study Roadmap
            </button>
            <button
              onClick={() => setActiveView('outline')}
              className={`px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer font-bold ${
                activeView === 'outline'
                  ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                  : 'text-zinc-400 hover:text-white bg-[#141622] border border-[#1c1f2e]'
              }`}
            >
              Cornell Notes &amp; Formulas
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-[#0e1017] border border-[#1c1f2e] rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* VIEW 1: Day-by-Day Study Plan */}
          {activeView === 'plan' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c1f2e] gap-3">
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {studyPlan.planTitle}
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono mt-0.5 inline-block">
                    Generated from course notes • 5 Days • 11.0 Total Hours
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono text-zinc-400">Roadmap Progress:</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">{progressPercent}% ({completedCount}/{totalTasks} tasks)</div>
                  </div>
                  <div className="w-28 h-2 bg-[#141622] rounded-full overflow-hidden border border-[#1c1f2e]">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Day Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {studyPlan.schedule.map((day) => (
                  <div
                    key={day.day}
                    className="p-4 bg-[#141622] border border-[#1c1f2e] hover:border-[#282c40] rounded-2xl flex flex-col justify-between space-y-3 transition-colors shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#0e1017] border border-[#1c1f2e] text-xs font-mono text-indigo-300 font-semibold">
                          Day {day.day}
                        </span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                          <ClockIcon className="w-3.5 h-3.5 text-zinc-500" /> {day.estimatedHours}h
                        </span>
                      </div>

                      <div className="font-semibold text-xs text-zinc-100 mb-3 leading-snug">
                        {day.focusTopic}
                      </div>

                      <ul className="space-y-2 text-xs">
                        {day.tasks.map((task, taskIdx) => {
                          const isDone = Boolean(completedTasks[`${day.day}-${taskIdx}`]);
                          return (
                            <li
                              key={task}
                              onClick={() => toggleTask(day.day, taskIdx)}
                              className="flex items-start gap-2 cursor-pointer group"
                            >
                              <span className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckSquareIcon className="w-3.5 h-3.5 text-emerald-400" weight="fill" />
                                ) : (
                                  <SquareIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                                )}
                              </span>
                              <span className={isDone ? 'line-through text-zinc-500' : 'text-zinc-300 group-hover:text-white'}>
                                {task}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="pt-2.5 border-t border-[#1c1f2e] text-xs text-indigo-400 flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Milestone</span>
                      </span>
                      <button
                        onClick={() => onOpenStudio?.('quiz')}
                        className="text-xs hover:underline text-indigo-400 cursor-pointer font-bold"
                      >
                        Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 2: Cornell Note Outlines & Formula Cheatsheet */}
          {activeView === 'outline' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c1f2e] gap-3">
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {outline.title}
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono mt-0.5 inline-block">
                    Structured Cornell Format with Reaction Equations &amp; Key Formulas
                  </span>
                </div>

                <button
                  onClick={() => TeachMeAPI.export.downloadMarkdownOutline(outline)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 border border-indigo-400/30"
                >
                  <DownloadSimpleIcon className="w-4 h-4" weight="bold" />
                  <span>Download .MD Notes</span>
                </button>
              </div>

              {/* Outline Sections */}
              <div className="space-y-4">
                {outline.sections.map((sec) => (
                  <div key={sec.heading} className="p-5 bg-[#141622] border border-[#1c1f2e] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-white">
                        {sec.heading}
                      </h4>
                      <span className="text-xs font-mono text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Core Concept
                      </span>
                    </div>

                    <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1.5 leading-relaxed">
                      {sec.keyPoints.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>

                    {sec.formulas && (
                      <div className="p-3 bg-[#0e1017] border border-[#1c1f2e] rounded-xl font-mono text-xs text-emerald-400">
                        {sec.formulas.map((f) => (
                          <div key={f}>Formula / Reaction: {f}</div>
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
