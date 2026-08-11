"use server";

import { db } from "@/db/index.js";
import { users, folders, documents, documentAccessLogs, documentEditLogs, groups, userGroups, loginHistory, qnaMessages, qnaThreads } from "@/db/schema.js";
import { eq, inArray, and, desc, asc, gte, lte } from "drizzle-orm";

// -- Shared across analytics --
export async function fetchUsersByCompany(companyId) {
    try {
        const data = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.companyId, companyId));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchUsersByIdsAnalytics(userIds) {
    try {
        if (!userIds || userIds.length === 0) return { data: [], error: null };
        const data = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, userIds));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchFoldersAnalytics(companyId, workspaceId) {
    try {
        let conditions = [eq(folders.companyId, companyId), eq(folders.isDeleted, false)];
        if (workspaceId) conditions.push(eq(folders.workspaceId, workspaceId));
        const data = await db.select({ id: folders.id, name: folders.name }).from(folders).where(and(...conditions));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchDocumentsAnalytics(companyId, workspaceId) {
    try {
        let conditions = [eq(documents.companyId, companyId), eq(documents.isDeleted, false)];
        if (workspaceId) conditions.push(eq(documents.workspaceId, workspaceId));
        const data = await db.select({ id: documents.id, name: documents.name, folder_id: documents.folderId }).from(documents).where(and(...conditions));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchDocumentsByIdsAnalytics(docIds) {
    try {
        if (!docIds || docIds.length === 0) return { data: [], error: null };
        const data = await db.select({ id: documents.id, name: documents.name }).from(documents).where(inArray(documents.id, docIds));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchDocumentAccessLogsAnalytics(docIds) {
    try {
        if (!docIds || docIds.length === 0) return { data: [], error: null };
        const data = await db.select({
            id: documentAccessLogs.id,
            document_id: documentAccessLogs.documentId,
            opened_at: documentAccessLogs.openedAt,
            closed_at: documentAccessLogs.closedAt,
            duration_seconds: documentAccessLogs.durationSeconds,
            duration_formatted: documentAccessLogs.durationFormatted,
            user_id: documentAccessLogs.userId
        }).from(documentAccessLogs).where(inArray(documentAccessLogs.documentId, docIds));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchDocumentEditLogsAnalytics(docIds) {
    try {
        if (!docIds || docIds.length === 0) return { data: [], error: null };
        const data = await db.select({
            id: documentEditLogs.id,
            document_id: documentEditLogs.documentId,
            action_type: documentEditLogs.actionType,
            metadata: documentEditLogs.metadata,
            changed_at: documentEditLogs.changedAt,
            user_id: documentEditLogs.userId
        }).from(documentEditLogs).where(inArray(documentEditLogs.documentId, docIds));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

// -- Group Users Page --
export async function fetchGroupsAnalytics(companyId) {
    try {
        const data = await db.select({ id: groups.id, name: groups.name }).from(groups).where(eq(groups.companyId, companyId)).orderBy(asc(groups.name));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchUserGroupsByGroupIdsAnalytics(groupIds) {
    try {
        if (!groupIds || groupIds.length === 0) return { data: [], error: null };
        const data = await db.select({ user_id: userGroups.userId, group_id: userGroups.groupId }).from(userGroups).where(inArray(userGroups.groupId, groupIds));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchLoginHistoryForCompanyAnalytics(companyId) {
    try {
        const data = await db.select({ user_id: loginHistory.userId, created_at: loginHistory.createdAt }).from(loginHistory).where(and(eq(loginHistory.companyId, companyId), eq(loginHistory.action, 'LOGIN')));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

// -- Group Insights Page --
export async function fetchUserGroupsByGroupIdAnalytics(groupId) {
    try {
        const data = await db.select({ user_id: userGroups.userId }).from(userGroups).where(eq(userGroups.groupId, groupId));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchLoginHistoryFilteredAnalytics(userIds, dateFrom, dateTo) {
    try {
        if (!userIds || userIds.length === 0) return { data: [], error: null };
        let conditions = [eq(loginHistory.action, 'LOGIN'), inArray(loginHistory.userId, userIds)];
        if (dateFrom) conditions.push(gte(loginHistory.createdAt, dateFrom + "T00:00:00"));
        if (dateTo) conditions.push(lte(loginHistory.createdAt, dateTo + "T23:59:59"));
        
        const data = await db.select({ user_id: loginHistory.userId, created_at: loginHistory.createdAt }).from(loginHistory).where(and(...conditions)).orderBy(asc(loginHistory.createdAt));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchDocumentEditLogsFilteredAnalytics(userIds, actionTypes, dateFrom, dateTo) {
    try {
        if (!userIds || userIds.length === 0) return { data: [], error: null };
        let conditions = [inArray(documentEditLogs.userId, userIds), inArray(documentEditLogs.actionType, actionTypes)];
        if (dateFrom) conditions.push(gte(documentEditLogs.changedAt, dateFrom + "T00:00:00"));
        if (dateTo) conditions.push(lte(documentEditLogs.changedAt, dateTo + "T23:59:59"));
        
        const data = await db.select({ 
            user_id: documentEditLogs.userId, 
            document_id: documentEditLogs.documentId, 
            action_type: documentEditLogs.actionType, 
            changed_at: documentEditLogs.changedAt 
        }).from(documentEditLogs).where(and(...conditions));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchDocumentAccessLogsFilteredAnalytics(userIds, dateFrom, dateTo) {
    try {
        if (!userIds || userIds.length === 0) return { data: [], error: null };
        let conditions = [inArray(documentAccessLogs.userId, userIds)];
        if (dateFrom) conditions.push(gte(documentAccessLogs.openedAt, dateFrom + "T00:00:00"));
        if (dateTo) conditions.push(lte(documentAccessLogs.openedAt, dateTo + "T23:59:59"));
        
        const data = await db.select({ 
            user_id: documentAccessLogs.userId, 
            document_id: documentAccessLogs.documentId, 
            opened_at: documentAccessLogs.openedAt 
        }).from(documentAccessLogs).where(and(...conditions));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchQnaMessagesAnalytics(userNames, dateFrom, dateTo) {
    try {
        if (!userNames || userNames.length === 0) return { data: [], error: null };
        let conditions = [eq(qnaMessages.isUser, true), inArray(qnaMessages.sender, userNames)];
        if (dateFrom) conditions.push(gte(qnaMessages.createdAt, dateFrom + "T00:00:00"));
        if (dateTo) conditions.push(lte(qnaMessages.createdAt, dateTo + "T23:59:59"));
        
        const data = await db.select({ 
            id: qnaMessages.id, 
            thread_id: qnaMessages.threadId, 
            sender: qnaMessages.sender, 
            text: qnaMessages.text, 
            created_at: qnaMessages.createdAt, 
            is_user: qnaMessages.isUser 
        }).from(qnaMessages).where(and(...conditions));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}

export async function fetchQnaThreadsAnalytics(threadIds) {
    try {
        if (!threadIds || threadIds.length === 0) return { data: [], error: null };
        const rawData = await db.select({ 
            id: qnaThreads.id, 
            doc_id: documents.id,
            doc_name: documents.name
        }).from(qnaThreads)
          .leftJoin(documents, eq(qnaThreads.fileId, documents.id))
          .where(inArray(qnaThreads.id, threadIds));
          
        const data = rawData.map(row => ({
            id: row.id,
            documents: row.doc_id ? { id: row.doc_id, name: row.doc_name } : null
        }));
        return { data, error: null };
    } catch (error) { return { data: null, error: error.message }; }
}
