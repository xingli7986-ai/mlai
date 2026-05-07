import type { Metadata } from "next";
import ConsumerNav from "@/components/ConsumerNav";
import BodyProfileGate from "@/components/my-studio/BodyProfileGate";
import CreateDesignButton from "@/components/my-studio/CreateDesignButton";
import StudioOverviewCards from "@/components/my-studio/StudioOverviewCards";
import StudioStepEntrypoints from "@/components/my-studio/StudioStepEntrypoints";
import StudioWorksPreview from "@/components/my-studio/StudioWorksPreview";
import "./my-studio.css";

export const metadata: Metadata = {
  title: "我的设计工作室 | MaxLuLu AI",
};

const A_HERO = "/assets/my-studio/01_hero";
const HERO_FIGURE = `${A_HERO}/maxlulu-my-studio-hero-fashion-illustration-1200x900.png`;
const HERO_FLORAL = `${A_HERO}/maxlulu-my-studio-hero-floral-bg-desktop-1920x600.png`;
const HERO_LINE_ART = "/assets/my-studio/hero/my-studio-hero-line-art.svg";

export default function MyStudioPage() {
  return (
    <div className="page-wrap my-studio-page">
      <ConsumerNav variant="solid" />
      <BodyProfileGate />

      <section className="msHero container">
        <div className="msHero__copy">
          <p className="msHero__eyebrow">欢迎回到你的</p>
          <h1>My Studio</h1>
          <p className="msHero__cn">我的设计工作室</p>
          <p className="msHero__lead">
            从一件衣服开始，生成你的专属印花、虚拟试穿图与生产资料草案。
          </p>
          <div className="msHero__actions">
            <CreateDesignButton className="msHero__primary" label="创建新的设计" />
            <a className="msHero__secondary" href="#my-design-works">
              继续我的作品
            </a>
          </div>
        </div>
        <div className="msHero__visual" aria-hidden>
          <span className="msHero__halo" />
          <img className="msHero__floral" src={HERO_FLORAL} alt="" />
          <img className="msHero__lineArt" src={HERO_LINE_ART} alt="" />
          <img className="msHero__figure" src={HERO_FIGURE} alt="" />
        </div>
      </section>

      <StudioOverviewCards />
      <StudioStepEntrypoints />
      <StudioWorksPreview />
    </div>
  );
}
