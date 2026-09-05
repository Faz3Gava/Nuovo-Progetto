import React, { useState } from 'react';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  X, 
  Folder, 
  Terminal, 
  Layers, 
  Settings, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { JAVA_PROJECT_FILES, JavaSourceFile } from '../data/javaFiles';

interface JavaCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JavaCodeViewerModal: React.FC<JavaCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<JavaSourceFile>(JAVA_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all files
      JAVA_PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.code);
      });

      // Add run scripts
      zip.file('run.sh', `#!/bin/bash\nmvn clean javafx:run\n`);
      zip.file('run.bat', `@echo off\nmvn clean javafx:run\npause\n`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'citylogic-javafx-maven-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  const filteredFiles = filterCategory === 'all' 
    ? JAVA_PROJECT_FILES 
    : JAVA_PROJECT_FILES.filter(f => f.category === filterCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Java &amp; JavaFX Source Code</h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30">
                  Maven + OpenJFX 21
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete object-oriented domain models, simulation pipeline, FXML layouts, and JavaFX Canvas renderer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
              title="Download entire project ready to run with Maven"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Generating ZIP...' : 'Download Project (.zip)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action bar / category tabs */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'ui', label: 'JavaFX UI & FXML' },
              { id: 'tick', label: 'Simulation & Ticks' },
              { id: 'core', label: 'Domain Core' },
              { id: 'application', label: 'Application Facade' },
              { id: 'test', label: 'JUnit 5 Tests' },
              { id: 'config', label: 'Maven POM' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Run: <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">mvn clean javafx:run</code></span>
          </div>
        </div>

        {/* Body: Split View (File Tree + Code Editor) */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Sidebar */}
          <div className="w-72 bg-slate-950/40 border-r border-slate-800 flex flex-col">
            <div className="p-3 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-indigo-400" /> Project Structure
              </span>
              <span className="text-slate-500 font-mono">{filteredFiles.length} files</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
              {filteredFiles.map(file => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick CLI tip */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Local Execution</p>
              <p className="text-[10px] text-slate-500">
                1. Unzip downloaded package<br/>
                2. Execute <span className="text-emerald-400 font-mono">mvn javafx:run</span>
              </p>
            </div>
          </div>

          {/* Main Code View */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File Path and Copy Action */}
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300 flex items-center gap-2">
                <span className="text-slate-500">{selectedFile.path.substring(0, selectedFile.path.lastIndexOf('/') + 1)}</span>
                <span className="text-indigo-300 font-semibold">{selectedFile.name}</span>
              </span>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed text-slate-300 bg-slate-950 selection:bg-indigo-500/30">
              <pre className="whitespace-pre">
                {selectedFile.code}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
