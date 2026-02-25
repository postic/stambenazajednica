import { Card as ShadCard, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CardProps {
  title: string;
  value: string | number;
  description?: string;
}

export default function Card({ title, value, description }: CardProps) {
  return (
    <ShadCard>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </ShadCard>
  );
}
