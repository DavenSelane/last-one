"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import {
  classSchema,
  ClassSchema,
} from "../../../public/lib/FormValidationSchema";
import { useFormState } from "react-dom";
import { createClass, updateClass } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
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
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      gradeId: data?.gradeId,
      supervisorId: data?.supervisorId,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
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
      toast(`Class has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { grades = [], tutors = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Class" : "Update Class"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Class Name"
          name="name"
          register={register}
          error={errors.name}
        />

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
          >
            <option value="">Select Grade</option>
            {grades.map((grade: { id: number; name: string }) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          {errors.gradeId && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Supervisor (Tutor)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
          >
            <option value="">Select Supervisor</option>
            {tutors.map((tutor: { id: number; firstName: string; lastName: string }) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.firstName} {tutor.lastName}
              </option>
            ))}
          </select>
          {errors.supervisorId && (
            <p className="text-xs text-red-400">{errors.supervisorId.message}</p>
          )}
        </div>

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors.id}
            hidden
          />
        )}
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

export default ClassForm;
