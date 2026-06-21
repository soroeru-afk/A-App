import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { Category, VideoInfo } from '../types';

interface AddVideoFormProps {
  categories: Category[];
  onAddVideo: (video: Omit<VideoInfo, 'id' | 'createdAt'>) => void;
  onAddCategory: (name: string) => void;
  onClose: () => void;
}

export default function AddVideoForm({
  categories,
  onAddVideo,
  onAddCategory,
  onClose
}: AddVideoFormProps) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!categoryId && !isAddingCat) || !file) return;

    let finalCatId = categoryId;

    if (isAddingCat && newCatName) {
      finalCatId = `cat_${Date.now()}`;
      onAddCategory(newCatName);
    }

    // Create object URL for local playback
    const url = URL.createObjectURL(file);

    onAddVideo({
      title,
      categoryId: finalCatId,
      url,
      originalName: file.name,
      type: file.type
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const selected = e.target.files[0];
        setFile(selected);
        if (!title && selected.name) {
             setTitle(selected.name.replace(/\.[^/.]+$/, "")); // remove extension
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-base-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel-bg border border-border-main shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-3 border-b border-border-main bg-accent-bg text-accent-text">
          <h2 className="font-bold text-sm">IMPORT VIDEO</h2>
          <button onClick={onClose} className="hover:opacity-70 p-1">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
            
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-dim font-bold">VIDEO FILE</label>
            <div className="relative">
                <input 
                    type="file" 
                    accept="video/mp4,video/x-matroska,video/webm,video/ogg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                />
                <div className="border-2 border-dashed border-border-light p-4 text-center text-sm text-text-normal hover:bg-border-main/20 flex flex-col items-center gap-2">
                    <Upload size={24} className="text-text-dim" />
                    {file ? <span className="font-bold text-accent-bg">{file.name}</span> : <span>Click to select MP4, MKV, or WEBM</span>}
                </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-dim font-bold">TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-2 py-1.5 bg-base-bg border border-border-main text-text-bright text-sm focus:outline-none focus:border-text-dim"
              placeholder="Movie Title"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-text-dim font-bold">CATEGORY</label>
              <button
                type="button"
                onClick={() => setIsAddingCat(!isAddingCat)}
                className="text-xs text-text-normal flex items-center gap-1 hover:text-text-bright"
              >
                {isAddingCat ? 'Use Existing Category' : 'Create New Category'}
              </button>
            </div>

            {isAddingCat ? (
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="px-2 py-1.5 bg-base-bg border border-border-main text-text-bright text-sm focus:outline-none focus:border-text-dim"
                placeholder="New Category Name"
                required={isAddingCat}
              />
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="px-2 py-1.5 bg-base-bg border border-border-main text-text-bright text-sm focus:outline-none focus:border-text-dim outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-2 bg-text-bright text-panel-bg font-bold text-sm tracking-wider hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            ADD TO LIBRARY
          </button>
        </form>
      </div>
    </div>
  );
}
