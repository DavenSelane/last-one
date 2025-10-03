"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import {
  announcementSchema,
  AnnouncementSchema,
} from "../../../public/lib/FormValidationSchema";
import { useFormState } from "react-dom";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    mode: "onSubmit",
    defaultValues: {
      id: data?.id,
      title: data?.title || "",
      description: data?.description || "",
      date: data?.date ? new Date(data.date) : undefined,
      classId: data?.classId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Announcement has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { classes = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Announcement" : "Update Announcement"}
      </h1>
      <div className="flex flex-col gap-4">
        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors.title}
        />
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            rows={4}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Date</label>
          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("date", { valueAsDate: true })}
          />
          {errors.date && (
            <p className="text-xs text-red-400">{errors.date.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">
            Class (Leave empty for all classes)
          </label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", {
              setValueAs: (v) => v === "" ? null : parseInt(v),
            })}
          >
            <option value="">All Classes</option>
            {classes.map((classItem: { id: number; name: string }) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
