export const URL_VERIFY = "http://localhost:8081/api/auth/verify"; 
// Auth
export const URL_LOGIN = "http://localhost:8081/api/auth/login"; 
export const URL_REGISTER = "http://localhost:8081/api/auth/register"; 
export const URL_FORGOT_PASSWORD = "http://localhost:8081/api/auth/forgot-password"; 
export const getVerifyCode = (phone: string) => `http://localhost:8081/api/auth/verify-code?phone=${phone}`; 
export const getResetPassword = (phone: string) => `http://localhost:8081/api/auth/reset-password?phone=${phone}`; 
// Search + Profile
export const getInformationProfile = (token: string) => `http://localhost:8081/api/auth/me?token=${token}`; 
export const getSearchKeyword = (keyword: string) => `http://localhost:8081/api/user/search?keyword=${keyword}`; 
export const getSendFriendRequest = (sender: string, receiver: string) => `http://localhost:8081/api/friends/send?sender=${sender}&receiver=${receiver}`; 
export const getUserPosts = (username: string) => `http://localhost:8081/api/posts/user?username=${username}`; 
export const updateInformationProfile = (username: string) => `http://localhost:8081/api/user/update-info?username=${username}`; 
export const getAcceptedFriends = (username: string) => `http://localhost:8081/api/friends/${username}/accept`; 
export const uploadPhoto = (username: string) => `http://localhost:8081/api/user/upload-picture?username=${username}`; 
export const deletePhoto = (username: string) => `http://localhost:8081/api/user/delete-picture?username=${username}`; 
export const deletePostUser = (postId: number) => `http://localhost:8081/api/posts/delete/${postId}`; 
export const deleteFriendship = (friendshipId : number) => `http://localhost:8081/api/friends/${friendshipId}`; 
// Chat
export const getConversations = (username: string) => `http://localhost:8081/api/chat/conversation/user?username=${username}`; 
export const conversationDetails = (conversationId: number) => `http://localhost:8081/api/chat/conversation/${conversationId}/details`; 
export const sendMessage = (conversationId: number, username: string) => `http://localhost:8081/api/chat/conversation/${conversationId}?username=${username}`; 
export const createPrivate = (username1: string, username2: string, chatName: string) => `http://localhost:8081/api/chat/user1/${username1}/user2/${username2}/private/${chatName}`; 
export const createGroup = (name: string) => `http://localhost:8081/api/chat/group/${name}`;
export const deleteConversation = (conversationId: number) => `http://localhost:8081/api/chat/conversation/${conversationId}`; 
// Friends
export const getPending = (username: string) => `http://localhost:8081/api/friends/${username}/pending`;
export const respondFriendship = (postId: number, type: string) => `http://localhost:8081/api/friends/response/${postId}?type=${type}`;
export const getSuggestedFriends = (username: string) => `http://localhost:8081/api/friends/${username}/suggested`; 
// Notifications
export const getNotificationsUnread = (username: string) => `http://localhost:8081/api/notification/unread?username=${username}`;
export const markAsReadNotify = (notificationId: number) => `http://localhost:8081/api/notification/mark-as-read?notificationId=${notificationId}`; 
export const deleteNotify = (notificationId: number) => `http://localhost:8081/api/notification/${notificationId}`; 
//Posts
export const feedPost = (username: string) => `http://localhost:8081/api/posts/feed?username=${username}`;
export const getComments = (postId: number) => `http://localhost:8081/api/posts/${postId}/comment`; 
export const addComment = (postId: number, userId: number) => `http://localhost:8081/api/posts/${postId}/user/${userId}/comment`; 
export const postCreate = (username: string) => `http://localhost:8081/api/posts/${username}`; 
export const likesManage = (idPost: number, idUser: number, likes: string) => `http://localhost:8081/api/posts/${idPost}/user/${idUser}/${likes}`; 
export const userLikesPost = (userId : number) => `http://localhost:8081/api/posts/likes/user/${userId}`; 
export const numberOfLikes = (postId: number) => `http://localhost:8081/api/posts/${postId}/like`;  
// Admin
export const adminGetAll = () => `http://localhost:8081/api/admin/users/all`; 
export const adminLastName = (lastName : string) => `http://localhost:8081/api/admin/users/lastName?lastName=${lastName}` 
export const adminFirstName = (firstName: string) => `http://localhost:8081/api/admin/users/firstName?firstName=${firstName}` 
export const adminPhone  = (phone : string) => `http://localhost:8081/api/admin/users/phone?phone=${phone}` 
export const adminCreateRole = (roleType : string) =>   `http://localhost:8081/api/admin/role?name-role=${roleType}` 
export const adminDeleteRole = (roleType: string) =>   `http://localhost:8081//api/admin/role?name-role=${roleType}` 
export const adminAssignRole = (username: string, role: string) =>   `http://localhost:8081/api/admin/role/assign-to-user?username=${username}&role=${role}` 
export const adminUnassignRole = (username: string, role: string) =>   `http://localhost:8081/api/admin/role/remove-to-user?username=${username}&role=${role}` 
export const deleteUser = (username: string) =>   `http://localhost:8081/api/admin/user/${username}` 