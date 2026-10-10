import { redirect } from "next/navigation";

export default async function ClientProjectRedirect({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/project-workspace/${encodeURIComponent(projectId)}`);
}
