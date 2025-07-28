package main.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.dto.request.posts.AddCommentRequest;
import main.dto.request.posts.DeletePostRequest;
import main.dto.response.posts.comment.AddCommentResponse;
import main.dto.response.posts.like.LikeResponse;
import main.dto.response.posts.post.AddPostResponse;
import main.dto.response.posts.post.FeedPostsResponse;
import main.dto.response.posts.post.GetUserPostsResponse;
import main.dto.response.posts.comment.AllCommentsResponse;
import main.dto.response.posts.comment.DeleteCommentResponse;
import main.dto.response.posts.post.DeletePostResponse;
import main.interfaces.IPostService;
import main.kafka.appevents.CommentAddEvent;
import main.kafka.appevents.PostAddEvent;
import main.kafka.KafkaProducer;
import main.posts.Comment;
import main.posts.Enums.ContentType;
import main.posts.Like;
import main.posts.Post;
import main.storage.Enums.StorageType;
import main.storage.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class PostsController {

    private final IPostService postService;
    private final StorageService storageService;
    private final KafkaProducer kafkaProducer;
    private final SimpMessagingTemplate simpMessagingTemplate;


    @GetMapping("/likes/user/{id}")
    public ResponseEntity<?> findLikesByUser(@PathVariable("id") Long userId) {
        try {
            log.info("Attempting find by userId={}", userId);
            List<Like> likes = postService.foundLikesByUser(userId);
            List<LikeResponse> responses = likes.stream().map(l -> LikeResponse.builder()
                    .userId(userId)
                    .postId(l.getPost().getId())
                    .id(l.getId())
                    .message("")
                    .build()).toList();
            return ResponseEntity.ok(responses);

        } catch (Exception ex) {
            log.error("Error while finding liked user post. userId={} error={}", userId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(LikeResponse.builder().message(ex.getMessage()).build());
        }
    }

    @PostMapping("/{idPost}/user/{idUser}/like")
    public ResponseEntity<LikeResponse> likePost(@PathVariable("idPost") Long postId, @PathVariable("idUser") Long userId) {
        try {
            log.info("Attempting to like post. userId={}, postId={}", userId, postId);
            Like likeAdded = postService.addLike(userId, postId);
            if (likeAdded == null) {
                log.warn("Like could not be added for userId={}, postId={}", userId, postId);
                throw new IllegalArgumentException("Like could not be added");
            }
            log.info("Like successfully added. likeId={}, userId={}, postId={}", likeAdded.getId(), userId, postId);

            return ResponseEntity.ok(LikeResponse.builder()
                    .userId(userId)
                    .postId(postId)
                    .id(likeAdded.getId())
                    .message("Like added with success")
                    .build());

        } catch (Exception ex) {
            log.error("Error while liking post. userId={}, postId={}, error={}", userId, postId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(LikeResponse.builder().message(ex.getMessage()).build());
        }
    }

    @PostMapping("/{idPost}/user/{idUser}/dislike")
    public ResponseEntity<?> dislikePost(@PathVariable("idPost") Long postId, @PathVariable("idUser") Long userId) {
        try {
            log.info("Attempting to dislike post. userId={}, postId={}", userId, postId);
            Like dislikedPost = postService.dislike(postId, userId);
            if (dislikedPost == null) {
                log.warn("Dislike operation failed. userId={}, postId={}", userId, postId);
                throw new IllegalArgumentException("Dislike could not be realized");
            }
            log.info("Post successfully disliked. likeId={}, userId={}, postId={}", dislikedPost.getId(), userId, postId);
            return ResponseEntity.ok(LikeResponse.builder()
                    .userId(userId)
                    .postId(postId)
                    .id(dislikedPost.getId())
                    .message("Dislike added with success")
                    .build());
        } catch (Exception ex) {
            log.error("Error during dislike operation. userId={}, postId={}, error={}", userId, postId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(LikeResponse.builder().message(ex.getMessage()).build());
        }
    }

    @GetMapping("/{postId}/like")
    public ResponseEntity<?> countLikes(@PathVariable("postId") Long postId) {
        try {
            log.info("Counting likes for postId={}", postId);
            Long countLikes = postService.getCountLikes(postId);
            log.info("Like count for postId={} is {}", postId, countLikes);
            return ResponseEntity.ok(countLikes);
        } catch (Exception ex) {
            log.error("Failed to count likes for postId={}. Reason: {}", postId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(new IllegalArgumentException(ex.getMessage()));
        }
    }

    @GetMapping("/{postId}/comment")
    public ResponseEntity<?> getAllCommentsPerPost(@PathVariable("postId") Long postId) {
        try {
            log.info("Fetching all comments for post ID '{}'", postId);
            List<Comment> comments = postService.getCommentsPerPost(postId);
            log.info("Found {} comments for post ID '{}'", comments.size(), postId);
            List<AllCommentsResponse> userComments = comments.stream().map(c ->
                    AllCommentsResponse.builder()
                            .id(c.getId())
                            .username(c.getUser().getUsername())
                            .profilePicture(c.getUser().getProfilePicture())
                            .text(c.getText())
                            .build()).toList();
            log.info("Mapped comments to DTO for post ID '{}'", postId);
            return ResponseEntity.ok(userComments);
        } catch (Exception ex) {
            log.error("Failed to retrieve comments for post ID '{}'. Reason: {}", postId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(AllCommentsResponse.builder().message(ex.getMessage()).build());
        }
    }


    @PostMapping("/{postId}/user/{userId}/comment")
    public ResponseEntity<AddCommentResponse> addComment(@PathVariable("userId") Long userId, @PathVariable("postId") Long postId, @RequestBody AddCommentRequest request) {
        try {
            String text = request.getText();
            log.info("Received request to add comment from user '{}' on post '{}'", userId, postId);
            if (text == null || text.isBlank()) {
                log.warn("Comment text is null or empty for user '{}', post '{}'", userId, postId);
                throw new IllegalArgumentException("Text is null or empty! Retry!");
            }
            log.info("Creating comment for post '{}' by user '{}'", postId, userId);
            Comment comment = postService.addComment(postId, userId, text);
            if (comment == null) {
                log.error("Comment returned as null for post '{}' and user '{}'", postId, userId);
                throw new IllegalArgumentException("Comment is null");
            }

            if (comment.getPost().getUser().getUsername() == null) {
                throw new NullPointerException("User or post is null");
            }

            CommentAddEvent payload = CommentAddEvent.builder()
                    .commentId(comment.getId())
                    .text(comment.getText())
                    .senderUsername(comment.getUser().getUsername())
                    .senderProfilePicture(comment.getUser().getProfilePicture())
                    .receiverUsername(comment.getPost().getUser().getUsername())
                    .receiverProfilePicture(comment.getPost().getUser().getProfilePicture())
                    .build();

            kafkaProducer.sendCommentCreated(payload);

            simpMessagingTemplate.convertAndSend("/topic/comment/" + comment.getPost().getUser().getUsername(), payload);
            log.info("Comment added successfully: ID={}, post={}, user={}", comment.getId(), postId, userId);
            return ResponseEntity.ok(AddCommentResponse.builder()
                    .id(comment.getId())
                    .text(comment.getText())
                    .username(comment.getUser().getUsername())
                    .profilePicture(comment.getUser().getProfilePicture())
                    .message("Comment add with success").build());
        } catch (Exception ex) {
            log.error("Failed to add comment on post '{}', by user '{}'. Reason: {}", postId, userId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(AddCommentResponse.builder().message(ex.getMessage()).build());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable("commentId") Long commentId) {
        try {
            log.info("Attempting to delete comment with ID '{}'", commentId);
            var commentDeleted = postService.deleteComment(commentId);
            if (commentDeleted == null) {
                log.warn("No comment found with ID '{}'", commentId);
                return ResponseEntity.badRequest().body(DeleteCommentResponse.builder().message("Comment not found").build());
            }
            log.info("Comment with ID '{}' deleted successfully", commentId);
            return ResponseEntity.ok(DeleteCommentResponse.builder().id(commentDeleted.getId()).message("Comment deleted").build());
        } catch (Exception ex) {
            log.error("Failed to delete comment with ID '{}'. Reason: {}", commentId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(DeleteCommentResponse.builder().message(ex.getMessage()).build());
        }
    }

    @PostMapping(value = "/{username}", consumes = "multipart/form-data")
    public ResponseEntity<AddPostResponse> addPost(@PathVariable("username") String username, @RequestPart("file") MultipartFile file, @RequestPart("type") String type, @RequestPart("description") String description) {
        try {
            ContentType contentType;
            try {
                log.info("Validating content type '{}' for user '{}'", type, username);
                contentType = ContentType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid content type '{}' received from user '{}'", type, username);
                return ResponseEntity.badRequest().body(AddPostResponse.builder().message("Type is invalid, this should be image, video, or text!").build());
            }
            log.info("Storing media file for user '{}'", username);
            var urlMedia = storageService.store(file, StorageType.POSTS);
            log.info("Creating new post for user '{}'", username);
            var postAdded = postService.createPost(username, urlMedia, description, contentType);
            log.info("Post created successfully: ID={}, user='{}'", postAdded.getId(), username);

            kafkaProducer.sendPostCreated(PostAddEvent.builder()
                    .sender(postAdded.getUser().getUsername())
                    .senderPicture(postAdded.getUser().getProfilePicture())
                    .description(postAdded.getDescription())
                    .mediaType(postAdded.getMediaUrl())
                    .build());

            return ResponseEntity.ok(AddPostResponse.builder().id(postAdded.getId())
                    .mediaUrl(postAdded.getMediaUrl())
                    .contentType(type)
                    .description(postAdded.getDescription())
                    .profilePicture(postAdded.getUser().getProfilePicture())
                    .username(postAdded.getUser().getUsername()).message("Post created with success").build());
        } catch (Exception ex) {
            log.error("Failed to create post for user '{}'. Reason: {}", username, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(AddPostResponse.builder().message(ex.getMessage()).build());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<DeletePostResponse> deletePost(@PathVariable("id") Long postId, @RequestBody DeletePostRequest request) {
        try {
            String urlFile = request.getMediaUrl();
            log.info("Attempting to delete post with ID '{}' and mediaUrl '{}'", postId, urlFile);
            if (urlFile == null || urlFile.isBlank()) {
                log.warn("Media URL is null or empty for post ID '{}'", postId);
                throw new IllegalArgumentException("Url file is null or empty! Retry!");
            }
            log.info("Deleting media file from storage for post ID '{}'", postId);
            storageService.delete(urlFile);
            log.info("Deleting post from database with ID '{}'", postId);
            Post postDeleted = postService.deletePost(postId);
            log.info("Post deleted successfully with ID '{}'", postDeleted.getId());
            return ResponseEntity.ok(DeletePostResponse.builder().id(postDeleted.getId())
                    .mediaUrl(postDeleted.getMediaUrl())
                    .description(postDeleted.getDescription())
                    .contentType(postDeleted.getContentType().toString()).message("Post deleted with success").build());
        } catch (Exception ex) {
            log.error("Error while deleting post with ID '{}': {}", postId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(DeletePostResponse.builder().message(ex.getMessage()).build()
            );
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getPosts(@RequestParam("username") String username) {
        try {
            log.info("Fetching posts for user '{}'", username);
            List<Post> listPosts = postService.getUserPosts(username);
            List<GetUserPostsResponse> getUserPosts = listPosts.stream().map(p ->
                            GetUserPostsResponse.builder()
                                    .id(p.getId())
                                    .mediaUrl(p.getMediaUrl())
                                    .contentType(p.getContentType().toString())
                                    .description(p.getDescription())
                                    .profilePicture(p.getUser().getProfilePicture())
                                    .username(p.getUser().getUsername())
                                    .build())
                    .toList();
            log.info("Returning post DTO list for user '{}'", username);
            return ResponseEntity.ok(getUserPosts);
        } catch (Exception ex) {
            log.error("Failed to retrieve posts for user '{}'. Reason: {}", username, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body(GetUserPostsResponse.builder().message(ex.getMessage()).build());
        }
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getFeedPosts(@RequestParam("username") String username) {
        try {
            log.info("Fetching feed for user '{}'", username);
            List<Post> listPosts = postService.getFeed(username);
            List<FeedPostsResponse> getUserPosts = listPosts.stream().map(p ->
                            FeedPostsResponse.builder()
                                    .id(p.getId())
                                    .mediaUrl(p.getMediaUrl())
                                    .description(p.getDescription())
                                    .contentType(p.getContentType().toString())
                                    .profilePicture(p.getUser().getProfilePicture())
                                    .username(p.getUser().getUsername()).build())
                    .toList();
            log.info("Returning feed DTO list for user '{}'", username);
            return ResponseEntity.ok(getUserPosts);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(FeedPostsResponse.builder().message(ex.getMessage()).build());
        }
    }
}
