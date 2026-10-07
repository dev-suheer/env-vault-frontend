import { useMemo, useState, type ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FieldFrame } from "@/components/hook-form/field-frame";
import { OptionsMenu } from "@/components/hook-form/options-menu";
import type { FieldOption } from "@/components/hook-form/types";

export function MultiSelectField({
  name,
  label,
  hint,
  placeholder = "Select",
  options,
  searchable = false,
}: {
  name: string;
  label?: string;
  hint?: ReactNode;
  placeholder?: string;
  options: FieldOption[];
  searchable?: boolean;
}) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const selected = Array.isArray(field.value) ? (field.value as string[]) : [];

  const visible = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    if (!searchable || !term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [keyword, options, searchable]);

  const summary = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label)
    .join(", ");

  function toggle(option: FieldOption) {
    const next = selected.includes(option.value)
      ? selected.filter((value) => value !== option.value)
      : [...selected, option.value];
    field.onChange(next);
  }

  return (
    <FieldFrame label={label} error={fieldState.error?.message} hint={hint}>
      <OptionsMenu
        open={open}
        onOpenChange={setOpen}
        placeholder={placeholder}
        label={summary}
        invalid={Boolean(fieldState.error)}
        searchable={searchable}
        keyword={keyword}
        onKeywordChange={setKeyword}
        options={visible}
        isSelected={(value) => selected.includes(value)}
        onPick={toggle}
      />
    </FieldFrame>
  );
}
