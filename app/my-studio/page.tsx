import ConsumerNav from "@/components/ConsumerNav";
import { Button } from "@/components/ui";
import "../inspiration/inspiration.css"; // 复用 .container + nav 样式

export default function MyStudioPlaceholderPage() {
  return (
    <main
      className="page-wrap"
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <ConsumerNav variant="solid" />

      <section
        style={{
          width: "100%",
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "var(--space-24) var(--gutter-desktop)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "var(--space-5)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--color-text-secondary)",
            fontSize: 13,
            letterSpacing: "0.18em",
            fontWeight: 500,
          }}
        >
          我的设计工作室<span style={{ color: "var(--color-border-strong)", margin: "0 6px" }}>/</span>my-studio
        </p>

        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-h1-size)",
            lineHeight: "var(--text-h1-line)",
            fontWeight: "var(--text-h1-weight)" as unknown as number,
            letterSpacing: "var(--text-h1-tracking)",
            color: "var(--color-text-primary)",
          }}
        >
          我的设计工作室
        </h1>

        <p
          style={{
            margin: 0,
            color: "var(--color-text-secondary)",
            fontSize: 16,
            lineHeight: "26px",
            maxWidth: 520,
          }}
        >
          创作工作台正在开发中,即将上线。
          <br />
          届时你可以用 4 种方式创作专属印花裙 — 基于已有款式、从零设计、AI 推荐花型、上传图片素材。
        </p>

        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            marginTop: "var(--space-4)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button as="a" href="/products" variant="primary" size="lg">
            返回印花衣橱
          </Button>
          <Button as="a" href="/inspiration" variant="secondary" size="lg">
            探索灵感广场
          </Button>
        </div>
      </section>
    </main>
  );
}
