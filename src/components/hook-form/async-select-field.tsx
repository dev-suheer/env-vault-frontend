import { useEffect, useRef, useState, type ReactNode, type UIEvent } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FieldFrame } from "@/components/hook-form/field-frame";
import { OptionsMenu } from "@/components/hook-form/options-menu";
import type { FieldOption, OptionPage } from "@/components/hook-form/types";

export function AsyncSelectField({
  name,
  label,
  hint,
  placeholder = "Select",
  multiple = false,
  loadOptions,
}: {
  name: string;
  label?: string;
  hint?: ReactNode;
  placeholder?: string;
  multiple?: boolean;
  loadOptions: (args: { keyword: string; page: number }) => Promise<OptionPage>;
}) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const loadOptionsRef = useRef(loadOptions);
  loadOptionsRef.current = loadOptions;

  useEffect(() => {
    if (!open) return;
    const request = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await loadOptionsRef.current({ keyword, page });
        setTotalPages(result.totalPages);
        setOptions((current) => (page === 1 ? result.data : mergeOptions(current, result.data)));
        setLabels((current) => {
          const next = { ...current };
          result.data.forEach((option) => {
            next[option.value] = option.label;
          });
          return next;
        });
      } finally {
        setLoading(false);
      }
    }, page === 1 ? 300 : 0);
    return () => window.clearTimeout(request);
  }, [keyword, open, page]);

  const selected = multiple ? (Array.isArray(field.value) ? (field.value as string[]) : []) : [];
  const summary = multiple
    ? selected.map((value) => labels[value] ?? value).join(", ")
    : labels[field.value] || options.find((option) => option.value === field.value)?.label || "";

  function pick(option: FieldOption) {
    if (!multiple) {
      field.onChange(option.value);
      setLabels((current) => ({ ...current, [option.value]: option.label }));
      setOpen(false);
      return;
    }
    const next = selected.includes(option.value)
      ? selected.filter((value) => value !== option.value)
      : [...selected, option.value];
    field.onChange(next);
  }

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const node = event.currentTarget;
    if (loading || page >= totalPages) return;
    if (node.scrollTop + node.clientHeight >= node.scrollHeight - 24) setPage((current) => current + 1);
  }

  return (
    <FieldFrame label={label} error={fieldState.error?.message} hint={hint}>
      <OptionsMenu
        open={open}
        onOpenChange={setOpen}
        placeholder={placeholder}
        label={summary}
        invalid={Boolean(fieldState.error)}
        searchable
        keyword={keyword}
        onKeywordChange={(value) => {
          setKeyword(value);
          setPage(1);
        }}
        options={options}
        isSelected={(value) => (multiple ? selected.includes(value) : field.value === value)}
        onPick={pick}
        loading={loading}
        empty={keyword ? "No results" : "Type to search"}
        onScroll={onScroll}
      />
    </FieldFrame>
  );
}

function mergeOptions(current: FieldOption[], next: FieldOption[]) {
  const seen = new Set(current.map((option) => option.value));
  return [...current, ...next.filter((option) => !seen.has(option.value))];
}
