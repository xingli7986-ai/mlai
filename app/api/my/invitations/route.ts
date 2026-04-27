import { GET as listInvitations } from "@/app/api/invitations/route";

export const runtime = "nodejs";

/** GET /api/my/invitations — alias of /api/invitations (same response shape). */
export async function GET(req: Request) {
  return listInvitations(req);
}
