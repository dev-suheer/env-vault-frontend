"use client";

import { UserPhoto } from "@/components/brand/avatar";
import { RoleChip } from "@/components/brand/role-chip";
import { Field, Form } from "@/components/hook-form";
import { ROLE } from "@/lib/brand";
import { useVault } from "@/lib/store";
import { btn, card, mute, primary } from "@/lib/styles";
import { resizePhoto } from "@/modules/profile/lib/photo";
import { useUpdateProfileMutation } from "@/store/Reducer/users-api";
import { setUser } from "@/store/slice/userSlice";
import type { RootState } from "@/store/store";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type ChangeEvent } from "react";
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
  const { me, toast, updateProfile } = useVault();
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.userSlice.user);
  const [saveProfile] = useUpdateProfileMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(me?.image ?? null);
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
      if (!updateProfile({ name: data.name, phone: data.phone, image })) {
        showError("Could not save your profile");
        return;
      }
      showSuccess("Profile saved");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  const onPhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Choose an image file");
      return;
    }
    try {
      setImage(await resizePhoto(file));
    } catch {
      toast("Could not read that image");
    }
  };

  if (!me) return null;

  const dirty =
    name.trim() !== me.name || phone.trim() !== me.phone || image !== me.image;

  return (
    <Form
      methods={methods}
      onSubmit={onSubmit}
      className={`${card} mt-6 overflow-hidden`}
    >
      <div className="flex flex-col gap-5 border-b border-line px-5 py-6 sm:flex-row sm:items-center sm:px-8 dark:border-ink-700">
        <UserPhoto
          name={name.trim() || me.name}
          image={image}
          className="h-24 w-24 text-3xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold">
            {name.trim() || me.name}
          </h2>
          <p className={`mt-0.5 truncate text-sm ${mute}`}>{me.email}</p>
          <div className="mt-3">
            <RoleChip role={me.role} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={btn}
            disabled
            onClick={() => fileRef.current?.click()}
          >
            Change photo
          </button>
          {image ? (
            <button
              type="button"
              className={btn}
              onClick={() => setImage(null)}
            >
              Remove
            </button>
          ) : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onPhotoChange}
        />
      </div>

      <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-2">
        <section>
          <h3 className="text-sm font-bold">Personal details</h3>
          <p className={`mt-1 text-xs ${mute}`}>
            Your name and phone. The photo above is the one shown on your
            account.
          </p>
          <div className="mt-5">
            <Field.Text name="name" label="Name" maxLength={60} />
            <Field.Text
              name="phone"
              label="Phone number"
              type="tel"
              maxLength={24}
              placeholder="e.g. +1 555 0100"
            />
          </div>
        </section>
        <section>
          <h3 className="text-sm font-bold">Account</h3>
          <p className={`mt-1 text-xs ${mute}`}>
            Email and role belong to the account and stay read only.
          </p>
          <div className="mt-5">
            <Field.Text name="email" label="Email" disabled />
            <Field.Text name="role" label="Role" disabled />
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-8 dark:border-ink-700">
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
