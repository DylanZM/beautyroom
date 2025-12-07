import { Users, Calendar, Award, Heart } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "2,500+",
    label: "Clientes Satisfechos",
  },
  {
    icon: Calendar,
    value: "10,000+",
    label: "Citas Realizadas",
  },
  {
    icon: Award,
    value: "15",
    label: "Años de Experiencia",
  },
  {
    icon: Heart,
    value: "98%",
    label: "Tasa de Satisfacción",
  },
];

export function StatsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
