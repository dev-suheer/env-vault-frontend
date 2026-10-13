"use client";

import { UserPhoto } from "@/components/brand/avatar";
import { RoleChip } from "@/components/brand/role-chip";
import { Field, Form } from "@/components/hook-form";
import { ROLE } from "@/lib/brand";
import { useVault } from "@/lib/store";
import { card, mute, primary } from "@/lib/styles";
import { useUpdateProfileMutation } from "@/store/Reducer/users-api";
import { setUser } from "@/store/slice/userSlice";
import type { RootState } from "@/store/store";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  phone: z.string().trim(),
  email: z.string(),
  role: z.string(),
});

type ProfileValues = z.infer<typeof schema>;

export function ProfileDetails() {
  const { me, updateProfile } = useVault();
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.userSlice.user);
  const [saveProfile] = useUpdateProfileMutation();
  const methods = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: me?.name ?? "",
      phone: me?.phone ?? "",
      email: me?.email ?? "",
      role: me ? ROLE[me.role].label : "",
    },
  });
  const name = useWatch({ control: methods.control, name: "name" });
  const phone = useWatch({ control: methods.control, name: "phone" });

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!me) return;
    try {
      if (data.name !== me.name || data.phone !== me.phone) {
        const result = await saveProfile({
          name: data.name,
          phone: data.phone,
        }).unwrap();
        if (session)
          dispatch(
            setUser({ ...session, name: result.name, phone: result.phone }),
          );
      }
      if (
        !updateProfile({
          name: data.name,
          phone: data.phone,
          image: me.image ?? null,
        })
      ) {
        showError("Could not save your profile");
        return;
      }
      showSuccess("Profile saved");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  if (!me) return null;

  const dirty = name.trim() !== me.name || phone.trim() !== me.phone;

  return (
    <Form
      methods={methods}
      onSubmit={onSubmit}
      className={`${card} mt-5 overflow-hidden`}
    >
      <div className="flex items-center gap-3 border-b border-line px-5 py-4 dark:border-ink-700">
        <UserPhoto
          name={name.trim() || me.name}
          image={me.image}
          className="h-12 w-12 text-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-bold">
              {name.trim() || me.name}
            </h2>
            <RoleChip role={me.role} />
          </div>
          <p className={`truncate text-sm ${mute}`}>{me.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 px-5 py-4 sm:grid-cols-2 [&>*]:mt-0">
        <Field.Text
          name="name"
          label="Name"
          maxLength={60}
          placeholder="Your name"
        />
        <Field.Text name="email" label="Email" disabled />
        <Field.Text
          name="phone"
          label="Phone number"
          type="tel"
          maxLength={24}
          placeholder="+92 300 1234567"
        />
        <Field.Text name="role" label="Role" disabled />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 dark:border-ink-700">
        <p className={`text-xs ${mute}`}>
          {dirty ? "You have unsaved changes." : "All changes are saved."}
        </p>
        <button
          className={`${primary} disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={!dirty || methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? "Saving…" : "Save profile"}
        </button>
      </div>
    </Form>
  );
}
