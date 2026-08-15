import React, { useState } from 'react';
import { Share2, ArrowRight } from 'lucide-react';

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
    y: 340,
    group: 'application',
    color: '#e888f8',
    description: 'Base substitutions, frameshifts, and mismatch repair mechanisms (such as Cas9 / CRISPR targeted endonuclease editing).'
  }
];

const EDGES = [
  { from: 'dna-core', to: 'transcription', label: 'transcribes to' },
  { from: 'transcription', to: 'translation', label: 'translates into' },
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
    <section id="knowledge-graph" className="py-24 border-t border-[#272a2e] bg-[#1c1e21] relative overflow-hidden font-['Geist']">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#e888f8] font-['Geist_Mono'] text-[13px] font-medium mb-3">
              <Share2 className="w-3.5 h-3.5" />
              <span>Interactive Concept Relationship Graph</span>
            </div>
            <h2 className="font-['Satoshi'] font-bold text-[32px] sm:text-[38px] text-[#e5e7eb] mb-3">
              Visual Concept Maps Extracted from Course Chapters
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#878c99] max-w-[620px] leading-[1.58]">
              TeachMe extracts interconnected topics and causal relationships from your uploaded textbook PDFs into an interactive concept graph. Click any node to explore.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('knowledge')}
            className="group inline-flex items-center gap-1.5 text-[14px] text-[#a8ff53] hover:underline cursor-pointer mt-4 md:mt-0"
          >
            <span>Explore full concept graph in Studio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Interactive Graph Box */}
        <div className="bg-[#121317] border border-[#272a2e] rounded-[4px] p-6 shadow-2xl relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* SVG Visualizer */}
            <div className="lg:col-span-8 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] p-4 flex items-center justify-center relative min-h-[380px] overflow-hidden">
              <svg viewBox="0 0 800 420" className="w-full h-full max-h-[380px]">
                {/* Edges */}
                {EDGES.map((edge, idx) => {
                  const src = NODES.find(n => n.id === edge.from)!;
                  const dst = NODES.find(n => n.id === edge.to)!;
                  const isHighlighted = selectedNode.id === src.id || selectedNode.id === dst.id;

                  return (
                    <g key={idx}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={dst.x}
                        y2={dst.y}
                        stroke={isHighlighted ? '#a8ff53' : '#3b3e45'}
                        strokeWidth={isHighlighted ? '2' : '1'}
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
                          r="28"
                          fill="none"
                          stroke={node.color}
                          strokeWidth="2"
                          className="animate-ping opacity-30"
                        />
                      )}
                      
                      {/* Node circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? '22' : '18'}
                        fill="#121317"
                        stroke={node.color}
                        strokeWidth={isSelected ? '3' : '1.5'}
                        className="transition-all duration-200"
                      />

                      {/* Node Label */}
                      <text
                        x={node.x}
                        y={node.y + 34}
                        textAnchor="middle"
                        fill={isSelected ? '#e5e7eb' : '#878c99'}
                        fontSize="11.5"
                        fontFamily="Geist, sans-serif"
                        fontWeight={isSelected ? '600' : '400'}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Details Inspector */}
            <div className="lg:col-span-4 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <span className="font-['Geist_Mono'] text-[12px] text-[#878c99] uppercase">
                    {selectedNode.group} Concept
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#121317] border border-[#272a2e] text-[#a8ff53] font-['Geist_Mono']">
                  Grounded in PDF
                </span>
              </div>

              <div>
                <h4 className="font-['Satoshi'] font-semibold text-[18px] text-[#e5e7eb] mb-2">
                  {selectedNode.label}
                </h4>
                <p className="text-[13.5px] leading-[1.62] text-[#878c99]">
                  {selectedNode.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#272a2e]/60">
                <button
                  onClick={() => onOpenStudio?.('knowledge')}
                  className="w-full py-2 bg-[#272a2e] hover:bg-[#3b3e45] text-[#a8ff53] text-[13px] font-medium rounded-[4px] transition-colors cursor-pointer text-center"
                >
                  Generate Practice Quiz for this Node →
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
