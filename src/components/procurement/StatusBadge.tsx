import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT:               { label: "Nháp",           variant: "secondary" },
  SUBMITTED:           { label: "Chờ duyệt",      variant: "outline" },
  DEPT_HEAD_APPROVED:  { label: "TBP đã duyệt",   variant: "default" },
  DIRECTOR_APPROVED:   { label: "Đã duyệt",        variant: "default" },
  APPROVED:            { label: "Đã duyệt",        variant: "default" },
  REJECTED:            { label: "Từ chối",         variant: "destructive" },
  RECEIVED:            { label: "Đã tiếp nhận",   variant: "default" },
  COMPLETED:           { label: "Hoàn thành",     variant: "default" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
