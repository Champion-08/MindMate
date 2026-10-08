import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { MaterialCard } from '../components/shared/MaterialCard';
import { EmptyState } from '../components/ui/EmptyState';
import { materials as mockMaterials } from '../data/mockData';
import { Material } from '../types';
import { Upload, FileText, Search as SearchIcon, Filter } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Materials() {
  const { showToast } = useAppContext();
  const [materials, setMaterials] = useState(mockMaterials);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      showToast('Material uploaded and processing started.', 'success');
      const newMaterial: Material = {
        id: Date.now(),
        name: 'New Uploaded Document',
        type: 'PDF',
        status: 'processing',
        pages: 12,
        date: 'Just now'
      };
      setMaterials([newMaterial, ...materials]);
      
      // Simulate processing complete
      setTimeout(() => {
        setMaterials(prev => prev.map(m => m.id === newMaterial.id ? { ...m, status: 'processed' } : m));
        showToast('Processing complete. MindMate has generated flashcards and quizzes.', 'success');
      }, 3000);
      
    }, 1500);
  };

  return (
    <AppShell pageTitle="Materials" pageSubtitle="Upload notes and let MindMate extract knowledge">
      <div className="max-w-5xl space-y-8">
        
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-card p-10 text-center transition-colors ${
            isUploading ? 'border-primary bg-indigo-50' : 'border-border bg-surface hover:border-primary/50'
          }`}
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-dark">
            {isUploading ? 'Uploading...' : 'Upload PDF / Notes / Text'}
          </h3>
          <p className="text-muted mb-6 max-w-md mx-auto">
            MindMate will process your materials, extract key concepts, build knowledge graphs, and generate practice questions automatically.
          </p>
          <Button onClick={handleUpload} disabled={isUploading} size="lg">
            {isUploading ? 'Processing...' : 'Select File to Upload'}
          </Button>
        </div>

        {/* List Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold">Your Materials</h3>
          <div className="flex gap-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input type="text" placeholder="Search materials..." className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Button variant="secondary" className="px-3">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Materials List */}
        <div className="grid grid-cols-1 gap-4">
          {materials.length > 0 ? (
            materials.map(material => (
              <MaterialCard 
                key={material.id} 
                material={material} 
                onClick={setSelectedMaterial}
              />
            ))
          ) : (
            <EmptyState 
              icon={FileText} 
              title="No materials yet" 
              description="Upload your first document to start extracting knowledge." 
            />
          )}
        </div>

      </div>

      {/* Material Detail Modal */}
      <Modal 
        isOpen={!!selectedMaterial} 
        onClose={() => setSelectedMaterial(null)} 
        title={selectedMaterial?.name || 'Material Details'}
        className="max-w-2xl"
      >
        <div className="mb-6">
          <Tabs 
            tabs={[
              { id: 'summary', label: 'AI Summary' },
              { id: 'concepts', label: 'Key Concepts' },
              { id: 'flashcards', label: 'Flashcards (12)' },
              { id: 'quiz', label: 'Generate Quiz' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <p className="text-dark/80 leading-relaxed">
                This document covers the fundamental concepts of Python programming, focusing primarily on data structures and control flow. MindMate has identified 4 critical areas that align with your current learning goals.
              </p>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h5 className="font-semibold text-primary mb-2">MindMate Integration</h5>
                <p className="text-sm text-dark/80">These notes have been integrated into your Knowledge Graph. Your mastery score for "Variables" increased by 2% based on this material.</p>
              </div>
            </div>
          )}
          {activeTab === 'concepts' && (
            <ul className="space-y-3 list-disc pl-5 text-dark/80">
              <li>Variables and Data Types (Integer, String, Float, Boolean)</li>
              <li>Conditional Statements (If, Elif, Else)</li>
              <li>Loops (For loops, While loops, Break/Continue)</li>
              <li>Basic Functions and Arguments</li>
            </ul>
          )}
          {activeTab === 'flashcards' && (
            <div className="text-center py-12">
              <p className="text-muted mb-4">MindMate generated 12 flashcards from this material.</p>
              <Button>Review Flashcards</Button>
            </div>
          )}
          {activeTab === 'quiz' && (
            <div className="text-center py-12">
              <p className="text-muted mb-4">Test your knowledge specifically on this material.</p>
              <Button>Start Custom Quiz</Button>
            </div>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
