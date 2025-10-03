"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import {
  subjectSchema,
  SubjectSchema,
} from "../../../public/lib/FormValidationSchema";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
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
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit(
    (data) => {
      // ✅ Only runs if validation passes
      formAction(data);
    },
    (errors) => {
      // ✅ Runs if validation fails (prevents crash)
      console.log("Validation errors:", errors);
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { tutors = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject Name "
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />

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

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Tutors</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("tutors")}
            defaultValue={data?.tutors?.map((t: any) => t.id.toString())}
          >
            {tutors.map(
              (tutor: { id: string; firstName: string; lastName: string }) => (
                <option value={tutor.id} key={tutor.id}>
                  {tutor.firstName + " " + tutor.lastName}
                </option>
              )
            )}
          </select>
          {errors.tutors?.message && (
            <p className="text-xs text-red-400">
              {errors.tutors.message.toString()}
            </p>
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

export default SubjectForm;
