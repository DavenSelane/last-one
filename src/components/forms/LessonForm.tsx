"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import {
  lessonSchema,
  LessonSchema,
} from "../../../public/lib/FormValidationSchema";
import { useFormState } from "react-dom";
import { createLesson, updateLesson } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const LessonForm = ({
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
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      id: data?.id,
      topic: data?.topic || "",
      subjectId: data?.subjectId,
      classId: data?.classId,
      tutorId: data?.tutorId,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
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
      toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { subjects = [], classes = [], tutors = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Lesson" : "Update Lesson"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Topic"
          name="topic"
          register={register}
          error={errors.topic}
        />

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject: { id: number; name: string }) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="text-xs text-red-400">{errors.subjectId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            <option value="">Select Class</option>
            {classes.map((classItem: { id: number; name: string; grade: { name: string } }) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name} ({classItem.grade?.name})
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Tutor</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("tutorId")}
          >
            <option value="">Select Tutor</option>
            {tutors.map((tutor: { id: number; firstName: string; lastName: string }) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.firstName} {tutor.lastName}
              </option>
            ))}
          </select>
          {errors.tutorId && (
            <p className="text-xs text-red-400">{errors.tutorId.message}</p>
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

export default LessonForm;
