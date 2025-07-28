
export interface DeletePostRequest {
  mediaUrl: string;
}

export interface DeleteFriendshipResponse {
  id: number;
}

export type MeRequest = {
    token : string
}

export type MeResponse = {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    profilePicture?: string;
    roles: string[];
}

export interface DeletePicture{
    id?: number
    username?: string
    firstName?: string
    lastName?: string
    phone?: string
    bio?: string
    profilePicture?: string
}

export type UpdateInformationProfileRequest = {
    lastName?: string;
    firstName?: string;
    phone?: string;
    bio?: string;
}

export type UpdateInformationProfileResponse = {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    profilePicture?: string;
};

export type UploadPictureResponse = {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    profilePicture: string;
}