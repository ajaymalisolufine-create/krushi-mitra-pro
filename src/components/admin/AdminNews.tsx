import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  category: string;
  publishedAt: string;
  status: 'published' | 'draft';
}

const initialNews: NewsItem[] = [
  {
    id: 1,
    title: 'Maharashtra leads in grape exports; 20% increase expected this year',
    source: 'Agri News',
    category: 'Export',
    publishedAt: '2024-01-20',
    status: 'published',
  },
  {
    id: 2,
    title: 'New government scheme announced for chickpea farmers',
    source: 'Farmer Friend',
    category: 'Scheme',
    publishedAt: '2024-01-19',
    status: 'published',
  },
  {
    id: 3,
    title: 'Weather forecast: Moderate rain expected next week',
    source: 'Weather Dept',
    category: 'Weather',
    publishedAt: '2024-01-18',
    status: 'draft',
  },
];

export const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Export': return 'bg-secondary/20 text-secondary';
      case 'Scheme': return 'bg-harvest-gold/20 text-accent';
      case 'Weather': return 'bg-sky-blue/20 text-sky-blue';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this news?')) {
      setNews(news.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News</h1>
          <p className="text-muted-foreground">Manage agriculture news</p>
        </div>
        <button
          onClick={() => {
            setEditingNews(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add News
        </button>
      </div>

      {/* News List */}
      <div className="space-y-3">
        {news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-4 shadow-card border border-border/50"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Newspaper className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    item.status === 'published'
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className={`px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.publishedAt}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingNews(item);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-medium"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-xs font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-lg"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingNews ? 'Edit News' : 'Add News'}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <textarea
                  defaultValue={editingNews?.title}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="News headline"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source</label>
                  <input
                    type="text"
                    defaultValue={editingNews?.source}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Agri News"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    defaultValue={editingNews?.category}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Export</option>
                    <option>Scheme</option>
                    <option>Weather</option>
                    <option>Market</option>
                    <option>Technology</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  defaultValue={editingNews?.status}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {editingNews ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
