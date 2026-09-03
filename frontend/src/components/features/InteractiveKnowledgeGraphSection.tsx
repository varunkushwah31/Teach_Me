import React, { useState } from 'react';
import { ShareNetworkIcon, ArrowRightIcon, SparkleIcon, BookOpenIcon } from '@phosphor-icons/react';

interface KnowledgeNode {
  id: string;
  label: string;
  x: number;
  y: number;
  group: 'core' | 'mechanism' | 'synthesis' | 'metabolism' | 'application';
  color: string;
  description: string;
}

const NODES: KnowledgeNode[] = [
  {
    id: 'dna-core',
    label: 'DNA Double Helix',
    x: 400,
    y: 200,
    group: 'core',
    color: '#a8ff53',
    description: 'Central genetic blueprint composed of antiparallel nucleotide strands (A-T, G-C) stabilized by hydrogen bonding.'
  },
  {
    id: 'transcription',
    label: 'RNA Transcription',
    x: 180,
    y: 120,
    group: 'mechanism',
    color: '#9c9af2',
    description: 'RNA Polymerase II binds to the promoter sequence to transcribe DNA into precursor mRNA, followed by 5\' capping and intron splicing.'
  },
  {
    id: 'translation',
    label: 'Ribosomal Translation',
    x: 620,
    y: 120,
    group: 'synthesis',
    color: '#fa3abf',
    description: 'Ribosomes (60S/40S subunits) read mRNA codons, where tRNA delivers matching amino acids to synthesize polypeptide chains.'
  },
  {
    id: 'protein-folding',
    label: 'Protein Folding & Enzymes',
    x: 200,
    y: 300,
    group: 'synthesis',
    color: '#afec73',
    description: 'Chaperone proteins assist polypeptide folding into tertiary and quaternary structures, forming functional biological enzymes.'
  },
  {
    id: 'metabolism',
    label: 'Cellular Respiration & ATP',
    x: 600,
    y: 300,
    group: 'metabolism',
    color: '#d9f07c',
    description: 'Glycolysis, Krebs Cycle, and the Electron Transport Chain generate 32 ATP molecules driven by proton gradients and ATP Synthase.'
  },
  {
    id: 'crispr-mutations',
    label: 'Genetic Mutations & Repair',
    x: 400,
    y: 60,
    group: 'application',
    color: '#f43f5e',
    description: 'Base mismatches, tautomeric shifts, and radiation-induced double-strand breaks repaired by homologous recombination or CRISPR endonuclease.'
  }
];

const EDGES = [
  { from: 'dna-core', to: 'transcription', label: 'transcribes into' },
  { from: 'transcription', to: 'translation', label: 'translated by' },
  { from: 'translation', to: 'protein-folding', label: 'folds into' },
  { from: 'protein-folding', to: 'metabolism', label: 'catalyzes' },
  { from: 'dna-core', to: 'crispr-mutations', label: 'mutations in' },
  { from: 'crispr-mutations', to: 'dna-core', label: 'repaired by' },
  { from: 'metabolism', to: 'dna-core', label: 'energizes' }
];

interface InteractiveKnowledgeGraphSectionProps {
  onOpenStudio?: (tab?: string) => void;
}

export const InteractiveKnowledgeGraphSection: React.FC<InteractiveKnowledgeGraphSectionProps> = ({ onOpenStudio }) => {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode>(NODES[0]);

  return (
    <section id="knowledge-graph" className="py-24 border-t border-[#2e3238] bg-[#1c1e21] relative overflow-hidden font-['Inter']">
      <div className="max-w-310 mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#e888f8] font-mono text-[13px] font-semibold mb-3">
              <ShareNetworkIcon className="w-4 h-4" />
              <span>Vector Graph Reasoning</span>
            </div>
            <h2 className="font-bold text-[32px] sm:text-[40px] text-[#f3f4f6] mb-3 tracking-tight">
              Visual Concept Maps Extracted from Course Textbooks
            </h2>
            <p className="text-[16px] text-[#b5b8c0] max-w-160 leading-[1.6]">
              TeachMe parses semantic entities and directional causal links directly from uploaded documents. Click any node below to inspect its definition and generate targeted diagnostic quizzes.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('knowledge')}
            className="group inline-flex items-center gap-2 text-[14px] text-[#a8ff53] font-semibold hover:underline cursor-pointer mt-4 md:mt-0"
          >
            <span>Explore full concept graph in Studio</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" weight="bold" />
          </button>
        </div>

        {/* Interactive Graph Box */}
        <div className="bg-[#121317] border border-[#2e3238] rounded p-6 shadow-2xl relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* SVG Visualizer */}
            <div className="lg:col-span-8 bg-[#1c1e21] border border-[#2e3238] rounded p-4 flex items-center justify-center relative min-h-96 overflow-hidden">
              <svg viewBox="0 0 800 420" className="w-full h-full max-h-96">
                {/* Edges */}
                {EDGES.map((edge) => {
                  const src = NODES.find(n => n.id === edge.from)!;
                  const dst = NODES.find(n => n.id === edge.to)!;
                  const isHighlighted = selectedNode.id === src.id || selectedNode.id === dst.id;

                  return (
                    <g key={`${edge.from}->${edge.to}`}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={dst.x}
                        y2={dst.y}
                        stroke={isHighlighted ? '#a8ff53' : '#3b3e45'}
                        strokeWidth={isHighlighted ? '2.5' : '1'}
                        strokeDasharray={isHighlighted ? 'none' : '4,4'}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {NODES.map((node) => {
                  const isSelected = selectedNode.id === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer group"
                    >
                      {/* Outer pulse when selected */}
                      {isSelected && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="30"
                          fill="none"
                          stroke={node.color}
                          strokeWidth="2"
                          className="animate-ping opacity-40"
                        />
                      )}
                      
                      {/* Node circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? '22' : '17'}
                        fill="#121317"
                        stroke={node.color}
                        strokeWidth={isSelected ? '3.5' : '1.5'}
                        className="transition-all duration-200"
                      />

                      {/* Node Label */}
                      <text
                        x={node.x}
                        y={node.y + 35}
                        textAnchor="middle"
                        fill={isSelected ? '#f3f4f6' : '#a0a4af'}
                        fontSize="12"
                        fontFamily="Inter, sans-serif"
                        fontWeight={isSelected ? '700' : '500'}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Details Inspector */}
            <div className="lg:col-span-4 bg-[#1c1e21] border border-[#2e3238] rounded p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full animate-ping"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <span className="font-mono text-[12px] text-[#a0a4af] uppercase tracking-wider">
                    {selectedNode.group} Concept
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#121317] border border-[#2e3238] text-[#a8ff53] font-mono">
                  Vector Grounded
                </span>
              </div>

              <div>
                <h4 className="font-bold text-[19px] text-[#f3f4f6] mb-2">
                  {selectedNode.label}
                </h4>
                <p className="text-[14px] leading-[1.65] text-[#b5b8c0]">
                  {selectedNode.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#2e3238] space-y-2">
                <button
                  onClick={() => onOpenStudio?.('quiz')}
                  className="w-full py-2.5 bg-[#272a2e] hover:bg-[#343840] text-[#a8ff53] text-[13px] font-semibold rounded transition-all cursor-pointer text-center flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(168,255,83,0.15)]"
                >
                  <SparkleIcon className="w-4 h-4" />
                  <span>Generate Quiz for this Concept →</span>
                </button>

                <button
                  onClick={() => onOpenStudio?.('chat')}
                  className="w-full py-2 bg-[#121317] hover:bg-[#191c22] text-[#d7d9dd] border border-[#2e3238] text-[12.5px] rounded transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <BookOpenIcon className="w-3.5 h-3.5 text-[#9c9af2]" />
                  <span>Ask AI Tutor About Concept</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

