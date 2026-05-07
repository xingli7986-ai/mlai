import Link from "next/link";
import ConsumerNav from "@/components/ConsumerNav";

export default function StudioStepGate({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <main className="studioStepGatePage">
      <ConsumerNav variant="solid" />
      <section className="studioStepGate">
        <p className="studioStepGate__eyebrow">Garment Work Required</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="studioStepGate__actions">
          <Link href={actionHref} className="studioStepGate__primary">
            {actionLabel}
          </Link>
          <Link href="/my-studio" className="studioStepGate__ghost">
            返回我的设计工作室
          </Link>
        </div>
      </section>
    </main>
  );
}
