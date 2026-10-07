import { useMemo, useState, type ReactNode } from "react";
import { cn } from "cn";
import { useController, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldFrame, fieldControl } from "@/components/hook-form/field-frame";
import { OptionsMenu } from "@/components/hook-form/options-menu";
import type { FieldOption } from "@/components/hook-form/types";

export function SelectField({
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
  const selected = options.find((option) => option.value === field.value);

  const visible = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    if (!searchable || !term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [keyword, options, searchable]);

  return (
    <FieldFrame label={label} error={fieldState.error?.message} hint={hint}>
      {searchable ? (
        <OptionsMenu
          open={open}
          onOpenChange={setOpen}
          placeholder={placeholder}
          label={selected?.label}
          invalid={Boolean(fieldState.error)}
          searchable
          keyword={keyword}
          onKeywordChange={setKeyword}
          options={visible}
          isSelected={(value) => value === field.value}
          onPick={(option) => {
            field.onChange(option.value);
            setOpen(false);
          }}
        />
      ) : (
        <Select value={field.value || null} onValueChange={field.onChange}>
          <SelectTrigger
            className={cn(
              fieldControl,
              "flex h-auto w-full justify-between data-[size=default]:h-auto",
              fieldState.error && "border-rose-500",
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldFrame>
  );
}
