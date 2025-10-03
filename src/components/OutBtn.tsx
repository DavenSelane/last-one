"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

const OutBtn = () => {
  return (
    <div>
      <button
        className="btn btn-primary py-4 px-lg-5 d-none d-lg-block"
        onClick={() =>
          signOut({
            redirect: true,
            callbackUrl: "/", // redirects to home page
          })
        }
      >
        Sign Out
      </button>
    </div>
  );
};

export default OutBtn;
