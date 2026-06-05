"use client";

import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";

import {
  FaUserPlus,
  FaFileExport,
  FaCog,
} from "react-icons/fa";

export default function ActivatePage() {

  // MULTI SELECT MEMBERS
  const [selectedMembers, setSelectedMembers] =
    useState([]);

  const [permissionType, setPermissionType] =
    useState("");

  const [selectedPermissions, setSelectedPermissions] =
    useState([]);

  const [showToast, setShowToast] =
    useState(false);

  const [showPermissionPage, setShowPermissionPage] =
    useState(false);

  const [openPermissionPopup, setOpenPermissionPopup] =
    useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "john@gmail.com",
      phone: "9876543210",
      status: "Inactive",
    },
    {
      id: 2,
      name: "Alex Smith",
      email: "alex@gmail.com",
      phone: "9876543211",
      status: "Active",
    },
    {
      id: 3,
      name: "Sara Lee",
      email: "sara@gmail.com",
      phone: "9876543212",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Sara Lee",
      email: "sara@gmail.com",
      phone: "9876543212",
      status: "Active",
    },
  ];

  // Workspace permissions
  const workspacePermissions = [
    "Documents",
    "Groups",
    "Settings",
  ];

  // File permissions
  const filePermissions = [
    "Create Workspace",
    "Edit Workspace",
    "Delete Workspace",
    "Manage Members",
    "View Reports",
  ];

  // Permission checkbox
  const handleCheckboxChange = (value) => {

    if (
      selectedPermissions.includes(value)
    ) {

      setSelectedPermissions(
        selectedPermissions.filter(
          (item) => item !== value
        )
      );

    } else {

      setSelectedPermissions([
        ...selectedPermissions,
        value,
      ]);

    }
  };

  // Final submit
  const handleSubmit = () => {

    if (!permissionType) {
      alert("Please select permission type");
      return;
    }

    if (
      selectedPermissions.length === 0
    ) {
      alert(
        "Please select at least one permission"
      );
      return;
    }

    const selectedMemberData =
      members.filter((member) =>
        selectedMembers.includes(member.id)
      );

    console.log({
      members: selectedMemberData,
      permissionType,
      permissions: selectedPermissions,
    });

    // Toast
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);

    // Reset
    setSelectedPermissions([]);
    setPermissionType("");
    setSelectedMembers([]);

    setOpenPermissionPopup(false);
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">

      {/* TOAST */}
      {showToast && (
        <div
          className="
            fixed
            top-6
            right-6
            bg-green-600
            text-white
            px-6
            py-3
            rounded-xl
            shadow-2xl
            z-[999]
            animate-bounce
          "
        >
          Permission Applied Successfully
        </div>
      )}

      {/* TITLE */}
      <div className="sticky top-0 pt-6 px-4 md:px-8 z-10 pb-4">

        <h1 className="text-black text-4xl font-bold mt-6">
          Sub Admin Members
        </h1>

      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-6 mt-8">

        {!showPermissionPage ? (

          <div className="bg-white rounded-2xl shadow-md p-6 w-full">

            {/* BUTTONS */}
            <div className="flex items-center gap-4 mb-6">

              {/* Invite */}
              <Button
                className="
                  flex
                  items-center
                  bg-transparent
                  hover:bg-transparent
                  shadow-none
                  !text-black
                  font-bold
                "
              >
                <FaUserPlus className="mr-2" />
                <span>Invite</span>
              </Button>

              {/* Export */}
              {/* <Button
                className="
                  flex
                  items-center
                  bg-transparent
                  hover:bg-transparent
                  shadow-none
                  !text-black
                  font-bold
                "
              >
                <FaFileExport className="mr-2" />
                <span>Export</span>
              </Button> */}

              {/* Permission */}
              <Button
                onClick={() =>
                  setShowPermissionPage(true)
                }
                className="
                  flex
                  items-center
                  bg-transparent
                  hover:bg-transparent
                  shadow-none
                  !text-black
                  font-bold
                "
              >
                <FaCog className="mr-2" />
                <span>Permission</span>
              </Button>

            </div>

            {/* TABLE */}
            <div className="hidden md:block overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>
                  <tr className="bg-gray-100">

                    <th className="text-left p-4 font-semibold text-black">
                      Name
                    </th>

                    <th className="text-left p-4 font-semibold text-black">
                      Email
                    </th>

                    <th className="text-left p-4 font-semibold text-black">
                      Phone Number
                    </th>

                    <th className="text-left p-4 font-semibold text-black">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {members.map((member) => (

                    <tr
                      key={member.id}
                      className="border-t border-gray-200"
                    >

                      <td className="p-4 text-gray-700">
                        {member.name}
                      </td>

                      <td className="p-4 text-gray-700">
                        {member.email}
                      </td>

                      <td className="p-4 text-gray-700">
                        {member.phone}
                      </td>

                      <td className="p-4">

                        <div className="flex items-center gap-2">

                          <div
                            className={`w-3 h-3 rounded-full ${
                              member.status === "Active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />

                          <span className="text-gray-700">
                            {member.status}
                          </span>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

        ) : (

          /* PERMISSION PAGE */
          <div
            className="
              bg-white
              rounded-2xl
              shadow-md
              p-10
              min-h-[500px]
            "
          >

            {/* HEADER */}
            <div className="flex items-start justify-between">

              <div>

                <h1 className="text-4xl font-bold text-black">
                  Permission
                </h1>

                {/* MEMBER LIST */}
                <div className="mt-8">

                  <h2 className="text-xl font-semibold text-black mb-5">
                    Select Member
                  </h2>

                  <div className="flex flex-wrap gap-4">

                    {members.map((member) => (

                      <label
                        key={member.id}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          px-2
                          py-4
                          cursor-pointer
                          hover:bg-gray-50
                          transition-all
                          min-w-[190px]
                        "
                      >

                        {/* CHECKBOX */}
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(
                            member.id
                          )}
                          onChange={() => {

                            if (
                              selectedMembers.includes(
                                member.id
                              )
                            ) {

                              setSelectedMembers(
                                selectedMembers.filter(
                                  (id) =>
                                    id !== member.id
                                )
                              );

                            } else {

                              setSelectedMembers([
                                ...selectedMembers,
                                member.id,
                              ]);

                            }
                          }}
                          className="
                            w-5
                            h-5
                            accent-black
                          "
                        />

                        {/* NAME */}
                        <div className="flex flex-col">

                          <span className="text-lg font-semibold text-black">
                            {member.name}
                          </span>

                        </div>

                      </label>
                    ))}

                  </div>

                  {/* SUBMIT */}
                  <button
                    onClick={() => {

                      if (
                        selectedMembers.length === 0
                      ) {

                        alert(
                          "Please select member"
                        );

                        return;
                      }

                      setOpenPermissionPopup(true);

                    }}
                    className="
                      mt-8
                      bg-black
                      hover:bg-gray-800
                      text-white
                      px-8
                      py-3
                      rounded-xl
                      font-semibold
                    "
                  >
                    Submit
                  </button>

                </div>

              </div>

              {/* BACK BUTTON */}
              <button
                onClick={() =>
                  setShowPermissionPage(false)
                }
                className="
                  bg-black
                  hover:bg-gray-800
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                "
              >
                Back
              </button>

            </div>

          </div>

        )}

      </div>

      {/* POPUP */}
      {openPermissionPopup && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
            p-4
          "
        >

          <div
            className="
              bg-white
              w-full
              max-w-md
              rounded-2xl
              shadow-2xl
              p-6
              relative
            "
          >

            {/* CLOSE */}
            <button
              onClick={() => {

                setOpenPermissionPopup(false);

                setSelectedPermissions([]);

                setPermissionType("");

              }}
              className="
                absolute
                top-3
                right-4
                text-xl
                text-gray-500
              "
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-black mb-6">
              Permissions
            </h2>

            {/* SELECTED MEMBERS */}
            <div className="mb-6">

              <p className="text-sm text-gray-500">
                Selected Members
              </p>

              <div className="flex flex-wrap gap-2 mt-3">

                {members
                  .filter((member) =>
                    selectedMembers.includes(
                      member.id
                    )
                  )
                  .map((member) => (

                    <span
                      key={member.id}
                      className="
                        bg-gray-100
                        px-4
                        py-2
                        rounded-xl
                        text-black
                        font-medium
                      "
                    >
                      {member.name}
                    </span>

                  ))}

              </div>

            </div>

            {/* SELECT */}
            <div>

              <label className="block mb-2 text-gray-700 font-medium">
                Access Permission
              </label>

              <select
                value={permissionType}
                onChange={(e) => {

                  setPermissionType(
                    e.target.value
                  );

                  setSelectedPermissions([]);

                }}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  p-3
                  outline-none
                  focus:border-black
                  text-black
                  bg-white
                "
              >

                <option value="">
                  Select
                </option>

                <option value="file">
                  File Permission
                </option>

                <option value="workspace">
                  Workspace Permission
                </option>

              </select>

            </div>

            {/* FILE PERMISSION */}
            {permissionType === "file" && (

              <div className="mt-6 space-y-3">

                <h3 className="font-semibold text-black">
                  File Permissions
                </h3>

                {filePermissions.map(
                  (permission, index) => (

                    <label
                      key={index}
                      className="
                        flex
                        items-center
                        gap-3
                        border
                        border-gray-200
                        rounded-xl
                        px-4
                        py-3
                        cursor-pointer
                        hover:bg-gray-50
                        transition-all
                      "
                    >

                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(
                          permission
                        )}
                        onChange={() =>
                          handleCheckboxChange(
                            permission
                          )
                        }
                        className="
                          w-5
                          h-5
                          accent-black
                        "
                      />

                      <span className="text-gray-700">
                        {permission}
                      </span>

                    </label>
                  )
                )}

              </div>
            )}

            {/* WORKSPACE PERMISSION */}
            {permissionType === "workspace" && (

              <div className="mt-6 space-y-3">

                <h3 className="font-semibold text-black">
                  Workspace Permissions
                </h3>

                {workspacePermissions.map(
                  (permission, index) => (

                    <label
                      key={index}
                      className="
                        flex
                        items-center
                        gap-3
                        border
                        border-gray-200
                        rounded-xl
                        px-4
                        py-3
                        cursor-pointer
                        hover:bg-gray-50
                        transition-all
                      "
                    >

                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(
                          permission
                        )}
                        onChange={() =>
                          handleCheckboxChange(
                            permission
                          )
                        }
                        className="
                          w-5
                          h-5
                          accent-black
                        "
                      />

                      <span className="text-gray-700">
                        {permission}
                      </span>

                    </label>
                  )
                )}

              </div>
            )}

            {/* FINAL SUBMIT */}
            <button
              onClick={handleSubmit}
              className="
                mt-8
                w-full
                bg-black
                hover:bg-gray-800
                text-white
                py-3
                rounded-xl
                font-semibold
                transition-all
              "
            >
              Submit Permission
            </button>

          </div>

        </div>
      )}

    </div>
  );
}