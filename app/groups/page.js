// import Sidebar from "./components/Sidebar";
// import ActivatePage from "./activate/page";

// export default function groupsPage() {
//   return (
//     <main className="flex min-h-screen bg-gray-100">
//       <Sidebar />

//       <div className="flex-1 p-10">
//         <h1 className="text-black text-3xl font-bold">
//           Dashboard Content
//         </h1>
//       </div>
//     <ActivatePage />
//     </main>
    
        
//   );
// }

"use client";

import { useState } from "react";

import Sidebar from "../../components/groups/GroupSidebar";
import ActivatePage from "../groups/subadmin/page";

export default function GroupsPage() {

  const [activePage, setActivePage] = useState("subadmin");

  const [openGroupMenu, setOpenGroupMenu] =
    useState(false);

  return (
    <main className="min-h-screen bg-gray-100">

      {/* <Sidebar
        setActivePage={setActivePage}
        openGroupMenu={openGroupMenu}
        setOpenGroupMenu={setOpenGroupMenu}
      /> */}

      {/* CONTENT */}
      {/* <div
        className={`
          transition-all
          duration-300

          pt-20
          md:pt-10

          px-4
          md:px-8

          ${
            openGroupMenu
              ? "md:ml-[320px]"
              : "md:ml-[100px]"
          }
        `}
      >
        

        {activePage === "subadmin" && (
        
          <ActivatePage />
        )}
      </div> */}

    </main>
  );
}