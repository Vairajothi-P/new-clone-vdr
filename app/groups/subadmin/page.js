"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
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

  const [selectedPermissions, setSelectedPermissions] =
    useState([]);

  const [showToast, setShowToast] =
    useState(false);

  const [showPermissionPage, setShowPermissionPage] =
    useState(false);

  const [showInviteModal, setShowInviteModal] =
    useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDescription, setInviteDescription] = useState("");
  const [inviteToast, setInviteToast] = useState(false);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

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
    if (selectedPermissions.includes(value)) {
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

  // Handle Invite Submit
  const handleInviteSubmit = () => {
    if (!inviteEmail.trim()) {
      alert("Please enter email");
      return;
    }

    if (!inviteDescription.trim()) {
      alert("Please enter description");
      return;
    }

    console.log({
      email: inviteEmail,
      description: inviteDescription,
      group: "super_Admin",
    });

    // Toast
    setInviteToast(true);

    setTimeout(() => {
      setInviteToast(false);
    }, 3000);

    // Reset
    setInviteEmail("");
    setInviteDescription("");
    setShowInviteModal(false);
  };

  // Final submit
  const handleSubmit = () => {
    if (selectedMembers.length === 0) {
      alert("Please select member");
      return;
    }

    if (selectedPermissions.length === 0) {
      alert("Please select permission type");
      return;
    }

    const selectedMemberData =
      members.filter((member) =>
        selectedMembers.includes(member.id)
      );

    console.log({
      members: selectedMemberData,
      permissions: selectedPermissions,
    });

    // Toast
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);

    // Reset
    setSelectedPermissions([]);
    setSelectedMembers([]);
    setShowPermissionPage(false);
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

      {/* INVITE TOAST */}
      {inviteToast && (
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
          Invitation Email Sent Successfully
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
                onClick={() => setShowInviteModal(true)}
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
                        {member.phone_number}
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

              <div className="flex-1">

                <h1 className="text-4xl font-bold text-black">
                  Permission
                </h1>

                {/* PERMISSION TYPES */}
                <div className="mt-10">

                  <h2 className="text-xl font-semibold text-black mb-5">
                    Select Permission Type
                  </h2>

                  <div className="flex flex-wrap gap-4">

                    {/* FILE PERMISSION */}
                    <label
                      className="
                        flex items-center gap-3
                        border rounded-2xl
                        px-5 py-4
                        cursor-pointer
                        hover:bg-gray-50
                        transition-all
                        flex-1
                        min-w-[200px]
                      "
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.some(
                          (p) => filePermissions.includes(p)
                        )}
                        onChange={() => {
                          if (selectedPermissions.some(
                            (p) => filePermissions.includes(p)
                          )) {
                            setSelectedPermissions(
                              selectedPermissions.filter(
                                (item) =>
                                  !filePermissions.includes(item)
                              )
                            );
                          } else {
                            setSelectedPermissions([
                              ...selectedPermissions,
                              filePermissions[0],
                            ]);
                          }
                        }}
                        className="w-5 h-5 accent-black"
                      />

                      <div>
                        <p className="font-semibold text-black">
                          File Permission
                        </p>
                        <p className="text-sm text-gray-500">
                          Access specific files
                        </p>
                      </div>
                    </label>

                    {/* WORKSPACE PERMISSION */}
                    <label
                      className="
                        flex items-center gap-3
                        border rounded-2xl
                        px-5 py-4
                        cursor-pointer
                        hover:bg-gray-50
                        transition-all
                        flex-1
                        min-w-[200px]
                      "
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.some(
                          (p) => workspacePermissions.includes(p)
                        )}
                        onChange={() => {
                          if (selectedPermissions.some(
                            (p) => workspacePermissions.includes(p)
                          )) {
                            setSelectedPermissions(
                              selectedPermissions.filter(
                                (item) =>
                                  !workspacePermissions.includes(item)
                              )
                            );
                          } else {
                            setSelectedPermissions([
                              ...selectedPermissions,
                              workspacePermissions[0],
                            ]);
                          }
                        }}
                        className="w-5 h-5 accent-black"
                      />

                      <div>
                        <p className="font-semibold text-black">
                          Workspace Permission
                        </p>
                        <p className="text-sm text-gray-500">
                          Access entire workspace
                        </p>
                      </div>
                    </label>

                  </div>

                </div>

                {/* FILE PERMISSION DETAILS */}
                {selectedPermissions.some(
                  (p) => filePermissions.includes(p)
                ) && (

                  <div className="mt-8 space-y-3">

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

                {/* WORKSPACE PERMISSION DETAILS */}
                {selectedPermissions.some(
                  (p) => workspacePermissions.includes(p)
                ) && (

                  <div className="mt-8 space-y-3">

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

                {/* SUBMIT BUTTON */}
                <button
                  onClick={handleSubmit}
                  className="
                    mt-10
                    bg-black
                    hover:bg-gray-800
                    text-white
                    px-8
                    py-3
                    rounded-xl
                    font-semibold
                    transition-all
                  "
                >
                  Submit Permission
                </button>

              </div>

              {/* BACK BUTTON */}
              <button
                onClick={() => {
                  setShowPermissionPage(false);
                  setSelectedMembers([]);
                  setSelectedPermissions([]);
                }}
                className="
                  bg-black
                  hover:bg-gray-800
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                  h-fit
                "
              >
                Back
              </button>

            </div>

          </div>

        )}

      </div>

      {/* INVITE MODAL */}
      {showInviteModal && (
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
              max-w-lg
              rounded-2xl
              shadow-2xl
              p-8
              relative
              max-h-[90vh]
              overflow-y-auto
            "
          >

            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setShowInviteModal(false);
                setInviteEmail("");
                setInviteDescription("");
              }}
              className="
                absolute
                top-3
                right-4
                text-2xl
                text-gray-500
                hover:text-gray-700
              "
            >
              ✕
            </button>

            {/* GROUP NAME */}
            <h2 className="text-2xl font-bold text-black mb-2">
              Invite Member
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Group: <span className="font-semibold text-black">super_Admin</span>
            </p>

            {/* MEMBERS SECTION */}
            <div className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-4">
                Current Members
              </h3>

              <div className="bg-gray-50   p-2">
                <p className="text-1xl font-bold text-black">
                  {members.length}
                  <span className="text-black-500 ml-2">
                    Members
                  </span>
                </p>
              </div>
            </div>

            {/* EMAIL INPUT */}
            <div className="mb-6">
              <label className="block mb-2 text-gray-700 font-semibold">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
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
              />
            </div>

            {/* DESCRIPTION TEXTAREA */}
            <div className="mb-8">
              <label className="block mb-2 text-gray-700 font-semibold">
                Description
              </label>
              <textarea
                value={inviteDescription}
                onChange={(e) => setInviteDescription(e.target.value)}
                placeholder="Enter invitation message"
                rows="4"
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
                  resize-none
                "
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleInviteSubmit}
              className="
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
              Send Invitation
            </button>

          </div>
        </div>
      )}

    </div>
  );
}