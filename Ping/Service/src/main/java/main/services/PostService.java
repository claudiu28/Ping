package main.services;

import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.friends.Enums.FriendshipRequestType;
import main.interfaces.IPostService;
import main.posts.*;
import main.posts.Enums.ContentType;
import main.users.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService implements IPostService {

    private final UserRepository userRepository;
    private final PostsRepository postsRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @Override
    public List<Like> foundLikesByUser(Long userId) {
        log.info("Attempting to add like. userId={}", userId);
        var user = userRepository.findById(userId).orElseThrow(() -> {
            log.warn("User with ID {} not found while searching for likes", userId);
            return new EntityExistsException("User not found");
        });
        log.warn("Likes for user, with id: '{}'", userId);
        return likeRepository.foundLikeUser(user);
    }


    @Override
    public Like addLike(Long userId, Long postId) {
        log.info("Attempting to add like. userId={}, postId={}", userId, postId);
        var user = userRepository.findById(userId).orElseThrow(() -> {
            log.warn("User with ID {} not found while adding like", userId);
            return new EntityExistsException("User not found");
        });

        var post = postsRepository.findById(postId).orElseThrow(() -> {
            log.warn("Post with ID {} not found while adding like", postId);
            return new EntityExistsException("Post not found");
        });

        if (likeRepository.existsLike(post, user)) {
            log.warn("User {} already liked post {}", userId, postId);
            throw new IllegalArgumentException("Already liked");
        }
        Like newLike = Like.builder().user(user).post(post).build();
        user.addLike(newLike);
        post.addLike(newLike);
        Like savedLike = likeRepository.save(newLike);
        log.info("Like saved successfully. LikeID={}, userId={}, postId={}", savedLike.getId(), userId, postId);
        return savedLike;
    }

    @Override
    public Like dislike(Long postId, Long userId) {
        log.info("Attempting to dislike post. userId={}, postId={}", userId, postId);
        var user = userRepository.findById(userId).orElseThrow(() -> {
            log.warn("User with ID {} not found while disliking", userId);
            return new EntityExistsException("User not found");
        });

        var post = postsRepository.findById(postId).orElseThrow(() -> {
            log.warn("Post with ID {} not found while disliking", postId);
            return new EntityExistsException("Post not found");
        });

        if (!likeRepository.existsLike(post, user)) {
            log.warn("User {} has not liked post {} yet", userId, postId);
            throw new IllegalArgumentException("Not liked yet");
        }

        var likeFound = likeRepository.foundLike(post, user).orElseThrow(() -> {
            log.error("Like not found for user {} and post {} even though existsLike returned true", userId, postId);
            return new EntityExistsException("Like not found");
        });

        user.removeLike(likeFound);
        post.removeLike(likeFound);
        likeRepository.deleteById(likeFound.getId());
        log.info("Dislike operation completed. userId={}, postId={}", userId, postId);
        return likeFound;
    }

    @Override
    public Long getCountLikes(Long postId) {
        log.info("Counting likes for postId={}", postId);
        var post = postsRepository.findById(postId).orElseThrow(() -> {
            log.warn("Post with ID {} not found while counting likes", postId);
            return new EntityExistsException("Post not found");
        });
        Long count = likeRepository.countLikesPerPost(post);
        log.info("Post {} has {} likes", postId, count);
        return count;
    }

    @Override
    public Comment addComment(Long postId, Long userId, String text) {
        log.info("Attempting to add comment. userId={}, postId={}, text='{}'", userId, postId, text);
        var user = userRepository.findById(userId).orElseThrow(() -> {
            log.warn("User with ID {} not found while adding comment", userId);
            return new EntityNotFoundException("User not found");
        });

        var post = postsRepository.findById(postId).orElseThrow(() -> {
            log.warn("Post with ID {} not found while adding comment", postId);
            return new EntityNotFoundException("Post not found");
        });

        if (text == null || text.trim().isEmpty()) {
            log.warn("Empty or null comment text provided by user {}", userId);
            throw new IllegalArgumentException("Comment text is empty");
        }

        Comment comment = Comment.builder().user(user).post(post).text(text).build();
        user.addComment(comment);
        post.addComment(comment);
        Comment savedComment = commentRepository.save(comment);
        log.info("Comment saved successfully. commentId={}, userId={}, postId={}", savedComment.getId(), userId, postId);
        return savedComment;
    }

    @Override
    public List<Comment> getCommentsPerPost(Long postId) {
        log.info("Fetching comments for postId={}", postId);
        var post = postsRepository.findById(postId).orElseThrow(() -> {
            log.warn("Post with ID {} not found while fetching comments", postId);
            return new EntityExistsException("Post not found");
        });
        List<Comment> comments = commentRepository.commentsPerPost(post);
        log.info("Found {} comments for post {}", comments.size(), postId);
        return comments;
    }

    @Override
    public Comment deleteComment(Long id) {
        log.info("Attempting to delete comment with ID: {}", id);
        var commentDeleted = commentRepository.findById(id).orElseThrow(() -> {
            log.warn("Comment with ID '{}' not found for deletion", id);
            return new EntityNotFoundException("Comment not exist");
        });
        var user = commentDeleted.getUser();
        var post = commentDeleted.getPost();
        user.removeComment(commentDeleted);
        post.removeComment(commentDeleted);
        commentRepository.deleteById(id);
        log.info("Successfully deleted comment with ID: {}", id);
        return commentDeleted;
    }

    @Override
    public List<Post> getUserPosts(String username) {
        log.info("Fetching posts for user: {}", username);
        List<Post> posts = postsRepository.findByUsername(username);
        log.info("Found {} posts for user '{}'", posts.size(), username);
        return posts;
    }

    @Override
    public Post createPost(String username, String mediaUrl, String description, ContentType type) {
        log.info("Creating post for user: {}", username);
        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found while trying to create post", username);
            return new EntityNotFoundException("User not found");
        });

        if (mediaUrl == null || mediaUrl.trim().isEmpty()) {
            log.error("Attempted to create a post with null or empty mediaUrl for user: {}", username);
            throw new NullPointerException("mediaUrl cannot be null or empty");
        }

        var newPost = Post.builder().user(user).mediaUrl(mediaUrl).description(description).contentType(type).build();
        user.addPost(newPost);
        Post savedPost = postsRepository.save(newPost);
        log.info("Post created with ID: {} for user: {}", savedPost.getId(), username);
        return savedPost;
    }

    @Override
    public Post deletePost(Long id) {
        log.info("Attempting to delete post with ID: {}", id);
        var postDeleted = postsRepository.findById(id).orElseThrow(() -> {
            log.warn("Post with ID '{}' not found for deletion", id);
            return new EntityNotFoundException("Post not exist");
        });
        var user = postDeleted.getUser();
        user.removePost(postDeleted);
        postsRepository.deleteById(id);
        log.info("Successfully deleted post with ID: {}", id);
        return postDeleted;
    }

    @Override
    public List<Post> getFeed(String username) {
        log.info("Fetching feed for user: {}", username);
        var posts = postsRepository.feedByUsername(username, FriendshipRequestType.Accepted);
        log.info("Found {} feed for user '{}'", posts.size(), username);
        return posts;
    }
}
