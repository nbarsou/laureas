import { CircleCheckIcon } from "lucide-react";

interface FormSucessProps {
  message?: string;
}

export const FormSucess = ({ message }: FormSucessProps) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
      <CircleCheckIcon />
      <p> {message} </p>
    </div>
  );
};
