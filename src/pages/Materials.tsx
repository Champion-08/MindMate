import React, { useState, useEffect } from 'react';
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
import { getMaterials, saveMaterial, deleteMaterial } from '../lib/db';

export default function Materials() {
  const { user, showToast } = useAppContext();
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await getMaterials(user!.id);
        if (res.data) setMaterials(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleUpload = async () => {
    if (!user) return;
    setIsUploading(true);
    
    try {
      const newMat = {
        name: 'New Uploaded Document',
        type: 'PDF',
        raw_content: 'Some raw content...',
        summary: 'Generated summary...',
        key_concepts: 'Variables, Loops'
      };
      await saveMaterial(user.id, newMat);
      
      const res = await getMaterials(user.id);
      if (res.data) setMaterials(res.data);
      showToast('Material uploaded and processed.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload material.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
      setSelectedMaterial(null);
      showToast('Material deleted.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const displayMaterials = materials.length > 0 ? materials.map(m => ({
    id: m.id,
    name: m.name || 'Document',
    type: m.type || 'PDF',
    status: m.status || 'processed',
    pages: 1,
    date: new Date(m.created_at).toLocaleDateString()
  })) : mockMaterials;

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
              <input type="text" placeholder="Search materials..." className="w-full pl-9 pr-4 py-2 bg-surface text-dark border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Button variant="secondary" className="px-3">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Materials List */}
        <div className="grid grid-cols-1 gap-4">
          {displayMaterials.length > 0 ? (
            displayMaterials.map(material => (
              <MaterialCard 
                key={material.id} 
                material={material as any} 
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
              { id: 'flashcards', label: 'Flashcards' },
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
                <p className="text-sm text-dark/80">These notes have been integrated into your Knowledge Graph.</p>
              </div>
              <Button variant="danger" onClick={() => handleDelete(selectedMaterial?.id)}>Delete Material</Button>
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
              <p className="text-muted mb-4">MindMate generated flashcards from this material.</p>
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
