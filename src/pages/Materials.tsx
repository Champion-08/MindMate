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
import { Upload, FileText, Search as SearchIcon, Filter, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiGetMaterials, apiUploadMaterial, apiGetMaterial, apiDeleteMaterial } from '../services/api';

export default function Materials() {
  const { showToast } = useAppContext();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [materialDetails, setMaterialDetails] = useState<any>(null);

  const fetchMaterials = async () => {
    try {
      const data = await apiGetMaterials();
      setMaterials(data.data.materials);
    } catch (e) {
      setMaterials(mockMaterials);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      await apiUploadMaterial({ name: 'New Uploaded Document', type: 'Text', content: 'Sample text' });
      showToast('Material uploaded successfully.', 'success');
      fetchMaterials();
    } catch (e) {
      showToast('Failed to upload material.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectMaterial = async (material: Material) => {
    setSelectedMaterial(material);
    try {
      const details = await apiGetMaterial(material.id.toString());
      setMaterialDetails(details.data.material);
    } catch (e) {
      setMaterialDetails(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteMaterial(id.toString());
      showToast('Material deleted.', 'success');
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (e) {
      showToast('Failed to delete.', 'error');
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Materials" pageSubtitle="Upload notes and let MindMate extract knowledge">
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </AppShell>
    );
  }

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
                onClick={() => handleSelectMaterial(material)}
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
        <div className="mb-6 flex justify-between items-center">
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
          <Button variant="danger" size="sm" onClick={() => selectedMaterial && handleDelete(selectedMaterial.id)}>
             <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-[300px]">
          {!materialDetails ? (
            <div className="flex justify-center items-center h-full mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : (
            <>
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <p className="text-dark/80 leading-relaxed">
                    {materialDetails.summary || "Summary not available."}
                  </p>
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h5 className="font-semibold text-primary mb-2">MindMate Integration</h5>
                    <p className="text-sm text-dark/80">These notes have been integrated into your Knowledge Graph.</p>
                  </div>
                </div>
              )}
              {activeTab === 'concepts' && (
                <ul className="space-y-3 list-disc pl-5 text-dark/80">
                  {materialDetails.keyConcepts?.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  )) || <li>No key concepts extracted.</li>}
                </ul>
              )}
              {activeTab === 'flashcards' && (
                <div className="text-center py-12">
                  <p className="text-muted mb-4">MindMate generated {materialDetails.flashcards?.length || 0} flashcards from this material.</p>
                  <Button disabled={!materialDetails.flashcards?.length}>Review Flashcards</Button>
                </div>
              )}
              {activeTab === 'quiz' && (
                <div className="text-center py-12">
                  <p className="text-muted mb-4">Test your knowledge specifically on this material.</p>
                  <Button>Start Custom Quiz</Button>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
