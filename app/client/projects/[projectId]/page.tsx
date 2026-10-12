import { Suspense } from "react";
import { redirect } from "next/navigation";

async function RedirectContent({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<React.ReactNode> {
  const { projectId } = await params;
  redirect(`/project-workspace/${encodeURIComponent(projectId)}`);
  return null;
}

export default function ClientProjectRedirect({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <RedirectContent params={params} />
    </Suspense>
  );
}
