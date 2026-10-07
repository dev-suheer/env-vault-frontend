import { AsyncSelectField } from "@/components/hook-form/async-select-field";
import { Form } from "@/components/hook-form/form";
import { MultiSelectField } from "@/components/hook-form/multi-select-field";
import { PasswordField } from "@/components/hook-form/password-field";
import { SelectField } from "@/components/hook-form/select-field";
import { TextField } from "@/components/hook-form/text-field";

export const Field = {
  Text: TextField,
  Password: PasswordField,
  Select: SelectField,
  MultiSelect: MultiSelectField,
  AsyncSelect: AsyncSelectField,
};

export { Form };
export type { FieldOption, OptionPage } from "@/components/hook-form/types";
