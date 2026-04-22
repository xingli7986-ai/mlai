import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import {
  FABRICS,
  NECKLINES,
  SKIRT_LENGTHS,
  SKIRT_TYPES,
  SLEEVE_TYPES,
  calculatePrice,
} from "@/lib/constants";
import {
  BOM_TEMPLATES,
  CONSTRUCTION_TEMPLATES,
  SHARED_BOM_ITEMS,
  calculateAllSizes,
  seasonFromDate,
} from "@/lib/techpack-data";
import { TechPackDocument, type TechPackProps } from "@/lib/techpack-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function lookupSkirt(id: string) {
  const f = SKIRT_TYPES.find((s) => s.id === id);
  return f
    ? { id: f.id, name: f.name, enName: f.enName }
    : { id, name: id, enName: id };
}

function lookupNeckline(id: string | null) {
  const f = NECKLINES.find((n) => n.id === id);
  if (f) return { id: f.id, name: f.name, enName: f.enName };
  const fallback = id ?? "—";
  return { id: fallback, name: fallback, enName: fallback };
}

function lookupSleeve(id: string | null) {
  const f = SLEEVE_TYPES.find((s) => s.id === id);
  if (f) return { id: f.id, name: f.name, enName: f.enName };
  const fallback = id ?? "—";
  return { id: fallback, name: fallback, enName: fallback };
}

function lookupLength(id: string | null) {
  const f = SKIRT_LENGTHS.find((l) => l.id === id);
  if (f) return { id: f.id, name: f.name, refLengthCm: f.refLengthCm };
  return { id: id ?? "knee", name: id ?? "—", refLengthCm: 95 };
}

function lookupFabric(id: string) {
  const f = FABRICS.find((x) => x.id === id);
  if (f) {
    return {
      info: { id: f.id, name: f.name, composition: f.composition, gsm: f.gsm },
      careInstructions: f.careInstructions,
    };
  }
  return {
    info: { id, name: id, composition: "—", gsm: "—" },
    careInstructions: undefined as string | undefined,
  };
}

function parseCustomMeasurements(
  raw: string | null
): TechPackProps["customMeasurements"] {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.bust === "number" &&
      typeof parsed.waist === "number" &&
      typeof parsed.hip === "number" &&
      typeof parsed.height === "number"
    ) {
      return {
        bust: parsed.bust,
        waist: parsed.waist,
        hip: parsed.hip,
        height: parsed.height,
      };
    }
  } catch {
    /* fall through */
  }
  return undefined;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { design: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.userId !== user.id && !isAdmin(user.phone)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const createdAt = order.createdAt;
    const styleCode = `ML-${createdAt.getFullYear()}-${order.id
      .slice(0, 4)
      .toUpperCase()}`;
    const styleName = (order.design.prompt ?? "").slice(0, 20) || "未命名款式";
    const date = formatDate(createdAt);
    const season = seasonFromDate(createdAt);
    const printImageUrl =
      order.design.productionImageUrl ||
      order.design.selectedImage ||
      order.design.images[0] ||
      "";
    const printDescription = order.design.prompt ?? "";

    const skirtType = lookupSkirt(order.skirtType);
    const neckline = lookupNeckline(order.neckline);
    const sleeveType = lookupSleeve(order.sleeveType);
    const skirtLength = lookupLength(order.skirtLength);
    const fabricLookup = lookupFabric(order.fabric);
    const fabric = fabricLookup.info;
    const careInstructions = fabricLookup.careInstructions;

    const customMeasurements = parseCustomMeasurements(order.customMeasurements);

    const constructionNotes =
      CONSTRUCTION_TEMPLATES[order.skirtType] ??
      "工艺模板待定: 工厂按通用连衣裙结构打板, 遵守下方通用工艺要求。";

    const bomItems = BOM_TEMPLATES[order.fabric] ?? [
      {
        item: "主面料",
        spec: `${fabric.name} · ${fabric.composition} · ${fabric.gsm}`,
        quantity: "1.5–1.8 m",
        placement: "主体",
      },
      ...SHARED_BOM_ITEMS,
    ];

    const pomData = calculateAllSizes(order.skirtLength ?? "knee");
    const price = calculatePrice(order.fabric, order.skirtType);

    let colorAnalysis: TechPackProps["colorAnalysis"];
    if (order.design.colorAnalysis) {
      try {
        const parsed = JSON.parse(order.design.colorAnalysis);
        if (Array.isArray(parsed)) {
          colorAnalysis = parsed.filter(
            (c): c is NonNullable<TechPackProps["colorAnalysis"]>[number] =>
              c &&
              typeof c.hex === "string" &&
              typeof c.pantoneCode === "string" &&
              typeof c.pantoneName === "string" &&
              typeof c.percentage === "number"
          );
        }
      } catch {
        /* fall through */
      }
    }

    const props: TechPackProps = {
      styleCode,
      styleName,
      date,
      season,
      printImageUrl,
      printDescription,
      skirtType,
      neckline,
      sleeveType,
      skirtLength,
      fabric,
      size: order.size,
      customMeasurements,
      constructionNotes,
      bomItems,
      pomData,
      price,
      vectorFileUrl: order.design.vectorImageUrl ?? undefined,
      colorAnalysis,
      careInstructions,
    };

    // Calling TechPackDocument directly (vs. createElement) returns the
    // <Document> element react-pdf expects. Since this is a one-shot
    // server-side render (no reconciler), direct invocation is fine.
    const buffer = await renderToBuffer(TechPackDocument(props));

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="MaxLuLu_TechPack_${styleCode}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("TechPack generation failed:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate tech pack";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
