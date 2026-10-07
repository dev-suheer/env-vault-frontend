import type { ReactNode, UIEvent } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fieldControl } from "@/components/hook-form/field-frame";
import type { FieldOption } from "@/components/hook-form/types";

const menuClass =
  "w-(--anchor-width) gap-0 border border-line bg-white p-1 text-fg shadow-lg ring-0 dark:border-ink-650 dark:bg-ink-950 dark:text-ink-100";

export function OptionsMenu({
  open,
  onOpenChange,
  placeholder,
  label,
  invalid,
  searchable,
  keyword,
  onKeywordChange,
  options,
  isSelected,
  onPick,
  loading,
  empty,
  onScroll,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder: string;
  label: ReactNode;
  invalid?: boolean;
  searchable?: boolean;
  keyword: string;
  onKeywordChange: (value: string) => void;
  options: FieldOption[];
  isSelected: (value: string) => boolean;
  onPick: (option: FieldOption) => void;
  loading?: boolean;
  empty?: string;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        type="button"
        className={cn(fieldControl, "flex items-center justify-between gap-2 text-left", invalid && "border-rose-500")}
      >
        <span className={cn("min-w-0 flex-1 truncate", !label && "text-[#6e7681]")}>{label || placeholder}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-[#6e7681]" />
      </PopoverTrigger>
      <PopoverContent align="start" className={menuClass}>
        {searchable ? (
          <input
            value={keyword}
            placeholder="Search"
            className="mb-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-sm outline-none dark:border-ink-650 dark:bg-ink-950"
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        ) : null}
        <div className="max-h-60 overflow-y-auto" onScroll={onScroll}>
          {options.map((option) => {
            const selected = isSelected(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-brand-500/15 hover:text-brand-700 dark:hover:text-brand-100",
                  selected && "bg-brand-500/15 text-brand-700 dark:text-brand-100",
                )}
                onClick={() => onPick(option)}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selected ? <CheckIcon className="size-4 shrink-0 text-brand-600 dark:text-brand-500" /> : null}
              </button>
            );
          })}
          {!loading && options.length === 0 ? <p className="px-2.5 py-2 text-sm text-[#6e7681]">{empty ?? "No results"}</p> : null}
          {loading ? <p className="px-2.5 py-2 text-sm text-[#6e7681]">Loading…</p> : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
