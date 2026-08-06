import { supabase } from "@/utils/supabase/client";

/**
 * Log Q&A Activity for audit compliance & notifications
 */
export async function logQnAActivity({
  companyId,
  workspaceId,
  threadId,
  userId,
  userName,
  actionType,
  details = {},
  ipAddress = "127.0.0.1"
}) {
  try {
    await supabase.from("qna_activity_logs").insert([{
      company_id: companyId,
      workspace_id: workspaceId || null,
      thread_id: threadId,
      user_id: userId,
      user_name: userName || "User",
      action_type: actionType,
      details: details,
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    }]);
  } catch (err) {
    console.warn("Failed to write Q&A activity log:", err.message);
  }
}

/**
 * Fetch all Q&A threads with strict visibility isolation
 */
export async function fetchQnAThreads(session, { activeDocId, activeFolderId } = {}) {
  if (!session || !session.company_id) return [];

  const isSuperAdmin = session.role === "super_admin";
  const isAdmin = session.role === "super_admin" || session.role === "admin";
  const userId = session.id;

  // 1. Get all group IDs for the current user
  let userGroupIds = [];
  try {
    const { data: ugRows } = await supabase
      .from("user_groups")
      .select("group_id")
      .eq("user_id", userId);
    userGroupIds = (ugRows || []).map(r => r.group_id);
  } catch (e) {
    console.error("Error fetching user groups:", e);
  }

  // 2. Query threads with joins
  let query = supabase
    .from("qna_threads")
    .select(`
      id,
      file_id,
      folder_id,
      company_id,
      workspace_id,
      subject,
      description,
      status,
      created_by,
      creator_group_id,
      document_owner_id,
      attachment_path,
      attachment_name,
      official_answer,
      official_answered_by,
      official_answered_at,
      created_at,
      updated_at,
      documents:file_id (id, name, uploaded_by, folder_id, creator_revoked),
      folders:folder_id (id, name, created_by, parent_folder_id, creator_revoked),
      creator:created_by (id, name, email, role),
      doc_owner:document_owner_id (id, name, email, role),
      group:creator_group_id (id, name),
      official_user:official_answered_by (id, name, email),
      qna_messages (
        id,
        thread_id,
        sender,
        sender_id,
        sender_role,
        text,
        message_type,
        is_official,
        is_user,
        attachment_path,
        attachment_name,
        created_at
      )
    `)
    .eq("company_id", session.company_id)
    .order("created_at", { ascending: false });

  const targetWorkspaceId = session.active_workspace_id || session.workspace_id;
  if (targetWorkspaceId) {
    query = query.or(`workspace_id.eq.${targetWorkspaceId},workspace_id.is.null`);
  }

  if (activeDocId) {
    query = query.eq("file_id", activeDocId);
  } else if (activeFolderId) {
    query = query.eq("folder_id", activeFolderId);
  }

  const { data: threads, error } = await query;
  if (error) throw error;

  // 3. Fetch permissions & folder hierarchy for document/folder access control
  let folPermSet = new Set();
  let docPermSet = new Set();
  let foldersMap = new Map();

  if (!isSuperAdmin) {
    // Fetch all workspace folders to evaluate hierarchy inheritance
    let foldersQuery = supabase
      .from("folders")
      .select("id, parent_folder_id, created_by, creator_revoked")
      .eq("company_id", session.company_id)
      .eq("is_deleted", false);
    if (targetWorkspaceId) {
      foldersQuery = foldersQuery.or(`workspace_id.eq.${targetWorkspaceId},workspace_id.is.null`);
    }
    const { data: allFolders } = await foldersQuery;
    (allFolders || []).forEach(f => foldersMap.set(f.id, f));

    if (userGroupIds.length > 0) {
      const { data: perms } = await supabase
        .from("permissions")
        .select("scope, folder_id, document_id, can_view")
        .eq("company_id", session.company_id)
        .in("group_id", userGroupIds);

      (perms || []).forEach(p => {
        if (p.can_view) {
          if (p.scope === "folder" && p.folder_id) folPermSet.add(p.folder_id);
          if (p.scope === "document" && p.document_id) docPermSet.add(p.document_id);
        }
      });
    }
  }

  const isFolderAccessible = (folderId) => {
    if (isSuperAdmin) return true;
    if (!folderId) return false;
    const visited = new Set();
    let curId = folderId;
    while (curId && !visited.has(curId)) {
      visited.add(curId);
      const f = foldersMap.get(curId);
      if (!f) break;
      if (f.created_by === userId && !f.creator_revoked) return true;
      if (folPermSet.has(curId)) return true;
      curId = f.parent_folder_id;
    }
    return false;
  };

  const isDocAccessible = (doc, fileId) => {
    if (isSuperAdmin) return true;
    if (!doc && !fileId) return false;
    if (doc) {
      if (doc.uploaded_by === userId && !doc.creator_revoked) return true;
      if (docPermSet.has(doc.id)) return true;
      if (doc.folder_id && isFolderAccessible(doc.folder_id)) return true;
    } else if (fileId) {
      if (docPermSet.has(fileId)) return true;
    }
    return false;
  };

  // 4. Apply Access Control & Strict Visibility Isolation:
  // ONLY show threads for files/folders the user has permission to view.
  const visibleThreads = (threads || []).filter(thread => {
    let hasItemAccess = false;
    if (isSuperAdmin) {
      hasItemAccess = true;
    } else if (thread.file_id) {
      hasItemAccess = isDocAccessible(thread.documents, thread.file_id);
    } else if (thread.folder_id) {
      hasItemAccess = isFolderAccessible(thread.folder_id);
    } else {
      // General workspace-level questions
      hasItemAccess = true;
    }

    if (!hasItemAccess) return false;

    // Visibility Isolation within accessible items
    if (isSuperAdmin) return true;
    const isCreator = thread.created_by === userId;
    const isDocOwner = thread.document_owner_id === userId;
    const isGroupMember = thread.creator_group_id && userGroupIds.includes(thread.creator_group_id);

    return isCreator || isDocOwner || isGroupMember;
  });

  // 4. Format thread objects
  return visibleThreads.map((t, idx) => {
    const isCreator = t.created_by === userId;
    const isDocOwner = t.document_owner_id === userId;
    const isGroupMember = t.creator_group_id && userGroupIds.includes(t.creator_group_id);

    const docName = t.documents?.name || (t.folders?.name ? `Folder: ${t.folders.name}` : "General Document");
    const creatorName = t.creator?.name || t.creator?.email || "Unknown User";
    const groupName = t.group?.name || "General Group";
    const documentOwnerName = t.doc_owner?.name || t.doc_owner?.email || "Document Owner";

    // Sort messages chronologically
    const msgs = (t.qna_messages || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Suggested replies
    const suggestions = msgs.filter(m => m.message_type === "internal_suggestion" || (m.is_user === false && !m.is_official));
    const officialMsg = msgs.find(m => m.is_official || m.message_type === "official_answer");

    return {
      id: t.id,
      displayId: idx + 1,
      fileId: t.file_id,
      folderId: t.folder_id,
      fileName: docName,
      subject: t.subject || "No Subject",
      description: t.description || "",
      status: t.status || "open", // 'open', 'in_review', 'answered', 'closed'
      created_by: t.created_by,
      creatorName,
      creatorEmail: t.creator?.email,
      creatorGroupId: t.creator_group_id,
      groupName,
      documentOwnerId: t.document_owner_id,
      documentOwnerName,
      attachmentPath: t.attachment_path,
      attachmentName: t.attachment_name,
      officialAnswer: t.official_answer || officialMsg?.text || null,
      officialAnsweredAt: t.official_answered_at ? new Date(t.official_answered_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : null,
      createdAt: new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      createdTime: new Date(t.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      fullDate: new Date(t.created_at).toLocaleString(),
      rawDate: t.created_at,
      updatedAt: t.updated_at,
      
      // User Permissions Context on this thread
      isCreator,
      isActualDocOwner: isDocOwner,
      isDocOwner: isDocOwner || isSuperAdmin,
      isGroupMember,
      isAdmin,
      isSuperAdmin,

      // Messages & Suggestions
      messages: msgs,
      suggestions: suggestions,
      officialMsg: officialMsg
    };
  });
}

/**
 * Create a new question thread linked to a document or folder
 */
export async function createQuestionThread(session, {
  fileId = null,
  folderId = null,
  subject,
  description,
  attachmentFile = null
}) {
  if (!session || !session.id) throw new Error("User session not found.");
  if (!subject?.trim() || !description?.trim()) throw new Error("Subject and description are required.");

  let documentOwnerId = null;
  let creatorGroupId = null;

  // 1. Resolve Document Owner ID
  if (fileId) {
    const { data: doc } = await supabase
      .from("documents")
      .select("id, name, uploaded_by, folder_id")
      .eq("id", fileId)
      .single();
    if (doc?.uploaded_by) documentOwnerId = doc.uploaded_by;
    if (!folderId && doc?.folder_id) folderId = doc.folder_id;
  }
  
  if (!documentOwnerId && folderId) {
    const { data: folder } = await supabase
      .from("folders")
      .select("id, name, created_by")
      .eq("id", folderId)
      .single();
    if (folder?.created_by) documentOwnerId = folder.created_by;
  }

  // Fallback document owner: company admin/super_admin
  if (!documentOwnerId) {
    const { data: adminUser } = await supabase
      .from("users")
      .select("id")
      .eq("company_id", session.company_id)
      .in("role", ["super_admin", "admin"])
      .limit(1)
      .single();
    documentOwnerId = adminUser?.id || session.id;
  }

  // 2. Resolve Creator Group ID
  const { data: ug } = await supabase
    .from("user_groups")
    .select("group_id")
    .eq("user_id", session.id)
    .limit(1)
    .single();
  creatorGroupId = ug?.group_id || null;

  // 3. Upload Attachment if any
  let attachmentPath = null;
  let attachmentName = null;
  if (attachmentFile) {
    const cleanName = attachmentFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `qa-attachments/${Date.now()}_${cleanName}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("original-files")
      .upload(path, attachmentFile);
    if (uploadErr) throw uploadErr;
    attachmentPath = uploadData.path;
    attachmentName = attachmentFile.name;
  }

  // 4. Insert into qna_threads
  const { data: thread, error: threadErr } = await supabase
    .from("qna_threads")
    .insert([{
      company_id: session.company_id,
      workspace_id: session.active_workspace_id || session.workspace_id || null,
      file_id: fileId || null,
      folder_id: folderId || null,
      created_by: session.id,
      creator_group_id: creatorGroupId,
      document_owner_id: documentOwnerId,
      subject: subject.trim(),
      description: description.trim(),
      status: "open",
      attachment_path: attachmentPath,
      attachment_name: attachmentName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (threadErr) throw threadErr;

  // 5. Insert initial question message into qna_messages
  await supabase.from("qna_messages").insert([{
    thread_id: thread.id,
    sender_id: session.id,
    sender: session.name || session.email || "User",
    sender_role: "question_creator",
    text: description.trim(),
    message_type: "question",
    is_user: true,
    is_official: false,
    attachment_path: attachmentPath,
    attachment_name: attachmentName,
    created_at: new Date().toISOString()
  }]);

  // 6. Audit Log
  await logQnAActivity({
    companyId: session.company_id,
    workspaceId: session.active_workspace_id,
    threadId: thread.id,
    userId: session.id,
    userName: session.name || session.email,
    actionType: "QUESTION_CREATED",
    details: {
      subject: subject.trim(),
      file_id: fileId,
      folder_id: folderId,
      document_owner_id: documentOwnerId
    }
  });

  return thread;
}

/**
 * Submit an internal suggested answer by group member or collaborator
 */
export async function submitSuggestedAnswer(session, {
  threadId,
  text,
  attachmentFile = null
}) {
  if (!session || !session.id) throw new Error("User session not found.");
  if (!text?.trim() && !attachmentFile) throw new Error("Suggested answer text or attachment is required.");

  // Upload attachment if any
  let attachmentPath = null;
  let attachmentName = null;
  if (attachmentFile) {
    const cleanName = attachmentFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `qa-attachments/${Date.now()}_${cleanName}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("original-files")
      .upload(path, attachmentFile);
    if (uploadErr) throw uploadErr;
    attachmentPath = uploadData.path;
    attachmentName = attachmentFile.name;
  }

  // Insert message as internal_suggestion
  const { data: msg, error: msgErr } = await supabase
    .from("qna_messages")
    .insert([{
      thread_id: threadId,
      sender_id: session.id,
      sender: session.name || session.email || "User",
      sender_role: session.role === "super_admin" || session.role === "admin" ? "admin" : "group_member",
      text: text?.trim() || "Suggested Attachment",
      message_type: "internal_suggestion",
      is_official: false,
      is_user: false,
      attachment_path: attachmentPath,
      attachment_name: attachmentName,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (msgErr) throw msgErr;

  // Update thread status to 'in_review' if it's currently 'open'
  await supabase
    .from("qna_threads")
    .update({
      status: "in_review",
      updated_at: new Date().toISOString()
    })
    .eq("id", threadId)
    .eq("status", "open");

  // Audit Log
  await logQnAActivity({
    companyId: session.company_id,
    workspaceId: session.active_workspace_id,
    threadId,
    userId: session.id,
    userName: session.name || session.email,
    actionType: "SUGGESTION_ADDED",
    details: { messageId: msg.id }
  });

  return msg;
}

/**
 * Publish an Official Answer (Document Owner or Admin only)
 * Option 1: Select an existing suggestion by messageId
 * Option 2: Write and publish a brand new answerText
 */
export async function publishOfficialAnswer(session, {
  threadId,
  messageId = null,
  answerText = null,
  attachmentFile = null
}) {
  if (!session || !session.id) throw new Error("User session not found.");

  let finalAnswer = "";
  let finalAttachmentPath = null;
  let finalAttachmentName = null;

  if (messageId) {
    // Option 1: Select existing suggested answer
    const { data: sourceMsg, error: fetchErr } = await supabase
      .from("qna_messages")
      .select("*")
      .eq("id", messageId)
      .single();
    if (fetchErr || !sourceMsg) throw new Error("Suggested message not found.");

    finalAnswer = sourceMsg.text;
    finalAttachmentPath = sourceMsg.attachment_path;
    finalAttachmentName = sourceMsg.attachment_name;

    // Mark that message as official
    await supabase
      .from("qna_messages")
      .update({
        is_official: true,
        message_type: "official_answer",
        updated_at: new Date().toISOString()
      })
      .eq("id", messageId);

  } else if (answerText?.trim() || attachmentFile) {
    // Option 2: Write fresh official answer
    if (attachmentFile) {
      const cleanName = attachmentFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `qa-attachments/${Date.now()}_${cleanName}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("original-files")
        .upload(path, attachmentFile);
      if (uploadErr) throw uploadErr;
      finalAttachmentPath = uploadData.path;
      finalAttachmentName = attachmentFile.name;
    }
    finalAnswer = answerText?.trim() || "See Official Attachment";

    // Insert new official answer message
    await supabase.from("qna_messages").insert([{
      thread_id: threadId,
      sender_id: session.id,
      sender: session.name || session.email || "Document Owner",
      sender_role: "doc_owner",
      text: finalAnswer,
      message_type: "official_answer",
      is_official: true,
      is_user: false,
      attachment_path: finalAttachmentPath,
      attachment_name: finalAttachmentName,
      created_at: new Date().toISOString()
    }]);
  } else {
    throw new Error("Please provide an answer or select a suggestion.");
  }

  // Update qna_threads to 'answered'
  const { data: updatedThread, error: updateErr } = await supabase
    .from("qna_threads")
    .update({
      official_answer: finalAnswer,
      official_answered_by: session.id,
      official_answered_at: new Date().toISOString(),
      status: "answered",
      updated_at: new Date().toISOString()
    })
    .eq("id", threadId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  // Audit Log
  await logQnAActivity({
    companyId: session.company_id,
    workspaceId: session.active_workspace_id,
    threadId,
    userId: session.id,
    userName: session.name || session.email,
    actionType: "OFFICIAL_ANSWER_PUBLISHED",
    details: {
      official_answered_by: session.id,
      selected_message_id: messageId || "new_answer"
    }
  });

  return updatedThread;
}

/**
 * Close or Reopen a Question Thread
 */
export async function setThreadStatus(session, threadId, newStatus) {
  const { data, error } = await supabase
    .from("qna_threads")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", threadId)
    .select()
    .single();

  if (error) throw error;

  await logQnAActivity({
    companyId: session.company_id,
    workspaceId: session.active_workspace_id,
    threadId,
    userId: session.id,
    userName: session.name || session.email,
    actionType: newStatus === "closed" ? "THREAD_CLOSED" : "STATUS_UPDATED",
    details: { newStatus }
  });

  return data;
}

/**
 * Download attachment from Supabase storage
 */
export async function downloadAttachment(path, fileName) {
  const { data, error } = await supabase.storage
    .from("original-files")
    .download(path);
  if (error) throw error;
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName || "attachment");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
