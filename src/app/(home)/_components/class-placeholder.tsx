import { BookIcon } from "lucide-react";
import { Card } from "~/components/ui/card";

export default function ClassPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="w-full">
      <div className="flex flex-col items-center justify-center gap-2 text-center p-2">
        <BookIcon className="h-12 w-12 text-blue-500" />
        <h1 className="text-lg font-medium">{title}</h1>
        <span className="text-muted-foreground">{description}</span>
      </div>
    </Card>
  );
}
