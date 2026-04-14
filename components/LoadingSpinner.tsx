import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
}

export default function LoadingSpinner({ message = "Cargando..." }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
      <p className="mt-3 text-sm text-muted">{message}</p>
    </div>
  );
}
