"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useRecordsStore } from "@/lib/stores/records-store";
import RecordDetail from "@/components/locker/RecordDetail";
import EmptyState from "@/components/shared/EmptyState";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

export default function RecordDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const record = useRecordsStore((s) => s.getRecordById(id));

  if (!record) {
    return (
      <div style={{ padding: "40px 20px 100px" }}>
        <EmptyState
          title="Record not found"
          description="This record may have been removed. Head back to your locker to see what's there."
          ctaLabel="Back to Locker"
          onCta={() => router.push("/dashboard/locker")}
        />
      </div>
    );
  }

  return <RecordDetail record={record} />;
}
