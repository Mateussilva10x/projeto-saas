import Link from "next/link";
import { Button } from "./ui/button";
import { PlusCircle, History } from "lucide-react";

interface DashboardCardProps {
  icon: "create" | "history";
  title: string;
  description: string;
  link: string;
  buttonText: string;
  variant: "primary" | "secondary";
}

const iconMap = {
  create: PlusCircle,
  history: History,
};

export default function DashboardCard({
  icon,
  title,
  description,
  link,
  buttonText,
  variant,
}: DashboardCardProps) {
  const Icon = iconMap[icon];
  const isPrimary = variant === "primary";

  const buttonClasses = isPrimary
    ? "bg-primary text-white hover:bg-primary/90 focus:ring-primary/30 dark:text-slate-900 dark:font-bold"
    : "bg-primary/20 text-primary dark:bg-secondary/10 dark:text-white hover:bg-secondary/50 focus:ring-primary/30";

  return (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-shadow hover:shadow-lg dark:hover:border-primary">
      <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-slate-900 dark:text-white text-lg font-medium leading-normal">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
          {description}
        </p>
      </div>
      <Link href={link} className="w-fit mt-2">
        <Button
          className={`w-fit mt-2 px-5 py-5 cursor-pointer  text-white text-sm font-medium rounded-lg  focus:outline-none focus:ring-4  ${buttonClasses}`}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
