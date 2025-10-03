"use client";

import { addStudentsToClass } from "@/lib/actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  classId: number | null;
};

type AddStudentsToClassProps = {
  classId: number;
  className: string;
  availableStudents: Student[];
};

const AddStudentsToClass = ({
  classId,
  className,
  availableStudents,
}: AddStudentsToClassProps) => {
  const [open, setOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [state, formAction] = useFormState(addStudentsToClass, {
    success: false,
    error: false,
  });
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Students added to ${className}`);
      setOpen(false);
      setSelectedStudents([]);
      router.refresh();
    }
    if (state.error) {
      toast.error("Failed to add students to class");
    }
  }, [state, router, className]);

  const toggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(availableStudents.map((s) => s.id));
    }
  };

  return (
    <>
      <button
        className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200"
        onClick={() => setOpen(true)}
        title="Add students to class"
      >
        <Image src="/student.png" alt="Add students" width={16} height={16} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[80vh] overflow-auto relative">
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>

            <h2 className="text-xl font-bold mb-4">
              Add Students to {className}
            </h2>

            {availableStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No students available to add. All students are already assigned to classes.
              </p>
            ) : (
              <form action={formAction} className="flex flex-col gap-4">
                <input type="hidden" name="classId" value={classId} />

                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">
                    Select students to add to this class ({selectedStudents.length} selected)
                  </p>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedStudents.length === availableStudents.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto border rounded-md">
                  {availableStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="studentIds"
                        value={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedStudents.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add {selectedStudents.length} Student{selectedStudents.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AddStudentsToClass;
