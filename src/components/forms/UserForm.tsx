"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  userSchema,
  UserSchema,
} from "../../../public/lib/FormValidationSchema";
import { useFormState } from "react-dom";
import { updateUser } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const UserForm = ({
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
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: data?.id,
      firstName: data?.firstName,
      lastName: data?.lastName,
      phone: data?.phone,
      bio: data?.bio,
      gradeId: data?.gradeId,
      subjects: data?.subjectsTaught?.map((s: any) => s.id.toString()) || [],
    },
  });

  const [state, formAction] = useFormState(updateUser, {
    success: false,
    error: false,
  });

  const onSubmit = handleSubmit((formData) => {
    const form = new FormData();
    form.append("id", data?.id.toString());
    form.append("firstName", formData.firstName);
    form.append("lastName", formData.lastName);
    if (formData.phone) form.append("phone", formData.phone);
    if (formData.bio) form.append("bio", formData.bio);
    if (formData.gradeId) form.append("gradeId", formData.gradeId.toString());
    if (formData.subjects) {
      formData.subjects.forEach((subjectId) => {
        form.append("subjects", subjectId);
      });
    }
    formAction(form);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast("User has been updated!");
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen]);

  const { grades = [], subjects = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Update User</h1>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="firstName"
          register={register}
          error={errors.firstName}
        />
        <InputField
          label="Last Name"
          name="lastName"
          register={register}
          error={errors.lastName}
        />
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Bio"
          name="bio"
          register={register}
          error={errors.bio}
        />
        {data?.role === "STUDENT" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Grade</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("gradeId", { valueAsNumber: true })}
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
        )}
        {data?.role === "TUTOR" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Subjects</label>
            <select
              multiple
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("subjects")}
            >
              {subjects.map((subject: { id: string; name: string }) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjects?.message && (
              <p className="text-xs text-red-400">
                {errors.subjects.message.toString()}
              </p>
            )}
          </div>
        )}
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">Update</button>
    </form>
  );
};

export default UserForm;
