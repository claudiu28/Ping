package main.interfaces;

import main.posts.Comment;
import main.posts.Enums.ContentType;
import main.posts.Like;
import main.posts.Post;

import java.util.List;

public interface IPostService {
    Like addLike(Long userId, Long postId);

    Like dislike(Long postId, Long userId);

    Long getCountLikes(Long postId);

    List<Post> getUserPosts(String username);

    List<Post> getFeed(String username);

    Post createPost(String username, String mediaUrl, String description, ContentType type);

    Post deletePost(Long id);

    Comment addComment(Long postId, Long userId, String text);

    List<Comment> getCommentsPerPost(Long postId);

    Comment deleteComment(Long id);

    List<Like> foundLikesByUser(Long userId);

}
