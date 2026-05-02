"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { products } from "@/lib/home-consumer-data";
import "../../studio-home.css";
import "../../fashion/fashion-tool.css";
import "../publish.css";

const SECTIONS = [
  { id: "cover", no: "01", title: "封面 · Cover", desc: "品牌、款号、设计师" },
  { id: "spec", no: "02", title: "技术规格 · Spec Sheet", desc: "三视图 + 测量点" },
  { id: "bom", no: "03", title: "用料表 · BOM", desc: "面料 / 辅料 / 五金" },
  { id: "process", no: "04", title: "工艺单 · Process", desc: "缝制顺序 + 关键工艺" },
  { id: "size", no: "05", title: "尺码表 · Size Chart", desc: "XS-XXL · cm" },
  { id: "color", no: "06", title: "色卡 · Pantone", desc: "印花配色 + ΔE" },
  { id: "label", no: "07", title: "吊牌 / 洗标", desc: "吊牌设计 + 中英文洗标" },
  { id: "pack", no: "08", title: "包装 · Packaging", desc: "包装规格 + 装箱" },
];

const HISTORY = [
  { id: "TP-2604", title: "墨影花园针织印花裹身裙", date: "2026-04-26", v: "v3.2" },
  { id: "TP-2598", title: "山茶花漫舞 长袖裹身款", date: "2026-04-21", v: "v2.4" },
  { id: "TP-2581", title: "几何拼接 通勤连衣裙", date: "2026-04-12", v: "v1.8" },
];

function PdfCover() {
  return (
    <div style={{
      aspectRatio: "210 / 297",
      borderRadius: 8,
      background: "linear-gradient(180deg, #fdfaf4 0%, #f0e6d6 100%)",
      border: "1px solid var(--ft-border)",
      padding: "32px 24px",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--ft-text2)" }}>
        <span>MaxLuLu AI Studio</span>
        <span>TP-2604 · v3.2</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", gap: 8 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 700, color: "var(--ft-text)", letterSpacing: "0.08em" }}>
          MaxLuLu
        </div>
        <div style={{ fontSize: 10, color: "var(--ft-gold)", letterSpacing: "0.3em" }}>TECH PACK</div>
        <div style={{ marginTop: 18, fontSize: 11, color: "var(--ft-text)", fontFamily: "var(--font-serif)" }}>
          墨影花园针织印花裹身裙
        </div>
        <div style={{ fontSize: 9, color: "var(--ft-text3)" }}>SS 26 · CR-2604</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--ft-text3)" }}>
        <span>设计师：Luna</span>
        <span>2026-04-26</span>
      </div>
    </div>
  );
}

function PdfSpec() {
  return (
    <div style={{
      aspectRatio: "210 / 297",
      borderRadius: 8,
      background: "#fff",
      border: "1px solid var(--ft-border)",
      padding: 16,
      display: "grid",
      gridTemplateRows: "auto auto 1fr auto",
      gap: 8,
      fontSize: 8,
      color: "var(--ft-text2)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, color: "var(--ft-text)" }}>02 · 技术规格</span>
        <span>1:5 · cm</span>
      </div>
      <div style={{ height: 1, background: "var(--ft-border)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <svg viewBox="0 0 240 320" style={{ width: "100%", height: "100%" }}>
          <rect x="0" y="0" width="240" height="320" fill="#fdfaf4" />
          <g stroke="#1b1b1b" strokeWidth="2" fill="none">
            <path d="M86 38 L62 60 L52 110 L66 116 L74 90 L80 270 L160 270 L166 90 L174 116 L188 110 L178 60 L154 38 L140 60 L120 86 L100 60 Z" />
            <path d="M88 40 C108 80 118 108 140 138" />
            <path d="M152 40 C132 78 116 106 96 138" />
            <path d="M70 130 C95 142 122 142 144 130" />
          </g>
          <text x="120" y="306" textAnchor="middle" fontSize="9" fill="#7a7a6f">FRONT</text>
        </svg>
        <svg viewBox="0 0 240 320" style={{ width: "100%", height: "100%" }}>
          <rect x="0" y="0" width="240" height="320" fill="#fdfaf4" />
          <g stroke="#1b1b1b" strokeWidth="2" fill="none">
            <path d="M86 38 L62 60 L52 110 L66 116 L74 90 L80 270 L160 270 L166 90 L174 116 L188 110 L178 60 L154 38 Z" />
            <path d="M86 42 L154 42" />
            <path d="M86 78 L154 78" strokeDasharray="3 3" />
          </g>
          <text x="120" y="306" textAnchor="middle" fontSize="9" fill="#7a7a6f">BACK</text>
        </svg>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 7 }}>
        <thead>
          <tr style={{ background: "#f5efe5", color: "var(--ft-text)" }}>
            <th style={{ padding: 4, textAlign: "left" }}>测量点</th>
            <th style={{ padding: 4 }}>S</th>
            <th style={{ padding: 4 }}>M</th>
            <th style={{ padding: 4 }}>L</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["衣长", "108", "110", "112"],
            ["胸围", "88", "92", "96"],
            ["腰围", "70", "74", "78"],
            ["袖长", "58", "59", "60"],
          ].map((row) => (
            <tr key={row[0]} style={{ borderTop: "0.5px solid var(--ft-border)" }}>
              {row.map((c, i) => (
                <td key={i} style={{ padding: 3, textAlign: i === 0 ? "left" : "center" }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PdfBom() {
  return (
    <div style={{
      aspectRatio: "210 / 297",
      borderRadius: 8,
      background: "#fff",
      border: "1px solid var(--ft-border)",
      padding: 16,
      display: "grid",
      gridTemplateRows: "auto auto 1fr",
      gap: 8,
      fontSize: 8,
      color: "var(--ft-text2)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, color: "var(--ft-text)" }}>03 · 用料表 BOM</span>
        <span>单件用量</span>
      </div>
      <div style={{ height: 1, background: "var(--ft-border)" }} />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 7 }}>
        <thead>
          <tr style={{ background: "#f5efe5", color: "var(--ft-text)" }}>
            <th style={{ padding: 4, textAlign: "left" }}>编号</th>
            <th style={{ padding: 4, textAlign: "left" }}>物料</th>
            <th style={{ padding: 4 }}>规格</th>
            <th style={{ padding: 4 }}>用量</th>
            <th style={{ padding: 4 }}>单价</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["F-01", "弹力针织印花面料", "180g", "2.4 m", "¥48"],
            ["F-02", "里布", "70g 雪纺", "1.6 m", "¥18"],
            ["B-01", "腰带", "印花同布", "1.5 m", "¥6"],
            ["A-01", "拉链", "YKK 32cm", "1 根", "¥8"],
            ["L-01", "标牌 / 洗标", "横幅", "1 套", "¥3"],
            ["T-01", "缝纫线", "锁边/明线", "—", "¥4"],
          ].map((row) => (
            <tr key={row[0]} style={{ borderTop: "0.5px solid var(--ft-border)" }}>
              {row.map((c, i) => (
                <td key={i} style={{ padding: 3, textAlign: i < 2 ? "left" : "center" }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PdfProcess() {
  return (
    <div style={{
      aspectRatio: "210 / 297",
      borderRadius: 8,
      background: "#fff",
      border: "1px solid var(--ft-border)",
      padding: 16,
      display: "grid",
      gridTemplateRows: "auto auto 1fr",
      gap: 8,
      fontSize: 8,
      color: "var(--ft-text2)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, color: "var(--ft-text)" }}>04 · 工艺顺序</span>
        <span>14 工序</span>
      </div>
      <div style={{ height: 1, background: "var(--ft-border)" }} />
      <ol style={{ margin: 0, paddingLeft: 14, display: "grid", gap: 5 }}>
        {[
          "裁片 / 检码 — 按 1:5 排料图开裁",
          "拷边 / 锁边 — 缝份 1 cm，机针 11#",
          "前片省道 — 腰侧褶裥按 SP1-3 标点",
          "肩缝合 — 弹力线针距 2.5 mm",
          "袖片缝合 — 装袖 + 收袖山",
          "侧缝 + 装袖 — 暗线 / 明线交替",
          "下摆 — 卷边 2 cm，针距 3 mm",
          "里布缝合 — 见 03 BOM 用量",
          "锁眼 / 钉扣 — 隐扣 4 颗",
          "整烫 — 不超 130 °C",
          "成衣检验 — AQL 2.5",
          "包装入袋 — PE + 防潮干燥剂",
        ].map((s, i) => (
          <li key={i} style={{ color: "var(--ft-text2)" }}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

export default function TechPackExportPage() {
  return (
    <div className="ft-root">
      <div className="st-tabs">
        <Link href="/studio">工具页</Link>
        <Link href="/products">我的设计</Link>
        <Link href="/products">灵感</Link>
        <Link href="/studio/publish" className="is-active">发布设计</Link>
        <Link href="/studio/dashboard">设计师中心</Link>
      </div>

      <div className="ft-header">
        <div>
          <p className="eyebrow">PUBLISH · TECH PACK</p>
          <h1>导出 Tech Pack · 工厂直发版</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="ft-btn">编辑元数据</button>
          <button type="button" className="ft-btn">复制工厂链接</button>
          <button type="button" className="ft-btn is-primary">下载 PDF</button>
        </div>
      </div>

      <div className="ft-grid">
        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>① 文件结构</h2></div>
            <div style={{ display: "grid", gap: 4 }}>
              {SECTIONS.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} className="ft-stage__chip" style={{
                  display: "grid",
                  gridTemplateColumns: "30px 1fr",
                  gap: 8,
                  height: "auto",
                  padding: "8px 10px",
                  textAlign: "left",
                  background: i === 0 ? "var(--ft-gold)" : "var(--ft-bg)",
                  color: i === 0 ? "#fff" : "var(--ft-text2)",
                  borderColor: i === 0 ? "var(--ft-gold)" : "var(--ft-border)",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, opacity: 0.8 }}>{s.no}</span>
                  <span style={{ display: "grid", gap: 1 }}>
                    <b style={{ fontSize: 12, fontWeight: 600, color: "inherit" }}>{s.title}</b>
                    <em style={{ fontStyle: "normal", fontSize: 10, opacity: 0.8 }}>{s.desc}</em>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="ft-card">
            <div className="ft-card__head"><h2>② 元数据</h2></div>
            <div className="ft-field">
              <label>款号</label>
              <input type="text" defaultValue="MU-CR-2604-0918" />
            </div>
            <div className="ft-field">
              <label>系列</label>
              <input type="text" defaultValue="MaxLuLu SS26 · 春夏" />
            </div>
            <div className="ft-field">
              <label>设计师</label>
              <input type="text" defaultValue="Luna · MaxLuLu Studio" />
            </div>
            <div className="ft-field" style={{ marginBottom: 0 }}>
              <label>版本</label>
              <input type="text" defaultValue="v3.2 · 2026-04-26" />
            </div>
          </div>
        </aside>

        <section>
          <div className="ft-stage" id="cover">
            <div className="ft-stage__head">
              <h2>预览（A4 · 210 × 297 mm）</h2>
              <div className="ft-stage__bar">
                <span className="ft-stage__chip is-active">A4 竖版</span>
                <span className="ft-stage__chip">A3 双开</span>
                <span className="ft-stage__chip">英文版</span>
                <span className="ft-stage__chip">中英对照</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <div>
                <small style={{ display: "block", marginBottom: 6, fontSize: 11, color: "var(--ft-text2)" }}>P1 · 封面</small>
                <PdfCover />
              </div>
              <div>
                <small style={{ display: "block", marginBottom: 6, fontSize: 11, color: "var(--ft-text2)" }}>P2 · 技术规格</small>
                <PdfSpec />
              </div>
              <div>
                <small style={{ display: "block", marginBottom: 6, fontSize: 11, color: "var(--ft-text2)" }}>P3 · 用料表</small>
                <PdfBom />
              </div>
              <div>
                <small style={{ display: "block", marginBottom: 6, fontSize: 11, color: "var(--ft-text2)" }}>P4 · 工艺顺序</small>
                <PdfProcess />
              </div>
            </div>

            <div className="ft-actions">
              <button type="button" className="ft-actionBtn"><span className="ic">⤓</span><span>下载 PDF</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">⤓</span><span>下载 ZIP</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">↗</span><span>发送给工厂</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">✚</span><span>追加附件</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">▦</span><span>查看历史</span></button>
              <button type="button" className="ft-actionBtn"><span className="ic">✓</span><span>归档</span></button>
            </div>
          </div>

          <section className="ft-helpRow">
            <article className="ft-helpCard">
              <b>导出格式</b>
              <p>PDF / DXF / Excel BOM / ZIP（含面料贴图、印花高清图、Pantone 色卡）。下游工厂可一键解压使用。</p>
            </article>
            <article className="ft-helpCard">
              <b>工厂模式</b>
              <p>勾选"工厂直发"后，PDF 内置可签字栏 + 关键尺寸 QR 码，工厂扫码可即时反馈测量。</p>
            </article>
            <article className="ft-helpCard">
              <b>版本管理</b>
              <p>每次导出会保存一份历史版本，便于追溯工艺变更；最多保留最近 30 个版本。</p>
            </article>
          </section>
        </section>

        <aside className="ft-aside">
          <div className="ft-card">
            <div className="ft-card__head"><h2>导出选项</h2></div>
            <div className="ft-field">
              <label>语言</label>
              <select defaultValue="cn">
                <option value="cn">中文</option>
                <option value="en">English</option>
                <option value="bi">中英对照</option>
              </select>
            </div>
            <div className="ft-field">
              <label>纸张</label>
              <select defaultValue="A4">
                <option value="A4">A4 竖版</option>
                <option value="A3">A3 双开</option>
                <option value="Letter">US Letter</option>
              </select>
            </div>
            <div className="ft-field" style={{ marginBottom: 0 }}>
              <label>分辨率</label>
              <select defaultValue="300">
                <option value="150">150 dpi · 网络</option>
                <option value="300">300 dpi · 印刷</option>
                <option value="600">600 dpi · 高清</option>
              </select>
            </div>
            <div style={{ display: "grid", gap: 6, marginTop: 12, fontSize: 11, color: "var(--ft-text2)" }}>
              <label className="pb-check"><input type="checkbox" defaultChecked /><span>含 Pantone 色卡</span></label>
              <label className="pb-check"><input type="checkbox" defaultChecked /><span>含面料贴图（实物）</span></label>
              <label className="pb-check"><input type="checkbox" defaultChecked /><span>含 QR 码追溯</span></label>
              <label className="pb-check"><input type="checkbox" /><span>添加水印 / 防伪</span></label>
            </div>
            <button type="button" className="ft-btn is-primary" style={{ width: "100%", marginTop: 12 }}>
              生成并下载
            </button>
          </div>

          <div className="ft-card">
            <div className="ft-card__head">
              <h2>导出历史</h2>
              <Link href="/studio/dashboard" className="more">全部 →</Link>
            </div>
            <div className="ft-history">
              {HISTORY.map((h, i) => (
                <div key={h.id} className="ft-history__item">
                  <div className="ft-history__media" style={{ background: "#fdfaf4", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 10, color: "var(--ft-gold)" }}>PDF</span>
                  </div>
                  <div>
                    <b>{h.id} · {h.v}</b>
                    <small>{h.title}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-card" style={{ background: "linear-gradient(135deg, var(--ft-gold-bg), rgba(176,134,92,0.02))" }}>
            <b style={{ display: "block", fontSize: 13, color: "var(--ft-text)", marginBottom: 6 }}>送工厂直发</b>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ft-text2)", lineHeight: 1.7, marginBottom: 10 }}>
              已绑定 3 家合作工厂。点击后会生成专属链接，工厂端打开即可直接备料。
            </p>
            <Link href="/studio/dashboard" className="ft-btn is-primary" style={{ width: "100%", justifyContent: "center" }}>
              发送到工厂 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
