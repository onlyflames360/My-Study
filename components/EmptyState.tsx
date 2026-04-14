import { BookOpen } from "lucide-react";

interface Props {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-primary-light" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted mb-4 max-w-md">{description}</p>
      {action}
    </div>
  );
}
