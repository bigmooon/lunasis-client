import { ApiResponse, AppError, mapStatusToErrorCode } from '@repo/shared/types';
import { logger, transformError } from '@repo/shared/utils';
import { api } from '@web/api/api';

import {
  AnonymousRes,
  CreateChatRoomRes,
  GetChatLogRes,
  GetChatRoomsRes,
  GetSavedMemoriesRes,
  SendMessageRes,
  UpdateSettingReq,
} from '../types';
import { getAnonymousUserId } from '../utils/anonymous-user';

// Server messages may contain internal hosts, so keep them in details (logs) only.
function toApiError(response: ApiResponse<unknown>): AppError {
  const status = response.code ?? 500;
  return new AppError(mapStatusToErrorCode(status), undefined, status, undefined, {
    serverMessage: response.message,
  });
}

// get chat room list
export async function getChatRoomsAPI(): Promise<GetChatRoomsRes> {
  try {
    const response = await api.get<ApiResponse<GetChatRoomsRes>>('/chats');

    if (response.success && response.data) {
      return response.data;
    }
    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[getChatRoomsAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// create new chat room
export async function createChatRoomAPI(formData: {
  question: string;
}): Promise<CreateChatRoomRes> {
  try {
    const response = await api.post<ApiResponse<CreateChatRoomRes>>('/chats', formData);

    if (response.success && response.data) {
      return response.data;
    }
    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[createChatRoomAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// get chat log for {chatRoomId}
export async function getChatLogAPI(chatRoomId: string): Promise<GetChatLogRes> {
  try {
    const response = await api.get<ApiResponse<GetChatLogRes>>(`/chats/${chatRoomId}`);

    if (response.success && response.data) {
      return response.data;
    }
    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[getChatLogAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// send message in {chatRoomId}
export async function sendMessageAPI(
  chatRoomId: string,
  formData: { question: string },
): Promise<SendMessageRes> {
  try {
    const response = await api.post<ApiResponse<SendMessageRes>>(`/chats/${chatRoomId}`, formData);

    if (response.success && response.data) {
      return response.data;
    }
    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[sendMessageAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// edit chat room title
export async function modifyChatRoomTitleAPI(
  chatRoomId: string,
  formData: { title: string },
): Promise<void> {
  try {
    const response = await api.patch<ApiResponse<void>>(`/chats/${chatRoomId}/title`, formData);

    if (response.success) return;

    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[modifyChatRoomTitleAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// anonymous chat
export async function anonymousChatAPI(formData: { question: string }): Promise<AnonymousRes> {
  try {
    const anonymousId = getAnonymousUserId();
    const response = await api.post<ApiResponse<AnonymousRes>>('/chats/anonymous', {
      anonymousId,
      question: formData.question,
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[anonymousChatAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// update personalization settings
export async function updateUserSettingAPI(formData: UpdateSettingReq): Promise<void> {
  try {
    const response = await api.post<ApiResponse<string>>('/users/setting', formData);

    if (response.success) return;

    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[updateUserSettingAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// get saved memories
export async function getSavedMemoriesAPI(): Promise<GetSavedMemoriesRes> {
  try {
    const response = await api.get<ApiResponse<GetSavedMemoriesRes>>('/users/summary');

    if (response.success && response.data) {
      return response.data;
    }
    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[getSavedMemoriesAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// delete saved memory
export async function deleteSavedMemoryAPI(savedMemoryId: string): Promise<void> {
  try {
    const response = await api.delete<ApiResponse<string>>(`/users/summary/${savedMemoryId}`);

    if (response.success) return;

    throw toApiError(response);
  } catch (error: unknown) {
    logger.error('[deleteSavedMemoryAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}
