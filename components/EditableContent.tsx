"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  content: string;
  onSave: (newContent: string) => void;
  className?: string;
}

export default function EditableContent({ content, onSave, className = "" }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={className}>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full min-h-[120px] p-3 text-sm border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-success text-white rounded-md hover:opacity-90"
          >
            <Check className="w-3 h-3" /> Guardar
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-muted text-white rounded-md hover:opacity-90"
          >
            <X className="w-3 h-3" /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted hover:text-primary"
        title="Editar"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
