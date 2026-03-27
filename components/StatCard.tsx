import Link from "next/link";

type StatCardProps = {
  title: string;
  value: string;
  icon: string;
  href: string;
};

export default function StatCard({ title, value, icon, href }: StatCardProps) {
  return (
    <Link href={href} className="card bg-base-200 hover:bg-base-300 transition-colors">
      <div className="card-body items-center text-center p-4">
        <span className="text-3xl">{icon}</span>
        <h3 className="card-title text-primary text-lg">{value}</h3>
        <p className="text-sm text-base-content/60">{title}</p>
      </div>
    </Link>
  );
}
