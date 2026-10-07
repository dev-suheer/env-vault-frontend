type ErrorItem = { msg?: string };

type ErrorData = {
  detail?: string | ErrorItem[];
  message?: string;
  error?: string;
};

function detailMessage(detail: ErrorData["detail"]): string | null {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const text = detail
      .map((item) => item?.msg)
      .filter((item): item is string => Boolean(item))
      .join(" ");
    if (text) return text;
  }
  return null;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: ErrorData | string }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      const fromDetail = detailMessage(data.detail);
      if (fromDetail) return fromDetail;
      if (typeof data.message === "string" && data.message.trim()) return data.message;
      if (typeof data.error === "string" && data.error.trim()) return data.error;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "An unexpected error occurred";
}
