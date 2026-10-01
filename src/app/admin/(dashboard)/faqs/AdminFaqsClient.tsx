'use client';

import { type FormEvent, useState } from 'react';
import { HelpCircle, AlertTriangle, Edit, Trash2, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import type { FaqItem } from '@/app/actions/faqActions';

interface AdminFaqsClientProps {
  initialFaqs: FaqItem[];
  dbError: boolean;
}

export default function AdminFaqsClient({ initialFaqs, dbError }: AdminFaqsClientProps) {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await api.post('/faqs', {
        question: formData.get('question'),
        answer: formData.get('answer'),
        order: Number(formData.get('order')) || undefined,
      });

      if (!result.success) {
        alert(result.error || 'Failed to create FAQ');
        return;
      }

      setShowForm(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await api.put(`/faqs/${id}`, {
        question: formData.get('question'),
        answer: formData.get('answer'),
        order: Number(formData.get('order')) || undefined,
        isActive: formData.get('isActive') === 'on',
      });

      if (!result.success) {
        alert(result.error || 'Failed to update FAQ');
        return;
      }

      setEditingFaq(null);
      setShowForm(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setDeletingId(id);
      try {
        const result = await api.del(`/faqs/${id}`);
        if (!result.success) {
          alert(result.error || 'Failed to delete FAQ');
          return;
        }
        setFaqs(prev => prev.filter(f => f.id !== id));
        router.refresh();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete FAQ');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
            <p className="text-ink/60 text-sm">Add and manage frequently asked questions for your website.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-primary px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Hide Form' : 'Add FAQ'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          {(showForm || editingFaq) && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <button
                  onClick={() => { setEditingFaq(null); setShowForm(false); }}
                  className="text-ink/60 hover:text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FaqForm 
                initialData={editingFaq} 
                isSubmitting={isSubmitting}
                onSubmit={editingFaq ? (formData) => handleUpdate(editingFaq.id, formData) : handleCreate} 
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">
            FAQ List ({faqs.length})
          </h2>

          {dbError && (
            <div className="glass-card p-6 border-red-500/20 bg-red-500/5 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-red-500 font-bold">Database Connection Error</p>
                <p className="text-ink/60 text-sm">Please update your DATABASE_URL in the .env file.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="glass-card p-6 border-ink/[0.08] group hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-ink/10 px-2 py-1 rounded text-xs font-bold text-ink/70">
                        Order: {faq.order}
                      </span>
                      {!faq.isActive && (
                        <span className="bg-red-500/20 px-2 py-1 rounded text-xs font-bold text-red-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold">{faq.question}</h3>
                    <p className="text-sm text-ink/65 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingFaq(faq)}
                      className="p-2 text-ink/65 hover:text-ink hover:text-primary hover:bg-ink/5 rounded transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(faq.id)}
                      disabled={deletingId === faq.id}
                      className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 rounded transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!dbError && faqs.length === 0 && (
              <div className="py-20 text-center glass-card border-dashed border-ink/10">
                <p className="text-ink/40">No FAQs added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqForm({ 
  initialData, 
  isSubmitting,
  onSubmit 
}: { 
  initialData?: FaqItem | null;
  isSubmitting: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-2 block">Question</label>
        <input 
          type="text" 
          name="question" 
          required 
          defaultValue={initialData?.question}
          className="w-full bg-ink/5 border border-ink/10 rounded-lg px-4 py-3 text-ink placeholder-ink/40 focus:outline-none focus:border-primary"
          placeholder="e.g., What is the range of the vehicle?"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-2 block">Answer</label>
        <textarea 
          name="answer" 
          required 
          rows={4}
          defaultValue={initialData?.answer}
          className="w-full bg-ink/5 border border-ink/10 rounded-lg px-4 py-3 text-ink placeholder-ink/40 focus:outline-none focus:border-primary"
          placeholder="Enter detailed answer here..."
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-2 block">Order</label>
        <input 
          type="number" 
          name="order" 
          min={1}
          step={1}
          defaultValue={initialData?.order || 0}
          className="w-full bg-ink/5 border border-ink/10 rounded-lg px-4 py-3 text-ink placeholder-ink/40 focus:outline-none focus:border-primary"
        />
      </div>
      {initialData && (
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isActive" 
            name="isActive"
            defaultChecked={initialData?.isActive}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-ink/70 text-sm">Active</label>
        </div>
      )}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : initialData ? 'Update FAQ' : 'Create FAQ'}
      </button>
    </form>
  );
}
